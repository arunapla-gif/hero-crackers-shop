'use client';

import { useState } from 'react';

export default function AdminDashboardClient({ initialOrders, initialProducts, categories, initialGodowns }) {
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [godowns, setGodowns] = useState(initialGodowns);
  
  // Tab State
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'masters'
  const [activeMasterTab, setActiveMasterTab] = useState('category'); // 'category', 'product', 'godown'

  const [loadingOrderId, setLoadingOrderId] = useState(null);

  // Forms state
  const [categoryName, setCategoryName] = useState('');
  const [godownName, setGodownName] = useState('');
  const [godownLocation, setGodownLocation] = useState('');
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    basePrice: '',
    price: '',
    discount: '',
    stockShop: '',
    categoryId: categories.length > 0 ? categories[0].id : '',
    imageUrl: ''
  });

  const handleStatusChange = async (orderId, newStatus) => {
    setLoadingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      alert('Error updating order');
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName })
      });
      if (res.ok) {
        alert('Category added! Please refresh the page to see it in the dropdown.');
        setCategoryName('');
      } else {
        alert('Failed to add category');
      }
    } catch (error) {
      alert('Error adding category');
    }
  };
  
  const handleAddGodown = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/godowns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: godownName, location: godownLocation })
      });
      if (res.ok) {
        const added = await res.json();
        setGodowns([...godowns, { ...added, stocks: [] }]);
        setGodownName('');
        setGodownLocation('');
        alert('Godown added!');
      } else {
        alert('Failed to add godown');
      }
    } catch (error) {
      alert('Error adding godown');
    }
  };

  const handleUpdateGodownStock = async (godownId, productId, quantity) => {
    try {
      const res = await fetch('/api/godowns/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ godownId, productId, quantity })
      });
      if (!res.ok) alert('Failed to update stock');
    } catch (error) {
      alert('Error updating stock');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          imageUrls: newProduct.imageUrl ? [newProduct.imageUrl] : []
        })
      });
      if (res.ok) {
        const addedProduct = await res.json();
        setProducts([...products, addedProduct]);
        alert('Product added successfully!');
        setNewProduct({ ...newProduct, name: '', description: '', basePrice: '', price: '', discount: '', stockShop: '', imageUrl: '' });
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      alert('Error adding product');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return '#ffae00';
      case 'PROCESSING': return '#007bff';
      case 'SHIPPED': return '#17a2b8';
      case 'DELIVERED': return '#28a745';
      default: return '#333';
    }
  };

  const inputStyle = { width: '100%', padding: '10px', margin: '5px 0 15px 0', border: '1px solid #ccc', borderRadius: '5px' };
  
  const TabButton = ({ active, onClick, children }) => (
    <button 
      onClick={onClick}
      style={{
        padding: '12px 24px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        backgroundColor: active ? 'var(--color-primary)' : '#eee',
        color: active ? '#fff' : '#333',
        border: 'none',
        borderRadius: '8px 8px 0 0',
        marginRight: '5px'
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ padding: '50px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '30px' }}>
        Admin Dashboard
      </h1>
      
      {/* Main Tabs */}
      <div style={{ borderBottom: '2px solid var(--color-primary)', marginBottom: '30px' }}>
        <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>Orders & Estimates</TabButton>
        <TabButton active={activeTab === 'masters'} onClick={() => setActiveTab('masters')}>Masters</TabButton>
      </div>
      
      {/* Orders Tab Content */}
      {activeTab === 'orders' && (
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '0 12px 12px 12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: 'var(--color-primary)', marginBottom: '20px' }}>Incoming Orders</h2>
          {orders.length === 0 ? <p>No orders yet.</p> : orders.map(order => (
            <div key={order.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong>Order ID: {order.id.slice(-6).toUpperCase()}</strong>
                <span style={{ color: getStatusColor(order.status), fontWeight: 'bold' }}>{order.status}</span>
              </div>
              <p><strong>Customer ID:</strong> {order.userId}</p>
              <p><strong>Total:</strong> ₹{order.totalAmount}</p>
              
              <div style={{ marginTop: '15px' }}>
                <strong>Items:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '0.9rem', color: '#555' }}>
                  {order.items.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return <li key={item.id}>{product ? product.name : 'Unknown Product'} - Qty: {item.quantity} (₹{item.price})</li>;
                  })}
                </ul>
              </div>

              <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {order.status !== 'PROCESSING' && (
                  <button disabled={loadingOrderId === order.id} onClick={() => handleStatusChange(order.id, 'PROCESSING')} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Mark Processing</button>
                )}
                {order.status !== 'SHIPPED' && (
                  <button disabled={loadingOrderId === order.id} onClick={() => handleStatusChange(order.id, 'SHIPPED')} style={{ padding: '8px 15px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Mark Shipped</button>
                )}
                {order.status !== 'DELIVERED' && (
                  <button disabled={loadingOrderId === order.id} onClick={() => handleStatusChange(order.id, 'DELIVERED')} style={{ padding: '8px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Mark Delivered</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Masters Tab Content */}
      {activeTab === 'masters' && (
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '0 12px 12px 12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          
          {/* Sub-tabs for Masters */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
            <button onClick={() => setActiveMasterTab('category')} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--color-primary)', backgroundColor: activeMasterTab === 'category' ? 'var(--color-primary)' : 'transparent', color: activeMasterTab === 'category' ? '#fff' : 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold' }}>Category Master</button>
            <button onClick={() => setActiveMasterTab('product')} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--color-primary)', backgroundColor: activeMasterTab === 'product' ? 'var(--color-primary)' : 'transparent', color: activeMasterTab === 'product' ? '#fff' : 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold' }}>Product Master</button>
            <button onClick={() => setActiveMasterTab('godown')} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--color-primary)', backgroundColor: activeMasterTab === 'godown' ? 'var(--color-primary)' : 'transparent', color: activeMasterTab === 'godown' ? '#fff' : 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold' }}>Godown Master</button>
          </div>

          {/* Category Master */}
          {activeMasterTab === 'category' && (
            <div>
              <h3 style={{ marginBottom: '15px' }}>Add New Category</h3>
              <form onSubmit={handleAddCategory} style={{ maxWidth: '400px', marginBottom: '30px' }}>
                <label><strong>Category Name</strong></label>
                <input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} required style={inputStyle} placeholder="e.g. Sparklers" />
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Save Category</button>
              </form>
              
              <h3 style={{ marginBottom: '15px' }}>Existing Categories</h3>
              <ul>
                {categories.map(c => <li key={c.id} style={{ marginBottom: '8px' }}>{c.name} (/{c.slug})</li>)}
              </ul>
            </div>
          )}

          {/* Product Master */}
          {activeMasterTab === 'product' && (
            <div style={{ display: 'flex', gap: '40px', alignItems: 'start' }}>
              <div style={{ flex: 1, maxWidth: '500px' }}>
                <h3 style={{ marginBottom: '15px' }}>Add New Product</h3>
                <form onSubmit={handleAddProduct}>
                  <label><strong>Product Name</strong></label>
                  <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required style={inputStyle} />
                  
                  <label><strong>Category</strong></label>
                  <select value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})} required style={inputStyle}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <label><strong>Base Price (MRP)</strong></label>
                      <input type="number" step="0.01" value={newProduct.basePrice} onChange={e => setNewProduct({...newProduct, basePrice: e.target.value})} required style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label><strong>Selling Price</strong></label>
                      <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required style={inputStyle} />
                    </div>
                  </div>

                  <label><strong>Image URL (Optional)</strong></label>
                  <input type="url" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} style={inputStyle} placeholder="https://..." />
                  
                  <label><strong>Description</strong></label>
                  <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} style={{...inputStyle, height: '80px'}} />

                  <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Create Product</button>
                </form>
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '15px' }}>Products Directory</h3>
                <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff' }}>
                      <tr style={{ borderBottom: '2px solid #eee' }}>
                        <th style={{ padding: '10px 0' }}>Name</th>
                        <th style={{ padding: '10px 0' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px 0' }}>{product.name}</td>
                          <td>₹{product.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Godown Master */}
          {activeMasterTab === 'godown' && (
            <div>
              <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
                <div style={{ flex: 1, maxWidth: '400px' }}>
                  <h3 style={{ marginBottom: '15px' }}>Add New Godown</h3>
                  <form onSubmit={handleAddGodown}>
                    <label><strong>Godown Name</strong></label>
                    <input type="text" value={godownName} onChange={e => setGodownName(e.target.value)} required style={inputStyle} placeholder="e.g. Main Warehouse" />
                    <label><strong>Location</strong></label>
                    <input type="text" value={godownLocation} onChange={e => setGodownLocation(e.target.value)} style={inputStyle} placeholder="e.g. South Sivakasi" />
                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Save Godown</button>
                  </form>
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '15px' }}>Existing Godowns</h3>
                  <ul>
                    {godowns.map(g => (
                      <li key={g.id} style={{ marginBottom: '8px' }}>
                        <strong>{g.name}</strong> {g.location && `(${g.location})`}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '30px 0' }} />

              <h3 style={{ marginBottom: '15px' }}>Manage Godown Stock</h3>
              <p style={{ marginBottom: '20px', color: '#666' }}>Update stock quantities for each product across different godowns.</p>
              
              {godowns.length === 0 ? (
                <p>Please create a Godown first to manage stock.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9f9f9' }}>
                        <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Product</th>
                        {godowns.map(g => (
                          <th key={g.id} style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>{g.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '15px' }}><strong>{product.name}</strong></td>
                          {godowns.map(godown => {
                            const stockRecord = godown.stocks?.find(s => s.productId === product.id);
                            const currentQty = stockRecord ? stockRecord.quantity : 0;
                            return (
                              <td key={godown.id} style={{ padding: '15px' }}>
                                <input 
                                  type="number" 
                                  defaultValue={currentQty}
                                  onBlur={(e) => {
                                    if(e.target.value !== String(currentQty)) {
                                      handleUpdateGodownStock(godown.id, product.id, e.target.value);
                                    }
                                  }}
                                  style={{ width: '80px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
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
          )}

        </div>
      )}
    </div>
  );
}
