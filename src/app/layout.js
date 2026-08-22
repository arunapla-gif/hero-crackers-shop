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
          <footer style={{ backgroundColor: '#fff', borderTop: '2px solid rgba(229, 57, 53, 0.1)', color: '#333', padding: '40px 50px', textAlign: 'center', marginTop: 'auto' }}>
            <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#555', lineHeight: '1.6' }}>
              <strong>Arunachalam Agency</strong><br/>
              📍 17, Thattu Mettu Street, Sattur Road, Sivakasi, Virudhunagar, Tamil Nadu - 626123<br/>
              📞 +91 90474 88862 | ✉️ admin@arunag.com / admin@herocrackers.com
            </div>
            <p>© {new Date().getFullYear()} Hero Crackers Fireworks. All rights reserved.</p>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '10px' }}>
              Hero Crackers is a part of <strong>Arunachalam Agency</strong> which is the verified Meta Business Portfolio.
            </p>
          </footer>
        </CartProvider>
      </body>
    </html>
  )
}
