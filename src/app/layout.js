import './globals.css'

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
      <body>
        <header style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)', padding: '20px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', margin: 0, color: 'var(--color-accent-gold)' }}>Hero Crackers</h2>
          <nav>
            <a href="/" style={{ marginRight: '20px', fontWeight: 'bold' }}>Home</a>
            <a href="/shop" style={{ marginRight: '20px', fontWeight: 'bold' }}>Shop Crackers</a>
            <a href="/cart" style={{ fontWeight: 'bold' }}>Cart (0)</a>
          </nav>
        </header>
        <main>
          {children}
        </main>
        <footer style={{ backgroundColor: '#1A1A1A', color: 'var(--color-text-light)', padding: '40px 50px', textAlign: 'center', marginTop: '50px' }}>
          <p>© 2024 Hero Crackers Fireworks. All rights reserved.</p>
        </footer>
      </body>
    </html>
  )
}
