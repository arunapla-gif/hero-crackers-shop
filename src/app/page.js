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
      @keyframes gradientBG {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes floatUp {
        0% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(10deg); }
        100% { transform: translateY(0px) rotate(0deg); }
      }
      @keyframes pulseGlow {
        0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
        70% { box-shadow: 0 0 0 20px rgba(255, 215, 0, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
      }
      .animated-hero {
        background: linear-gradient(-45deg, #FF1361, #FFF800, #ff5722, #9C27B0);
        background-size: 400% 400%;
        animation: gradientBG 10s ease infinite;
        position: relative;
        overflow: hidden;
        padding: 120px 20px 140px;
        text-align: center;
        border-bottom: 8px solid #FFD700;
      }
      .floating-icon {
        position: absolute;
        font-size: 3rem;
        opacity: 0.8;
        animation: floatUp 4s ease-in-out infinite;
        z-index: 0;
      }
      .glass-card {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 30px;
        padding: 50px 30px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.2);
        max-width: 800px;
        margin: 0 auto;
        position: relative;
        z-index: 10;
      }
      .hero-btn {
        background: #FFD700;
        color: #d32f2f;
        border: none;
        padding: 18px 50px;
        border-radius: 40px;
        font-weight: 900;
        font-size: 1.3rem;
        letter-spacing: 2px;
        cursor: pointer;
        text-transform: uppercase;
        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        transition: transform 0.3s ease, background 0.3s ease;
        animation: pulseGlow 2s infinite;
      }
      .hero-btn:hover {
        transform: scale(1.05) translateY(-3px);
        background: #fff;
      }
      .title-text {
        font-family: var(--font-serif);
        font-size: 4.5rem;
        line-height: 1.1;
        margin-bottom: 20px;
        color: #fff;
        text-shadow: 3px 3px 6px rgba(0,0,0,0.3);
      }
    `}</style>
    <div style={{ backgroundColor: '#fffdf5', color: '#333' }}>
      
      {/* Vibrant Animated Hero Section */}
      <section className="animated-hero">
        
        {/* Floating Decorative Elements */}
        <div className="floating-icon" style={{ top: '15%', left: '10%', animationDelay: '0s', fontSize: '4rem' }}>🪔</div>
        <div className="floating-icon" style={{ top: '60%', left: '5%', animationDelay: '1s', fontSize: '2.5rem' }}>✨</div>
        <div className="floating-icon" style={{ top: '20%', right: '10%', animationDelay: '2s', fontSize: '5rem' }}>🎆</div>
        <div className="floating-icon" style={{ bottom: '15%', right: '15%', animationDelay: '0.5s', fontSize: '3rem' }}>💥</div>
        <div className="floating-icon" style={{ top: '5%', left: '50%', animationDelay: '1.5s', fontSize: '2rem' }}>🌟</div>
        
        <ScrollReveal delay={100} style={{ position: 'relative', zIndex: 1, padding: '40px 0' }}>
          <div className="glass-card">
            <div style={{ display: 'inline-block', padding: '6px 20px', background: '#FFD700', borderRadius: '30px', color: '#d32f2f', fontWeight: 'bold', fontSize: '1rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              Deepavali Mega Sale
            </div>
            
            <h1 className="title-text">
              Celebrate with Color & Joy!
            </h1>
            
            <p style={{ fontSize: '1.4rem', lineHeight: '1.5', marginBottom: '40px', color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.4)', fontWeight: '500' }}>
              Bring home the magic with our explosive range of premium, safe, and highly vibrant Sivakasi fireworks.
            </p>
            
            <a href="/shop" style={{ textDecoration: 'none' }}>
              <button className="hero-btn">
                Shop The Collection 🚀
              </button>
            </a>
          </div>
        </ScrollReveal>
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
