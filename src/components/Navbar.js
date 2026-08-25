'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { cartItemsCount, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        padding: '0',
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(255, 248, 231, 0.95)' : 'rgba(255, 248, 231, 0.7)',
        backdropFilter: 'blur(10px)',
        borderBottom: '3px double #D4AF37',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
      }}
    >
      <div className="royal-nav-container" style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 40px',
      }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h2 style={{ 
          fontFamily: '"Rozha One", "Playfair Display", serif', 
          margin: 0, 
          color: '#3E0000',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span className="brand-logo-icon" style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 2px 5px rgba(212,175,55,0.4))' }}>🪔</span>
          <span className="brand-title" style={{ fontWeight: '800', fontSize: '1.8rem' }}>Hero</span> 
          <span className="brand-subtitle" style={{ color: '#FF9933', fontWeight: '700', fontSize: '1.8rem' }}>Crackers</span>
        </h2>
      </Link>

      <style>{`
        @media (max-width: 768px) {
          .desktop-links {
            display: none !important;
          }
          .royal-nav-container {
            padding: 10px 15px !important;
          }
          .brand-logo-icon {
            font-size: 1.8rem !important;
          }
          .brand-title, .brand-subtitle {
            font-size: 1.4rem !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }

        .mobile-menu-btn {
          display: none;
          background: transparent;
          border: none;
          font-size: 1.8rem;
          color: #3E0000;
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }

        .nav-link {
          position: relative;
          color: #3E0000;
          text-decoration: none;
          font-weight: 700;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          transition: color 0.3s;
          padding: 5px 0;
        }
        .nav-link::after {
          content: '❖';
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%) scale(0);
          color: #FF9933;
          font-size: 0.8rem;
          transition: transform 0.3s ease;
        }
        .nav-link:hover::after, .nav-link.active::after {
          transform: translateX(-50%) scale(1);
        }
        .nav-link:hover, .nav-link.active {
          color: #FF9933;
        }

        @keyframes bounceEffect {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .cart-btn {
          background: transparent;
          border: none;
          color: #3E0000;
          padding: 8px 15px;
          cursor: pointer;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          position: relative;
        }
        .cart-btn:hover {
          transform: translateY(-2px) scale(1.1);
        }
        .cart-btn:hover .cart-counter {
          animation: bounceEffect 0.5s ease-in-out infinite;
        }
      `}</style>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <div className="desktop-links" style={{ display: 'flex', gap: '30px' }}>
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
        </div>
        
        <button 
          className="cart-btn"
          onClick={() => setIsCartOpen(true)}
        >
          🛒 <span className="cart-counter" style={{
            position: 'absolute',
            top: '0px',
            right: '0px',
            background: '#FF9933', 
            color: '#FFFFFF', 
            borderRadius: '50%', 
            width: '20px', 
            height: '20px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: '800',
            border: '2px solid #3E0000'
          }}>{cartItemsCount}</span>
        </button>

        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✖' : '☰'}
        </button>
      </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'rgba(255, 248, 231, 0.98)',
          backdropFilter: 'blur(10px)',
          borderBottom: '3px double #D4AF37',
          padding: '30px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '25px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          zIndex: 40
        }}>
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link href="/shop" className={`nav-link ${pathname === '/shop' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
          <Link href="/admin" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>
        </div>
      )}

    </header>
  );
}
