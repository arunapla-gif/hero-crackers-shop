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
    <div style={{ backgroundColor: '#0A0710', color: '#FFF', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        /* Global Styles */
        .primary-btn {
          background: linear-gradient(135deg, #FF9800 0%, #FF5722 100%);
          color: #fff;
          border: none;
          padding: 16px 36px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 87, 34, 0.4);
        }
        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 87, 34, 0.6);
          filter: brightness(1.1);
        }

        .view-all-btn {
          background-color: transparent;
          color: #FFC107;
          border: 2px solid #FFC107;
          padding: 12px 40px;
          border-radius: 25px;
          font-weight: bold;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s;
        }
        .view-all-btn:hover {
          background-color: rgba(255, 193, 7, 0.1);
          box-shadow: 0 0 15px rgba(255, 193, 7, 0.3);
        }

        /* Glassmorphism Containers */
        .glass-card {
          background: rgba(25, 20, 45, 0.5);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }

        .category-card {
          background: rgba(25, 20, 45, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 30px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .category-card:hover {
          transform: translateY(-5px);
          background: rgba(35, 25, 60, 0.6);
          box-shadow: 0 15px 30px rgba(0,0,0,0.5);
          border-color: rgba(255, 193, 7, 0.5);
        }

        /* Text Gradients */
        .text-gradient {
          background: linear-gradient(to right, #FFC107, #FF5722);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
      
      {/* 1. HERO SECTION WITH SEAMLESS PANORAMIC NIGHT SKY */}
      <section style={{
        position: 'relative',
        width: '100%',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '60px' // offset for navbar
      }}>
        {/* Massive Background Image with Seamless Fade */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
        }}>
          <Image 
            src="/images/dark_hero_fireworks.png" 
            alt="Diwali Night Sky Fireworks"
            fill
            style={{ objectFit: 'cover', objectPosition: 'top' }}
            priority
            quality={100}
          />
        </div>

        {/* Hero Content (Floating over the seamlessly blended background) */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 10, padding: '0 5%' }}>
          <ScrollReveal>
            <div style={{ display: 'inline-block', padding: '8px 25px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', color: '#FFC107', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '2px', border: '1px solid rgba(255,193,7,0.3)', marginBottom: '30px', textTransform: 'uppercase' }}>
              ✨ The Premium Sivakasi Collection
            </div>
            
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3.5rem, 8vw, 6rem)', color: '#FFF', lineHeight: 1.1, marginBottom: '25px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.8))' }}>
              Light Up Your <br/>
              <span className="text-gradient">Celebrations.</span>
            </h1>
            
            <p style={{ fontSize: '1.25rem', color: '#DDD', lineHeight: '1.7', marginBottom: '45px', maxWidth: '600px', margin: '0 auto 45px auto', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.8))' }}>
              Experience the spectacular joy of authentic Sivakasi fireworks. 
              Premium quality, explosive colors, and guaranteed safety for your entire family.
            </p>
            
            <Link href="/shop" style={{ textDecoration: 'none' }}>
              <button className="primary-btn">
                Shop The Magic
              </button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. THE LEGACY OF SIVAKASI (Glassmorphism Section) */}
      <section style={{ padding: '80px 5%', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <ScrollReveal>
            <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap' }}>
              
              {/* Image Side */}
              <div style={{ flex: '1 1 450px', position: 'relative', minHeight: '400px' }}>
                <Image 
                  src="/images/sivakasi_history.png"
                  alt="Sivakasi Fireworks Heritage"
                  fill
                  style={{ objectFit: 'cover' }}
                />
                {/* Gradient overlay to blend image into the dark card seamlessly */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, transparent 50%, rgba(25, 20, 45, 1) 100%)' }} />
              </div>

              {/* Text Side */}
              <div style={{ flex: '1 1 450px', padding: '60px 50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#FFF', marginBottom: '20px' }}>
                  The Legacy of <span className="text-gradient">Sivakasi</span>
                </h2>
                
                <p style={{ fontSize: '1.15rem', color: '#CCC', lineHeight: '1.8', marginBottom: '20px' }}>
                  Known as the "Mini Japan" of India, Sivakasi has been the beating heart of India's fireworks industry for nearly a century. The unique climate and generations of unparalleled craftsmanship make it legendary.
                </p>
                
                <p style={{ fontSize: '1.15rem', color: '#CCC', lineHeight: '1.8' }}>
                  At Hero Crackers, we bring this rich heritage directly to your doorstep. Every sparkler and fountain we offer is a testament to local artisans, ensuring tradition, quality, and safety in every spark.
                </p>
              </div>

            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY (Glassmorphism Grid) */}
      <section style={{ padding: '80px 5%', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#FFF' }}>
                Browse by Category
              </h2>
            </div>
          </ScrollReveal>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px' }}>
            {[
              { name: 'Sparklers', emoji: '✨' },
              { name: 'Rockets', emoji: '🚀' },
              { name: 'Chakkars', emoji: '🌀' },
              { name: 'Gift Boxes', emoji: '🎁' }
            ].map((cat, i) => (
              <ScrollReveal key={cat.name} delay={i * 100}>
                <Link href="/shop" style={{ textDecoration: 'none' }}>
                  <div className="category-card">
                    <div style={{ fontSize: '3rem', marginBottom: '15px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }}>{cat.emoji}</div>
                    <h3 style={{ color: '#FFF', fontSize: '1.2rem', margin: 0, fontWeight: '600' }}>{cat.name}</h3>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED COLLECTIONS (Products) */}
      <section style={{ padding: '80px 5%', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#FFF' }}>
                Featured Collections
              </h2>
              <div style={{ width: '60px', height: '3px', background: 'linear-gradient(to right, #FFC107, #FF5722)', margin: '15px auto' }} />
            </div>
          </ScrollReveal>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', justifyItems: 'center' }}>
            {featuredProducts.map((product, index) => (
              <ScrollReveal key={product.id} delay={index * 150}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '70px' }}>
             <Link href="/shop" style={{ textDecoration: 'none' }}>
                <button className="view-all-btn">
                  View Full Catalog
                </button>
             </Link>
          </div>
        </div>
      </section>

      {/* 5. WHY SHOP WITH US (Glass Trust Banner) */}
      <section style={{ padding: '60px 5%', position: 'relative', zIndex: 10, paddingBottom: '100px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <ScrollReveal>
            <div className="glass-card" style={{ padding: '50px 30px' }}>
              <h3 style={{ textAlign: 'center', fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#FFF', marginBottom: '40px' }}>
                Why Choose <span className="text-gradient">Hero Crackers?</span>
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '30px' }}>
                {[
                  { title: 'Secure Shopping', desc: '100% safe checkout' },
                  { title: 'Fast Delivery', desc: 'Guaranteed festival shipping' },
                  { title: 'Safe Fireworks', desc: 'Certified Sivakasi quality' }
                ].map(feature => (
                  <div key={feature.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', textAlign: 'center' }}>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '60px', height: '60px', background: 'rgba(255, 87, 34, 0.2)', color: '#FF9800', 
                      borderRadius: '50%', fontSize: '1.5rem', fontWeight: 'bold', border: '1px solid rgba(255,152,0,0.3)'
                    }}>
                      ✓
                    </div>
                    <span style={{ color: '#FFF', fontWeight: '700', fontSize: '1.2rem' }}>{feature.title}</span>
                    <span style={{ color: '#AAA', fontSize: '0.95rem' }}>{feature.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}
