'use client';

export default function ProductCard({ product, onAddToCart, cartQuantity = 0, onUpdateQuantity }) {
  const isPremium = product.price > 300;
  
  return (
    <div 
      style={{ 
        background: 'linear-gradient(145deg, rgba(45, 15, 20, 0.7) 0%, rgba(15, 5, 10, 0.9) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '15px', 
        borderRadius: '16px', 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)', 
        width: '100%', 
        maxWidth: '380px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        borderLeft: `4px solid ${isPremium ? '#FFC107' : '#FF5722'}`,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        gap: '15px',
        alignItems: 'stretch'
      }} 
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-10px)';
        e.currentTarget.style.background = 'linear-gradient(145deg, rgba(65, 20, 25, 0.85) 0%, rgba(25, 10, 15, 0.95) 100%)';
        e.currentTarget.style.boxShadow = `0 15px 40px ${isPremium ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 87, 34, 0.2)'}`;
      }} 
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = 'linear-gradient(145deg, rgba(45, 15, 20, 0.7) 0%, rgba(15, 5, 10, 0.9) 100%)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5)';
      }}
    >
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
          <h3 style={{ fontSize: '1.2rem', marginBottom: '5px', color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
        </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: isPremium ? '#FFC107' : '#FF5722', fontWeight: 'bold', fontSize: '1.2rem' }}>
          ₹{product.price}
        </p>
        
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
