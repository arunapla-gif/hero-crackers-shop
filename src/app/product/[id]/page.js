'use client';

export default function ProductPage({ params }) {
  // In a real app, we would fetch the product details using params.id from Prisma
  
  return (
    <div style={{ padding: '50px', maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '50px', flexWrap: 'wrap' }}>
      
      {/* Product Image Placeholder */}
      <div style={{ flex: '1 1 400px', backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <span style={{ color: '#888', fontSize: '1.2rem' }}>Product Image (e.g., Royal Chakkars)</span>
      </div>

      {/* Product Info */}
      <div style={{ flex: '1 1 500px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '10px' }}>
          Sivakasi Royal Chakkars
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <span style={{ color: 'var(--color-accent-gold)', fontSize: '1.2rem' }}>★★★★★</span>
          <span style={{ color: '#666' }}>4.8 (124 Reviews)</span>
        </div>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#444' }}>
          A dynamic and explosive ground spinner featuring spectacular sparks and a stunning golden display. Safe, low smoke, and perfect for family celebrations.
        </p>

        <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '10px' }}>₹1,299.00</h2>
        <p style={{ color: 'green', fontWeight: 'bold', marginBottom: '30px' }}>In Stock | Free Shipping available</p>

        {/* Quantity and Add to Cart */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '5px', overflow: 'hidden' }}>
            <button style={{ padding: '10px 15px', border: 'none', background: '#eee', cursor: 'pointer', fontSize: '1.2rem' }}>-</button>
            <input type="text" defaultValue="1" readOnly style={{ width: '50px', textAlign: 'center', border: 'none', fontSize: '1.2rem' }} />
            <button style={{ padding: '10px 15px', border: 'none', background: '#eee', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
          </div>
          
          <button className="pulse-button">
            Add to Cart
          </button>
        </div>

        {/* Key Features */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--color-primary)' }}>Key Features</h3>
          <ul style={{ listStylePosition: 'inside', lineHeight: '1.8' }}>
            <li>LOUD SOUNDS</li>
            <li>VIBRANT COLORS</li>
            <li>PREMIUM SIVAKASI QUALITY</li>
            <li>SAFE FOR OUTDOOR USE</li>
          </ul>
        </div>

      </div>
    </div>
  )
}
