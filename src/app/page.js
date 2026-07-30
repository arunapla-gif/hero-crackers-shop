import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import ScrollReveal from '@/components/ScrollReveal';
import AnimatedFestivalHero from '@/components/AnimatedFestivalHero';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  // Fetch a few featured products for the homepage
  const featuredProducts = await prisma.product.findMany({
    take: 3,
    orderBy: { price: 'desc' } // Just grabbing some high-end ones as featured
  });

  return (
    <>
    <div style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-dark)' }}>
      
      <AnimatedFestivalHero />

      {/* Featured Products Section */}
      <section style={{ padding: '100px 20px', textAlign: 'center', backgroundColor: 'var(--color-background)' }}>
        <ScrollReveal>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '3.5rem', marginBottom: '15px', color: 'var(--color-primary)', letterSpacing: '-1px' }}>
            Festive Favorites
          </h2>
          <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>
            A curated selection of our most spectacular and highest-rated firecrackers to light up your celebrations.
          </p>
        </ScrollReveal>
        
        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {featuredProducts.map((product, index) => (
            <ScrollReveal key={product.id} delay={index * 150}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
    </>
  )
}
