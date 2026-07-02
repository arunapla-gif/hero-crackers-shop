'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load cart
    const savedCart = localStorage.getItem('hero_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Fetch products
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const handleUpdateQuantity = (productId, delta) => {
    setCart(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      const newCart = { ...prev };
      if (newQty === 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = newQty;
      }
      localStorage.setItem('hero_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const cartItems = Object.keys(cart).map(id => {
    const product = products.find(p => p.id === id);
    return {
      product,
      quantity: cart[id]
    };
  }).filter(item => item.product); // Filter out items not found in db

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          shippingAddress: customerInfo.address,
          totalAmount: cartTotal,
          items: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          }))
        })
      });

      if (res.ok) {
        const order = await res.json();
        // Clear cart
        localStorage.removeItem('hero_cart');
        setCart({});
        alert(`Order submitted successfully! Your Order ID is ${order.id.slice(-6).toUpperCase()}`);
        router.push('/');
      } else {
        const error = await res.json();
        alert(`Failed to submit order: ${error.error}`);
      }
    } catch (error) {
      alert("An error occurred while submitting your order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading your cart...</div>;
  }

  const inputStyle = { width: '100%', padding: '12px', margin: '8px 0 20px 0', border: '1px solid #ccc', borderRadius: '8px', fontSize: '1rem' };
  const labelStyle = { fontWeight: 'bold', color: '#555' };

  return (
    <div style={{ padding: '50px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '30px', textAlign: 'center' }}>
        Secure Checkout
      </h1>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', flexDirection: 'row-reverse' }}>
        
        {/* Right Column: Checkout Form */}
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--color-primary)', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Shipping Details</h3>
            
            <form onSubmit={handleSubmitOrder}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" required value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} style={inputStyle} placeholder="John Doe" />
              
              <label style={labelStyle}>Phone Number (WhatsApp)</label>
              <input type="tel" required value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} style={inputStyle} placeholder="10-digit mobile number" />
              
              <label style={labelStyle}>Delivery Address</label>
              <textarea required value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} style={{...inputStyle, height: '100px'}} placeholder="Full street address with pincode" />

              <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginTop: '10px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 'bold' }}>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Shipping</span>
                  <span style={{ color: 'green', fontWeight: 'bold' }}>Calculated Later</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #ddd', paddingTop: '10px', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  <span>Total Estimate</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting || cartItems.length === 0}
                style={{
                  width: '100%',
                  backgroundColor: submitting ? '#ccc' : 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '15px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s ease'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Estimate Request'}
              </button>
              
              <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
                No payment required now. We will contact you to confirm shipping logistics and final amount.
              </p>
            </form>
          </div>
        </div>

        {/* Left Column: Cart Items */}
        <div style={{ flex: '1 1 600px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#333' }}>Order Items ({cartItems.length})</h3>
          
          {cartItems.length === 0 ? (
            <div style={{ padding: '40px', backgroundColor: '#fff', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '1.2rem', color: '#666' }}>Your cart is empty.</p>
              <button onClick={() => router.push('/shop')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Return to Shop</button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.product.id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '80px', height: '80px', backgroundColor: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {item.product.imageUrls?.[0] ? (
                      <img src={item.product.imageUrls[0]} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '2rem' }}>{item.product.price > 300 ? '🌋' : '✨'}</span>
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', margin: '0 0 5px 0', color: '#333' }}>{item.product.name}</h4>
                    <p style={{ color: 'var(--color-primary)', fontWeight: 'bold', margin: 0 }}>₹{item.product.price}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                    <button onClick={() => handleUpdateQuantity(item.product.id, -1)} style={{ padding: '8px 12px', background: '#f9f9f9', border: 'none', borderRight: '1px solid #ddd', cursor: 'pointer' }}>-</button>
                    <span style={{ padding: '8px 15px', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.product.id, 1)} style={{ padding: '8px 12px', background: '#f9f9f9', border: 'none', borderLeft: '1px solid #ddd', cursor: 'pointer' }}>+</button>
                  </div>
                  <div style={{ width: '100px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    ₹{(item.product.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
