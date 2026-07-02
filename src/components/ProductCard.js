'use client';

export default function ProductCard({ product, onAddToCart }) {
  const isPremium = product.price > 300;
  
  return (
    <div 
      style={{ 
        background: '#fff', 
        padding: '25px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 30px rgba(211, 47, 47, 0.1)', 
        width: '320px', 
        textAlign: 'left', 
        borderTop: `6px solid ${isPremium ? '#ffd700' : '#ff5722'}`, 
        transition: 'transform 0.3s, box-shadow 0.3s', 
        cursor: 'pointer' 
      }} 
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-10px)';
        e.currentTarget.style.boxShadow = '0 15px 40px rgba(211, 47, 47, 0.2)';
      }} 
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(211, 47, 47, 0.1)';
      }}
    >
      <div style={{ height: '220px', backgroundColor: '#fff5e6', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '5rem' }}>{isPremium ? '🌋' : '✨'}</span>
      </div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#d32f2f' }}>{product.name}</h3>
      <p style={{ color: '#666', fontSize: '1rem', marginBottom: '25px', lineHeight: '1.6' }}>{product.description}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: '1.5rem' }}>₹{product.price}</p>
        <button 
          onClick={() => onAddToCart && onAddToCart(product.id)}
          style={{ 
            padding: '12px 25px', 
            background: '#d32f2f', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            fontSize: '1.1rem', 
            transition: 'background 0.3s' 
          }} 
          onMouseOver={(e) => e.target.style.background = '#b71c1c'} 
          onMouseOut={(e) => e.target.style.background = '#d32f2f'}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
