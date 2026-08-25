'use client';

import Link from 'next/link';

export default function DynamicLandingPage() {
  return (
    <div style={{ 
      background: '#FFF8E7', // Festive Cream / Light Ivory
      color: '#3E0000', // Deep Kumkum Maroon
      overflowX: 'hidden', 
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif' 
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Rozha+One&display=swap');
        
        * { box-sizing: border-box; }
        
        html { scroll-behavior: smooth; }

        .title-font {
          font-family: '"Rozha One", "Playfair Display", serif';
        }

        /* Traditional Rangoli / Kolam inspired Background (Light Mode) */
        .rangoli-bg {
          position: absolute;
          inset: 0;
          background-color: #FFF8E7;
          background-image: 
            radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.15) 0%, transparent 60%),
            repeating-linear-gradient(45deg, rgba(212, 175, 55, 0.05) 0px, rgba(212, 175, 55, 0.05) 2px, transparent 2px, transparent 20px),
            repeating-linear-gradient(-45deg, rgba(212, 175, 55, 0.05) 0px, rgba(212, 175, 55, 0.05) 2px, transparent 2px, transparent 20px);
          z-index: 0;
        }

        .festive-btn {
          background: linear-gradient(135deg, #FF9933 0%, #D84315 100%); /* Saffron to Deep Orange */
          color: #ffffff;
          padding: 16px 45px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          border: 2px solid #FFD700;
          box-shadow: 0 8px 25px rgba(216, 67, 21, 0.3);
        }
        
        .festive-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 35px rgba(255, 153, 51, 0.5);
          background: linear-gradient(135deg, #FFB74D 0%, #E64A19 100%);
        }

        /* Responsive Layout Classes */
        .hero-section {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 140px 5% 80px;
          overflow: hidden;
        }

        .hero-wrapper {
          position: relative; 
          z-index: 10; 
          width: 100%;
          max-width: 1300px; 
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 50px;
        }

        .hero-text-col {
          flex: 1 1 500px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 30px;
        }

        .hero-image-col {
          flex: 1 1 500px;
          display: flex;
          justify-content: center;
          position: relative;
        }
        
        .hero-desc {
          font-size: 1.25rem;
          line-height: 1.8;
          color: #5D4037;
          max-width: 600px;
          margin: 0;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 110px 5% 50px;
            align-items: flex-start;
          }
          .hero-wrapper {
            gap: 40px;
            text-align: center;
            justify-content: center;
          }
          .hero-text-col {
            align-items: center;
            text-align: center;
            flex-basis: 100%;
            gap: 20px;
          }
          .hero-image-col {
            flex-basis: 100%;
          }
          .hero-desc {
            font-size: 1.1rem;
            line-height: 1.6;
          }
          .title-font {
            font-size: 2.8rem !important;
          }
        }
      `}</style>

      {/* FESTIVE HERO SECTION */}
      <section className="hero-section">
        
        {/* Light Rangoli Background */}
        <div className="rangoli-bg"></div>

        {/* Ambient Glows */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, rgba(255,153,51,0.08) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          zIndex: 1
        }}></div>

        {/* Hero Content Wrapper */}
        <div className="hero-wrapper">
          
          {/* Left Text Column */}
          <div className="hero-text-col">
            
            {/* Traditional Greeting */}
            <div style={{
              padding: '10px 25px',
              border: '2px solid #D4AF37',
              color: '#3E0000',
              fontSize: '0.95rem',
              fontWeight: '800',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              background: '#FFF0C2',
              boxShadow: '0 8px 25px rgba(212,175,55,0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '15px',
              borderRadius: '30px'
            }}>
              <span style={{ color: '#FF9933' }}>❖</span>
              Family Celebration 2026
              <span style={{ color: '#FF9933' }}>❖</span>
            </div>

            <h1 className="title-font" style={{
              fontSize: 'clamp(3rem, 6vw, 5.5rem)',
              lineHeight: '1.15',
              color: '#3E0000',
              fontWeight: '800',
              margin: '0',
            }}>
              Sivakasi's <br/>
              <span style={{ 
                color: '#FF9933',
                textShadow: '0 2px 5px rgba(255,153,51,0.2)'
              }}>
                Finest Deepavali
              </span>
            </h1>
            
            <p className="hero-desc">
              Celebrate the Festival of Lights with authentic, vibrant, and traditional fireworks straight from the heart of Tamil Nadu. Bring home the joy, the light, and the thunder. 🪔✨
            </p>

            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', justifyContent: 'center' }}>
              <Link href="/shop" className="festive-btn">
                Explore Catalog 🎇
              </Link>
            </div>
          </div>

          {/* Right Image Column */}
          <div className="hero-image-col">
            {/* Decorative Image Frame */}
            <div style={{
              position: 'relative',
              padding: '15px',
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '3px double #D4AF37',
              boxShadow: '0 20px 40px rgba(62,0,0,0.15), inset 0 0 20px rgba(212,175,55,0.1)',
              transform: 'rotate(2deg)',
              transition: 'transform 0.5s ease'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)'}
            onMouseOut={e => e.currentTarget.style.transform = 'rotate(2deg)'}
            >
              <img 
                src="/diwali-family-hero.png" 
                alt="South Indian Family Celebrating Diwali" 
                style={{
                  width: '100%',
                  maxWidth: '550px',
                  height: 'auto',
                  borderRadius: '10px',
                  display: 'block',
                  boxShadow: '0 10px 20px rgba(62,0,0,0.1)'
                }} 
              />
              
              {/* Corner Ornaments */}
              <span style={{ position: 'absolute', top: '-15px', left: '-15px', fontSize: '2.5rem', color: '#D4AF37', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))' }}>🪔</span>
              <span style={{ position: 'absolute', bottom: '-15px', right: '-15px', fontSize: '2.5rem', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))' }}>✨</span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
