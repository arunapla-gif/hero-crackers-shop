'use client';

export default function ProductCard({ product, onAddToCart }) {
  const isPremium = product.price > 300;
  
  return (
    <div 
      style={{ 
        background: 'rgba(30, 20, 50, 0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '25px', 
        borderRadius: '20px', 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)', 
        width: '320px', 
        textAlign: 'left', 
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderTop: `4px solid ${isPremium ? '#FFC107' : '#FF5722'}`,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
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
        height: '220px', 
        background: isPremium ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 87, 34, 0.05)', 
        borderRadius: '12px', 
        marginBottom: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: `1px solid ${isPremium ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 87, 34, 0.1)'}`
      }}>
        <span style={{ fontSize: '5rem', filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.2))' }}>{isPremium ? '🌋' : '✨'}</span>
      </div>
      
      <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#FFF' }}>{product.name}</h3>
      <p style={{ color: '#BBB', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.6', height: '45px', overflow: 'hidden' }}>{product.description}</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: isPremium ? '#FFC107' : '#FF5722', fontWeight: 'bold', fontSize: '1.6rem' }}>
          ₹{product.price}
        </p>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onAddToCart) onAddToCart(product);
          }}
          style={{ 
            padding: '12px 25px', 
            background: isPremium ? '#FFC107' : '#FF5722', 
            color: '#000', 
            border: 'none', 
            borderRadius: '30px', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            fontSize: '1rem', 
            transition: 'all 0.3s ease',
            boxShadow: `0 4px 10px ${isPremium ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 87, 34, 0.3)'}`
          }} 
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = `0 6px 15px ${isPremium ? 'rgba(255, 193, 7, 0.5)' : 'rgba(255, 87, 34, 0.5)'}`;
          }} 
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = `0 4px 10px ${isPremium ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 87, 34, 0.3)'}`;
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
