'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function MascotTestPage() {
  const [selectedMascot, setSelectedMascot] = useState('old');

  const mascots = {
    old: { name: 'Old Mascot Theme', src: '/images/old_mascot.png' },
    new1: { name: 'New: Pixar Kids', src: '/images/new_mascot_1.png' },
    new2: { name: 'New: Cute Firecracker', src: '/images/new_mascot_2.png' },
    new3: { name: 'New: Rocket Rider', src: '/images/new_mascot_3.png' }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', color: '#fff' }}>
      
      {/* Dropdown Control Panel */}
      <div style={{ padding: '20px', backgroundColor: '#111', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 100 }}>
        <h3 style={{ margin: 0, color: '#ffc107' }}>Mascot Live Preview:</h3>
        <select 
          value={selectedMascot} 
          onChange={e => setSelectedMascot(e.target.value)}
          style={{ padding: '10px', fontSize: '1rem', borderRadius: '8px', backgroundColor: '#222', color: '#fff', border: '1px solid #555', cursor: 'pointer' }}
        >
          {Object.entries(mascots).map(([key, data]) => (
            <option key={key} value={key}>{data.name}</option>
          ))}
        </select>
        <Link href="/" style={{ color: '#aaa', textDecoration: 'underline' }}>Back to Home</Link>
      </div>

      {/* Hero Section Preview */}
      <section style={{
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        padding: '20px 5%'
      }}>
        {/* Background Mesh (similar to ModernHero) */}
        <div style={{
          position: 'absolute',
          inset: '-20%',
          background: `
            radial-gradient(circle at 20% 30%, rgba(255, 19, 97, 0.4) 0%, transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(255, 248, 0, 0.4) 0%, transparent 40%),
            radial-gradient(circle at 40% 80%, rgba(255, 87, 34, 0.4) 0%, transparent 40%)
          `,
          filter: 'blur(60px)',
          zIndex: 0,
          opacity: 0.8
        }}></div>

        {/* Content Container */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap', gap: '40px' }}>
          
          {/* Text Side */}
          <div style={{ flex: '1 1 500px', padding: '40px' }}>
            <div style={{ display: 'inline-block', padding: '8px 24px', background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.2)', borderRadius: '30px', color: '#ffc107', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '30px' }}>
              Deepavali Mega Sale
            </div>
            
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(3rem, 6vw, 4.5rem)',
              lineHeight: 1.1,
              marginBottom: '30px',
              color: '#fff',
              background: 'linear-gradient(135deg, #fff 0%, #ffc107 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 10px 20px rgba(255,193,7,0.2))'
            }}>
              Experience the Magic.
            </h1>
            
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '40px', color: 'rgba(255,255,255,0.7)', fontWeight: '400' }}>
              Bring home the joy with our exclusive collection of vibrant, premium Sivakasi fireworks. Safe, certified, and spectacular.
            </p>
            
            <button style={{
              background: 'linear-gradient(135deg, #FF1361, #FF5722)',
              color: '#fff',
              border: 'none',
              padding: '18px 40px',
              borderRadius: '50px',
              fontWeight: 800,
              fontSize: '1.1rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(255, 19, 97, 0.4)'
            }}>
              Shop The Collection
            </button>
          </div>

          {/* Image Side */}
          <div style={{ flex: '1 1 500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '500px',
              aspectRatio: '1/1',
              borderRadius: '30px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(255,193,7,0.2)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Image 
                src={mascots[selectedMascot].src}
                alt={mascots[selectedMascot].name}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
