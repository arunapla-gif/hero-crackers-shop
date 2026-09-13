'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide public footer on all admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer style={{ backgroundColor: '#3E0000', borderTop: '6px solid #D4AF37', color: '#FFF8E7', padding: '60px 5% 40px', textAlign: 'center', marginTop: 'auto' }}>
      <div style={{ marginBottom: '25px', fontSize: '1.05rem', color: '#FFDBAA', lineHeight: '1.8' }}>
        <strong style={{ color: '#FFD700', fontSize: '1.2rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Arunachalam Agency</strong><br/>
        <span style={{ fontSize: '1.2rem', color: '#FFD700' }}>📍</span> 17, Thattu Mettu Street, Sattur Road, Sivakasi, Virudhunagar, Tamil Nadu - 626123<br/>
        <span style={{ fontSize: '1.2rem', color: '#FFD700' }}>📞</span> +91 90474 88862 &nbsp;|&nbsp; <span style={{ fontSize: '1.2rem', color: '#FFD700' }}>✉️</span> admin@arunag.com
      </div>
      <p style={{ color: '#D4AF37', fontSize: '0.95rem' }}>© {new Date().getFullYear()} Hero Crackers. All rights reserved.</p>
      <p style={{ fontSize: '0.9rem', color: '#FFDBAA', marginTop: '15px' }}>
        Hero Crackers is a part of <strong style={{ color: '#FF9933' }}>Arunachalam Agency</strong> | Verified Meta Business
      </p>
    </footer>
  );
}
