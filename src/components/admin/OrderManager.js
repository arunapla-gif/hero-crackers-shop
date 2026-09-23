import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

import OrderModals from './orders/OrderModals';
import OrderFilters from './orders/OrderFilters';
import OrderTable from './orders/OrderTable';
import { formatOrderNumber } from '@/lib/utils';

export default function OrderManager({ isDarkMode, products, transports, onEditOrder, onDuplicateOrder, onRepeatOrder }) {
  const queryClient = useQueryClient();

  // Filters
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  // Modals state
  const [dispatchOrderId, setDispatchOrderId] = useState(null);
  const [paymentOrderId, setPaymentOrderId] = useState(null);

  // Fetch Orders with React Query
  const { data, isLoading } = useQuery({
    queryKey: ['orders', { page, limit, orderFilter, sourceFilter, orderSearch, startDate, endDate }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page, limit, status: orderFilter, source: sourceFilter, search: orderSearch, startDate, endDate
      });
      const res = await fetch(`/api/orders?${params.toString()}`);
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    }
  });

  const orders = data?.orders || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Realtime Subscription
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('orders-realtime-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'shop', table: 'Order' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch Analytics (ignoring pagination)
  const { data: analyticsData } = useQuery({
    queryKey: ['orderAnalytics', { orderFilter, sourceFilter, orderSearch, startDate, endDate }],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: orderFilter, source: sourceFilter, search: orderSearch, startDate, endDate
      });
      const res = await fetch(`/api/orders/analytics?${params.toString()}`);
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    }
  });

  const periodRevenue = analyticsData?.periodRevenue || 0;
  const periodPendingCount = analyticsData?.periodPendingCount || 0;
  const periodShippedCount = analyticsData?.periodShippedCount || 0;

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
    const headers = ['Order ID', 'Date', 'Customer Phone', 'Address', 'Status', 'Total Amount', 'Remarks'];
    const rows = orders.map(o => [
      o.id, 
      new Date(o.createdAt).toLocaleDateString(),
      o.customerPhone || 'N/A',
      `"${o.shippingAddress.replace(/"/g, '""')}"`,
      o.status,
      o.totalAmount,
      `"${(o.remarks || '').replace(/"/g, '""')}"`
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

  const printInvoice = (order, orderProducts) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    
    // Sort items by product sequence to match catalog
    const sortedItems = [...order.items].sort((a, b) => {
      const productA = orderProducts.find(p => p.id === a.productId);
      const productB = orderProducts.find(p => p.id === b.productId);
      const seqA = productA ? (productA.sequence || 0) : 999999;
      const seqB = productB ? (productB.sequence || 0) : 999999;
      return seqA - seqB;
    });
    
    const itemsHtml = sortedItems.map((item, idx) => {
      const product = orderProducts.find(p => p.id === item.productId);
      const productName = product ? product.name : 'Unknown Item';
      return `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #ddd;">${idx + 1}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #ddd; font-weight: 500;">${productName}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">₹${item.price * item.quantity}</td>
        </tr>
      `;
    }).join('');

    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - ${formatOrderNumber(order.orderNumber, order.createdAt)}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #ff1361; font-size: 32px; letter-spacing: 1px; text-transform: uppercase; }
            .header p { margin: 5px 0; color: #666; font-size: 14px; }
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .details h3 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 5px; color: #555; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
            .address-box { flex: 1; min-width: 250px; padding-right: 20px; }
            .meta-box { flex: 1; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #f8f8f8; padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; color: #555; }
            th.center { text-align: center; }
            th.right { text-align: right; }
            .totals { width: 50%; float: right; margin-top: 20px; }
            .totals-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .totals-row.bold { font-weight: bold; font-size: 1.4em; border-bottom: none; border-top: 2px solid #333; padding-top: 15px; }
            .footer { clear: both; margin-top: 60px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: right;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #ff1361; color: white; border: none; cursor: pointer; font-weight: bold; border-radius: 4px;">Print Invoice</button>
          </div>
          
          <div class="header">
            <div>
              <h1>HERO CRACKERS</h1>
              <p>Premium Sivakasi Fireworks Wholesale & Retail</p>
              <p>Sivakasi, Tamil Nadu, India</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin:0 0 5px 0; color:#333; font-size: 28px;">INVOICE</h2>
              <p style="font-weight: bold; color: #000; font-size: 16px;"># ${formatOrderNumber(order.orderNumber, order.createdAt)}</p>
              <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div class="details">
            <div class="address-box">
              <h3>Billed To:</h3>
              <p style="font-size: 16px;"><strong>${order.user?.name || 'Walk-in Customer'}</strong></p>
              <p>Phone: ${order.customerPhone || 'N/A'}</p>
              <p style="margin-top: 10px;">${order.shippingAddress ? order.shippingAddress.replace(/\n/g, '<br>') : 'N/A'}</p>
            </div>
            <div class="meta-box">
              <h3>Shipping Details:</h3>
              <p><strong>Transport:</strong> ${order.transportName || 'N/A'}</p>
              <p><strong>Tracking/LR:</strong> ${order.trackingNumber || 'N/A'}</p>
              <p><strong>Status:</strong> <span style="text-transform: uppercase;">${order.status}</span></p>
            </div>
          </div>
          ${order.remarks ? `<div style="margin-bottom: 20px; padding: 10px; background-color: #f8f8f8; border-left: 4px solid #555;"><p style="margin:0;font-size:14px;"><strong>Remarks:</strong> ${order.remarks}</p></div>` : ''}
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product Description</th>
                <th class="center">Qty</th>
                <th class="right">Unit Price</th>
                <th class="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="totals-row bold">
              <span>Grand Total:</span>
              <span>₹${order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for shopping with Hero Crackers!</p>
            <p>This is a computer-generated invoice and does not require a physical signature.</p>
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  const printShippingLabel = (order) => {
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
          ${order.remarks ? `<div style="margin-top:15px; padding: 10px; background-color: #f0f0f0;"><p style="margin:0;"><strong>Remarks:</strong> ${order.remarks}</p></div>` : ''}
          
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
      <OrderModals
        transports={transports}
        dispatchOrderId={dispatchOrderId}
        setDispatchOrderId={setDispatchOrderId}
        paymentOrderId={paymentOrderId}
        setPaymentOrderId={setPaymentOrderId}
      />

      {/* Dynamic Analytics Dashboard */}
      <div className="analytics-grid">
        <div className="admin-card analytics-card analytics-revenue">
          <h4 className="analytics-card-title">Period Revenue</h4>
          <div className="analytics-card-value">₹{periodRevenue.toLocaleString()}</div>
        </div>
        <div className="admin-card analytics-card analytics-pending">
          <h4 className="analytics-card-title">Pending Orders</h4>
          <div className="analytics-card-value">
            {periodPendingCount} <span className="analytics-card-subtitle">Requires Action</span>
          </div>
        </div>
        <div className="admin-card analytics-card analytics-shipped">
          <h4 className="analytics-card-title">Total Shipped</h4>
          <div className="analytics-card-value">
            {periodShippedCount} <span className="analytics-card-subtitle">In Transit</span>
          </div>
        </div>
      </div>

      <OrderFilters
        isDarkMode={isDarkMode}
        orderFilter={orderFilter}
        setOrderFilter={setOrderFilter}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
        orderSearch={orderSearch}
        setOrderSearch={setOrderSearch}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        setPage={setPage}
        orders={orders}
        selectedOrders={selectedOrders}
        setSelectedOrders={setSelectedOrders}
        handleBulkStatusChange={handleBulkStatusChange}
        handleBulkMarkPaid={handleBulkMarkPaid}
        exportToCSV={exportToCSV}
      />

      {isLoading ? (
        <div style={{ color: 'var(--admin-text-secondary)', textAlign: 'center', padding: '40px' }}>Loading orders...</div>
      ) : (
        <OrderTable 
          orders={orders}
          selectedOrders={selectedOrders}
          handleSelectOrder={handleSelectOrder}
          expandedOrderId={expandedOrderId}
          setExpandedOrderId={setExpandedOrderId}
          handleStatusChange={handleStatusChange}
          setPaymentOrderId={setPaymentOrderId}
          handleSetCredit={handleSetCredit}
          handleWhatsAppSend={handleWhatsAppSend}
          printInvoice={printInvoice}
          printShippingLabel={printShippingLabel}
          loadingAction={loadingAction}
          products={products}
        />
      )}
      
      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="admin-btn-secondary"
          >
            Previous
          </button>
          <span style={{ color: 'var(--admin-text-primary)', fontWeight: 'bold' }}>Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="admin-btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
