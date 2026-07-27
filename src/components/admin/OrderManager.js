import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTheme, getStyles, statusBadge } from './theme';

export default function OrderManager({ isDarkMode, products, onEditOrder, onDuplicateOrder }) {
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
  
  // Dispatch Modal
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchOrderId, setDispatchOrderId] = useState(null);
  const [transportName, setTransportName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

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

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === 'SHIPPED') {
      setDispatchOrderId(orderId);
      setDispatchModalOpen(true);
      return;
    }
    if (newStatus === 'CANCELLED' && !confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    updateOrderMutation.mutate({ orderId, data: { status: newStatus } });
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!dispatchOrderId) return;
    
    updateOrderMutation.mutate({ 
      orderId: dispatchOrderId, 
      data: { status: 'SHIPPED', transportName, trackingNumber } 
    });
    
    setDispatchModalOpen(false);
    setTransportName('');
    setTrackingNumber('');
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
    const originalContent = document.body.innerHTML;
    // We will quickly generate print content since it's not rendered in bulk anymore
    const printWindow = window.open('', '_blank');
    
    let itemsHtml = order.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return `
        <tr>
          <td style="border: 1px solid #000; padding: 8px;">${product ? product.name : 'Item'}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.quantity}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: right;">₹${item.price * item.quantity}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html><head><title>Print Invoice</title></head><body>
      <div style="padding: 40px; font-family: Arial, sans-serif; color: #000; background-color: #fff;">
        <h1 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px;">HERO CRACKERS</h1>
        <h2 style="text-align: center;">PACKING SLIP / INVOICE</h2>
        <div style="display: flex; justify-content: space-between; margin-top: 30px;">
          <div>
            <p><strong>Order ID:</strong> ${order.id.slice(-6).toUpperCase()}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Customer ID:</strong> ${order.userId.slice(-6)}</p>
            <p><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
          </div>
        </div>
        <div style="margin-top: 20px; padding: 15px; border: 1px solid #ccc;">
          <p><strong>Shipping Address:</strong><br/>${order.shippingAddress}</p>
        </div>
        <table style="width: 100%; margin-top: 30px; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #000; padding: 8px; text-align: left;">Item</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Qty</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <th colspan="2" style="border: 1px solid #000; padding: 8px; text-align: right;">Total:</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right;">₹${order.totalAmount}</th>
            </tr>
          </tfoot>
        </table>
      </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      {/* Modal Overlay for Dispatch */}
      {dispatchModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...styles.cardStyle, width: '400px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: theme.textPrimary }}>Dispatch Order</h3>
            <form onSubmit={handleDispatchSubmit}>
              <label style={styles.labelStyle}>Transport / Courier Name</label>
              <input type="text" required value={transportName} onChange={e => setTransportName(e.target.value)} style={styles.inputStyle} placeholder="e.g. Navata Transport" />
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
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          <input 
            type="text" 
            className="search-input"
            placeholder="🔍 Search ID, Phone..." 
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
                      ORD-{order.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div>{statusBadge(order.status, theme)}</div>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: '1.5', minWidth: '250px', alignItems: 'flex-end' }}>
                  
                  {/* Secondary Actions Row */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {order.customerPhone && (
                      <a 
                        href={`https://wa.me/91${order.customerPhone.replace(/[^0-9]/g, '').slice(-10)}?text=Hello! Your Hero Crackers order %23${order.id.slice(-6).toUpperCase()} is currently ${order.status}.${order.trackingNumber ? ` It was dispatched via ${order.transportName}. Tracking LR: ${order.trackingNumber}` : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn"
                        style={{...styles.btnPrimary, padding: '8px 12px', backgroundColor: '#25D36615', color: '#25D366', border: '1px solid #25D36640', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none'}}
                      >
                        💬 WhatsApp
                      </a>
                    )}
                    <button onClick={() => triggerPrint(order)} className="action-btn" title="Print Invoice" style={{ ...styles.btnPrimary, padding: '8px', backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, boxShadow: 'none' }}>🖨️</button>
                    <button onClick={() => onEditOrder(order)} className="action-btn" title="Edit Order" style={{ ...styles.btnPrimary, padding: '8px', backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, boxShadow: 'none' }}>✏️</button>
                    <button onClick={() => onDuplicateOrder(order)} className="action-btn" title="Duplicate Order" style={{ ...styles.btnPrimary, padding: '8px', backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, boxShadow: 'none' }}>📋</button>
                  </div>
                  
                  {/* Primary Status Row */}
                  {order.status !== 'CANCELLED' && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {order.status === 'PENDING' && <button className="action-btn" onClick={() => handleStatusChange(order.id, 'PROCESSING')} style={{ ...styles.btnPrimary, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: theme.info, boxShadow: 'none' }}>Process</button>}
                      {(order.status === 'PENDING' || order.status === 'PROCESSING') && <button className="action-btn" onClick={() => handleStatusChange(order.id, 'SHIPPED')} style={{ ...styles.btnPrimary, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: theme.shipped, boxShadow: 'none' }}>Dispatch</button>}
                      {order.status === 'SHIPPED' && <button className="action-btn" onClick={() => handleStatusChange(order.id, 'DELIVERED')} style={{ ...styles.btnPrimary, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: theme.success, boxShadow: 'none' }}>Deliver</button>}
                      <button className="action-btn" onClick={() => handleStatusChange(order.id, 'CANCELLED')} style={{ ...styles.btnPrimary, padding: '8px 12px', fontSize: '0.85rem', backgroundColor: 'transparent', color: theme.cancelled, border: `1px solid ${theme.cancelled}`, boxShadow: 'none' }}>✕ Cancel</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Expandable Items Table */}
              {expandedOrderIds.includes(order.id) && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px dashed ${theme.border}`, width: '100%', overflowX: 'auto' }}>
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
