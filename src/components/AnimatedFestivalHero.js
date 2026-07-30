'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ScrollReveal from './ScrollReveal';

export default function AnimatedFestivalHero() {
  const [fireworks, setFireworks] = useState([]);

  useEffect(() => {
    // Generate random fireworks bursts on mount
    const generateFirework = () => {
      const id = Math.random().toString(36).substring(2, 9);
      const top = Math.random() * 60 + 10; // 10% to 70% height
      const left = Math.random() * 80 + 10; // 10% to 90% width
      const color = ['#FFC107', '#E53935', '#8E24AA', '#FF5722'][Math.floor(Math.random() * 4)];
      
      setFireworks(prev => {
        // Keep max 5 at a time
        const next = [...prev, { id, top, left, color }];
        if (next.length > 5) next.shift();
        return next;
      });
    };

    const interval = setInterval(generateFirework, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'relative',
      height: '90vh',
      minHeight: '600px',
      overflow: 'hidden',
      background: 'var(--color-background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <style>{`
        @keyframes fireworkBurst {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes fireworkParticles {
          0% { box-shadow: 0 0 #fff; }
          100% { box-shadow: 0 -40px 0 #fff, 28px -28px 0 #fff, 40px 0 0 #fff, 28px 28px 0 #fff, 0 40px 0 #fff, -28px 28px 0 #fff, -40px 0 0 #fff, -28px -28px 0 #fff; }
        }
        .fw {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          animation: fireworkBurst 1.5s ease-out forwards;
        }
        .fw::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: 50%;
          animation: fireworkParticles 1.5s ease-out forwards;
        }
      `}</style>

      {/* Background Fireworks */}
      {fireworks.map(fw => (
        <div key={fw.id} className="fw" style={{
          top: \`\${fw.top}%\`,
          left: \`\${fw.left}%\`,
          backgroundColor: fw.color,
          color: fw.color
        }}>
          <div style={{ 
            position: 'absolute', 
            width: '100px', 
            height: '100px', 
            background: \`radial-gradient(circle, \${fw.color}33 0%, transparent 70%)\`,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%'
          }} />
        </div>
      ))}

      {/* Decorative SVG bursts */}
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.1, pointerEvents: 'none' }}>
        <circle cx="20%" cy="30%" r="200" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="10 20" />
        <circle cx="80%" cy="70%" r="300" fill="none" stroke="var(--color-accent-gold)" strokeWidth="2" strokeDasharray="15 30" />
      </svg>

      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '60px',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '30px',
        border: '2px solid rgba(255, 255, 255, 1)',
        boxShadow: '0 20px 50px rgba(229, 57, 53, 0.15)',
        maxWidth: '800px',
        width: '90%',
        margin: '0 auto'
      }}>
        <ScrollReveal>
          <h1 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '4.5rem', 
            color: 'var(--color-primary)', 
            marginBottom: '20px',
            lineHeight: 1.1,
            textShadow: '0 4px 15px rgba(229, 57, 53, 0.2)'
          }}>
            Light Up Your <span style={{ color: 'var(--color-accent-purple)' }}>Deepavali</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <p style={{ 
            fontSize: '1.3rem', 
            color: 'var(--color-text-dark)', 
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px',
            fontWeight: '500'
          }}>
            Discover Premium Fireworks for a Magical Celebration. Direct from Sivakasi to your doorstep.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <Link href="/shop" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-orange))',
              color: '#fff',
              border: 'none',
              padding: '18px 50px',
              borderRadius: '40px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(229, 57, 53, 0.4)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(229, 57, 53, 0.6)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(229, 57, 53, 0.4)';
            }}
            >
              Shop Collection
            </button>
          </Link>
        </ScrollReveal>
      </div>
    </div>
  );
}
