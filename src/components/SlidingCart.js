'use client';

import { useCart } from '@/context/CartContext';
import { useEffect } from 'react';
import Link from 'next/link';

export default function SlidingCart() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartItemsCount, cartTotal, isCartOpen, setIsCartOpen } = useCart();

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
          zIndex: 2000,
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
          height: '100dvh',
          width: '100%',
          maxWidth: '450px',
          backgroundColor: 'rgba(15, 15, 15, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '-10px 0 50px rgba(0,0,0,0.8)',
          zIndex: 2001,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        <div style={{ 
          padding: '25px 30px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <h2 style={{ margin: 0, color: '#FFF', fontSize: '1.4rem', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#E6C27A' }}>✨</span> Your Cart <span style={{ fontSize: '0.9rem', background: 'rgba(230, 194, 122, 0.2)', color: '#E6C27A', padding: '2px 10px', borderRadius: '15px' }}>{cartItemsCount}</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {cartItemsCount > 0 && (
              <button 
                onClick={() => {
                  if(window.confirm('Are you sure you want to clear your cart?')) clearCart();
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#ccc',
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseOut={e => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                Clear Cart
              </button>
            )}
            <button 
              onClick={() => setIsCartOpen(false)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#fff', 
                fontSize: '1.5rem', 
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>

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
                  alignItems: 'center',
                  gap: '15px', 
                  padding: '15px', 
                  backgroundColor: 'rgba(255,255,255,0.03)', 
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  transition: 'background 0.2s, transform 0.2s'
                }}>
                  <div style={{ 
                    width: '70px', 
                    height: '70px', 
                    backgroundColor: 'rgba(0,0,0,0.4)', 
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                  }}>
                    <span style={{ filter: 'drop-shadow(0 0 10px rgba(230,194,122,0.3))' }}>{item.price > 300 ? '🌋' : '✨'}</span>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#FFF', fontWeight: '500', fontSize: '1.1rem', marginBottom: '5px' }}>{item.name}</div>
                    <div style={{ color: '#E6C27A', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{item.price}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '15px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        background: 'rgba(230,194,122,0.1)', 
                        border: '1px solid rgba(230,194,122,0.2)',
                        borderRadius: '20px',
                        overflow: 'hidden'
                      }}>
                        <button onClick={() => updateQuantity(item, -1)} style={{ background: 'transparent', border: 'none', color: '#E6C27A', padding: '5px 12px', cursor: 'pointer', fontSize: '1.1rem' }}>−</button>
                        <span style={{ color: '#FFF', fontSize: '0.9rem', width: '25px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item, 1)} style={{ background: 'transparent', border: 'none', color: '#E6C27A', padding: '5px 12px', cursor: 'pointer', fontSize: '1.1rem' }}>+</button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseOver={e => e.target.style.color = '#ff4444'}
                        onMouseOut={e => e.target.style.color = '#888'}
                        title="Remove Item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div style={{ 
            padding: '20px 25px max(25px, env(safe-area-inset-bottom))', 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#fff', fontSize: '1rem' }}>
              <span style={{ color: '#aaa' }}>Subtotal</span>
              <span style={{ color: '#fff' }}>₹{cartTotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#fff', fontSize: '1rem' }}>
              <span style={{ color: '#aaa' }}>Shipping</span>
              <span style={{ color: '#4caf50' }}>Calculated Later</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#fff', fontSize: '1.3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>Total</span>
              <span style={{ fontWeight: 'bold', color: '#E6C27A' }}>₹{cartTotal.toLocaleString()}</span>
            </div>
            
            <Link href="/cart" onClick={() => setIsCartOpen(false)} style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%',
                background: 'linear-gradient(135deg, #FFB75E, #ED8F03)',
                color: '#000',
                border: 'none',
                padding: '16px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 5px 20px rgba(237, 143, 3, 0.4)',
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
