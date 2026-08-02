'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', color: '#fff' }}>
      
      {/* Hero Section Preview */}
      <section style={{
        position: 'relative',
        minHeight: 'calc(100vh - 80px)', // Account for navbar
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '20px 5%'
      }}>
        {/* Full Cover Background Image - Using Pixar Kids as default premium look */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 0
        }}>
          <Image 
            src="/images/new_mascot_1.png"
            alt="Deepavali Celebration"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
          />
          {/* Overlay to ensure text readability */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.2) 100%)'
          }} />
        </div>

        {/* Content Container */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Text Side (Left Aligned over the dark gradient) */}
          <div style={{ flex: '1 1 600px', padding: '40px', maxWidth: '700px' }}>
            <div style={{ display: 'inline-block', padding: '10px 28px', background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.3)', borderRadius: '30px', color: '#ffc107', fontWeight: 'bold', fontSize: '1rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '35px', backdropFilter: 'blur(10px)' }}>
              Deepavali Mega Sale
            </div>
            
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(4rem, 8vw, 6.5rem)',
              lineHeight: 1.05,
              marginBottom: '35px',
              color: '#fff',
              textShadow: '0 15px 40px rgba(0,0,0,0.9)'
            }}>
              Experience <br/><span style={{ color: '#ffc107', filter: 'drop-shadow(0 0 20px rgba(255,193,7,0.4))' }}>the Magic.</span>
            </h1>
            
            <p style={{ fontSize: '1.4rem', lineHeight: '1.7', marginBottom: '50px', color: 'rgba(255,255,255,0.9)', fontWeight: '400', textShadow: '0 4px 15px rgba(0,0,0,1)', maxWidth: '550px' }}>
              Bring home the joy with our exclusive collection of vibrant, premium Sivakasi fireworks. Safe, certified, and spectacular.
            </p>
            
            <Link href="/shop" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'linear-gradient(135deg, #FF1361, #FF5722)',
                color: '#fff',
                border: 'none',
                padding: '22px 60px',
                borderRadius: '50px',
                fontWeight: 800,
                fontSize: '1.3rem',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 15px 40px rgba(255, 19, 97, 0.6)',
                transition: 'transform 0.3s, box-shadow 0.3s'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(255, 19, 97, 0.8)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 19, 97, 0.6)';
              }}
              >
                Enter the Shop
              </button>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
