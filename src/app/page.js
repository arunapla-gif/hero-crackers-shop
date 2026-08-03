import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import ScrollReveal from '@/components/ScrollReveal';

export const revalidate = 60;

export default async function Home() {
  const featuredProducts = await prisma.product.findMany({
    take: 4,
    orderBy: { price: 'desc' }
  });

  return (
    <div style={{ backgroundColor: '#FAF8F5', color: '#333', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        /* Global Button Styles */
        .terracotta-btn {
          background-color: #D84315;
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: bold;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.2s ease;
          width: 100%;
        }
        .terracotta-btn:hover {
          background-color: #BF360C;
          transform: translateY(-2px);
        }

        /* Hero Text Styles */
        .hero-title {
          font-family: 'var(--font-serif)';
          font-size: clamp(2.5rem, 5vw, 4rem);
          color: #FFC107;
          text-shadow: 2px 2px 10px rgba(0,0,0,0.8);
          margin-bottom: 5px;
          line-height: 1.1;
        }
        .hero-subtitle {
          font-size: 1.2rem;
          color: #fff;
          text-shadow: 1px 1px 5px rgba(0,0,0,0.8);
          font-weight: 500;
        }

        .view-all-btn {
          background-color: transparent;
          color: #D84315;
          border: 2px solid #D84315;
          padding: 12px 40px;
          border-radius: 25px;
          font-weight: bold;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .view-all-btn:hover {
          background-color: #D84315;
          color: #fff;
        }
      `}</style>
      
      {/* 1. HERO MASCOT SHOWCASE (Full Width Image) */}
      <section style={{
        position: 'relative',
        width: '100%',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        {/* Background Image */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          <Image 
            src="/images/mockup_family_hero.png"
            alt="Happy Diwali Family"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
          />
          {/* Subtle gradient overlay to ensure text readability on the edges */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.6) 100%)'
          }} />
        </div>

        {/* Text Overlays - Positioned left and right like the mockup */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '20px 5%' }}>
          
          {/* Left Text */}
          <div style={{ textAlign: 'left', maxWidth: '400px', marginTop: '10%' }}>
            <ScrollReveal>
              <h1 className="hero-title">HAPPY DIWALI!</h1>
              <p className="hero-subtitle">Illuminate Your Celebrations!</p>
            </ScrollReveal>
          </div>

          {/* Right Text */}
          <div style={{ textAlign: 'right', maxWidth: '400px', marginTop: '10%' }}>
            <ScrollReveal delay={200}>
              <h1 className="hero-title" style={{ color: '#fff' }}>
                SPARKLE<br/><span style={{ color: '#FFC107' }}>AND SHINE!</span>
              </h1>
              <p className="hero-subtitle">Get Ready for Diwali</p>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* 2. FEATURED COLLECTIONS (Products) */}
      <section style={{ padding: '80px 5%' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#222', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Featured Collections
              </h2>
              <div style={{ width: '60px', height: '3px', backgroundColor: '#D84315', margin: '15px auto' }} />
            </div>
          </ScrollReveal>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {featuredProducts.map((product, index) => (
              <ScrollReveal key={product.id} delay={index * 100}>
                {/* 
                  We render the standard ProductCard. 
                  Since the page background is light (#FAF8F5), the default ProductCard will look clean. 
                  We can wrap it in a container to enforce the mockup's soft shadow and terracotta button style 
                  if needed, but ProductCard handles its own layout well.
                */}
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
             <Link href="/shop" style={{ textDecoration: 'none' }}>
                <button className="view-all-btn">
                  View All Products
                </button>
             </Link>
          </div>
        </div>
      </section>

      {/* 3. WHY SHOP WITH US (Trust Banner) */}
      <section style={{ padding: '40px 5%', backgroundColor: '#F0EBE1', borderTop: '1px solid #E5E0D5', borderBottom: '1px solid #E5E0D5' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <ScrollReveal>
            <h3 style={{ textAlign: 'center', fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#333', marginBottom: '30px' }}>
              WHY SHOP WITH US?
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
              {[
                { title: 'Secure Shopping' },
                { title: 'Fast Delivery' },
                { title: 'Safe Fireworks' }
              ].map(feature => (
                <div key={feature.title} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '24px', height: '24px', backgroundColor: '#D84315', color: '#fff', 
                    borderRadius: '50%', fontSize: '0.8rem', fontWeight: 'bold' 
                  }}>
                    ✓
                  </div>
                  <span style={{ color: '#444', fontWeight: '600', fontSize: '1.1rem' }}>{feature.title}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}
