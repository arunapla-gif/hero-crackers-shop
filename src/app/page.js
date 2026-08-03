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
    <div style={{ backgroundColor: '#FCFAFF', color: '#333', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        /* Global Styles */
        .primary-btn {
          background-color: #D84315;
          color: #fff;
          border: none;
          padding: 16px 36px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 15px rgba(216, 67, 21, 0.3);
        }
        .primary-btn:hover {
          background-color: #BF360C;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(216, 67, 21, 0.4);
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
          transition: all 0.3s;
        }
        .view-all-btn:hover {
          background-color: #D84315;
          color: #fff;
        }

        .category-card {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 20px;
          padding: 30px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }
        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.08);
          border-color: #D84315;
        }

        /* Image Containers */
        .premium-image-wrapper {
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          transition: transform 0.3s ease;
        }
        .premium-image-wrapper:hover {
          transform: scale(1.02);
        }
      `}</style>
      
      {/* 1. MODERN SPLIT HERO */}
      <section style={{
        padding: '60px 5%',
        background: 'linear-gradient(135deg, #FFFAF0 0%, #FFF3E0 100%)',
        position: 'relative'
      }}>
        {/* Decorative background shapes */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: '#FFC107', opacity: '0.1', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '300px', height: '300px', background: '#FF5722', opacity: '0.1', borderRadius: '50%', filter: 'blur(80px)' }} />

        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '50px', position: 'relative', zIndex: 10 }}>
          
          {/* Text Content */}
          <div style={{ flex: '1 1 450px', maxWidth: '600px' }}>
            <ScrollReveal>
              <div style={{ display: 'inline-block', padding: '8px 20px', background: '#FFF3E0', color: '#D84315', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px', border: '1px solid #FFE0B2', marginBottom: '20px' }}>
                🎉 Deepavali 2026 Collection
              </div>
              
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem, 5vw, 4.5rem)', color: '#1A1A1A', lineHeight: 1.1, marginBottom: '25px' }}>
                The True Spirit of <span style={{ color: '#D84315' }}>Diwali.</span>
              </h1>
              
              <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.7', marginBottom: '40px', maxWidth: '500px' }}>
                Experience the joy of authentic Sivakasi fireworks. 
                Premium quality, spectacular colors, and safe celebrations delivered straight to your door.
              </p>
              
              <Link href="/shop" style={{ textDecoration: 'none' }}>
                <button className="primary-btn">
                  Explore The Magic
                </button>
              </Link>
            </ScrollReveal>
          </div>

          {/* Premium Image Card */}
          <div style={{ flex: '1 1 450px', display: 'flex', justifyContent: 'center', width: '100%' }}>
            <ScrollReveal delay={200} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <div className="premium-image-wrapper" style={{ width: '100%', maxWidth: '550px', aspectRatio: '4/4', position: 'relative' }}>
                <Image 
                  src="/images/mockup_family_hero.png" // Re-using the beautiful family mockup image, but as a card!
                  alt="Happy Diwali Family"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* 2. THE LEGACY OF SIVAKASI (History Section) */}
      <section style={{ padding: '100px 5%', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap-reverse', gap: '60px' }}>
          
          {/* History Image */}
          <div style={{ flex: '1 1 450px', display: 'flex', justifyContent: 'center', width: '100%' }}>
            <ScrollReveal style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <div className="premium-image-wrapper" style={{ width: '100%', maxWidth: '500px', aspectRatio: '4/5', position: 'relative', borderRadius: '20px' }}>
                <Image 
                  src="/images/sivakasi_history.png"
                  alt="Sivakasi Fireworks Heritage"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </ScrollReveal>
          </div>

          {/* History Text */}
          <div style={{ flex: '1 1 450px', maxWidth: '550px' }}>
            <ScrollReveal delay={200}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#1A1A1A', marginBottom: '20px' }}>
                The Legacy of Sivakasi
              </h2>
              <div style={{ width: '50px', height: '4px', backgroundColor: '#FFC107', marginBottom: '30px' }} />
              
              <p style={{ fontSize: '1.15rem', color: '#555', lineHeight: '1.8', marginBottom: '20px' }}>
                Known as the "Mini Japan" of India, Sivakasi has been the beating heart of India's fireworks industry for nearly a century. The dry climate and generations of unparalleled craftsmanship make it unique in the world.
              </p>
              
              <p style={{ fontSize: '1.15rem', color: '#555', lineHeight: '1.8' }}>
                At Hero Crackers, we honor this rich heritage. Every sparkler, rocket, and fountain we offer is a testament to the dedication of local artisans. We bring the magic of Sivakasi directly from the factories to your family's celebration, ensuring tradition, quality, and safety in every spark.
              </p>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* 3. SHOP BY CATEGORY */}
      <section style={{ padding: '80px 5%', backgroundColor: '#FAFAFA' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#222' }}>
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
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{cat.emoji}</div>
                    <h3 style={{ color: '#333', fontSize: '1.2rem', margin: 0, fontWeight: '600' }}>{cat.name}</h3>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED COLLECTIONS (Products) */}
      <section style={{ padding: '100px 5%', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#222' }}>
                Featured Collections
              </h2>
              <div style={{ width: '60px', height: '3px', backgroundColor: '#D84315', margin: '15px auto' }} />
            </div>
          </ScrollReveal>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {featuredProducts.map((product, index) => (
              <ScrollReveal key={product.id} delay={index * 150}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
             <Link href="/shop" style={{ textDecoration: 'none' }}>
                <button className="view-all-btn">
                  View Full Catalog
                </button>
             </Link>
          </div>
        </div>
      </section>

      {/* 5. WHY SHOP WITH US (Trust Banner) */}
      <section style={{ padding: '50px 5%', backgroundColor: '#FFF8E1', borderTop: '1px solid #FFE0B2', borderBottom: '1px solid #FFE0B2' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <ScrollReveal>
            <h3 style={{ textAlign: 'center', fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#333', marginBottom: '40px' }}>
              Why Shop With Us?
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '30px' }}>
              {[
                { title: 'Secure Shopping', desc: '100% safe checkout' },
                { title: 'Fast Delivery', desc: 'Guaranteed festival shipping' },
                { title: 'Safe Fireworks', desc: 'Certified Sivakasi quality' }
              ].map(feature => (
                <div key={feature.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center' }}>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '40px', height: '40px', backgroundColor: '#D84315', color: '#fff', 
                    borderRadius: '50%', fontSize: '1.2rem', fontWeight: 'bold' 
                  }}>
                    ✓
                  </div>
                  <span style={{ color: '#222', fontWeight: '700', fontSize: '1.1rem' }}>{feature.title}</span>
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>{feature.desc}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}
