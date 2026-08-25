'use client';

export default function ProductCard({ product, onAddToCart, cartQuantity = 0, onUpdateQuantity }) {
  const isPremium = product.price > 300;
  
  return (
    <div 
      style={{ 
        background: 'rgba(30, 20, 50, 0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '15px', 
        borderRadius: '16px', 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)', 
        width: '380px', 
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
        e.currentTarget.style.background = 'rgba(40, 30, 70, 0.6)';
        e.currentTarget.style.boxShadow = `0 15px 40px ${isPremium ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 87, 34, 0.2)'}`;
      }} 
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = 'rgba(30, 20, 50, 0.4)';
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
      
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '5px 0' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '5px', color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
        </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: isPremium ? '#FFC107' : '#FF5722', fontWeight: 'bold', fontSize: '1.2rem' }}>
          ₹{product.price}
        </p>
        
        <div style={{ minWidth: '120px', height: '36px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          {cartQuantity > 0 ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: 'rgba(255,255,255,0.1)', 
              border: `1px solid ${isPremium ? '#FFC107' : '#FF5722'}`,
              borderRadius: '30px', 
              overflow: 'hidden',
              height: '100%'
            }}>
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity && onUpdateQuantity(-1); }} 
                style={{ padding: '0 12px', height: '100%', background: 'transparent', border: 'none', color: '#FFF', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                -
              </button>
              <span style={{ color: '#FFF', fontWeight: 'bold', minWidth: '25px', textAlign: 'center', fontSize: '0.9rem' }}>
                {cartQuantity}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity && onUpdateQuantity(1); }} 
                style={{ padding: '0 12px', height: '100%', background: isPremium ? '#FFC107' : '#FF5722', border: 'none', color: '#000', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
              >
                +
              </button>
            </div>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onAddToCart) onAddToCart(product);
              }}
              style={{ 
                padding: '0 15px', 
                height: '100%',
                background: isPremium ? '#FFC107' : '#FF5722', 
                color: '#000', 
                border: 'none', 
                borderRadius: '20px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                fontSize: '0.85rem', 
                transition: 'all 0.2s ease',
                boxShadow: `0 4px 10px ${isPremium ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 87, 34, 0.3)'}`
              }} 
              onMouseOver={(e) => {
                e.target.style.boxShadow = `0 6px 15px ${isPremium ? 'rgba(255, 193, 7, 0.5)' : 'rgba(255, 87, 34, 0.5)'}`;
              }} 
              onMouseOut={(e) => {
                e.target.style.boxShadow = `0 4px 10px ${isPremium ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 87, 34, 0.3)'}`;
              }}
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
