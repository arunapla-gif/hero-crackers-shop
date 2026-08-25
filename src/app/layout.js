import './globals.css'
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import SlidingCart from '@/components/SlidingCart';

export const metadata = {
  title: 'Hero Crackers | Premium Sivakasi Fireworks',
  description: 'Celebrate Deepavali with premium, safe, and vibrant fireworks from Sivakasi.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-dark)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <CartProvider>
          <Navbar />
          <SlidingCart />
          <main style={{ flex: 1, marginTop: '80px' }}>
            {children}
          </main>
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
        </CartProvider>
      </body>
    </html>
  )
}
