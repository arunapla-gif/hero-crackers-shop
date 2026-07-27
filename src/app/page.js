import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import ScrollReveal from '@/components/ScrollReveal';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  // Fetch a few featured products for the homepage
  const featuredProducts = await prisma.product.findMany({
    take: 3,
    orderBy: { price: 'desc' } // Just grabbing some high-end ones as featured
  });

  return (
    <>
    <style>{`
      .hero-btn {
        background: linear-gradient(135deg, #d32f2f 0%, #ff5722 100%);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.2);
        padding: 18px 50px;
        border-radius: 40px;
        box-shadow: 0 10px 30px rgba(211, 47, 47, 0.4);
        font-weight: bold;
        font-size: 1.2rem;
        letter-spacing: 1px;
        cursor: pointer;
        text-transform: uppercase;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .hero-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 40px rgba(211, 47, 47, 0.6);
      }
    `}</style>
    <div style={{ backgroundColor: '#fffdf5', color: '#333' }}>
      
      {/* Premium Dark Hero Section */}
      <section style={{ 
        backgroundColor: '#0a0a0a', 
        backgroundImage: 'radial-gradient(circle at 50% 0%, #3a0000 0%, #0a0a0a 70%)',
        padding: '120px 20px 140px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        borderBottom: '1px solid rgba(255, 215, 0, 0.2)'
      }}>
        
        <ScrollReveal delay={100} style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '40px 0' }}>
          
          <div style={{ display: 'inline-block', padding: '8px 20px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '30px', color: '#ffd700', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '30px' }}>
            ✨ Premium Sivakasi Quality
          </div>
          
          <h1 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '5.5rem', 
            lineHeight: '1.1',
            marginBottom: '30px', 
            background: 'linear-gradient(to right, #ffffff, #ffe0b2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.2))'
          }}>
            Ignite the Night.
          </h1>
          
          <p style={{ fontSize: '1.4rem', lineHeight: '1.6', marginBottom: '50px', color: '#a0a0a0', maxWidth: '700px', margin: '0 auto 50px' }}>
            Experience the magic of Deepavali with our exclusive collection of vibrant, high-quality, and certified safe fireworks. 
          </p>
          
          <a href="/shop" style={{ textDecoration: 'none' }}>
            <button className="hero-btn">
              Explore Collection
            </button>
          </a>
        </ScrollReveal>
        
        {/* Premium Ambient Background Effects */}
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(211,47,47,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(50px)', zIndex: 0 }}></div>
      </section>

      {/* Featured Products Section */}
      <section style={{ padding: '100px 20px', textAlign: 'center', backgroundColor: '#faf9f6' }}>
        <ScrollReveal>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '3.5rem', marginBottom: '15px', color: '#1a1a1a', letterSpacing: '-1px' }}>
            Festive Favorites
          </h2>
          <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>
            A curated selection of our most spectacular and highest-rated firecrackers to light up your celebrations.
          </p>
        </ScrollReveal>
        
        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {featuredProducts.map((product, index) => (
            <ScrollReveal key={product.id} delay={index * 150}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
    </>
  )
}
