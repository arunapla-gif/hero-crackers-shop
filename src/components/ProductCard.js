'use client';

export default function ProductCard({ product, onAddToCart, cartQuantity = 0, onUpdateQuantity, index = 0, onProductClick, viewMode = 'grid' }) {
  const isPremium = product.price > 300;
  
  // Calculate pricing metrics
  const mrp = product.basePrice > product.price ? product.basePrice : Math.round(product.price * 3.33);
  const discountPercent = Math.round(((mrp - product.price) / mrp) * 100);
  const savings = mrp - product.price;

  if (viewMode === 'list') {
    return (
      <div 
        className="list-row"
        onClick={() => onProductClick && onProductClick()}
      >
        <div className="col-product">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Tiny Icon */}
            <div style={{
              width: '28px', height: '28px', flexShrink: 0,
              background: isPremium ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 87, 34, 0.05)',
              borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${isPremium ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 87, 34, 0.1)'}`
            }}>
              <span style={{ fontSize: '0.9rem' }}>{isPremium ? '🌋' : '✨'}</span>
            </div>
            {/* Name and Tag */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '0.95rem', color: '#FFF', margin: 0, whiteSpace: 'normal', wordBreak: 'break-word' }}>{product.name}</h3>
                <span className="list-badge desktop-badge" style={{
                  background: '#FF1361',
                  color: '#fff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '0.65rem',
                  whiteSpace: 'nowrap'
                }}>
                  80% FLAT OFF
                </span>
              </div>
              {product.packageString && (
                <span style={{ color: '#888', fontSize: '0.75rem', marginTop: '2px' }}>
                  PKG: {product.packageString}
                </span>
              )}
              
              <div className="mobile-price-stack">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="mobile-mrp">MRP: ₹{mrp.toLocaleString('en-IN')}</span>
                  <span className="list-badge" style={{
                    background: '#FF1361',
                    color: '#fff',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '0.55rem',
                    whiteSpace: 'nowrap'
                  }}>
                    80% OFF
                  </span>
                </div>
                <span className="mobile-final">₹{product.price.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-mrp desktop-only">
          <span style={{ color: '#B0BEC5', textDecoration: 'line-through', textDecorationColor: '#FF3B30', fontSize: '0.8rem' }}>
            ₹{mrp.toLocaleString('en-IN')}
          </span>
        </div>
        
        <div className="col-price desktop-only">
          <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '1.1rem' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="col-action">
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: cartQuantity > 0 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)', 
              border: `1px solid ${isPremium ? '#FFC107' : '#FF5722'}`,
              borderRadius: '20px', 
              overflow: 'hidden',
              height: '32px',
              opacity: cartQuantity > 0 ? 1 : 0.8
            }}>
              <button 
                onClick={(e) => { e.stopPropagation(); if (cartQuantity > 0 && onUpdateQuantity) onUpdateQuantity(-1); }} 
                style={{ 
                  padding: '0 10px', height: '100%', background: 'transparent', border: 'none', 
                  color: cartQuantity > 0 ? '#FFF' : 'rgba(255,255,255,0.3)', fontSize: '1rem', 
                  cursor: cartQuantity > 0 ? 'pointer' : 'default'
                }}
              >
                -
              </button>
              <span style={{ color: cartQuantity > 0 ? '#FFF' : 'rgba(255,255,255,0.5)', fontWeight: 'bold', minWidth: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
                {cartQuantity}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); if (onUpdateQuantity) onUpdateQuantity(1); }} 
                style={{ 
                  padding: '0 10px', height: '100%', background: isPremium ? '#FFC107' : '#FF5722', 
                  border: 'none', color: '#000', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="grid-card-container"
      style={{
        background: 'linear-gradient(145deg, rgba(45, 20, 44, 0.85) 0%, rgba(26, 26, 29, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
        position: 'relative',
        boxShadow: isPremium ? '0 8px 32px rgba(255, 193, 7, 0.15)' : '0 4px 16px rgba(0,0,0,0.4)',
        border: `1px solid ${isPremium ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        padding: '12px',
        alignItems: 'center',
        gap: '15px',
        height: '100%'
      }} 
      onClick={() => onProductClick && onProductClick()}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.background = 'linear-gradient(145deg, rgba(60, 25, 45, 0.95) 0%, rgba(35, 30, 35, 1) 100%)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.6)';
        e.currentTarget.style.border = '1px solid rgba(255, 87, 34, 0.3)'; // Subtle warm border
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = 'linear-gradient(145deg, rgba(45, 20, 44, 0.85) 0%, rgba(26, 26, 29, 0.95) 100%)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.4)';
        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      }}
    >
      {/* Discount Badge */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0', // Moved to Top-Left
        background: '#FF1361',
        color: '#fff',
        padding: '6px 14px',
        borderTopLeftRadius: '16px',
        borderBottomRightRadius: '16px',
        fontWeight: '900',
        fontSize: '0.85rem',
        boxShadow: '2px 2px 10px rgba(255, 19, 97, 0.3)',
        zIndex: 2,
        letterSpacing: '1px'
      }}>
        80% FLAT OFF
      </div>
      <div style={{ 
        width: '120px', 
        flexShrink: 0,
        background: isPremium ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 87, 34, 0.05)', 
        borderRadius: '10px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: `1px solid ${isPremium ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 87, 34, 0.1)'}`
      }}>
        <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.2))' }}>{isPremium ? '🌋' : '✨'}</span>
      </div>
      
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '5px 0', minWidth: 0 }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '2px', color: '#FFF', lineHeight: '1.2' }}>{product.name}</h3>
          {product.packageString && (
            <span style={{ color: '#aaa', fontSize: '0.85rem' }}>PKG: {product.packageString}</span>
          )}
        </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{ 
              color: '#B0BEC5', // Light blue-grey, very readable against dark
              textDecoration: 'line-through', 
              textDecorationColor: '#FF3B30',
              textDecorationThickness: '2px',
              fontSize: '0.9rem', 
              fontWeight: '500'
            }}>
              MRP: ₹{mrp.toLocaleString('en-IN')}
            </span>
          </div>
          <p style={{ 
            color: '#FFD700', // Solid Bright Gold
            fontWeight: '900', 
            fontSize: '1.7rem', 
            margin: '0 0 2px 0', 
            lineHeight: 1, 
            textShadow: '0 0 10px rgba(255, 215, 0, 0.3)' // Subtle glow
          }}>
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          <span style={{ color: '#00E676', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            Save ₹{savings.toLocaleString('en-IN')}
          </span>
        </div>
        
        <div style={{ minWidth: '120px', height: '36px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: cartQuantity > 0 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)', 
              border: `1px solid ${isPremium ? '#FFC107' : '#FF5722'}`,
              borderRadius: '30px', 
              overflow: 'hidden',
              height: '100%',
              opacity: cartQuantity > 0 ? 1 : 0.8
            }}>
              <button 
                onClick={(e) => { e.stopPropagation(); if (cartQuantity > 0 && onUpdateQuantity) onUpdateQuantity(-1); }} 
                style={{ 
                  padding: '0 12px', 
                  height: '100%', 
                  background: 'transparent', 
                  border: 'none', 
                  color: cartQuantity > 0 ? '#FFF' : 'rgba(255,255,255,0.3)', 
                  fontSize: '1.2rem', 
                  cursor: cartQuantity > 0 ? 'pointer' : 'default', 
                  display: 'flex', 
                  alignItems: 'center' 
                }}
              >
                -
              </button>
              <span style={{ color: cartQuantity > 0 ? '#FFF' : 'rgba(255,255,255,0.5)', fontWeight: 'bold', minWidth: '25px', textAlign: 'center', fontSize: '0.9rem' }}>
                {cartQuantity}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); if (onUpdateQuantity) onUpdateQuantity(1); }} 
                style={{ 
                  padding: '0 12px', 
                  height: '100%', 
                  background: isPremium ? '#FFC107' : '#FF5722', 
                  border: 'none', 
                  color: '#000', 
                  fontSize: '1.2rem', 
                  cursor: 'pointer', 
                  fontWeight: 'bold', 
                  display: 'flex', 
                  alignItems: 'center'
                }}
              >
                +
              </button>
            </div>
        </div>
      </div>
      </div>
    </div>
  );
}
