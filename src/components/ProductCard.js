'use client';

export default function ProductCard({ product, onAddToCart }) {
  const isPremium = product.price > 300;
  
  return (
    <div 
      style={{ 
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '25px', 
        borderRadius: '20px', 
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)', 
        width: '320px', 
        textAlign: 'left', 
        border: '1px solid rgba(255,255,255,0.05)',
        borderTop: `1px solid ${isPremium ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 19, 97, 0.5)'}`,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }} 
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-10px)';
        e.currentTarget.style.boxShadow = `0 15px 40px ${isPremium ? 'rgba(255,215,0,0.15)' : 'rgba(255,19,97,0.15)'}`;
        e.currentTarget.style.border = `1px solid ${isPremium ? 'rgba(255,215,0,0.2)' : 'rgba(255,19,97,0.2)'}`;
      }} 
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)';
        e.currentTarget.style.borderTop = `1px solid ${isPremium ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 19, 97, 0.5)'}`;
      }}
    >
      <div style={{ 
        height: '220px', 
        background: isPremium ? 'linear-gradient(135deg, rgba(255,215,0,0.1), transparent)' : 'linear-gradient(135deg, rgba(255,19,97,0.1), transparent)', 
        borderRadius: '12px', 
        marginBottom: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.02)'
      }}>
        <span style={{ fontSize: '5rem', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }}>{isPremium ? '🌋' : '✨'}</span>
      </div>
      
      <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#fff' }}>{product.name}</h3>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.6', height: '45px', overflow: 'hidden' }}>{product.description}</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: isPremium ? '#ffc107' : '#ff1361', fontWeight: 'bold', fontSize: '1.6rem', textShadow: `0 0 10px ${isPremium ? 'rgba(255,193,7,0.4)' : 'rgba(255,19,97,0.4)'}` }}>
          ₹{product.price}
        </p>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onAddToCart) onAddToCart(product);
          }}
          style={{ 
            padding: '12px 25px', 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)', 
            color: '#fff', 
            border: '1px solid rgba(255,255,255,0.2)', 
            borderRadius: '30px', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            fontSize: '1rem', 
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(5px)'
          }} 
          onMouseOver={(e) => {
            e.target.style.background = isPremium ? 'rgba(255,215,0,0.2)' : 'rgba(255,19,97,0.2)';
            e.target.style.borderColor = isPremium ? '#ffc107' : '#ff1361';
            e.target.style.color = isPremium ? '#ffc107' : '#ff1361';
            e.target.style.boxShadow = `0 0 15px ${isPremium ? 'rgba(255,193,7,0.3)' : 'rgba(255,19,97,0.3)'}`;
          }} 
          onMouseOut={(e) => {
            e.target.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)';
            e.target.style.borderColor = 'rgba(255,255,255,0.2)';
            e.target.style.color = '#fff';
            e.target.style.boxShadow = 'none';
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
