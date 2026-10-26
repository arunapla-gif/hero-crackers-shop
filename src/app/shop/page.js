import prisma from '@/lib/prisma';
import ShopInterface from '@/components/ShopInterface';

export const metadata = {
  title: 'Shop Crackers | Hero Crackers',
  description: 'Browse our full catalog of premium Sivakasi fireworks.',
}

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ShopPage() {
  // Fetch all categories with their nested products
  const categories = await prisma.category.findMany({
    where: {
      slug: { not: 'custom-items' }
    },
    orderBy: { sequence: 'asc' },
    include: {
      products: {
        orderBy: [
          { sequence: 'asc' },
          { name: 'asc' }
        ]
      }
    }
  });

  return (
    <div style={{ backgroundColor: '#fffdf5', color: '#333', minHeight: '100vh' }}>
      
      {/* Page Header */}
      <section style={{ 
        background: '#1A1A1A', 
        padding: '60px 20px',
        textAlign: 'center',
        color: '#fff',
        borderBottom: '4px solid #ff5722'
      }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3.5rem', marginBottom: '10px', color: '#ffd700' }}>
          Our Products
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '14px' }}>
          Explore our wide range of premium fireworks for every celebration.
        </p>
        <div style={{ display: 'inline-block', backgroundColor: 'rgba(255, 87, 34, 0.15)', border: '1px solid #ff5722', padding: '6px 18px', borderRadius: '25px', color: '#ffb74d', fontSize: '0.95rem', fontWeight: 'bold' }}>
          📦 Direct Sivakasi Godown Dispatch • Minimum Order ₹5,000
        </div>
      </section>

      {/* Main Interactive Interface (Grid / Quick Buy Toggle) */}
      <ShopInterface categories={categories} />

    </div>
  )
}
