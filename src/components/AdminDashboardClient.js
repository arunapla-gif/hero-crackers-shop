'use client';

import { useState, useMemo } from 'react';

export default function AdminDashboardClient({ initialOrders, initialProducts, categories, initialGodowns }) {
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [godowns, setGodowns] = useState(initialGodowns);
  
  const [activeTab, setActiveTab] = useState('orders');
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

  // Dispatch Modal
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchOrderId, setDispatchOrderId] = useState(null);
  const [transportName, setTransportName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Calculate Analytics
  const todayRevenue = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return orders
      .filter(o => {
        const dateStr = new Date(o.createdAt).toISOString();
        return dateStr.startsWith(today) && o.status !== 'PENDING';
      })
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const shippedCount = orders.filter(o => o.status === 'SHIPPED').length;

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (orderFilter !== 'ALL') {
      result = result.filter(o => o.status === orderFilter);
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
  }, [orders, orderFilter, orderSearch]);


  const handleStatusChange = async (orderId, newStatus) => {
    // If marking as shipped, open dispatch modal instead
    if (newStatus === 'SHIPPED') {
      setDispatchOrderId(orderId);
      setDispatchModalOpen(true);
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

  // Rest of the master handlers (Product, Category, Godown) remain same
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
    // Hide standard UI, show print UI, trigger print, revert
    const printContent = document.getElementById(`print-invoice-${orderId}`);
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore React state bindings after native innerHTML mutation
  };

  // UI Styles definition
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
    transition: 'all 0.3s',
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
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    transition: 'all 0.2s',
    boxShadow: `0 4px 10px ${theme.accent}40`
  };

  const statusBadge = (status) => {
    let color = theme.textSecondary;
    if(status === 'PENDING') color = theme.accent;
    if(status === 'PROCESSING') color = theme.info;
    if(status === 'SHIPPED') color = '#8b5cf6';
    if(status === 'DELIVERED') color = theme.success;
    return (
      <span style={{ 
        padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
        backgroundColor: `${color}22`, color: color, border: `1px solid ${color}55`
      }}>
        {status}
      </span>
    );
  };

  const TabButton = ({ active, onClick, children }) => (
    <button 
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
                <button type="button" onClick={() => setDispatchModalOpen(false)} style={{ ...btnPrimary, flex: 1, backgroundColor: 'transparent', color: theme.textPrimary, border: `1px solid ${theme.border}`, boxShadow: 'none' }}>Cancel</button>
                <button type="submit" style={{ ...btnPrimary, flex: 1 }}>Confirm Dispatch</button>
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
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{ 
              padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold',
              backgroundColor: theme.cardBg, color: theme.textPrimary, border: `1px solid ${theme.border}`,
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'
            }}
          >
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
        
        {/* Main Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: `1px solid ${theme.border}` }}>
          <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>Orders & Analytics</TabButton>
          <TabButton active={activeTab === 'masters'} onClick={() => setActiveTab('masters')}>Data Masters</TabButton>
        </div>
        
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {/* Analytics Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <div style={{ ...cardStyle, padding: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: theme.textSecondary, textTransform: 'uppercase', fontSize: '0.85rem' }}>Today's Processed Revenue</h4>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.accent }}>₹{todayRevenue.toLocaleString()}</div>
              </div>
              <div style={{ ...cardStyle, padding: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: theme.textSecondary, textTransform: 'uppercase', fontSize: '0.85rem' }}>Pending Orders</h4>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.textPrimary }}>{pendingCount} <span style={{ fontSize: '0.9rem', color: theme.textSecondary }}>Requires Action</span></div>
              </div>
              <div style={{ ...cardStyle, padding: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: theme.textSecondary, textTransform: 'uppercase', fontSize: '0.85rem' }}>Total Shipped</h4>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{shippedCount} <span style={{ fontSize: '0.9rem', color: theme.textSecondary }}>In Transit</span></div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Search by Order ID, Address, or Phone..." 
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                style={{ ...inputStyle, margin: 0, width: '100%', maxWidth: '450px' }}
              />
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    style={{ 
                      padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
                      backgroundColor: orderFilter === f ? theme.accent : theme.cardBg,
                      color: orderFilter === f ? '#fff' : theme.textSecondary,
                      border: `1px solid ${orderFilter === f ? theme.accent : theme.border}`,
                      transition: 'all 0.2s'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
              {filteredOrders.length === 0 ? <p style={{ color: theme.textSecondary }}>No orders found.</p> : filteredOrders.map(order => (
                <div key={order.id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  
                  {/* Hidden Print Layout */}
                  <div id={`print-invoice-${order.id}`} style={{ display: 'none' }}>
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

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <strong style={{ fontSize: '1.2rem', color: theme.textPrimary }}>#{order.id.slice(-6).toUpperCase()}</strong>
                      {statusBadge(order.status)}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: theme.textSecondary, fontSize: '0.95rem' }}>
                      <span>Phone: {order.customerPhone || 'N/A'}</span>
                      <strong style={{ color: theme.accent, fontSize: '1.1rem' }}>₹{order.totalAmount}</strong>
                    </div>

                    <div style={{ marginBottom: '15px', color: theme.textSecondary, fontSize: '0.9rem' }}>
                      <strong>Address:</strong> {order.shippingAddress}
                    </div>
                    
                    {(order.transportName || order.trackingNumber) && (
                      <div style={{ backgroundColor: `${theme.accent}11`, border: `1px solid ${theme.accent}44`, padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem', color: theme.textPrimary }}>
                        <strong style={{ color: theme.accent }}>Dispatch Details:</strong><br/>
                        Transport: {order.transportName}<br/>
                        LR Number: {order.trackingNumber}
                      </div>
                    )}
                    
                    <div style={{ backgroundColor: theme.bg, padding: '15px', borderRadius: '8px', marginBottom: '20px', maxHeight: '120px', overflowY: 'auto' }}>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: theme.textSecondary }}>
                        {order.items.map(item => {
                          const product = products.find(p => p.id === item.productId);
                          return <li key={item.id} style={{ marginBottom: '5px' }}>{product ? product.name : 'Item'} x {item.quantity}</li>;
                        })}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={() => triggerPrint(order.id)} style={{ ...btnPrimary, backgroundColor: theme.bg, color: theme.textPrimary, border: `1px solid ${theme.border}`, boxShadow: 'none' }}>🖨️ Print</button>
                    
                    {order.customerPhone && (
                      <a 
                        href={`https://wa.me/91${order.customerPhone.replace(/[^0-9]/g, '').slice(-10)}?text=Hello! Your Hero Crackers order %23${order.id.slice(-6).toUpperCase()} is currently ${order.status}.${order.trackingNumber ? ` It was dispatched via ${order.transportName}. Tracking LR: ${order.trackingNumber}` : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...btnPrimary, backgroundColor: '#25D366', boxShadow: 'none', display: 'inline-block', textDecoration: 'none' }}
                      >
                        💬 WhatsApp
                      </a>
                    )}

                    <div style={{ width: '100%', height: '1px', backgroundColor: theme.border, margin: '5px 0' }}></div>

                    {order.status !== 'PROCESSING' && <button disabled={loadingOrderId === order.id} onClick={() => handleStatusChange(order.id, 'PROCESSING')} style={{ ...btnPrimary, flex: 1, backgroundColor: theme.info, boxShadow: 'none' }}>Process</button>}
                    {order.status !== 'SHIPPED' && <button disabled={loadingOrderId === order.id} onClick={() => handleStatusChange(order.id, 'SHIPPED')} style={{ ...btnPrimary, flex: 1, backgroundColor: '#8b5cf6', boxShadow: 'none' }}>Ship & Dispatch</button>}
                    {order.status !== 'DELIVERED' && <button disabled={loadingOrderId === order.id} onClick={() => handleStatusChange(order.id, 'DELIVERED')} style={{ ...btnPrimary, flex: 1, backgroundColor: theme.success, boxShadow: 'none' }}>Deliver</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Masters Tab */}
        {activeTab === 'masters' && (
          <div style={cardStyle}>
            {/* Sub-navigation */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
              {['product', 'category', 'godown'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveMasterTab(tab)} 
                  style={{ 
                    padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                    backgroundColor: activeMasterTab === tab ? theme.accent : 'transparent', 
                    color: activeMasterTab === tab ? '#fff' : theme.textSecondary,
                    border: `1px solid ${activeMasterTab === tab ? theme.accent : theme.border}`
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} Master
                </button>
              ))}
            </div>

            {/* Product Master */}
            {activeMasterTab === 'product' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
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

                    <button type="submit" style={{ ...btnPrimary, width: '100%', marginTop: '10px' }}>Save Product</button>
                  </form>
                </div>

                {/* Table */}
                <div>
                  <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '25px' }}>Product Directory</h3>
                  <div style={{ overflowY: 'auto', maxHeight: '550px', border: `1px solid ${theme.border}`, borderRadius: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ position: 'sticky', top: 0, backgroundColor: theme.bg, zIndex: 1 }}>
                        <tr>
                          <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Item</th>
                          <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(product => (
                          <tr key={product.id} style={{ borderBottom: `1px solid ${theme.border}`, transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = theme.bg} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '15px', color: theme.textPrimary }}>{product.name}</td>
                            <td style={{ padding: '15px', color: theme.accent }}>₹{product.price}</td>
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
                  <button type="submit" style={btnPrimary}>Save Category</button>
                </form>
                
                <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '25px' }}>Existing Categories</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {categories.map(c => (
                    <span key={c.id} style={{ padding: '8px 16px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '20px', color: theme.textSecondary }}>
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Godown Master */}
            {activeMasterTab === 'godown' && (
              <div>
                <div style={{ display: 'flex', gap: '40px', marginBottom: '50px', alignItems: 'start' }}>
                  <div style={{ flex: 1, maxWidth: '400px' }}>
                    <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '25px' }}>Register Godown</h3>
                    <form onSubmit={handleAddGodown}>
                      <label style={labelStyle}>Godown Name</label>
                      <input type="text" value={godownName} onChange={e => setGodownName(e.target.value)} required style={inputStyle} />
                      <label style={labelStyle}>Location / Address</label>
                      <input type="text" value={godownLocation} onChange={e => setGodownLocation(e.target.value)} style={inputStyle} />
                      <button type="submit" style={btnPrimary}>Register Godown</button>
                    </form>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '25px' }}>Registered Locations</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      {godowns.map(g => (
                        <div key={g.id} style={{ padding: '20px', backgroundColor: theme.bg, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                          <h4 style={{ margin: '0 0 5px 0', color: theme.accent, fontSize: '1.2rem' }}>{g.name}</h4>
                          <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>{g.location || 'No location specified'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '30px', backgroundColor: theme.bg, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
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
