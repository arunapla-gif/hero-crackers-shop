import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import SlidingCart from '@/components/SlidingCart';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.herocrackers.com'),
  title: {
    default: 'Hero Crackers | Premium Sivakasi Fireworks Wholesale & Retail',
    template: '%s | Hero Crackers Sivakasi',
  },
  description: 'Celebrate Deepavali with 100% CSIR-NEERI certified Green Fireworks directly from Sivakasi. Safe, vibrant, and licensed by PESO. Best wholesale & retail prices.',
  keywords: [
    'Sivakasi fireworks',
    'Hero Crackers',
    'Arunachalam Agency',
    'buy crackers online',
    'Diwali crackers Sivakasi',
    'green crackers Sivakasi',
    'wholesale crackers',
    'fireworks estimate portal',
  ],
  authors: [{ name: 'Arunachalam Agency' }],
  creator: 'Hero Crackers',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.herocrackers.com',
    siteName: 'Hero Crackers Sivakasi',
    title: 'Hero Crackers | Premium Sivakasi Fireworks',
    description: 'Celebrate Deepavali with premium, safe, and vibrant fireworks directly from Sivakasi. Instant price estimate and parcel transport across India.',
    images: [
      {
        url: '/diwali-family-hero.png',
        width: 1200,
        height: 630,
        alt: 'Hero Crackers Sivakasi Fireworks Celebrations',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hero Crackers | Premium Sivakasi Fireworks',
    description: '100% Certified Green Crackers from Sivakasi. Safe and vibrant festival celebrations.',
    images: ['/diwali-family-hero.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:ital,wght@0,700;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text-dark)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CartProvider>
          <Navbar />
          <SlidingCart />
          <main style={{ flex: 1, marginTop: '80px' }}>
            {children}
          </main>
          <WhatsAppButton />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
