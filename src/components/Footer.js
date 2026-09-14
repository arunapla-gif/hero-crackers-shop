'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Footer() {
  const pathname = usePathname();

  // Hide public footer on all admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const linkStyle = {
    color: '#FFDBAA',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.2s ease',
  };

  return (
    <footer style={{ backgroundColor: '#2B0000', borderTop: '5px solid #D4AF37', color: '#FFF8E7', padding: '50px 5% 35px', textAlign: 'center', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Compliance / Green Crackers Banner */}
        <div style={{ 
          backgroundColor: 'rgba(212, 175, 55, 0.1)', 
          border: '1px solid rgba(212, 175, 55, 0.3)', 
          borderRadius: '12px', 
          padding: '16px 20px', 
          marginBottom: '35px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          fontSize: '0.9rem',
          color: '#FFE4B5'
        }}>
          <span>🌱 <strong>100% Green Crackers:</strong> CSIR-NEERI Certified Formulations</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>🏛️ <strong>PESO Authorized:</strong> Legal Sivakasi Fireworks Manufacturer & Dealer</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>📜 <strong>Supreme Court Compliant:</strong> Transparent Quotation / Estimate Portal</span>
        </div>

        {/* Agency Information */}
        <div style={{ marginBottom: '30px', fontSize: '1.05rem', color: '#FFDBAA', lineHeight: '1.8' }}>
          <strong style={{ color: '#FFD700', fontSize: '1.3rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Arunachalam Agency</strong>
          <div style={{ fontSize: '0.95rem', color: '#E0C097', marginTop: '4px' }}>Wholesale & Retail Sivakasi Fireworks Hub</div>
          <div style={{ marginTop: '10px' }}>
            <span style={{ color: '#FFD700' }}>📍</span> 17, Thattu Mettu Street, Sattur Road, Sivakasi, Virudhunagar, Tamil Nadu - 626123
          </div>
          <div style={{ marginTop: '6px' }}>
            <span style={{ color: '#FFD700' }}>📞</span> <a href="tel:+919047488862" style={{ color: '#FFDBAA', textDecoration: 'none' }}>+91 90474 88862</a>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <span style={{ color: '#FFD700' }}>✉️</span> <a href="mailto:admin@arunag.com" style={{ color: '#FFDBAA', textDecoration: 'none' }}>admin@arunag.com</a>
          </div>
        </div>

        {/* Legal & Policy Links */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          gap: '25px', 
          padding: '18px 0', 
          borderTop: '1px solid rgba(212, 175, 55, 0.2)', 
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          marginBottom: '25px'
        }}>
          <Link href="/shop" style={linkStyle}>Browse Fireworks</Link>
          <Link href="/legal/terms" style={linkStyle}>Terms & Conditions</Link>
          <Link href="/legal/privacy" style={linkStyle}>Privacy Policy</Link>
          <Link href="/legal/shipping" style={linkStyle}>Shipping & Delivery</Link>
          <Link href="/legal/safety" style={linkStyle}>Safety Guidelines</Link>
        </div>

        {/* Copyright & Meta Disclaimer */}
        <p style={{ color: '#D4AF37', fontSize: '0.9rem', margin: '0 0 8px 0' }}>
          © {new Date().getFullYear()} Hero Crackers. All rights reserved.
        </p>
        <p style={{ fontSize: '0.85rem', color: '#D2B48C', margin: 0 }}>
          Hero Crackers is a proprietary brand of <strong style={{ color: '#FFA07A' }}>Arunachalam Agency</strong> | Verified Sivakasi Fireworks Enterprise
        </p>

      </div>
    </footer>
  );
}
