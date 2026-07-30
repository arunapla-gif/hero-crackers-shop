'use client';

import { useCart } from '@/context/CartContext';
import { useEffect } from 'react';
import Link from 'next/link';

export default function SlidingCart() {
  const { cart, updateQuantity, removeFromCart, cartItemsCount, cartTotal, isCartOpen, setIsCartOpen } = useCart();

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const cartItems = Object.values(cart);

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(5px)',
          zIndex: 100,
          animation: 'fadeIn 0.3s ease forwards'
        }}
      />

      {/* Drawer */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '450px',
          backgroundColor: '#0a0a0a',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.8)',
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div style={{ 
          padding: '25px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 19, 97, 0.05)'
        }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Shopping Cart <span style={{ fontSize: '1rem', background: '#ff1361', padding: '2px 10px', borderRadius: '15px' }}>{cartItemsCount}</span>
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#888', 
              fontSize: '1.5rem', 
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseOver={e => e.target.style.color = '#fff'}
            onMouseOut={e => e.target.style.color = '#888'}
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🛒</div>
              <p>Your cart is empty.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid #ff1361',
                  color: '#ff1361',
                  padding: '10px 20px',
                  borderRadius: '30px',
                  marginTop: '20px',
                  cursor: 'pointer'
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  gap: '15px', 
                  padding: '15px', 
                  backgroundColor: 'rgba(255,255,255,0.03)', 
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    backgroundColor: 'rgba(255, 19, 97, 0.1)', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    {item.price > 300 ? '🌋' : '✨'}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}>{item.name}</div>
                    <div style={{ color: '#ffc107', fontWeight: '600' }}>₹{item.price}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: '20px',
                        overflow: 'hidden'
                      }}>
                        <button onClick={() => updateQuantity(item, -1)} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '5px 12px', cursor: 'pointer' }}>-</button>
                        <span style={{ color: '#fff', fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item, 1)} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '5px 12px', cursor: 'pointer' }}>+</button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ff5722', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div style={{ 
            padding: '25px', 
            borderTop: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#fff', fontSize: '1.2rem' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 'bold', color: '#ffc107' }}>₹{cartTotal.toLocaleString()}</span>
            </div>
            
            <Link href="/cart" onClick={() => setIsCartOpen(false)} style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%',
                background: 'linear-gradient(135deg, #FF1361, #FF5722)',
                color: '#fff',
                border: 'none',
                padding: '16px',
                borderRadius: '30px',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(255, 19, 97, 0.3)',
                transition: 'transform 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.target.style.transform = 'translateY(0)'}
              >
                Proceed to Checkout
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
