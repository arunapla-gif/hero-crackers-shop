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
      <body style={{ backgroundColor: '#050505', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <CartProvider>
          <Navbar />
          <SlidingCart />
          <main style={{ flex: 1, marginTop: '80px' }}>
            {children}
          </main>
          <footer style={{ backgroundColor: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', padding: '40px 50px', textAlign: 'center', marginTop: 'auto' }}>
            <p>© 2024 Hero Crackers Fireworks. All rights reserved.</p>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', marginTop: '10px' }}>
              Hero Crackers is a retail brand owned and operated by <strong>Arunachalam Agency</strong>.
            </p>
          </footer>
        </CartProvider>
      </body>
    </html>
  )
}
