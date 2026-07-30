'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const router = useRouter();
  const { cart, cartTotal, updateQuantity, clearCart } = useCart();
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    referredBy: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const cartItems = Object.values(cart);

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
          referredBy: customerInfo.referredBy,
          totalAmount: cartTotal,
          items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      if (res.ok) {
        const order = await res.json();
        clearCart();
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

  const inputStyle = { width: '100%', padding: '12px', margin: '8px 0 20px 0', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '1rem', background: 'rgba(255,255,255,0.8)', color: '#333', outline: 'none' };
  const labelStyle = { fontWeight: 'bold', color: '#555' };

  return (
    <div style={{ padding: '50px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '30px', textAlign: 'center' }}>
        Secure Checkout
      </h1>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', flexDirection: 'row-reverse' }}>
        
        {/* Right Column: Checkout Form */}
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(229,57,53,0.1)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>Shipping Details</h3>
            
            <form onSubmit={handleSubmitOrder}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" required value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} style={inputStyle} placeholder="John Doe" />
              
              <label style={labelStyle}>Phone Number (WhatsApp)</label>
              <input type="tel" required value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} style={inputStyle} placeholder="10-digit mobile number" />
              
              <label style={labelStyle}>Delivery Address</label>
              <textarea required value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} style={{...inputStyle, height: '100px', resize: 'vertical'}} placeholder="Full street address with pincode" />

              <label style={labelStyle}>Referred By (Optional)</label>
              <input type="text" value={customerInfo.referredBy} onChange={e => setCustomerInfo({...customerInfo, referredBy: e.target.value})} style={inputStyle} placeholder="Name of agent or friend" />

              <div style={{ backgroundColor: 'rgba(229,57,53,0.05)', padding: '15px', borderRadius: '8px', marginTop: '10px', marginBottom: '20px', border: '1px solid rgba(229,57,53,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#333' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 'bold', color: '#111' }}>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#333' }}>
                  <span>Shipping</span>
                  <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Calculated Later</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(229,57,53,0.2)', paddingTop: '10px', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  <span>Total Estimate</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting || cartItems.length === 0}
                style={{
                  width: '100%',
                  background: submitting ? '#ccc' : 'linear-gradient(135deg, var(--color-primary), var(--color-accent-orange))',
                  color: '#fff',
                  border: 'none',
                  padding: '15px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s ease',
                  boxShadow: submitting ? 'none' : '0 5px 15px rgba(229, 57, 53, 0.3)'
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
            <div style={{ padding: '40px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '1.2rem', color: '#666' }}>Your cart is empty.</p>
              <button onClick={() => router.push('/shop')} style={{ marginTop: '20px', padding: '10px 20px', background: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: '30px', cursor: 'pointer' }}>Return to Shop</button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '20px', borderRadius: '12px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(229,57,53,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <span style={{ fontSize: '2rem' }}>{item.price > 300 ? '🌋' : '✨'}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', margin: '0 0 5px 0', color: '#1A1A1A' }}>{item.name}</h4>
                    <p style={{ color: 'var(--color-primary)', fontWeight: 'bold', margin: 0 }}>₹{item.price}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.05)', borderRadius: '20px', overflow: 'hidden' }}>
                    <button onClick={() => updateQuantity(item, -1)} style={{ padding: '8px 12px', background: 'transparent', color: '#333', border: 'none', cursor: 'pointer' }}>-</button>
                    <span style={{ padding: '8px 15px', fontWeight: 'bold', color: '#333' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item, 1)} style={{ padding: '8px 12px', background: 'transparent', color: '#333', border: 'none', cursor: 'pointer' }}>+</button>
                  </div>
                  <div style={{ width: '100px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                    ₹{(item.price * item.quantity).toLocaleString()}
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
