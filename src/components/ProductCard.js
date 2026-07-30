'use client';

export default function ProductCard({ product, onAddToCart }) {
  const isPremium = product.price > 300;
  
  return (
    <div 
      style={{ 
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '25px', 
        borderRadius: '20px', 
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)', 
        width: '320px', 
        textAlign: 'left', 
        border: '1px solid rgba(255, 255, 255, 1)',
        borderTop: `4px solid ${isPremium ? 'var(--color-accent-gold)' : 'var(--color-primary)'}`,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }} 
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-10px)';
        e.currentTarget.style.boxShadow = `0 15px 40px ${isPremium ? 'rgba(255, 193, 7, 0.3)' : 'rgba(229, 57, 53, 0.2)'}`;
      }} 
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
      }}
    >
      <div style={{ 
        height: '220px', 
        background: isPremium ? 'rgba(255, 193, 7, 0.1)' : 'rgba(229, 57, 53, 0.05)', 
        borderRadius: '12px', 
        marginBottom: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: `1px solid ${isPremium ? 'rgba(255, 193, 7, 0.3)' : 'rgba(229, 57, 53, 0.1)'}`
      }}>
        <span style={{ fontSize: '5rem', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.1))' }}>{isPremium ? '🌋' : '✨'}</span>
      </div>
      
      <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#1A1A1A' }}>{product.name}</h3>
      <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.6', height: '45px', overflow: 'hidden' }}>{product.description}</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: isPremium ? '#F57F17' : 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.6rem' }}>
          ₹{product.price}
        </p>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onAddToCart) onAddToCart(product);
          }}
          style={{ 
            padding: '12px 25px', 
            background: isPremium ? 'var(--color-accent-gold)' : 'var(--color-primary)', 
            color: isPremium ? '#000' : '#fff', 
            border: 'none', 
            borderRadius: '30px', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            fontSize: '1rem', 
            transition: 'all 0.3s ease',
            boxShadow: `0 4px 10px ${isPremium ? 'rgba(255, 193, 7, 0.4)' : 'rgba(229, 57, 53, 0.4)'}`
          }} 
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = `0 6px 15px ${isPremium ? 'rgba(255, 193, 7, 0.6)' : 'rgba(229, 57, 53, 0.6)'}`;
          }} 
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = `0 4px 10px ${isPremium ? 'rgba(255, 193, 7, 0.4)' : 'rgba(229, 57, 53, 0.4)'}`;
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
