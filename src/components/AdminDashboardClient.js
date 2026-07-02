'use client';

import { useState } from 'react';

export default function AdminDashboardClient({ initialOrders, initialProducts, categories }) {
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [loadingOrderId, setLoadingOrderId] = useState(null);

  // Forms state
  const [categoryName, setCategoryName] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    basePrice: '',
    price: '',
    discount: '',
    stockShop: '',
    stockGodown: '',
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
        setNewProduct({ ...newProduct, name: '', description: '', basePrice: '', price: '', discount: '', stockShop: '', stockGodown: '', imageUrl: '' });
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

  return (
    <div style={{ padding: '50px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '30px' }}>
        Admin Dashboard
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Column: Orders */}
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: 'var(--color-primary)', marginBottom: '20px' }}>Estimates / Orders</h2>
          {orders.length === 0 ? <p>No orders yet.</p> : orders.map(order => (
            <div key={order.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong>Order ID: {order.id.slice(-6).toUpperCase()}</strong>
                <span style={{ color: getStatusColor(order.status), fontWeight: 'bold' }}>{order.status}</span>
              </div>
              <p><strong>Customer ID:</strong> {order.userId}</p>
              <p><strong>Total:</strong> ₹{order.totalAmount}</p>
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

        {/* Right Column: Products & Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Add Category Form */}
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: 'var(--color-primary)', marginBottom: '15px' }}>Add Category</h2>
            <form onSubmit={handleAddCategory}>
              <label><strong>Category Name</strong></label>
              <input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} required style={inputStyle} placeholder="e.g. Sparklers" />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Add Category</button>
            </form>
          </div>

          {/* Add Product Form */}
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: 'var(--color-primary)', marginBottom: '15px' }}>Add Product</h2>
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
                <div style={{ flex: 1 }}>
                  <label><strong>Discount (%)</strong></label>
                  <input type="number" step="0.01" value={newProduct.discount} onChange={e => setNewProduct({...newProduct, discount: e.target.value})} required style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label><strong>Shop Stock</strong></label>
                  <input type="number" value={newProduct.stockShop} onChange={e => setNewProduct({...newProduct, stockShop: e.target.value})} required style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label><strong>Godown Stock</strong></label>
                  <input type="number" value={newProduct.stockGodown} onChange={e => setNewProduct({...newProduct, stockGodown: e.target.value})} required style={inputStyle} />
                </div>
              </div>

              <label><strong>Image URL (Optional)</strong></label>
              <input type="url" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} style={inputStyle} placeholder="https://..." />
              
              <label><strong>Description</strong></label>
              <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} style={{...inputStyle, height: '80px'}} />

              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Create Product</button>
            </form>
          </div>

          {/* Product Inventory Overview */}
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: 'var(--color-primary)', marginBottom: '15px' }}>Inventory Overview</h2>
            <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff' }}>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '10px 0' }}>Name</th>
                    <th style={{ padding: '10px 0' }}>Price / Base</th>
                    <th style={{ padding: '10px 0' }}>Stock (S/G)</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px 0' }}>{product.name}</td>
                      <td>₹{product.price} <br/><small style={{ textDecoration: 'line-through', color: '#888' }}>₹{product.basePrice || product.price}</small></td>
                      <td>
                        Shop: {product.stockShop || 0} <br/>
                        Godown: {product.stockGodown || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
