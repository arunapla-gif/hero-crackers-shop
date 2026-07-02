'use client';

import { useState } from 'react';

export default function AdminDashboardClient({ initialOrders, products }) {
  const [orders, setOrders] = useState(initialOrders);
  const [loadingOrderId, setLoadingOrderId] = useState(null);

  const handleStatusChange = async (orderId, newStatus) => {
    setLoadingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error(error);
      alert('Error updating order');
    } finally {
      setLoadingOrderId(null);
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

  return (
    <div style={{ padding: '50px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '30px' }}>
        Admin Dashboard
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Orders Panel */}
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: 'var(--color-primary)', marginBottom: '20px' }}>Estimates / Orders</h2>
          
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            orders.map(order => (
              <div key={order.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong>Order ID: {order.id.slice(-6).toUpperCase()}</strong>
                  <span style={{ color: getStatusColor(order.status), fontWeight: 'bold' }}>{order.status}</span>
                </div>
                <p><strong>Customer ID:</strong> {order.userId}</p>
                <p><strong>Address:</strong> {order.shippingAddress || 'N/A'}</p>
                <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                
                <div style={{ marginTop: '15px' }}>
                  <strong>Items:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '0.9rem', color: '#555' }}>
                    {order.items.map(item => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <li key={item.id}>
                          {product ? product.name : 'Unknown Product'} - Qty: {item.quantity} (₹{item.price})
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {order.status !== 'PROCESSING' && (
                    <button 
                      disabled={loadingOrderId === order.id}
                      onClick={() => handleStatusChange(order.id, 'PROCESSING')}
                      style={{ padding: '8px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                      Mark Processing
                    </button>
                  )}
                  {order.status !== 'SHIPPED' && (
                    <button 
                      disabled={loadingOrderId === order.id}
                      onClick={() => handleStatusChange(order.id, 'SHIPPED')}
                      style={{ padding: '8px 15px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                      Mark Shipped
                    </button>
                  )}
                  {order.status !== 'DELIVERED' && (
                    <button 
                      disabled={loadingOrderId === order.id}
                      onClick={() => handleStatusChange(order.id, 'DELIVERED')}
                      style={{ padding: '8px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Product Management Panel */}
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: 'var(--color-primary)' }}>Products Overview</h2>
          </div>
          
          <div style={{ overflowY: 'auto', maxHeight: '600px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff' }}>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '10px 0' }}>Name</th>
                  <th style={{ padding: '10px 0' }}>Price</th>
                  <th style={{ padding: '10px 0' }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px 0' }}>{product.name}</td>
                    <td>₹{product.price}</td>
                    <td style={{ color: product.stock > 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                      {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
