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
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    
    // Sort items by product sequence to match catalog
    const sortedItems = [...order.items].sort((a, b) => {
      const productA = orderProducts.find(p => p.id === a.productId);
      const productB = orderProducts.find(p => p.id === b.productId);
      const seqA = productA ? (productA.sequence || 0) : 999999;
      const seqB = productB ? (productB.sequence || 0) : 999999;
      return seqA - seqB;
    });

    const totalQty = sortedItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const totalItems = sortedItems.length;
    
    const itemsHtml = sortedItems.map((item, idx) => {
      const product = orderProducts.find(p => p.id === item.productId);
      const productName = product ? product.name : 'Unknown Item';
      const unitPrice = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      const amount = unitPrice * qty;
      return `
        <tr>
          <td class="col-num center">${idx + 1}</td>
          <td class="col-name">${productName}</td>
          <td class="col-qty center">${qty}</td>
          <td class="col-rate right">₹${unitPrice.toLocaleString('en-IN')}</td>
          <td class="col-amount right">₹${amount.toLocaleString('en-IN')}</td>
        </tr>
      `;
    }).join('');

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice - ${formatOrderNumber(order.orderNumber, order.createdAt)}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 6mm 8mm 6mm 8mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #1f2937;
              margin: 0;
              padding: 12px 16px;
              font-size: 10.5px;
              line-height: 1.25;
              background: #fff;
            }

            /* Density Options */
            body.density-compact {
              font-size: 10.5px;
            }
            body.density-compact td, body.density-compact th {
              padding: 3px 6px;
            }

            body.density-ultra {
              font-size: 9.5px;
              line-height: 1.15;
            }
            body.density-ultra td, body.density-ultra th {
              padding: 1.5px 5px;
            }
            body.density-ultra .header {
              margin-bottom: 5px;
              padding-bottom: 3px;
            }
            body.density-ultra .details {
              margin-bottom: 5px;
              padding: 4px 8px;
            }

            body.density-normal {
              font-size: 12px;
            }
            body.density-normal td, body.density-normal th {
              padding: 6px 8px;
            }

            /* Screen Toolbar */
            .toolbar {
              display: flex;
              align-items: center;
              justify-content: space-between;
              background: #111827;
              color: #fff;
              padding: 8px 16px;
              border-radius: 6px;
              margin-bottom: 12px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            }
            .toolbar-title {
              font-weight: 600;
              font-size: 13px;
            }
            .toolbar-controls {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .toolbar select {
              padding: 5px 10px;
              border-radius: 4px;
              border: 1px solid #4b5563;
              background: #1f2937;
              color: #fff;
              font-size: 12px;
              cursor: pointer;
            }
            .toolbar button {
              padding: 6px 14px;
              background: #ff1361;
              color: #fff;
              border: none;
              border-radius: 4px;
              font-weight: bold;
              font-size: 12px;
              cursor: pointer;
            }
            .toolbar button:hover {
              background: #e00b50;
            }

            /* Header */
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 8px;
              border-bottom: 2px solid #ff1361;
              padding-bottom: 5px;
            }
            .header-brand h1 {
              margin: 0;
              color: #ff1361;
              font-size: 20px;
              font-weight: 800;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              line-height: 1.1;
            }
            .header-brand p {
              margin: 2px 0 0 0;
              color: #4b5563;
              font-size: 10px;
            }
            .header-meta {
              text-align: right;
            }
            .header-meta h2 {
              margin: 0;
              color: #111827;
              font-size: 18px;
              font-weight: 800;
              letter-spacing: 0.5px;
              line-height: 1.1;
            }
            .header-meta p {
              margin: 1px 0;
              font-size: 10.5px;
            }
            .badge-source {
              display: inline-block;
              font-size: 9px;
              font-weight: bold;
              padding: 1px 5px;
              border-radius: 3px;
              background: #e5e7eb;
              color: #374151;
            }

            /* Details Card */
            .details {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              margin-bottom: 8px;
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              padding: 6px 10px;
            }
            .details-box {
              flex: 1;
            }
            .details-box h3 {
              margin: 0 0 3px 0;
              padding-bottom: 2px;
              border-bottom: 1px solid #e5e7eb;
              color: #6b7280;
              text-transform: uppercase;
              font-size: 9.5px;
              letter-spacing: 0.5px;
              font-weight: 700;
            }
            .details-box p {
              margin: 1px 0;
              font-size: 10px;
              line-height: 1.25;
            }
            .customer-name {
              font-size: 11px !important;
              font-weight: 700;
              color: #111827;
            }
            .remarks-box {
              margin-bottom: 6px;
              padding: 4px 8px;
              background: #eff6ff;
              border-left: 3px solid #3b82f6;
              font-size: 9.5px;
              border-radius: 2px;
              color: #1e40af;
            }

            /* Table */
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 6px;
            }
            thead {
              display: table-header-group;
            }
            tr {
              page-break-inside: avoid;
            }
            th {
              background-color: #f3f4f6;
              padding: 3px 6px;
              text-align: left;
              border-top: 1px solid #d1d5db;
              border-bottom: 1.5px solid #9ca3af;
              text-transform: uppercase;
              font-size: 9.5px;
              letter-spacing: 0.5px;
              color: #374151;
              font-weight: 700;
            }
            th.center, td.center { text-align: center; }
            th.right, td.right { text-align: right; }
            td {
              padding: 3px 6px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 10px;
              line-height: 1.25;
            }
            tbody tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .col-num { width: 5%; }
            .col-name { width: 48%; font-weight: 500; color: #111827; }
            .col-qty { width: 10%; font-weight: 600; }
            .col-rate { width: 17%; }
            .col-amount { width: 20%; font-weight: 700; color: #111827; }

            /* Summary & Totals */
            .summary-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-top: 4px;
            }
            .summary-notes {
              font-size: 9px;
              color: #6b7280;
              max-width: 50%;
              line-height: 1.3;
            }
            .summary-notes p {
              margin: 1px 0;
            }
            .totals {
              width: 250px;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              background: #f9fafb;
              padding: 4px 8px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 1.5px 0;
              font-size: 10px;
              color: #4b5563;
            }
            .totals-row.grand-total {
              font-weight: 800;
              font-size: 12.5px;
              color: #111827;
              border-top: 1.5px solid #111827;
              margin-top: 2px;
              padding-top: 3px;
            }

            /* Footer */
            .footer {
              clear: both;
              margin-top: 8px;
              text-align: center;
              color: #9ca3af;
              font-size: 8.5px;
              border-top: 1px solid #e5e7eb;
              padding-top: 4px;
            }

            /* Print Rules */
            @media print {
              body {
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body class="density-compact">
          <div class="no-print toolbar">
            <div class="toolbar-title">📄 Invoice Preview</div>
            <div class="toolbar-controls">
              <label for="densitySelect" style="font-size: 11px; color: #d1d5db;">Density:</label>
              <select id="densitySelect" onchange="setDensity(this.value)">
                <option value="compact">Compact (Default: ~40+ items/page)</option>
                <option value="ultra">Ultra-Compact (~55+ items/page)</option>
                <option value="normal">Standard / Relaxed</option>
              </select>
              <button onclick="window.print()">🖨️ Print Invoice</button>
            </div>
          </div>
          
          <div class="header">
            <div class="header-brand">
              <h1>HERO CRACKERS</h1>
              <p>Premium Sivakasi Fireworks Wholesale & Retail | Sivakasi, Tamil Nadu</p>
            </div>
            <div class="header-meta">
              <h2>INVOICE</h2>
              <p><strong># ${formatOrderNumber(order.orderNumber, order.createdAt)}</strong> <span class="badge-source">${order.source || 'ONLINE'}</span></p>
              <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div class="details">
            <div class="details-box">
              <h3>Billed To:</h3>
              <p class="customer-name">${order.user?.name || order.customerName || 'Walk-in Customer'}</p>
              <p>Phone: <strong>${order.customerPhone || 'N/A'}</strong></p>
              <p>${order.shippingAddress ? order.shippingAddress.replace(/\n/g, ', ') : 'N/A'}</p>
            </div>
            <div class="details-box" style="text-align: right;">
              <h3>Shipping & Order Info:</h3>
              <p><strong>Transport:</strong> ${order.transportName || 'N/A'}</p>
              <p><strong>Tracking / LR:</strong> ${order.trackingNumber || 'N/A'}</p>
              <p><strong>Status:</strong> <span style="text-transform: uppercase; font-weight: bold;">${order.status}</span> | <strong>Payment:</strong> ${order.paymentStatus === 'PAID' ? 'Paid' : order.paymentStatus === 'CREDIT' ? 'Credit / Later' : 'Unpaid'}</p>
            </div>
          </div>

          ${order.remarks ? `
            <div class="remarks-box">
              <strong>Note / Remarks:</strong> ${order.remarks}
            </div>
          ` : ''}
          
          <table>
            <thead>
              <tr>
                <th class="col-num center">#</th>
                <th class="col-name">Product Description</th>
                <th class="col-qty center">Qty</th>
                <th class="col-rate right">Unit Price</th>
                <th class="col-amount right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="summary-section">
            <div class="summary-notes">
              <p>Thank you for shopping with <strong>Hero Crackers</strong>!</p>
              <p>This is a computer-generated invoice and does not require a physical signature.</p>
            </div>
            <div class="totals">
              <div class="totals-row">
                <span>Total Items:</span>
                <strong>${totalItems}</strong>
              </div>
              <div class="totals-row">
                <span>Total Quantity:</span>
                <strong>${totalQty}</strong>
              </div>
              <div class="totals-row grand-total">
                <span>Grand Total:</span>
                <span>₹${(order.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            Hero Crackers, Sivakasi • All Disputes Subject to Sivakasi Jurisdiction
          </div>
          
          <script>
            function setDensity(density) {
              document.body.className = 'density-' + density;
              try {
                localStorage.setItem('hero_invoice_density', density);
              } catch(e) {}
            }
            try {
              var saved = localStorage.getItem('hero_invoice_density');
              if (saved) {
                document.getElementById('densitySelect').value = saved;
                setDensity(saved);
              }
            } catch(e) {}
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
          onEditOrder={onEditOrder}
          onDuplicateOrder={onDuplicateOrder}
          onRepeatOrder={onRepeatOrder}
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
