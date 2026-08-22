'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ScrollReveal from './ScrollReveal';

export default function DynamicLandingPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Sparklers', 'Ground Chakkars', 'Flower Pots', 'Aerial Fancy'];
  
  const products = [
    { id: 1, name: 'Hero Sparklers', category: 'Sparklers', price: 120, originalPrice: 300, discount: '60%', image: '/product_sparklers.png' },
    { id: 2, name: 'Hero Rockets', category: 'Aerial Fancy', price: 450, originalPrice: 1500, discount: '70%', image: '/product_rockets.png' },
    { id: 3, name: 'Magic Fountain', category: 'Flower Pots', price: 250, originalPrice: 800, discount: '68%', image: '/product_fountains.png' },
    { id: 4, name: 'Big Ground Chakkars', category: 'Ground Chakkars', price: 180, originalPrice: 600, discount: '70%', image: '🌀' },
    { id: 5, name: 'Color Smoke Fountains', category: 'Flower Pots', price: 300, originalPrice: 900, discount: '66%', image: '⛲' },
    { id: 6, name: '12 Shot Multi-Color', category: 'Aerial Fancy', price: 450, originalPrice: 1500, discount: '70%', image: '🚀' },
    { id: 7, name: '240 Rider Wala', category: 'Aerial Fancy', price: 500, originalPrice: 1800, discount: '72%', image: '🧨' },
    { id: 8, name: 'Premium Gift Box', category: 'All', price: 1500, originalPrice: 5000, discount: '70%', image: '🎁' },
  ];

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === 'activeCategory' || p.category === activeCategory);

  return (
    <div style={{ 
      background: '#FAFAFA', 
      color: '#333', 
      overflowX: 'hidden', 
      fontFamily: '"Inter", system-ui, sans-serif' 
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bangers&display=swap');
        * { box-sizing: border-box; }
        
        .premium-btn {
          background: #B71C1C;
          color: white;
          border: 2px solid #B71C1C;
          padding: 14px 40px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .premium-btn:hover {
          background: #8B0000;
          border-color: #8B0000;
          box-shadow: 0 4px 15px rgba(183, 28, 28, 0.4);
        }
        .premium-btn-outline {
          background: transparent;
          color: #D4AF37;
          border: 2px solid #D4AF37;
        }
        .premium-btn-outline:hover {
          background: #D4AF37;
          color: #1a1a1a;
        }

        .category-tab {
          padding: 10px 25px;
          background: #fff;
          border: 1px solid #ddd;
          color: #666;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .category-tab:hover {
          border-color: #B71C1C;
          color: #B71C1C;
        }
        .category-tab.active {
          background: #B71C1C;
          color: #fff;
          border-color: #B71C1C;
        }

        .product-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 20px;
          padding: 0;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .product-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(212, 175, 55, 0.15);
          border-color: #D4AF37;
        }

        .discount-badge {
          position: absolute;
          top: 15px;
          right: -30px;
          background: linear-gradient(135deg, #FF416C, #FF4B2B);
          color: white;
          padding: 5px 35px;
          font-weight: 800;
          font-size: 0.85rem;
          transform: rotate(45deg);
          box-shadow: 0 2px 10px rgba(255, 75, 43, 0.5);
          z-index: 10;
        }

        .add-to-cart-btn {
          width: 100%;
          padding: 15px;
          background: #f8f9fa;
          border: none;
          border-top: 1px solid #eee;
          color: #B71C1C;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          font-size: 1rem;
        }
        
        .add-to-cart-btn:hover {
          background: #B71C1C;
          color: white;
        }

        .add-to-cart-btn:active {
          transform: scale(0.95);
        }      `}</style>

      {/* INTERACTIVE HERO SECTION */}
      <section style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 0 60px 0',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #FF4500 0%, #7A28CB 50%, #4A00E0 100%)',
      }}>
        {/* Faint Grid Background Overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          zIndex: 1
        }}></div>

        {/* Animated Background Particles */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, overflow: 'hidden' }}>
          <style>{`
            .bg-spark {
              position: absolute;
              width: 5px; height: 5px;
              background: #FFF;
              border-radius: 50%;
              box-shadow: 0 0 15px #FFF, 0 0 25px #FFD700;
              animation: floatBgSpark linear infinite;
              opacity: 0.8;
            }
            @keyframes floatBgSpark {
              0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
              20% { opacity: 1; }
              80% { opacity: 1; }
              100% { transform: translateY(-10vh) scale(1.5); opacity: 0; }
            }
          `}</style>
          {[...Array(25)].map((_, i) => (
            <div key={i} className="bg-spark" style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 4 + 3}s`,
              animationDelay: `${Math.random() * 3}s`
            }}></div>
          ))}
        </div>

        {/* TOP NAVIGATION BAR */}
        <nav style={{
          position: 'relative',
          zIndex: 20,
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px',
          color: '#FFF',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎆</span>
            <div style={{ lineHeight: '1' }}>
              <div style={{ fontWeight: '900', fontSize: '1.2rem', letterSpacing: '1px' }}>FIREWORKS</div>
              <div style={{ fontWeight: '900', fontSize: '1.2rem', letterSpacing: '1px' }}>FRENZY</div>
            </div>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: '30px', fontWeight: '700', fontSize: '0.9rem', letterSpacing: '1px' }}>
            <span style={{ color: '#FFD700', cursor: 'pointer' }}>HOME</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#FFD700'} onMouseOut={e => e.target.style.color = '#FFF'}>CATEGORIES</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#FFD700'} onMouseOut={e => e.target.style.color = '#FFF'}>BESTSELLERS</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#FFD700'} onMouseOut={e => e.target.style.color = '#FFF'}>SHOWS</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#FFD700'} onMouseOut={e => e.target.style.color = '#FFF'}>ACCOUNT</span>
            <span style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', gap: '5px' }}>
              CART <span style={{ fontSize: '1.2rem' }}>🛒</span>
              <span style={{
                position: 'absolute', top: '-8px', right: '-12px',
                background: '#FF8C00', color: '#FFF', fontSize: '0.7rem',
                padding: '2px 6px', borderRadius: '50%', fontWeight: '900'
              }}>4</span>
            </span>
          </div>

          {/* Icons */}
          <div style={{ display: 'flex', gap: '20px', fontSize: '1.2rem', cursor: 'pointer' }}>
            <span>🔍</span>
            <span>🤍</span>
            <span>👤</span>
          </div>
        </nav>

        {/* HERO CONTENT (Stacked Vertically) */}
        <div style={{ 
          position: 'relative', 
          zIndex: 10, 
          width: '100%',
          maxWidth: '1000px', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '60px',
          gap: '20px',
          textAlign: 'center'
        }}>
          
          <h1 style={{
            fontSize: 'clamp(4rem, 10vw, 9rem)',
            lineHeight: '0.9',
            color: '#FFD700',
            fontFamily: '"Bangers", system-ui, sans-serif',
            letterSpacing: '4px',
            margin: '0',
            textShadow: '0px 4px 0px #CC3700, 0px 8px 0px #8B0000, 0px 15px 20px rgba(0,0,0,0.6), -2px -2px 0 #FFF, 2px -2px 0 #FFF, -2px 2px 0 #FFF, 2px 2px 0 #FFF',
            transform: 'rotate(-2deg)'
          }}>
            EXPLOSIVE FUN!
          </h1>
          
          <p style={{
            fontSize: '1.8rem',
            lineHeight: '1.4',
            color: '#FFF',
            margin: '10px 0 30px',
            fontWeight: '900',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textTransform: 'uppercase',
            textShadow: '0 4px 8px rgba(0,0,0,0.6)',
            transform: 'rotate(-1deg)'
          }}>
            Spark the Celebration! <br/>
            <span style={{ fontSize: '1.2rem', fontWeight: '600', textTransform: 'none' }}>
              Shop premium fireworks for unforgettable nights.
            </span>
          </p>

          <Link href="#catalog" style={{
            background: 'linear-gradient(to bottom, #FFB900, #FF7B00)',
            color: '#FFF',
            fontWeight: '900',
            fontSize: '1.6rem',
            textTransform: 'uppercase',
            padding: '18px 60px',
            borderRadius: '50px',
            textDecoration: 'none',
            border: '3px solid #FFF',
            boxShadow: '0 10px 0 #CC3700, 0 20px 30px rgba(0,0,0,0.5), inset 0 4px 10px rgba(255,255,255,0.5)',
            transition: 'all 0.1s ease',
            display: 'inline-block',
            cursor: 'pointer',
            zIndex: 15
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(8px)';
            e.currentTarget.style.boxShadow = '0 2px 0 #CC3700, 0 10px 15px rgba(0,0,0,0.5), inset 0 4px 10px rgba(255,255,255,0.5)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 0 #CC3700, 0 20px 30px rgba(0,0,0,0.5), inset 0 4px 10px rgba(255,255,255,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 0 #CC3700, 0 20px 30px rgba(0,0,0,0.5), inset 0 4px 10px rgba(255,255,255,0.5)';
          }}
          >
            SHOP NOW
          </Link>

          {/* Floating 3D Element over the bottom edge */}
          <div style={{ marginTop: '-40px', width: '100%', maxWidth: '700px', display: 'flex', justifyContent: 'center' }}>
            <style>{`
              .fun-container {
                position: relative;
                width: 100%;
                aspect-ratio: 1/1;
                animation: float3DAsset 5s ease-in-out infinite;
                filter: drop-shadow(0 40px 50px rgba(0,0,0,0.6));
                z-index: 10;
              }

              @keyframes float3DAsset {
                0% { transform: translateY(0px) rotate(0deg) scale(1); }
                50% { transform: translateY(-25px) rotate(2deg) scale(1.03); }
                100% { transform: translateY(0px) rotate(0deg) scale(1); }
              }
            `}</style>
            
            <div className="fun-container">
              <Image 
                src="/explosive_fun.png" 
                alt="Explosive Fun Fireworks Box" 
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* FESTIVE CATALOG SECTION */}
      <section id="catalog" style={{ 
        position: 'relative', 
        padding: '80px 5%',
        background: '#FAFAFA', 
      }}>
        
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ 
              fontSize: '2.5rem', color: '#111', marginBottom: '15px', fontFamily: '"Playfair Display", serif'
            }}>
              Diwali Collection 2024
            </h2>
            <div style={{ width: '60px', height: '3px', background: '#B71C1C', margin: '0 auto' }}></div>
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginBottom: '40px' }}>
            {categories.map(cat => (
              <button 
                key={cat}
                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            
            {filteredProducts.map((product, idx) => (
              <ScrollReveal key={product.id} distance="30px" delay={idx * 50} duration="0.5s">
                <div className="product-card">
                  <div className="discount-badge">{product.discount} OFF</div>
                  
                  {/* Product Image Placeholder */}
                  <div style={{ 
                    height: '250px', 
                    background: '#f8f9fa', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '5rem',
                    borderBottom: '1px solid #eee',
                    position: 'relative'
                  }}>
                    {product.image.startsWith('/') ? (
                       <Image src={product.image} alt={product.name} fill style={{ objectFit: 'contain', padding: '20px' }} />
                    ) : (
                       product.image
                    )}
                  </div>

                  <div style={{ padding: '25px 20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.8rem', color: '#B71C1C', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                      {product.category}
                    </div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#111', fontWeight: '600', flexGrow: 1 }}>
                      {product.name}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: '700', color: '#111' }}>₹{product.price}</span>
                      <span style={{ fontSize: '1rem', color: '#999', textDecoration: 'line-through' }}>₹{product.originalPrice}</span>
                    </div>
                  </div>

                  {/* Enhanced Add to Cart Button */}
                  <button 
                    className="add-to-cart-btn"
                    onClick={(e) => {
                      // Small visual click effect
                      const btn = e.currentTarget;
                      btn.innerHTML = '🛒 Added!';
                      btn.style.background = '#4CAF50';
                      btn.style.color = '#fff';
                      setTimeout(() => {
                        btn.innerHTML = 'Add to Cart';
                        btn.style.background = '';
                        btn.style.color = '';
                      }, 1000);
                      
                      // Trigger global cart update (assuming this is handled by a context in reality, 
                      // but here we can just show the visual effect)
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </ScrollReveal>
            ))}

          </div>
        </div>
      </section>

      {/* PROFESSIONAL FOOTER */}
      <footer style={{
        background: '#111',
        color: '#fff',
        padding: '60px 5% 30px',
        borderTop: '5px solid #D4AF37'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'space-between' }}>
          
          <div style={{ flex: '1 1 300px' }}>
            <h3 style={{ color: '#D4AF37', fontSize: '1.5rem', marginBottom: '15px', fontFamily: '"Playfair Display", serif' }}>
              HERO CRACKERS
            </h3>
            <p style={{ color: '#aaa', lineHeight: '1.6', marginBottom: '20px' }}>
              Lighting up smiles since 2010. Direct wholesale suppliers of premium, certified green crackers from the fireworks capital, Sivakasi.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <span style={{ padding: '8px 15px', background: '#222', borderRadius: '4px', fontSize: '0.9rem' }}>✅ 100% Authentic</span>
              <span style={{ padding: '8px 15px', background: '#222', borderRadius: '4px', fontSize: '0.9rem' }}>✅ Eco-Friendly</span>
            </div>
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <h4 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#aaa', lineHeight: '2' }}>
              <li><Link href="#catalog" style={{ color: 'inherit', textDecoration: 'none' }}>Shop Online</Link></li>
              <li><Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Download Price List</Link></li>
              <li><Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Safety Guidelines</Link></li>
              <li><Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms & Conditions</Link></li>
            </ul>
          </div>

          <div style={{ flex: '1 1 250px' }}>
            <h4 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Contact Us</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#aaa', lineHeight: '2' }}>
              <li>📍 123 Firework Ave, Sivakasi, TN</li>
              <li>📞 +91 98765 43210</li>
              <li>✉️ sales@herocrackers.com</li>
            </ul>
          </div>

        </div>
        
        <div style={{ 
          maxWidth: '1200px', 
          margin: '40px auto 0', 
          paddingTop: '20px', 
          borderTop: '1px solid #333', 
          textAlign: 'center',
          color: '#777',
          fontSize: '0.9rem'
        }}>
          <p style={{ marginBottom: '10px' }}>&copy; {new Date().getFullYear()} Hero Crackers. All Rights Reserved. Designed for a brighter, safer Diwali.</p>
          <p>Hero Crackers is a part of <strong>Arunachalam Agency</strong> which is the verified Meta Business Portfolio.</p>
        </div>
      </footer>

    </div>
  );
}
