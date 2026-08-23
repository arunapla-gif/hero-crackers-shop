import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTheme, getStyles, statusBadge, paymentBadge } from './theme';
import { formatOrderNumber } from '@/lib/utils';

const Spinner = () => (
  <svg style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px', marginRight: '8px' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export default function OrderManager({ isDarkMode, products, transports, onEditOrder, onDuplicateOrder, onRepeatOrder }) {
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme, isDarkMode);
  const queryClient = useQueryClient();

  // Filters
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState([]);
  
  const toggleExpandOrder = (id) => {
    setExpandedOrderIds(prev => prev.includes(id) ? prev.filter(oId => oId !== id) : [...prev, id]);
  };
  
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchOrderId, setDispatchOrderId] = useState(null);
  const [transportName, setTransportName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentDetails, setPaymentDetails] = useState('');

  // Fetch Orders with React Query
  const { data, isLoading } = useQuery({
    queryKey: ['orders', { page, limit, orderFilter, orderSearch, startDate, endDate }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page, limit, status: orderFilter, search: orderSearch, startDate, endDate
      });
      const res = await fetch(`/api/orders?${params.toString()}`);
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    }
  });

  const orders = data?.orders || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Dynamic Analytics based on current page/filters (or ideally from a separate analytics query)
  const periodRevenue = useMemo(() => {
    return orders
      .filter(o => o.status !== 'PENDING' && o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const periodPendingCount = orders.filter(o => o.status === 'PENDING').length;
  const periodShippedCount = orders.filter(o => o.status === 'SHIPPED').length;

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, data }) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    }
  });

  const [loadingAction, setLoadingAction] = useState({ id: null, action: null });

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === 'SHIPPED') {
      setDispatchOrderId(orderId);
      setDispatchModalOpen(true);
      return;
    }
    if (newStatus === 'CANCELLED' && !confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    setLoadingAction({ id: orderId, action: newStatus });
    try {
      await updateOrderMutation.mutateAsync({ orderId, data: { status: newStatus } });
    } catch (e) {
      console.error('Failed to update status', e);
    } finally {
      setLoadingAction({ id: null, action: null });
    }
  };

  const openPaymentModal = (orderId) => {
    setPaymentOrderId(orderId);
    setPaymentMethod('CASH');
    setPaymentDetails('');
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentOrderId) return;
    
    setLoadingAction({ id: paymentOrderId, action: 'payment' });
    try {
      await updateOrderMutation.mutateAsync({ 
        orderId: paymentOrderId, 
        data: { paymentStatus: 'PAID', paymentMethod, paymentDetails } 
      });
      setPaymentModalOpen(false);
      setPaymentMethod('CASH');
      setPaymentDetails('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction({ id: null, action: null });
    }
  };

  const handleSetCredit = async (orderId) => {
    setLoadingAction({ id: orderId, action: 'credit' });
    try {
      await updateOrderMutation.mutateAsync({ orderId, data: { paymentStatus: 'CREDIT' } });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction({ id: null, action: null });
    }
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!dispatchOrderId) return;
    
    setLoadingAction({ id: dispatchOrderId, action: 'dispatch' });
    try {
      await updateOrderMutation.mutateAsync({ 
        orderId: dispatchOrderId, 
        data: { status: 'SHIPPED', transportName, trackingNumber } 
      });
      setDispatchModalOpen(false);
      setTransportName('');
      setTrackingNumber('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction({ id: null, action: null });
    }
  };

  const handleWhatsAppSend = async (orderId) => {
    setLoadingAction({ id: orderId, action: 'whatsapp' });
    try {
      const res = await fetch(`/api/orders/${orderId}/whatsapp`, { method: 'POST' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        let errMsg = errorData.error || 'Failed to trigger WhatsApp message';
        if (errorData.details) {
          errMsg += '\nDetails: ' + (typeof errorData.details === 'object' ? JSON.stringify(errorData.details, null, 2) : errorData.details);
        }
        throw new Error(errMsg);
      }
      queryClient.invalidateQueries(['orders']);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoadingAction({ id: null, action: null });
    }
  };

  const handleSelectOrder = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(oId => oId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length && orders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (!confirm(`Are you sure you want to change the status of ${selectedOrders.length} orders to ${newStatus}?`)) return;
    
    await Promise.all(selectedOrders.map(id => 
      fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    ));
    queryClient.invalidateQueries(['orders']);
    setSelectedOrders([]);
  };

  const handleBulkMarkPaid = async () => {
    if (!confirm(`Are you sure you want to mark ${selectedOrders.length} orders as PAID via CASH?`)) return;
    
    await Promise.all(selectedOrders.map(id => 
      fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'PAID', paymentMethod: 'CASH', paymentDetails: 'Bulk Applied' }),
      })
    ));
    queryClient.invalidateQueries(['orders']);
    setSelectedOrders([]);
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer Phone', 'Address', 'Status', 'Total Amount'];
    const rows = orders.map(o => [
      o.id, 
      new Date(o.createdAt).toLocaleDateString(),
      o.customerPhone || 'N/A',
      `"${o.shippingAddress.replace(/"/g, '""')}"`,
      o.status,
      o.totalAmount
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `hero_orders_${startDate || 'all'}_to_${endDate || 'all'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrint = (order) => {
    // Import print-js dynamically or assume it's imported at the top. 
    // Since this is a React component, we can import it at the top, or require it here.
    const printJS = require('print-js');
    
    // Instead of building HTML, we just point printJS to our backend API 
    // which generates the invoice PDF.
    printJS({
      printable: `/api/orders/${order.id}/invoice`,
      type: 'pdf',
      showModal: true,
      modalMessage: 'Generating Document...',
      onError: (err) => alert('Failed to print: ' + err)
    });
  };

  const triggerPrintLabel = (order) => {
    // Generate a simple HTML for a 4x6 label and print it
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <style>
            body { font-family: sans-serif; margin: 0; padding: 20px; width: 4in; height: 6in; box-sizing: border-box; }
            h2 { margin: 0 0 10px 0; font-size: 24px; }
            p { margin: 5px 0; font-size: 16px; }
            .address { font-size: 20px; font-weight: bold; margin-top: 15px; border: 2px solid #000; padding: 10px; }
            .footer { margin-top: 30px; font-size: 12px; border-top: 1px dashed #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h2>Hero Crackers</h2>
          <p><strong>Order ID:</strong> ${formatOrderNumber(order.orderNumber, order.createdAt)}</p>
          <p><strong>Transport:</strong> ${order.transportName || 'N/A'}</p>
          <p><strong>Tracking LR:</strong> ${order.trackingNumber || 'N/A'}</p>
          
          <div class="address">
            <p><strong>TO:</strong> ${order.user?.name || 'Walk-in Customer'}</p>
            <p><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
            <p style="margin-top:10px;">${order.shippingAddress}</p>
          </div>
          
          <div class="footer">
            <p><strong>From:</strong> Hero Crackers Shop, Sivakasi</p>
            <p>Thank you for shopping with us!</p>
          </div>
          
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {/* Modal Overlay for Dispatch */}
      {dispatchModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...styles.cardStyle, width: '400px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: theme.textPrimary }}>Dispatch Order</h3>
            <form onSubmit={handleDispatchSubmit}>
              <label style={styles.labelStyle}>Transport / Courier Agency</label>
              <select required value={transportName} onChange={e => setTransportName(e.target.value)} style={styles.inputStyle}>
                <option value="">Select an Agency...</option>
                {transports && transports.filter(t => t.isActive).map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
              <label style={styles.labelStyle}>Lorry Receipt (LR) / Tracking Number</label>
              <input type="text" required value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} style={styles.inputStyle} placeholder="e.g. LR-98765432" />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setDispatchModalOpen(false)} className="action-btn" style={{ ...styles.btnPrimary, flex: 1, backgroundColor: 'transparent', color: theme.textPrimary, border: `1px solid ${theme.border}`, boxShadow: 'none' }}>Cancel</button>
                <button type="submit" className="action-btn" style={{ ...styles.btnPrimary, flex: 1 }}>Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Overlay for Payment */}
      {paymentModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...styles.cardStyle, width: '400px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: theme.textPrimary }}>Record Payment</h3>
            <form onSubmit={handlePaymentSubmit}>
              <label style={styles.labelStyle}>Payment Method</label>
              <select required value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={styles.inputStyle}>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="BANK">Bank Transfer</option>
              </select>
              
              <label style={styles.labelStyle}>Transaction ID / Notes</label>
              <input type="text" value={paymentDetails} onChange={e => setPaymentDetails(e.target.value)} style={styles.inputStyle} placeholder="e.g. UTR-98765432" />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setPaymentModalOpen(false)} className="action-btn" style={{ ...styles.btnPrimary, flex: 1, backgroundColor: 'transparent', color: theme.textPrimary, border: `1px solid ${theme.border}`, boxShadow: 'none' }}>Cancel</button>
                <button type="submit" className="action-btn" style={{ ...styles.btnPrimary, backgroundColor: theme.success, flex: 1 }}>Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Analytics Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ ...styles.cardStyle, padding: '25px', background: `linear-gradient(135deg, ${theme.cardBg} 0%, ${theme.accent}15 100%)`, border: `1px solid ${theme.accent}40`, boxShadow: `0 10px 30px ${theme.accent}15` }}>
          <h4 style={{ margin: '0 0 10px 0', color: theme.textSecondary, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Period Revenue</h4>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: theme.accent, textShadow: `0 2px 10px ${theme.accent}30` }}>₹{periodRevenue.toLocaleString()}</div>
        </div>
        <div style={{ ...styles.cardStyle, padding: '25px', background: `linear-gradient(135deg, ${theme.cardBg} 0%, ${theme.info}15 100%)`, border: `1px solid ${theme.info}40`, boxShadow: `0 10px 30px ${theme.info}15` }}>
          <h4 style={{ margin: '0 0 10px 0', color: theme.textSecondary, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Pending Orders</h4>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: theme.info, textShadow: `0 2px 10px ${theme.info}30` }}>
            {periodPendingCount} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: theme.textSecondary }}>Requires Action</span>
          </div>
        </div>
        <div style={{ ...styles.cardStyle, padding: '25px', background: `linear-gradient(135deg, ${theme.cardBg} 0%, ${theme.shipped}15 100%)`, border: `1px solid ${theme.shipped}40`, boxShadow: `0 10px 30px ${theme.shipped}15` }}>
          <h4 style={{ margin: '0 0 10px 0', color: theme.textSecondary, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Total Shipped</h4>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: theme.shipped, textShadow: `0 2px 10px ${theme.shipped}30` }}>
            {periodShippedCount} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: theme.textSecondary }}>In Transit</span>
          </div>
        </div>
      </div>

      {/* Advanced Filters & Search Bar */}
      <div className="filter-bar" style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div className="mobile-stack" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          <input 
            type="text" 
            className="search-input"
            placeholder="🔍 Search ID, Phone, Reference..." 
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter') setPage(1); }}
            style={styles.searchInputStyle}
          />
          
          {/* Date Pickers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="date" value={startDate} onChange={e => {setStartDate(e.target.value); setPage(1);}} className="date-input" style={styles.dateInputStyle} />
            <span style={{ color: theme.textSecondary }}>to</span>
            <input type="date" value={endDate} onChange={e => {setEndDate(e.target.value); setPage(1);}} className="date-input" style={styles.dateInputStyle} />
            {(startDate || endDate) && (
              <button className="action-btn" onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }} style={{ background: 'transparent', border: 'none', color: theme.cancelled, cursor: 'pointer', padding: '5px' }}>✕ Clear</button>
            )}
          </div>
        </div>
        
        {/* Export Button */}
        <button className="action-btn" onClick={exportToCSV} style={{ ...styles.btnPrimary, backgroundColor: theme.cardBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, boxShadow: 'none', padding: '12px 20px' }}>
          📊 Export CSV
        </button>
      </div>

      {/* Segmented Control for Filters */}
      <div style={{ display: 'flex', backgroundColor: theme.inputBg, padding: '5px', borderRadius: '30px', border: `1px solid ${theme.border}`, flexWrap: 'wrap', marginBottom: '30px', width: 'fit-content' }}>
        {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(f => (
          <button 
            key={f}
            className="filter-btn"
            onClick={() => { setOrderFilter(f); setPage(1); }}
            style={{ 
              padding: '8px 18px', 
              borderRadius: '25px', 
              cursor: 'pointer', 
              fontWeight: 'bold', 
              fontSize: '0.85rem',
              backgroundColor: orderFilter === f ? theme.cardBg : 'transparent',
              color: orderFilter === f ? (f === 'ALL' ? theme.textPrimary : (f === 'PENDING' ? theme.accent : f === 'SHIPPED' ? theme.shipped : f === 'DELIVERED' ? theme.success : f === 'CANCELLED' ? theme.cancelled : theme.info)) : theme.textSecondary,
              border: 'none',
              boxShadow: orderFilter === f ? `0 2px 8px rgba(0,0,0,${isDarkMode ? '0.3' : '0.1'})` : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div style={{ backgroundColor: `${theme.accent}15`, border: `1px solid ${theme.accent}40`, borderRadius: '12px', padding: '15px 25px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: `0 5px 15px ${theme.accent}10` }}>
          <div style={{ color: theme.textPrimary, fontWeight: 'bold' }}>
            <span style={{ color: theme.accent, fontSize: '1.2rem' }}>{selectedOrders.length}</span> Orders Selected
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="action-btn" onClick={() => handleBulkStatusChange('PROCESSING')} style={{ ...styles.btnPrimary, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: theme.info, boxShadow: 'none' }}>Bulk Process</button>
            <button className="action-btn" onClick={() => handleBulkStatusChange('SHIPPED')} style={{ ...styles.btnPrimary, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: theme.shipped, boxShadow: 'none' }}>Bulk Dispatch (No Tracking)</button>
            <button className="action-btn" onClick={() => handleBulkStatusChange('DELIVERED')} style={{ ...styles.btnPrimary, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: theme.success, boxShadow: 'none' }}>Bulk Deliver</button>
            <button className="action-btn" onClick={handleBulkMarkPaid} style={{ ...styles.btnPrimary, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: theme.success, border: `1px solid ${theme.success}`, boxShadow: 'none' }}>Bulk Mark Paid</button>
            <button className="action-btn" onClick={() => handleBulkStatusChange('CANCELLED')} style={{ ...styles.btnPrimary, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: 'transparent', color: theme.cancelled, border: `1px solid ${theme.cancelled}`, boxShadow: 'none' }}>Bulk Cancel</button>
          </div>
        </div>
      )}

      {/* Select All Utility */}
      <div style={{ marginBottom: '15px', paddingLeft: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theme.textSecondary, cursor: 'pointer', fontSize: '0.9rem' }}>
          <input 
            type="checkbox" 
            className="custom-checkbox"
            checked={orders.length > 0 && selectedOrders.length === orders.length}
            onChange={handleSelectAll}
          />
          Select All {orders.length} Current Page Orders
        </label>
      </div>

      {isLoading ? (
        <div style={{ color: theme.textSecondary, textAlign: 'center', padding: '40px' }}>Loading orders...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {orders.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', backgroundColor: theme.cardBg, borderRadius: '16px', border: `1px dashed ${theme.border}` }}>
              <span style={{ fontSize: '3rem' }}>📭</span>
              <h3 style={{ color: theme.textPrimary, margin: '15px 0 5px 0' }}>No orders found</h3>
              <p style={{ color: theme.textSecondary }}>Try adjusting your filters or date range.</p>
            </div>
          ) : orders.map(order => (
            <div key={order.id} className="order-card" style={{ ...styles.listCardStyle, opacity: order.status === 'CANCELLED' ? 0.6 : 1, flexDirection: 'column', alignItems: 'stretch' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', width: '100%' }}>
                
                {/* Col 1: ID & Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '150px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="checkbox" 
                      className="custom-checkbox"
                      checked={selectedOrders.includes(order.id)} 
                      onChange={() => handleSelectOrder(order.id)} 
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {formatOrderNumber(order.orderNumber, order.createdAt)}
                    </span>
                  </div>
                  <div>{statusBadge(order.status, theme)}</div>
                  <div style={{ marginTop: '4px' }}>{paymentBadge(order.paymentStatus, theme)}</div>
                </div>
                
                {/* Col 2: Customer Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1.5', minWidth: '250px' }}>
                  <strong style={{ fontSize: '1.8rem', color: theme.textPrimary, letterSpacing: '-1px', textDecoration: order.status === 'CANCELLED' ? 'line-through' : 'none' }}>
                    ₹{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                  <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: theme.textPrimary, marginTop: '5px' }}>
                    👤 {order.user?.name || 'Walk-in Customer'}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: theme.textSecondary }}>
                    📞 <strong style={{ color: theme.textPrimary }}>{order.customerPhone || 'N/A'}</strong>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: theme.textSecondary, marginTop: '2px', lineHeight: '1.4' }}>
                    📍 {order.shippingAddress}
                  </div>
                  {order.referredBy && (
                    <div style={{ fontSize: '0.85rem', color: theme.accent, marginTop: '4px', fontWeight: 'bold' }}>
                      🏷️ Referred By: {order.referredBy}
                    </div>
                  )}
                  {(order.transportName || order.trackingNumber) && (
                    <div style={{ fontSize: '0.85rem', color: theme.shipped, marginTop: '4px', fontWeight: 'bold' }}>
                      LR: {order.trackingNumber} ({order.transportName})
                    </div>
                  )}
                  {order.paymentStatus === 'PAID' && order.paymentMethod && (
                    <div style={{ fontSize: '0.85rem', color: theme.success, marginTop: '4px', fontWeight: 'bold' }}>
                      Paid via {order.paymentMethod} {order.paymentDetails ? `(${order.paymentDetails})` : ''}
                    </div>
                  )}
                </div>

                {/* Col 3: Items Toggle */}
                <div style={{ flex: '1', minWidth: '150px', padding: '0 15px', borderLeft: `1px solid ${theme.border}`, borderRight: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <button 
                    onClick={() => toggleExpandOrder(order.id)}
                    style={{ ...styles.btnPrimary, backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, boxShadow: 'none', padding: '10px 15px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span>📦 {order.items.length} Items</span>
                    <span>{expandedOrderIds.includes(order.id) ? '▲' : '▼'}</span>
                  </button>
                </div>

                {/* Col 4: Actions */}
                <div style={{ flex: '1.5', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* Status Actions (Primary focus) */}
                  {order.status !== 'CANCELLED' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
                      {order.status === 'PENDING' && (
                        <button className="action-btn" disabled={loadingAction.id === order.id && loadingAction.action === 'PROCESSING'} onClick={() => handleStatusChange(order.id, 'PROCESSING')} style={{ ...styles.btnPrimary, padding: '10px', fontSize: '0.9rem', backgroundColor: theme.info, boxShadow: 'none', gridColumn: 'span 2', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {loadingAction.id === order.id && loadingAction.action === 'PROCESSING' ? <Spinner /> : null}
                          {loadingAction.id === order.id && loadingAction.action === 'PROCESSING' ? 'Processing...' : 'Process Order'}
                        </button>
                      )}
                      {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                        <button className="action-btn" disabled={loadingAction.id === order.id && loadingAction.action === 'SHIPPED'} onClick={() => handleStatusChange(order.id, 'SHIPPED')} style={{ ...styles.btnPrimary, padding: '10px', fontSize: '0.9rem', backgroundColor: theme.shipped, boxShadow: 'none', gridColumn: order.status === 'PROCESSING' ? 'span 2' : 'span 1', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {loadingAction.id === order.id && loadingAction.action === 'SHIPPED' ? <Spinner /> : null}
                          {loadingAction.id === order.id && loadingAction.action === 'SHIPPED' ? 'Dispatching...' : 'Dispatch'}
                        </button>
                      )}
                      {order.status === 'SHIPPED' && (
                        <button className="action-btn" disabled={loadingAction.id === order.id && loadingAction.action === 'DELIVERED'} onClick={() => handleStatusChange(order.id, 'DELIVERED')} style={{ ...styles.btnPrimary, padding: '10px', fontSize: '0.9rem', backgroundColor: theme.success, boxShadow: 'none', gridColumn: 'span 2', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {loadingAction.id === order.id && loadingAction.action === 'DELIVERED' ? <Spinner /> : null}
                          {loadingAction.id === order.id && loadingAction.action === 'DELIVERED' ? 'Delivering...' : 'Deliver Order'}
                        </button>
                      )}
                      <button className="action-btn" disabled={loadingAction.id === order.id && loadingAction.action === 'CANCELLED'} onClick={() => handleStatusChange(order.id, 'CANCELLED')} style={{ ...styles.btnPrimary, padding: '10px', fontSize: '0.9rem', backgroundColor: 'transparent', color: theme.cancelled, border: `1px solid ${theme.cancelled}`, boxShadow: 'none', gridColumn: 'span 2', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {loadingAction.id === order.id && loadingAction.action === 'CANCELLED' ? <Spinner /> : null}
                        {loadingAction.id === order.id && loadingAction.action === 'CANCELLED' ? 'Cancelling...' : '✕ Cancel'}
                      </button>
                    </div>
                  )}

                  {/* Payment Actions */}
                  {order.status !== 'CANCELLED' && order.paymentStatus === 'UNPAID' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
                      <button className="action-btn" onClick={() => openPaymentModal(order.id)} style={{ ...styles.btnPrimary, padding: '8px', fontSize: '0.85rem', backgroundColor: theme.success, boxShadow: 'none' }}>Mark Paid</button>
                      <button className="action-btn" onClick={() => handleSetCredit(order.id)} style={{ ...styles.btnPrimary, padding: '8px', fontSize: '0.85rem', backgroundColor: theme.shipped, boxShadow: 'none' }}>Set Credit</button>

                    </div>
                  )}
                  {order.status !== 'CANCELLED' && order.paymentStatus === 'CREDIT' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', width: '100%' }}>
                      <button className="action-btn" onClick={() => openPaymentModal(order.id)} style={{ ...styles.btnPrimary, padding: '8px', fontSize: '0.85rem', backgroundColor: theme.success, boxShadow: 'none' }}>Collect Payment</button>
                    </div>
                  )}

                  {/* WhatsApp Smart Button */}
                  {order.customerPhone && (
                    <button 
                      className="action-btn"
                      disabled={loadingAction.id === order.id && loadingAction.action === 'whatsapp'}
                      onClick={() => handleWhatsAppSend(order.id)}
                      title="Send automated PDF via WhatsApp API"
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        backgroundColor: order.lastSentVersion === 0 ? theme.info : (order.lastSentVersion < order.editVersion ? theme.accent : theme.success), 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        fontSize: '0.9rem', 
                        fontWeight: 'bold', 
                        gap: '8px'
                      }}
                    >
                      {loadingAction.id === order.id && loadingAction.action === 'whatsapp' ? (
                        <>
                          <Spinner /> Sending...
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                          {order.lastSentVersion === 0 
                            ? "Send Initial Bill (v1)" 
                            : (order.lastSentVersion < order.editVersion 
                                ? `Send Updated Bill (v${order.editVersion})` 
                                : `Sent v${order.editVersion} (Resend?)`)}
                        </>
                      )}
                    </button>
                  )}

                  {/* Utility Actions (5-Column Grid) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', width: '100%' }}>
                    <button className="action-btn" onClick={() => triggerPrint(order)} title="Print Invoice" style={{ padding: '8px 0', backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🖨️</button>
                    <button className="action-btn" onClick={() => triggerPrintLabel(order)} title="Print Shipping Label (4x6 Sticker)" style={{ padding: '8px 0', backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🏷️</button>
                    <button className="action-btn" onClick={() => onEditOrder(order)} title="Edit Order" style={{ padding: '8px 0', backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✏️</button>
                    <button className="action-btn" onClick={() => onDuplicateOrder(order)} title="Duplicate (New Customer)" style={{ padding: '8px 0', backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>📋</button>
                    <button className="action-btn" onClick={() => onRepeatOrder(order)} title="Repeat Order (Same Customer)" style={{ padding: '8px 0', backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🔁</button>
                  </div>
                  

                </div>
              </div>

              {/* Expandable Items Table */}
              {expandedOrderIds.includes(order.id) && (
                <div className="table-responsive" style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px dashed ${theme.border}` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ color: theme.textSecondary, textAlign: 'left', borderBottom: `1px solid ${theme.border}` }}>
                        <th style={{ padding: '8px', width: '50px' }}>#</th>
                        <th style={{ padding: '8px' }}>Product</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Price</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                          <tr key={item.id} style={{ borderBottom: `1px solid ${theme.border}40` }}>
                            <td style={{ padding: '12px 8px', color: theme.textSecondary }}>{idx + 1}</td>
                            <td style={{ padding: '12px 8px', color: theme.textPrimary, fontWeight: '500' }}>{product ? product.name : 'Unknown Item'}</td>
                            <td style={{ padding: '12px 8px', textAlign: 'center', color: theme.textPrimary }}>{item.quantity}</td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', color: theme.textSecondary }}>₹{item.price}</td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', color: theme.textPrimary, fontWeight: 'bold' }}>₹{item.price * item.quantity}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px', alignItems: 'center' }}>
          <button 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)}
            style={{ ...styles.btnPrimary, backgroundColor: page === 1 ? theme.border : theme.cardBg, color: theme.textPrimary }}
          >
            ← Previous
          </button>
          <span style={{ color: theme.textSecondary }}>Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(page + 1)}
            style={{ ...styles.btnPrimary, backgroundColor: page === totalPages ? theme.border : theme.cardBg, color: theme.textPrimary }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
