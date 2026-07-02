import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  // Fetch a few featured products for the homepage
  const featuredProducts = await prisma.product.findMany({
    take: 3,
    orderBy: { price: 'desc' } // Just grabbing some high-end ones as featured
  });

  return (
    <div style={{ backgroundColor: '#fffdf5', color: '#333' }}>
      
      {/* Bright Festive Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #d32f2f 0%, #ff5722 100%)', 
        padding: '100px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        borderBottom: '8px solid #ffd700'
      }}>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', padding: '40px 0' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '4.5rem', marginBottom: '20px', color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            Celebrate with Joy.
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '50px', color: '#ffe0b2', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
            Premium, vibrant, and highly-certified Sivakasi crackers for a spectacular Deepavali.
          </p>
          <a href="/shop" style={{ textDecoration: 'none' }}>
            <button style={{ 
              background: '#ffd700', 
              color: '#d32f2f', 
              border: 'none', 
              padding: '18px 50px',
              borderRadius: '30px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              fontWeight: 'bold',
              fontSize: '1.4rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease'
            }}>
              Shop Now
            </button>
          </a>
        </div>
        
        {/* Subtle background decoration (Mandala / Festive vibe) */}
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0) 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
      </section>

      {/* Featured Products Section */}
      <section style={{ padding: '80px 50px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', marginBottom: '10px', color: '#d32f2f' }}>
          Festive Favorites
        </h2>
        <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '60px' }}>Brighten up your celebrations with our most popular picks.</p>
        
        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
