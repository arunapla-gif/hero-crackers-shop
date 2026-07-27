'use client';

import { useState, useRef, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';

export default function ModernHero() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const heroRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <section 
      ref={heroRef}
      onMouseMove={handleMouseMove}
      style={{
        '--mouse-x': `${mousePos.x}%`,
        '--mouse-y': `${mousePos.y}%`,
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#050505', // Deep dark base
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <style>{`
        @keyframes flowGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .hero-mesh {
          position: absolute;
          inset: -20%;
          background: 
            radial-gradient(circle at 20% 30%, rgba(255, 19, 97, 0.4) 0%, transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(255, 248, 0, 0.4) 0%, transparent 40%),
            radial-gradient(circle at 40% 80%, rgba(255, 87, 34, 0.4) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(156, 39, 176, 0.4) 0%, transparent 40%);
          filter: blur(60px);
          animation: flowGradient 15s ease infinite;
          background-size: 200% 200%;
          z-index: 0;
          opacity: 0.8;
        }

        .cursor-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1;
          filter: blur(40px);
          transition: width 0.2s, height 0.2s;
        }

        .glass-content {
          position: relative;
          z-index: 10;
          background: rgba(20, 20, 20, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 40px;
          padding: 80px 40px;
          text-align: center;
          max-width: 900px;
          width: 100%;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
          overflow: hidden;
        }
        
        .glass-content::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.08) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        .modern-title {
          font-family: var(--font-serif);
          font-size: clamp(3rem, 8vw, 5.5rem);
          line-height: 1.1;
          margin-bottom: 30px;
          color: #fff;
          background: linear-gradient(135deg, #fff 0%, #ffc107 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 10px 20px rgba(255,193,7,0.2));
          position: relative;
          z-index: 2;
        }

        .modern-btn {
          position: relative;
          background: linear-gradient(135deg, #FF1361, #FF5722);
          color: #fff;
          border: none;
          padding: 20px 50px;
          border-radius: 50px;
          font-weight: 800;
          font-size: 1.2rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          overflow: hidden;
          z-index: 2;
          box-shadow: 0 10px 30px rgba(255, 19, 97, 0.4);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
        }

        .modern-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s ease;
        }

        .modern-btn:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 40px rgba(255, 19, 97, 0.6);
        }

        .modern-btn:hover::before {
          left: 100%;
        }
      `}</style>

      {/* Animated Mesh Background */}
      <div className="hero-mesh"></div>
      
      {/* Interactive Cursor Glow */}
      <div 
        className="cursor-glow" 
        style={{ left: 'var(--mouse-x)', top: 'var(--mouse-y)' }}
      ></div>

      <ScrollReveal delay={100} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div className="glass-content">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-block', padding: '8px 24px', background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.2)', borderRadius: '30px', color: '#ffc107', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '30px', backdropFilter: 'blur(5px)' }}>
              Deepavali Mega Sale
            </div>
            
            <h1 className="modern-title">
              Experience the Magic.
            </h1>
            
            <p style={{ fontSize: '1.3rem', lineHeight: '1.6', marginBottom: '50px', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto 50px', fontWeight: '400' }}>
              Bring home the joy with our exclusive collection of vibrant, premium Sivakasi fireworks. Safe, certified, and spectacular.
            </p>
            
            <a href="/shop" style={{ textDecoration: 'none' }}>
              <button className="modern-btn">
                Shop The Collection
              </button>
            </a>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
