import Link from 'next/link';

export const metadata = {
  title: '404 - Page Not Found | Hero Crackers Sivakasi',
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
        background: 'radial-gradient(circle at center, #3A0007 0%, #1A0003 100%)',
        color: '#FFF8E7',
      }}
    >
      <div style={{ fontSize: '5rem', marginBottom: '10px' }}>🎆</div>
      <h1
        style={{
          fontSize: '3.5rem',
          margin: '0 0 15px 0',
          fontFamily: 'var(--font-serif, serif)',
          color: '#D4AF37',
          textShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
        }}
      >
        404 - Spark Lost
      </h1>
      <p
        style={{
          fontSize: '1.2rem',
          maxWidth: '550px',
          color: '#FFE4B5',
          lineHeight: '1.7',
          marginBottom: '35px',
        }}
      >
        The page or firework you are looking for has either finished bursting or been relocated. Let’s guide you back to our full catalog!
      </p>

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/shop"
          style={{
            padding: '14px 28px',
            backgroundColor: '#D4AF37',
            color: '#1A0003',
            borderRadius: '30px',
            fontWeight: 'bold',
            fontSize: '1rem',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
            transition: 'transform 0.2s ease',
          }}
        >
          Explore Fireworks Shop
        </Link>
        <Link
          href="/"
          style={{
            padding: '14px 28px',
            backgroundColor: 'transparent',
            color: '#FFE4B5',
            border: '2px solid rgba(212, 175, 55, 0.6)',
            borderRadius: '30px',
            fontWeight: 'bold',
            fontSize: '1rem',
            textDecoration: 'none',
          }}
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
