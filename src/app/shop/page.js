import prisma from '@/lib/prisma';
import ShopInterface from '@/components/ShopInterface';

export const metadata = {
  title: 'Shop Crackers | Hero Crackers',
  description: 'Browse our full catalog of premium Sivakasi fireworks.',
}

export default async function ShopPage() {
  // Fetch all categories with their nested products
  const categories = await prisma.category.findMany({
    include: {
      products: true
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
        <p style={{ fontSize: '1.2rem', color: '#ccc' }}>
          Explore our wide range of premium fireworks for every celebration.
        </p>
      </section>

      {/* Main Interactive Interface (Grid / Quick Buy Toggle) */}
      <ShopInterface categories={categories} />

    </div>
  )
}
