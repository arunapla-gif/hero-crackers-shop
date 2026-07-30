'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { cartItemsCount, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show public navbar on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 40px',
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(5, 5, 5, 0.7)' : 'rgba(5, 5, 5, 0.2)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
        boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h2 style={{ 
          fontFamily: 'var(--font-serif)', 
          margin: 0, 
          color: '#fff',
          fontSize: '1.8rem',
          textShadow: '0 0 10px rgba(255,193,7,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ color: '#ffc107' }}>Hero</span> Crackers
        </h2>
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <Link 
          href="/" 
          style={{ 
            color: pathname === '/' ? '#ffc107' : '#fff', 
            textDecoration: 'none', 
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'color 0.2s',
            textShadow: pathname === '/' ? '0 0 10px rgba(255,193,7,0.5)' : 'none'
          }}
        >
          Home
        </Link>
        <Link 
          href="/shop" 
          style={{ 
            color: pathname === '/shop' ? '#ffc107' : '#fff', 
            textDecoration: 'none', 
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'color 0.2s',
            textShadow: pathname === '/shop' ? '0 0 10px rgba(255,193,7,0.5)' : 'none'
          }}
        >
          Shop
        </Link>
        
        <button 
          onClick={() => setIsCartOpen(true)}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 19, 97, 0.1), rgba(255, 87, 34, 0.1))',
            border: '1px solid rgba(255, 87, 34, 0.3)',
            color: '#fff',
            padding: '8px 20px',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 15px rgba(255, 19, 97, 0.2)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 19, 97, 0.3), rgba(255, 87, 34, 0.3))';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 19, 97, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 19, 97, 0.1), rgba(255, 87, 34, 0.1))';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 19, 97, 0.2)';
          }}
        >
          🛒 <span style={{ 
            background: '#ff1361', 
            color: '#fff', 
            borderRadius: '50%', 
            width: '24px', 
            height: '24px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '0.9rem'
          }}>{cartItemsCount}</span>
        </button>
      </nav>
    </header>
  );
}
