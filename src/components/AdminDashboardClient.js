'use client';

import { useState, useMemo } from 'react';

export default function AdminDashboardClient({ initialOrders, initialProducts, categories, initialGodowns }) {
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [godowns, setGodowns] = useState(initialGodowns);
  
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'quickbill', 'masters'
  const [activeMasterTab, setActiveMasterTab] = useState('product');
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Forms state
  const [categoryName, setCategoryName] = useState('');
  const [godownName, setGodownName] = useState('');
  const [godownLocation, setGodownLocation] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', basePrice: '', price: '', discount: '', stockShop: '', categoryId: categories.length > 0 ? categories[0].id : '', imageUrl: ''
  });

  // Filters for Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('ALL');
  
  // Advanced Features State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Dispatch Modal
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchOrderId, setDispatchOrderId] = useState(null);
  const [transportName, setTransportName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Quick Bill POS State
  const [quickBillCart, setQuickBillCart] = useState({}); // { productId: quantity }
  const [quickBillCustomer, setQuickBillCustomer] = useState({ name: '', phone: '', address: 'Walk-in / Store Pickup' });
  const [isBilling, setIsBilling] = useState(false);


  const filteredOrders = useMemo(() => {
    let result = orders;
    
    if (orderFilter !== 'ALL') {
      result = result.filter(o => o.status === orderFilter);
    }
    
    if (startDate) {
      result = result.filter(o => new Date(o.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      result = result.filter(o => new Date(o.createdAt) < end);
    }

    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(q) || 
        o.shippingAddress.toLowerCase().includes(q) || 
        (o.customerPhone && o.customerPhone.includes(q))
      );
    }
    // Sort newest first
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, orderFilter, orderSearch, startDate, endDate]);

  // Dynamic Analytics based on filters
  const periodRevenue = useMemo(() => {
    return filteredOrders
      .filter(o => o.status !== 'PENDING' && o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [filteredOrders]);

  const periodPendingCount = filteredOrders.filter(o => o.status === 'PENDING').length;
  const periodShippedCount = filteredOrders.filter(o => o.status === 'SHIPPED').length;


  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === 'SHIPPED') {
      setDispatchOrderId(orderId);
      setDispatchModalOpen(true);
      return;
    }
    if (newStatus === 'CANCELLED' && !confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    await updateOrder(orderId, { status: newStatus });
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!dispatchOrderId) return;
    
    await updateOrder(dispatchOrderId, { 
      status: 'SHIPPED', 
      transportName, 
      trackingNumber 
    });
    
    setDispatchModalOpen(false);
    setTransportName('');
    setTrackingNumber('');
  };

  const updateOrder = async (orderId, data) => {
    setLoadingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      }
    } finally {
      setLoadingOrderId(null);
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
    if (selectedOrders.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
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
    
    setOrders(orders.map(o => selectedOrders.includes(o.id) ? { ...o, status: newStatus } : o));
    setSelectedOrders([]); // Clear selection
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer Phone', 'Address', 'Status', 'Total Amount'];
    const rows = filteredOrders.map(o => [
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

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryName })
    });
    if (res.ok) {
      alert('Category added! Refresh to see it in dropdowns.');
      setCategoryName('');
    }
  };
  
  const handleAddGodown = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/godowns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: godownName, location: godownLocation })
    });
    if (res.ok) {
      const added = await res.json();
      setGodowns([...godowns, { ...added, stocks: [] }]);
      setGodownName(''); setGodownLocation('');
    }
  };

  const handleUpdateGodownStock = async (godownId, productId, quantity) => {
    await fetch('/api/godowns/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ godownId, productId, quantity })
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProduct, imageUrls: newProduct.imageUrl ? [newProduct.imageUrl] : [] })
    });
    if (res.ok) {
      const addedProduct = await res.json();
      setProducts([...products, addedProduct]);
      setNewProduct({ ...newProduct, name: '', description: '', basePrice: '', price: '', discount: '', stockShop: '', imageUrl: '' });
    }
  };

  const triggerPrint = (orderId) => {
    const printContent = document.getElementById(`print-invoice-${orderId}`);
    if (!printContent) return;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); 
  };

  // Quick Bill Handlers
  const updateQuickBillQty = (productId, delta) => {
    setQuickBillCart(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      const newCart = { ...prev };
      if (next === 0) delete newCart[productId];
      else newCart[productId] = next;
      return newCart;
    });
  };

  const quickBillTotal = useMemo(() => {
    return Object.entries(quickBillCart).reduce((sum, [id, qty]) => {
      const p = products.find(prod => prod.id === id);
      return sum + ((p?.price || 0) * qty);
    }, 0);
  }, [quickBillCart, products]);

  const handleGenerateQuickBill = async (e) => {
    e.preventDefault();
    if (Object.keys(quickBillCart).length === 0) return alert('Cart is empty!');
    setIsBilling(true);
    
    const items = Object.entries(quickBillCart).map(([id, qty]) => {
      const p = products.find(prod => prod.id === id);
      return { productId: id, quantity: qty, price: p.price };
    });
    
    const payload = {
      customerName: quickBillCustomer.name || 'Walk-in Customer',
      customerPhone: quickBillCustomer.phone || '0000000000',
      shippingAddress: quickBillCustomer.address,
      totalAmount: quickBillTotal,
      items
    };
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const order = await res.json();
        setOrders([order, ...orders]);
        setQuickBillCart({});
        setQuickBillCustomer({ name: '', phone: '', address: 'Walk-in / Store Pickup' });
        
        setTimeout(() => triggerPrint(order.id), 300);
      }
    } finally {
      setIsBilling(false);
    }
  };


  // ---------------- UI THEME SYSTEM ---------------- //
  const darkTheme = {
    bg: '#0f172a',
    cardBg: '#1e293b',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#f59e0b',
    accentHover: '#d97706',
    border: '#334155',
    inputBg: '#0f172a',
    danger: '#ef4444',
    success: '#10b981',
    info: '#3b82f6',
    shipped: '#8b5cf6',
    cancelled: '#ef4444',
  };

  const lightTheme = {
    bg: '#f8fafc',
    cardBg: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    accent: '#d97706',
    accentHover: '#b45309',
    border: '#e2e8f0',
    inputBg: '#f1f5f9',
    danger: '#dc2626',
    success: '#059669',
    info: '#2563eb',
    shipped: '#7c3aed',
    cancelled: '#dc2626',
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const cardStyle = {
    backgroundColor: theme.cardBg,
    borderRadius: '16px',
    padding: '30px',
    boxShadow: isDarkMode ? '0 10px 25px rgba(0,0,0,0.2)' : '0 10px 25px rgba(0,0,0,0.05)',
    border: `1px solid ${theme.border}`,
    color: theme.textPrimary,
    transition: 'all 0.3s'
  };

  // Redesigned Single-Line Horizontal List Card
  const listCardStyle = {
    backgroundColor: theme.cardBg,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: isDarkMode ? '0 5px 15px rgba(0,0,0,0.1)' : '0 5px 15px rgba(0,0,0,0.02)',
    border: `1px solid ${theme.border}`,
    color: theme.textPrimary,
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    margin: '8px 0 20px 0',
    backgroundColor: theme.inputBg,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    color: theme.textPrimary,
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s',
  };

  const searchInputStyle = {
    width: '100%',
    maxWidth: '350px',
    padding: '14px 20px',
    backgroundColor: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: '30px',
    color: theme.textPrimary,
    fontSize: '1.05rem',
    outline: 'none',
    boxShadow: `inset 0 2px 4px rgba(0,0,0,${isDarkMode ? '0.2' : '0.02'})`,
    transition: 'border-color 0.3s, box-shadow 0.3s',
  };

  const dateInputStyle = {
    ...searchInputStyle,
    padding: '12px 20px',
    fontSize: '0.9rem',
    maxWidth: '160px',
    color: theme.textSecondary,
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const btnPrimary = {
    padding: '12px 24px',
    backgroundColor: theme.accent,
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
    boxShadow: `0 4px 10px ${theme.accent}40`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const qtyBtnStyle = {
    padding: '5px 12px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    backgroundColor: theme.inputBg,
    border: `1px solid ${theme.border}`,
    color: theme.textPrimary,
    cursor: 'pointer',
    borderRadius: '8px',
    outline: 'none'
  };

  const statusBadge = (status) => {
    let color = theme.textSecondary;
    if(status === 'PENDING') color = theme.accent;
    if(status === 'PROCESSING') color = theme.info;
    if(status === 'SHIPPED') color = theme.shipped;
    if(status === 'DELIVERED') color = theme.success;
    if(status === 'CANCELLED') color = theme.cancelled;
    
    return (
      <span style={{ 
        padding: '6px 14px', 
        borderRadius: '20px', 
        fontSize: '0.75rem', 
        fontWeight: 'bold',
        letterSpacing: '0.5px',
        backgroundColor: `${color}15`, 
        color: color, 
        border: `1px solid ${color}40`,
        boxShadow: `0 0 10px ${color}20`,
        textTransform: 'uppercase',
        display: 'inline-block'
      }}>
        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color, marginRight: '6px', marginBottom: '1px' }}></span>
        {status}
      </span>
    );
  };

  const TabButton = ({ active, onClick, children }) => (
    <button 
      className="tab-btn"
      onClick={onClick}
      style={{
        padding: '14px 28px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        backgroundColor: active ? theme.cardBg : 'transparent',
        color: active ? theme.accent : theme.textSecondary,
        border: 'none',
        borderBottom: active ? `3px solid ${theme.accent}` : '3px solid transparent',
        transition: 'all 0.3s',
        outline: 'none'
      }}
      onMouseOver={e => !active && (e.target.style.color = theme.textPrimary)}
      onMouseOut={e => !active && (e.target.style.color = theme.textSecondary)}
    >
      {children}
    </button>
  );

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '40px 20px', fontFamily: '"Inter", sans-serif', transition: 'background-color 0.3s' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .order-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,${isDarkMode ? '0.4' : '0.1'}) !important; }
        .search-input:focus, .date-input:focus { border-color: ${theme.accent} !important; box-shadow: 0 0 0 3px ${theme.accent}20 !important; }
        .custom-checkbox { width: 22px; height: 22px; cursor: pointer; accent-color: ${theme.accent}; }
        
        /* Global Button Hover Effects (Glowing & Lifting) */
        button { transition: all 0.2s ease-in-out !important; }
        .action-btn { position: relative; overflow: hidden; }
        .action-btn:hover:not(:disabled) {
           transform: scale(1.03) translateY(-2px) !important;
           filter: brightness(1.2) !important;
           box-shadow: 0 8px 20px rgba(0,0,0,0.3) !important;
           opacity: 0.95;
        }
        .action-btn:active:not(:disabled) {
           transform: scale(0.97) translateY(0) !important;
           filter: brightness(0.9) !important;
        }
        button:disabled { opacity: 0.5 !important; cursor: not-allowed !important; filter: grayscale(1) !important; }
        
        .qty-btn:hover { background-color: ${theme.accent} !important; color: white !important; border-color: ${theme.accent} !important; transform: scale(1.1); }
        .qty-btn:active { transform: scale(0.95) !important; }
        
        .filter-btn:hover { background-color: ${theme.cardBg} !important; opacity: 0.8 !important; transform: translateY(-1px); }
      `}} />

      {/* Hidden Print Layouts for ALL Orders (Required so Quick Bill instantly finds it) */}
      <div style={{ display: 'none' }}>
        {orders.map(order => (
          <div key={order.id} id={`print-invoice-${order.id}`}>
            <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#000', backgroundColor: '#fff' }}>
              <h1 style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px' }}>HERO CRACKERS</h1>
              <h2 style={{ textAlign: 'center' }}>PACKING SLIP / INVOICE</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <div>
                  <p><strong>Order ID:</strong> {order.id.slice(-6).toUpperCase()}</p>
                  <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p><strong>Customer ID:</strong> {order.userId.slice(-6)}</p>
                  <p><strong>Phone:</strong> {order.customerPhone || 'N/A'}</p>
                </div>
              </div>
              <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc' }}>
                <p><strong>Shipping Address:</strong><br/>{order.shippingAddress}</p>
              </div>
              <table style={{ width: '100%', marginTop: '30px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Item</th>
                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Qty</th>
                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <tr key={item.id}>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>{product ? product.name : 'Item'}</td>
                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>₹{item.price * item.quantity}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="2" style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Total:</th>
                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>₹{order.totalAmount}</th>
                  </tr>
                </tfoot>
              </table>
              <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '0.9rem', color: '#555' }}>
                Thank you for shopping with Hero Crackers! Have a safe and happy Diwali.
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Overlay for Dispatch */}
      {dispatchModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...cardStyle, width: '400px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: theme.textPrimary }}>Dispatch Order</h3>
            <form onSubmit={handleDispatchSubmit}>
              <label style={labelStyle}>Transport / Courier Name</label>
              <input type="text" required value={transportName} onChange={e => setTransportName(e.target.value)} style={inputStyle} placeholder="e.g. Navata Transport" />
              <label style={labelStyle}>Lorry Receipt (LR) / Tracking Number</label>
              <input type="text" required value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} style={inputStyle} placeholder="e.g. LR-98765432" />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setDispatchModalOpen(false)} className="action-btn" style={{ ...btnPrimary, flex: 1, backgroundColor: 'transparent', color: theme.textPrimary, border: `1px solid ${theme.border}`, boxShadow: 'none' }}>Cancel</button>
                <button type="submit" className="action-btn" style={{ ...btnPrimary, flex: 1 }}>Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: theme.textPrimary, margin: '0 0 10px 0', transition: 'color 0.3s' }}>
              Command Center
            </h1>
            <p style={{ color: theme.textSecondary, margin: 0, fontSize: '1.1rem' }}>Manage orders, inventory, and masters seamlessly.</p>
          </div>
          <button 
            className="action-btn"
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{ 
              padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold',
              backgroundColor: theme.cardBg, color: theme.textPrimary, border: `1px solid ${theme.border}`,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
        
        {/* Main Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: `1px solid ${theme.border}`, flexWrap: 'wrap' }}>
          <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>Orders & Analytics</TabButton>
          <TabButton active={activeTab === 'quickbill'} onClick={() => setActiveTab('quickbill')}>⚡ Quick Bill (POS)</TabButton>
          <TabButton active={activeTab === 'masters'} onClick={() => setActiveTab('masters')}>Data Masters</TabButton>
        </div>
        
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {/* Dynamic Analytics Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ ...cardStyle, padding: '25px', background: `linear-gradient(135deg, ${theme.cardBg} 0%, ${theme.accent}15 100%)`, border: `1px solid ${theme.accent}40`, boxShadow: `0 10px 30px ${theme.accent}15` }}>
                <h4 style={{ margin: '0 0 10px 0', color: theme.textSecondary, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Period Revenue</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: theme.accent, textShadow: `0 2px 10px ${theme.accent}30` }}>₹{periodRevenue.toLocaleString()}</div>
              </div>
              <div style={{ ...cardStyle, padding: '25px', background: `linear-gradient(135deg, ${theme.cardBg} 0%, ${theme.info}15 100%)`, border: `1px solid ${theme.info}40`, boxShadow: `0 10px 30px ${theme.info}15` }}>
                <h4 style={{ margin: '0 0 10px 0', color: theme.textSecondary, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Pending Orders</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: theme.info, textShadow: `0 2px 10px ${theme.info}30` }}>
                  {periodPendingCount} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: theme.textSecondary }}>Requires Action</span>
                </div>
              </div>
              <div style={{ ...cardStyle, padding: '25px', background: `linear-gradient(135deg, ${theme.cardBg} 0%, ${theme.shipped}15 100%)`, border: `1px solid ${theme.shipped}40`, boxShadow: `0 10px 30px ${theme.shipped}15` }}>
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
                  style={searchInputStyle}
                />
                
                {/* Date Pickers */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="date-input" style={dateInputStyle} />
                  <span style={{ color: theme.textSecondary }}>to</span>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="date-input" style={dateInputStyle} />
                  {(startDate || endDate) && (
                    <button className="action-btn" onClick={() => { setStartDate(''); setEndDate(''); }} style={{ background: 'transparent', border: 'none', color: theme.cancelled, cursor: 'pointer', padding: '5px' }}>✕ Clear</button>
                  )}
                </div>
              </div>
              
              {/* Export Button */}
              <button className="action-btn" onClick={exportToCSV} style={{ ...btnPrimary, backgroundColor: theme.cardBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, boxShadow: 'none', padding: '12px 20px' }}>
                📊 Export CSV
              </button>
            </div>

            {/* Segmented Control for Filters */}
            <div style={{ display: 'flex', backgroundColor: theme.inputBg, padding: '5px', borderRadius: '30px', border: `1px solid ${theme.border}`, flexWrap: 'wrap', marginBottom: '30px', width: 'fit-content' }}>
              {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(f => (
                <button 
                  key={f}
                  className="filter-btn"
                  onClick={() => setOrderFilter(f)}
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
                  <button className="action-btn" onClick={() => handleBulkStatusChange('PROCESSING')} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: theme.info, boxShadow: 'none' }}>Bulk Process</button>
                  <button className="action-btn" onClick={() => handleBulkStatusChange('SHIPPED')} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: theme.shipped, boxShadow: 'none' }}>Bulk Dispatch (No Tracking)</button>
                  <button className="action-btn" onClick={() => handleBulkStatusChange('DELIVERED')} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: theme.success, boxShadow: 'none' }}>Bulk Deliver</button>
                  <button className="action-btn" onClick={() => handleBulkStatusChange('CANCELLED')} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: 'transparent', color: theme.cancelled, border: `1px solid ${theme.cancelled}`, boxShadow: 'none' }}>Bulk Cancel</button>
                </div>
              </div>
            )}

            {/* Select All Utility */}
            <div style={{ marginBottom: '15px', paddingLeft: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theme.textSecondary, cursor: 'pointer', fontSize: '0.9rem' }}>
                <input 
                  type="checkbox" 
                  className="custom-checkbox"
                  checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                  onChange={handleSelectAll}
                />
                Select All {filteredOrders.length} Filtered Orders
              </label>
            </div>

            {/* SINGLE LINE LIST VIEW (Horizontal Layout) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {filteredOrders.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', backgroundColor: theme.cardBg, borderRadius: '16px', border: `1px dashed ${theme.border}` }}>
                  <span style={{ fontSize: '3rem' }}>📭</span>
                  <h3 style={{ color: theme.textPrimary, margin: '15px 0 5px 0' }}>No orders found</h3>
                  <p style={{ color: theme.textSecondary }}>Try adjusting your filters or date range.</p>
                </div>
              ) : filteredOrders.map(order => (
                <div key={order.id} className="order-card" style={{ ...listCardStyle, opacity: order.status === 'CANCELLED' ? 0.6 : 1, flexWrap: 'wrap' }}>
                  
                  {/* Column 1: Checkbox, ID & Status */}
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
                    <div>{statusBadge(order.status)}</div>
                  </div>
                  
                  {/* Column 2: Total & Contact */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1.5', minWidth: '220px' }}>
                    <strong style={{ fontSize: '1.8rem', color: theme.textPrimary, letterSpacing: '-1px', textDecoration: order.status === 'CANCELLED' ? 'line-through' : 'none' }}>
                      ₹{order.totalAmount.toLocaleString()}
                    </strong>
                    <div style={{ fontSize: '0.85rem', color: theme.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      📞 <strong style={{ color: theme.textPrimary }}>{order.customerPhone || 'N/A'}</strong> • 📍 {order.shippingAddress}
                    </div>
                    {(order.transportName || order.trackingNumber) && (
                      <div style={{ fontSize: '0.8rem', color: theme.shipped, marginTop: '2px', fontWeight: 'bold' }}>
                        LR: {order.trackingNumber} ({order.transportName})
                      </div>
                    )}
                  </div>

                  {/* Column 3: Compressed Items Summary */}
                  <div style={{ flex: '2', minWidth: '250px', padding: '0 15px', borderLeft: `1px solid ${theme.border}`, borderRight: `1px solid ${theme.border}`, fontSize: '0.9rem', color: theme.textSecondary, display: 'flex', alignItems: 'center' }}>
                    {(() => {
                      const parts = order.items.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        return product ? `${product.name} x${item.quantity}` : `Item x${item.quantity}`;
                      });
                      const showing = parts.slice(0, 2).join(', ');
                      const hidden = parts.length > 2 ? ` (+${parts.length - 2} more)` : '';
                      return <span style={{ lineHeight: '1.4' }}>{showing} <strong style={{ color: theme.textPrimary }}>{hidden}</strong></span>;
                    })()}
                  </div>

                  {/* Column 4: Action Buttons (Right-aligned) */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', flex: '1.5', minWidth: '280px', justifyContent: 'flex-end' }}>
                    
                    {/* Utility Icons (Print & WhatsApp) */}
                    <div style={{ display: 'flex', gap: '8px', marginRight: 'auto' }}>
                      <button className="action-btn" onClick={() => triggerPrint(order.id)} style={{ ...btnPrimary, padding: '8px 12px', backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, boxShadow: 'none' }}>
                        🖨️
                      </button>
                      
                      {order.customerPhone && (
                        <a 
                          className="action-btn"
                          href={`https://wa.me/91${order.customerPhone.replace(/[^0-9]/g, '').slice(-10)}?text=Hello! Your Hero Crackers order %23${order.id.slice(-6).toUpperCase()} is currently ${order.status}.${order.trackingNumber ? ` It was dispatched via ${order.transportName}. Tracking LR: ${order.trackingNumber}` : ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ ...btnPrimary, padding: '8px 12px', backgroundColor: '#25D36615', color: '#25D366', border: '1px solid #25D36640', boxShadow: 'none', textDecoration: 'none' }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                        </a>
                      )}
                    </div>
                    
                    {/* Main Status Actions */}
                    {order.status !== 'CANCELLED' && (
                      <>
                        {order.status !== 'PROCESSING' && <button className="action-btn" disabled={loadingOrderId === order.id} onClick={() => handleStatusChange(order.id, 'PROCESSING')} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: theme.info, boxShadow: 'none' }}>Process</button>}
                        {order.status !== 'SHIPPED' && <button className="action-btn" disabled={loadingOrderId === order.id} onClick={() => handleStatusChange(order.id, 'SHIPPED')} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: theme.shipped, boxShadow: 'none' }}>Dispatch</button>}
                        {order.status !== 'DELIVERED' && <button className="action-btn" disabled={loadingOrderId === order.id} onClick={() => handleStatusChange(order.id, 'DELIVERED')} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: theme.success, boxShadow: 'none' }}>Deliver</button>}
                        <button className="action-btn" disabled={loadingOrderId === order.id} onClick={() => handleStatusChange(order.id, 'CANCELLED')} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: 'transparent', color: theme.cancelled, border: `1px solid ${theme.cancelled}`, boxShadow: 'none' }}>✕ Cancel</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Bill (POS) Tab */}
        {activeTab === 'quickbill' && (
          <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            
            {/* Left Panel: Scrollable Product Matrix */}
            <div style={{ flex: '1 1 600px', backgroundColor: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: `0 10px 25px rgba(0,0,0,${isDarkMode ? '0.2' : '0.05'})`, padding: '20px', maxHeight: '800px', overflowY: 'auto' }}>
              <h2 style={{ color: theme.textPrimary, margin: '0 0 20px 0', fontSize: '1.8rem', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px' }}>Product Matrix</h2>
              
              {categories.map(category => {
                const catProducts = products.filter(p => p.categoryId === category.id);
                if (catProducts.length === 0) return null;
                
                return (
                  <div key={category.id} style={{ marginBottom: '30px' }}>
                    <div style={{ backgroundColor: theme.inputBg, padding: '10px 15px', borderRadius: '8px', color: theme.accent, fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {category.name}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {catProducts.map(product => {
                        const qty = quickBillCart[product.id] || 0;
                        return (
                          <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', backgroundColor: theme.bg, borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ color: theme.textPrimary, fontWeight: '600', fontSize: '1.05rem' }}>{product.name}</div>
                              <div style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>₹{product.price}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                              <button className="qty-btn" onClick={() => updateQuickBillQty(product.id, -1)} style={qtyBtnStyle}>-</button>
                              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: theme.textPrimary, width: '30px', textAlign: 'center' }}>{qty}</span>
                              <button className="qty-btn" onClick={() => updateQuickBillQty(product.id, 1)} style={qtyBtnStyle}>+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Panel: Sticky Cart Summary */}
            <div style={{ flex: '1 1 350px', position: 'sticky', top: '20px' }}>
              <form onSubmit={handleGenerateQuickBill} style={{ backgroundColor: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: `0 10px 25px rgba(0,0,0,${isDarkMode ? '0.2' : '0.05'})`, padding: '30px' }}>
                <h2 style={{ color: theme.textPrimary, margin: '0 0 25px 0', fontSize: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cart Summary</span>
                  <span style={{ color: theme.accent, fontSize: '1.2rem' }}>{Object.keys(quickBillCart).length} Items</span>
                </h2>
                
                <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '20px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>
                  {Object.entries(quickBillCart).length === 0 ? (
                    <div style={{ color: theme.textSecondary, textAlign: 'center', padding: '20px 0' }}>Cart is empty</div>
                  ) : (
                    Object.entries(quickBillCart).map(([id, qty]) => {
                      const p = products.find(prod => prod.id === id);
                      return (
                        <div key={id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: theme.textSecondary, fontSize: '0.95rem' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{p?.name}</span>
                          <span style={{ color: theme.textPrimary, fontWeight: 'bold' }}>{qty} x ₹{p?.price}</span>
                        </div>
                      )
                    })
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                  <span style={{ fontSize: '1.2rem', color: theme.textSecondary }}>Grand Total</span>
                  <strong style={{ fontSize: '2.5rem', color: theme.accent, letterSpacing: '-1px' }}>₹{quickBillTotal.toLocaleString()}</strong>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={labelStyle}>Customer Name (Optional)</label>
                  <input type="text" value={quickBillCustomer.name} onChange={e => setQuickBillCustomer({...quickBillCustomer, name: e.target.value})} style={inputStyle} placeholder="Walk-in Customer" />
                  
                  <label style={labelStyle}>Phone Number (Optional)</label>
                  <input type="text" value={quickBillCustomer.phone} onChange={e => setQuickBillCustomer({...quickBillCustomer, phone: e.target.value})} style={inputStyle} placeholder="0000000000" />
                  
                  <label style={labelStyle}>Address / Notes</label>
                  <input type="text" value={quickBillCustomer.address} onChange={e => setQuickBillCustomer({...quickBillCustomer, address: e.target.value})} style={{...inputStyle, marginBottom: 0}} />
                </div>

                <button 
                  type="submit" 
                  className="action-btn"
                  disabled={isBilling || Object.keys(quickBillCart).length === 0}
                  style={{ 
                    ...btnPrimary, 
                    width: '100%', 
                    padding: '16px', 
                    fontSize: '1.2rem', 
                    backgroundColor: isBilling ? theme.border : theme.success, 
                    boxShadow: isBilling ? 'none' : `0 4px 15px ${theme.success}50` 
                  }}
                >
                  {isBilling ? 'Generating...' : '⚡ Generate Bill & Print'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Masters Tab */}
        {activeTab === 'masters' && (
          <div style={cardStyle}>
            {/* Sub-navigation */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
              {['product', 'category', 'godown'].map(tab => (
                <button 
                  key={tab}
                  className="tab-btn"
                  onClick={() => setActiveMasterTab(tab)} 
                  style={{ 
                    padding: '10px 24px', 
                    borderRadius: '30px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer', 
                    transition: 'all 0.2s',
                    backgroundColor: activeMasterTab === tab ? theme.accent : 'transparent', 
                    color: activeMasterTab === tab ? '#fff' : theme.textSecondary,
                    border: `1px solid ${activeMasterTab === tab ? theme.accent : theme.border}`,
                    boxShadow: activeMasterTab === tab ? `0 4px 12px ${theme.accent}40` : 'none'
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} Master
                </button>
              ))}
            </div>

            {/* Product Master */}
            {activeMasterTab === 'product' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
                {/* Form */}
                <div>
                  <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '25px' }}>Create Product</h3>
                  <form onSubmit={handleAddProduct}>
                    <label style={labelStyle}>Product Name</label>
                    <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required style={inputStyle} />
                    
                    <label style={labelStyle}>Category</label>
                    <select value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})} required style={inputStyle}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>MRP (Base)</label>
                        <input type="number" step="0.01" value={newProduct.basePrice} onChange={e => setNewProduct({...newProduct, basePrice: e.target.value})} required style={inputStyle} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Selling Price</label>
                        <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required style={inputStyle} />
                      </div>
                    </div>

                    <label style={labelStyle}>Image URL</label>
                    <input type="url" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} style={inputStyle} />

                    <button type="submit" className="action-btn" style={{ ...btnPrimary, width: '100%', marginTop: '10px' }}>Save Product</button>
                  </form>
                </div>

                {/* Table */}
                <div>
                  <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '25px' }}>Product Directory</h3>
                  <div style={{ overflowY: 'auto', maxHeight: '550px', border: `1px solid ${theme.border}`, borderRadius: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ position: 'sticky', top: 0, backgroundColor: theme.bg, zIndex: 1, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <tr>
                          <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Item</th>
                          <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(product => (
                          <tr key={product.id} style={{ borderBottom: `1px solid ${theme.border}`, transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = theme.bg} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '15px', color: theme.textPrimary }}>{product.name}</td>
                            <td style={{ padding: '15px', color: theme.accent, fontWeight: 'bold' }}>₹{product.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Category Master */}
            {activeMasterTab === 'category' && (
              <div style={{ maxWidth: '500px' }}>
                <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '25px' }}>Add Category</h3>
                <form onSubmit={handleAddCategory} style={{ marginBottom: '40px' }}>
                  <label style={labelStyle}>Category Name</label>
                  <input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} required style={inputStyle} />
                  <button type="submit" className="action-btn" style={btnPrimary}>Save Category</button>
                </form>
                
                <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '25px' }}>Existing Categories</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {categories.map(c => (
                    <span key={c.id} style={{ padding: '8px 16px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '20px', color: theme.textSecondary, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Godown Master */}
            {activeMasterTab === 'godown' && (
              <div>
                <div style={{ display: 'flex', gap: '40px', marginBottom: '50px', alignItems: 'start', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 400px' }}>
                    <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '25px' }}>Register Godown</h3>
                    <form onSubmit={handleAddGodown}>
                      <label style={labelStyle}>Godown Name</label>
                      <input type="text" value={godownName} onChange={e => setGodownName(e.target.value)} required style={inputStyle} />
                      <label style={labelStyle}>Location / Address</label>
                      <input type="text" value={godownLocation} onChange={e => setGodownLocation(e.target.value)} style={inputStyle} />
                      <button type="submit" className="action-btn" style={btnPrimary}>Register Godown</button>
                    </form>
                  </div>
                  
                  <div style={{ flex: '1 1 400px' }}>
                    <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '25px' }}>Registered Locations</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                      {godowns.map(g => (
                        <div key={g.id} style={{ padding: '20px', backgroundColor: theme.bg, borderRadius: '12px', border: `1px solid ${theme.border}`, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}>
                          <h4 style={{ margin: '0 0 5px 0', color: theme.accent, fontSize: '1.2rem' }}>{g.name}</h4>
                          <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>{g.location || 'No location specified'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '30px', backgroundColor: theme.bg, borderRadius: '12px', border: `1px solid ${theme.border}`, boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', margin: '0 0 10px 0' }}>Global Stock Matrix</h3>
                  <p style={{ color: theme.textSecondary, marginBottom: '25px' }}>Click any cell to instantly update the inventory level.</p>
                  
                  {godowns.length === 0 ? <p style={{ color: theme.accent }}>Please register a Godown first.</p> : (
                    <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: theme.cardBg }}>
                          <tr>
                            <th style={{ padding: '15px', color: theme.textPrimary, borderBottom: `1px solid ${theme.border}` }}>Product</th>
                            {godowns.map(g => (
                              <th key={g.id} style={{ padding: '15px', color: theme.accent, borderBottom: `1px solid ${theme.border}` }}>{g.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(product => (
                            <tr key={product.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                              <td style={{ padding: '15px', color: theme.textSecondary }}>{product.name}</td>
                              {godowns.map(godown => {
                                const qty = godown.stocks?.find(s => s.productId === product.id)?.quantity || 0;
                                return (
                                  <td key={godown.id} style={{ padding: '15px' }}>
                                    <input 
                                      type="number" 
                                      defaultValue={qty}
                                      onBlur={(e) => e.target.value !== String(qty) && handleUpdateGodownStock(godown.id, product.id, e.target.value)}
                                      style={{ width: '80px', padding: '8px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '6px', color: theme.textPrimary, outline: 'none' }}
                                    />
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
