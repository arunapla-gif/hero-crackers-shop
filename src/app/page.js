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

  // The deep rich purple hex used in the mascot images
  const themeBg = '#12092b';

  return (
    <div style={{ backgroundColor: themeBg, color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        /* Global Hover Styles */
        .primary-btn {
          background: linear-gradient(135deg, #FF1361, #FF5722);
          color: #fff;
          border: none;
          padding: 18px 45px;
          border-radius: 50px;
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(255, 19, 97, 0.4);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .primary-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(255, 19, 97, 0.6);
        }

        .category-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .category-card:hover {
          transform: translateY(-10px);
          background: rgba(255,255,255,0.1);
        }
        
        .cat-sparklers:hover { border-color: #FF1361; box-shadow: 0 10px 30px rgba(255, 19, 97, 0.2); }
        .cat-rockets:hover { border-color: #9C27B0; box-shadow: 0 10px 30px rgba(156, 39, 176, 0.2); }
        .cat-chakkars:hover { border-color: #FFC107; box-shadow: 0 10px 30px rgba(255, 193, 7, 0.2); }
        .cat-giftboxes:hover { border-color: #4CAF50; box-shadow: 0 10px 30px rgba(76, 175, 80, 0.2); }

        @keyframes floatSpark {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100px) scale(0); opacity: 0; }
        }
        .spark {
          position: absolute;
          background: #ffc107;
          border-radius: 50%;
          box-shadow: 0 0 10px #ffc107, 0 0 20px #ff9800;
          animation: floatSpark 3s infinite ease-in;
        }

        @keyframes floatMascot {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .floating-mascot {
          animation: floatMascot 6s ease-in-out infinite;
        }
      `}</style>
      
      {/* 1. HERO MASCOT SHOWCASE */}
      <section style={{
        position: 'relative',
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        padding: '20px 5%'
      }}>
        
        {/* Decorative Sparks */}
        {[...Array(15)].map((_, i) => (
          <div key={i} className="spark" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }} />
        ))}

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', width: '100%', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          
          {/* Left Text Content */}
          <div style={{ flex: '1 1 500px', padding: '40px 20px' }}>
            <ScrollReveal>
              <div style={{ display: 'inline-block', padding: '10px 24px', background: 'linear-gradient(90deg, rgba(255,19,97,0.2), rgba(255,193,7,0.2))', border: '1px solid rgba(255,193,7,0.5)', borderRadius: '30px', color: '#ffc107', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '30px' }}>
                🎇 Deepavali Mega Sale 2026
              </div>
              
              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(3.5rem, 6vw, 5.5rem)',
                lineHeight: 1.1,
                marginBottom: '20px',
                color: '#fff',
                textShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}>
                Light Up Your <br/><span style={{ color: '#ffc107' }}>Celebration.</span>
              </h1>
              
              <p style={{ fontSize: '1.25rem', lineHeight: '1.6', marginBottom: '40px', color: 'rgba(255,255,255,0.8)', maxWidth: '500px' }}>
                Premium Sivakasi fireworks delivered directly to your doorstep. Safe, spectacular, and guaranteed to bring joy to your family.
              </p>
              
              <Link href="/shop" style={{ textDecoration: 'none' }}>
                <button className="primary-btn">
                  Shop The Collection
                </button>
              </Link>
            </ScrollReveal>
          </div>

          {/* Right Mascot Image */}
          <div style={{ flex: '1 1 500px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <ScrollReveal delay={200}>
              <div className="floating-mascot" style={{
                position: 'relative',
                width: '100%',
                maxWidth: '600px',
                aspectRatio: '1/1'
              }}>
                {/* 
                  The mascot background is #12092b which matches the page background exactly. 
                  It will blend seamlessly! 
                */}
                <Image 
                  src="/images/mascot_dark_theme_hero.png"
                  alt="Diwali Mascot"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* 2. CATEGORY QUICK LINKS */}
      <section style={{ padding: '80px 5%', backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <ScrollReveal>
            <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '50px', color: '#fff' }}>Shop By Category</h2>
          </ScrollReveal>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            {[
              { name: 'Sparklers & Fountains', emoji: '✨', cssClass: 'cat-sparklers' },
              { name: 'Rockets & Aerials', emoji: '🚀', cssClass: 'cat-rockets' },
              { name: 'Ground Chakkars', emoji: '🌀', cssClass: 'cat-chakkars' },
              { name: 'Family Gift Boxes', emoji: '🎁', cssClass: 'cat-giftboxes' }
            ].map((cat, i) => (
              <ScrollReveal key={cat.name} delay={i * 100}>
                <Link href="/shop" style={{ textDecoration: 'none' }}>
                  <div className={`category-card ${cat.cssClass}`}>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{cat.emoji}</div>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>{cat.name}</h3>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FESTIVE FAVORITES (PRODUCTS) */}
      <section style={{ padding: '100px 5%', position: 'relative' }}>
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,19,97,0.1) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: '#fff', marginBottom: '15px' }}>Festive Favorites</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                Hand-picked selections to ensure your Diwali night is the brightest in the neighborhood.
              </p>
            </div>
          </ScrollReveal>
          
          <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {featuredProducts.map((product, index) => (
              <ScrollReveal key={product.id} delay={index * 150}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TRUST & QUALITY BANNER */}
      <section style={{ padding: '60px 5%', backgroundColor: '#0a0518', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '30px' }}>
          {[
            { icon: '🎇', title: 'Direct from Sivakasi', desc: '100% authentic quality' },
            { icon: '🛡️', title: 'Safe & Certified', desc: 'Strictly tested for safety' },
            { icon: '⚡', title: 'Express Delivery', desc: 'Fast festival shipping' }
          ].map(feature => (
            <div key={feature.title} style={{ textAlign: 'center', flex: '1 1 200px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{feature.icon}</div>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '5px' }}>{feature.title}</h4>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: 0 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
