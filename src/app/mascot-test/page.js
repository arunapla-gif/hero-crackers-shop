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
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '20px 5%'
      }}>
        {/* Full Cover Background Image */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 0
        }}>
          <Image 
            src={mascots[selectedMascot].src}
            alt={mascots[selectedMascot].name}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
          />
          {/* Overlay to ensure text readability */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)'
          }} />
        </div>

        {/* Content Container */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Text Side (Left Aligned over the dark gradient) */}
          <div style={{ flex: '1 1 600px', padding: '40px', maxWidth: '700px' }}>
            <div style={{ display: 'inline-block', padding: '8px 24px', background: 'rgba(255,193,7,0.2)', border: '1px solid rgba(255,193,7,0.4)', borderRadius: '30px', color: '#ffc107', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '30px', backdropFilter: 'blur(5px)' }}>
              Deepavali Mega Sale
            </div>
            
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(3.5rem, 7vw, 5.5rem)',
              lineHeight: 1.1,
              marginBottom: '30px',
              color: '#fff',
              textShadow: '0 10px 30px rgba(0,0,0,0.8)'
            }}>
              Experience <br/><span style={{ color: '#ffc107' }}>the Magic.</span>
            </h1>
            
            <p style={{ fontSize: '1.3rem', lineHeight: '1.6', marginBottom: '40px', color: 'rgba(255,255,255,0.9)', fontWeight: '500', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              Bring home the joy with our exclusive collection of vibrant, premium Sivakasi fireworks. Safe, certified, and spectacular.
            </p>
            
            <button style={{
              background: 'linear-gradient(135deg, #FF1361, #FF5722)',
              color: '#fff',
              border: 'none',
              padding: '18px 50px',
              borderRadius: '50px',
              fontWeight: 800,
              fontSize: '1.2rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(255, 19, 97, 0.5)'
            }}>
              Shop The Collection
            </button>
          </div>

        </div>
      </section>

      {/* Featured Products Mock Section to show full page context */}
      <section style={{ padding: '100px 20px', textAlign: 'center', backgroundColor: '#050505', position: 'relative', zIndex: 10 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '3.5rem', marginBottom: '15px', color: '#ffc107', letterSpacing: '-1px' }}>
          Festive Favorites
        </h2>
        <p style={{ color: '#aaa', fontSize: '1.2rem', marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>
          A curated selection of our most spectacular and highest-rated firecrackers to light up your celebrations.
        </p>
        
        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ width: '300px', height: '400px', backgroundColor: '#111', borderRadius: '20px', border: '1px solid #333' }}>
              <div style={{ height: '60%', backgroundColor: '#222', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}></div>
              <div style={{ padding: '20px', textAlign: 'left' }}>
                <div style={{ height: '20px', backgroundColor: '#333', width: '80%', marginBottom: '10px', borderRadius: '4px' }}></div>
                <div style={{ height: '15px', backgroundColor: '#333', width: '40%', marginBottom: '20px', borderRadius: '4px' }}></div>
                <div style={{ height: '40px', backgroundColor: '#FF1361', width: '100%', borderRadius: '20px' }}></div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
