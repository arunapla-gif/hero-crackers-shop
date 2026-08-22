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
        background: '#ffffff',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h2 style={{ 
          fontFamily: 'var(--font-serif)', 
          margin: 0, 
          color: 'var(--color-primary)',
          fontSize: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ color: 'var(--color-accent-gold)', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Hero</span> Crackers
        </h2>
      </Link>

      <style>{`
        .nav-link {
          position: relative;
          color: var(--color-text-dark);
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          transition: color 0.3s;
          padding: 5px 0;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 3px;
          bottom: 0;
          left: 0;
          background-color: var(--color-primary);
          transition: width 0.3s ease-out;
          border-radius: 2px;
        }
        .nav-link:hover {
          color: var(--color-primary);
        }
        .nav-link:hover::after, .nav-link.active::after {
          width: 100%;
        }
        .nav-link.active {
          color: var(--color-primary);
        }

        @keyframes bounceEffect {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .cart-btn {
          background: var(--color-primary);
          border: none;
          color: #fff;
          padding: 8px 20px;
          border-radius: 30px;
          cursor: pointer;
          font-weight: bold;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(229, 57, 53, 0.3);
        }
        .cart-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(229, 57, 53, 0.5);
        }
        .cart-btn:hover .cart-counter {
          animation: bounceEffect 0.5s ease-in-out infinite;
        }
      `}</style>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <Link 
          href="/" 
          className={`nav-link ${pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link 
          href="/shop" 
          className={`nav-link ${pathname === '/shop' ? 'active' : ''}`}
        >
          Shop
        </Link>
        <Link 
          href="/admin" 
          className="nav-link"
        >
          Admin
        </Link>
        
        <button 
          className="cart-btn"
          onClick={() => setIsCartOpen(true)}
        >
          🛒 <span className="cart-counter" style={{ 
            background: 'var(--color-accent-gold)', 
            color: '#1a1a1a', 
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
