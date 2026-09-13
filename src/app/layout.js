import './globals.css'
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import SlidingCart from '@/components/SlidingCart';

import Footer from '@/components/Footer';

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
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
