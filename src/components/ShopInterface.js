'use client';

import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import styles from './ShopInterface.module.css';
import { useCart } from '@/context/CartContext';

export default function ShopInterface({ categories }) {
  const [viewMode, setViewMode] = useState('quick'); // default to quick buy on mobile
  const [selectedImage, setSelectedImage] = useState(null); // for thumbnail modal
  const [searchQuery, setSearchQuery] = useState('');
  
  const { cart, updateQuantity, setIsCartOpen, cartItemsCount, cartTotal } = useCart();

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const lowerQ = searchQuery.toLowerCase();
    return categories.map(cat => ({
      ...cat,
      products: cat.products.filter(p => p.name.toLowerCase().includes(lowerQ))
    })).filter(cat => cat.products.length > 0);
  }, [categories, searchQuery]);

  const handleAddToCartFromGrid = (product) => {
    updateQuantity(product, 1);
    setIsCartOpen(true);
  };

  return (
    <div className={styles.container}>
      
      {/* Search and Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '30px' }}>
        
        <input 
          type="text"
          placeholder="Search for fireworks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '15px 25px',
            borderRadius: '30px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            background: 'rgba(255, 255, 255, 0.9)',
            color: 'var(--color-text-dark)',
            fontSize: '1.2rem',
            outline: 'none',
            backdropFilter: 'blur(10px)',
            transition: 'border-color 0.3s, box-shadow 0.3s'
          }}
          onFocus={e => {
            e.target.style.borderColor = 'var(--color-primary)';
            e.target.style.boxShadow = '0 0 10px rgba(229, 57, 53, 0.2)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
            e.target.style.boxShadow = 'none';
          }}
        />

        <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.5)', padding: '5px', borderRadius: '30px', border: '1px solid rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', margin: '0 auto', justifyContent: 'center' }}>
          <button 
            onClick={() => setViewMode('quick')}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              border: 'none', 
              borderRadius: '25px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              background: viewMode === 'quick' ? 'var(--color-primary)' : 'transparent',
              color: viewMode === 'quick' ? '#fff' : 'var(--color-text-dark)',
              transition: 'all 0.2s',
              boxShadow: viewMode === 'quick' ? '0 5px 15px rgba(229, 57, 53, 0.3)' : 'none'
            }}
          >
            Quick Buy
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              border: 'none', 
              borderRadius: '25px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              background: viewMode === 'grid' ? 'var(--color-primary)' : 'transparent',
              color: viewMode === 'grid' ? '#fff' : 'var(--color-text-dark)',
              transition: 'all 0.2s',
              boxShadow: viewMode === 'grid' ? '0 5px 15px rgba(229, 57, 53, 0.3)' : 'none'
            }}
          >
            Grid View
          </button>
        </div>
      </div>

      {/* Product Display */}
      {filteredCategories.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', padding: '50px 0' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No fireworks found matching "{searchQuery}"</p>
          <p>Try searching for something else!</p>
        </div>
      ) : filteredCategories.map((category) => (
        <div key={category.id} style={{ marginBottom: '60px' }}>
          <h2 className={styles.categoryTitle} style={{ color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            {category.name}
          </h2>
          
          {category.products.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>More products coming soon.</p>
          ) : viewMode === 'grid' ? (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {category.products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCartFromGrid} 
                />
              ))}
            </div>
          ) : (
            <div className={styles.quickBuyContainer}>
              {category.products.map((product) => {
                const isPremium = product.price > 300;
                return (
                  <div key={product.id} className={styles.productRow}>
                    <div className={styles.productInfo}>
                      <div 
                        className={styles.thumbnailWrapper} 
                        onClick={() => setSelectedImage(product)}
                        style={{ background: isPremium ? 'rgba(255, 193, 7, 0.1)' : 'rgba(229, 57, 53, 0.05)' }}
                      >
                        {isPremium ? '🌋' : '✨'}
                      </div>
                      <div className={styles.productName} style={{ color: 'var(--color-text-dark)' }}>
                        {product.name}
                      </div>
                    </div>
                    <div className={styles.productAction}>
                      <div className={styles.priceBlock}>
                        <span className={styles.price} style={{ color: isPremium ? '#F57F17' : 'var(--color-primary)' }}>₹{product.price}</span>
                      </div>
                      
                      {cart[product.id] ? (
                        <div className={styles.qtyControl} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.05)', padding: '5px 10px', borderRadius: '20px' }}>
                          <button onClick={() => updateQuantity(product, -1)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-dark)', fontSize: '1.2rem', cursor: 'pointer' }}>-</button>
                          <span style={{ color: 'var(--color-text-dark)', fontWeight: 'bold' }}>{cart[product.id].quantity}</span>
                          <button onClick={() => updateQuantity(product, 1)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-dark)', fontSize: '1.2rem', cursor: 'pointer' }}>+</button>
                        </div>
                      ) : (
                        <button 
                          className={styles.addToCartBtn} 
                          onClick={() => {
                            updateQuantity(product, 1);
                            setIsCartOpen(true);
                          }}
                          style={{
                            background: isPremium ? 'var(--color-accent-gold)' : 'var(--color-primary)',
                            border: 'none',
                            color: isPremium ? '#000' : '#fff',
                            padding: '8px 20px',
                            borderRadius: '30px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: `0 4px 10px ${isPremium ? 'rgba(255, 193, 7, 0.3)' : 'rgba(229, 57, 53, 0.3)'}`
                          }}
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Sticky Cart Summary */}
      {cartItemsCount > 0 && (
        <div className={styles.stickyFooter} style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.05)'
        }}>
          <div className={styles.footerTotals}>
            <span className={styles.footerTotalLabel} style={{ color: '#666' }}>Total Estimate</span>
            <span className={styles.footerTotalValue} style={{ color: 'var(--color-primary)' }}>₹{cartTotal.toLocaleString()}</span>
            <span className={styles.footerItems} style={{ color: '#888' }}>{cartItemsCount} items selected</span>
          </div>
          <button 
            className={styles.footerBtn}
            onClick={() => setIsCartOpen(true)}
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-orange))',
              color: '#fff',
              border: 'none',
              boxShadow: '0 5px 15px rgba(229, 57, 53, 0.3)'
            }}
          >
            View Cart
          </button>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className={styles.modalOverlay} style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(5px)' }} onClick={() => setSelectedImage(null)}>
          <div className={styles.modalContent} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModalBtn} style={{ color: '#333', background: '#f5f5f5' }} onClick={() => setSelectedImage(null)}>×</button>
            <div style={{ height: '200px', backgroundColor: '#fff5e6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '6rem' }}>{selectedImage.price > 300 ? '🌋' : '✨'}</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '10px' }}>{selectedImage.name}</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>{selectedImage.description}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{selectedImage.price}</p>
          </div>
        </div>
      )}

    </div>
  );
}
