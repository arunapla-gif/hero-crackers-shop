'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import styles from './ShopInterface.module.css';

export default function ShopInterface({ categories }) {
  const [viewMode, setViewMode] = useState('quick'); // default to quick buy on mobile
  const [cart, setCart] = useState({}); // { [productId]: quantity }
  const [selectedImage, setSelectedImage] = useState(null); // for thumbnail modal
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('hero_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('hero_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // Create a fast lookup for product prices to calculate totals
  const productsLookup = {};
  categories.forEach(cat => {
    cat.products.forEach(prod => {
      productsLookup[prod.id] = prod;
    });
  });

  const handleUpdateQuantity = (productId, delta) => {
    setCart(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      
      const newCart = { ...prev };
      if (newQty === 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = newQty;
      }
      return newCart;
    });
  };

  const handleAddToCartFromGrid = (productId) => {
    handleUpdateQuantity(productId, 1);
  };

  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
    return total + (productsLookup[id]?.price || 0) * qty;
  }, 0);

  return (
    <div className={styles.container}>
      
      {/* Toggle Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#333', display: 'none' /* hidden on mobile for space */ }}>
          Browse Catalog
        </h2>
        
        <div style={{ display: 'flex', gap: '10px', background: '#fff', padding: '5px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', width: '100%', justifyContent: 'center' }}>
          <button 
            onClick={() => setViewMode('quick')}
            style={{ 
              flex: 1,
              padding: '10px 20px', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              background: viewMode === 'quick' ? '#d32f2f' : 'transparent',
              color: viewMode === 'quick' ? '#fff' : '#666',
              transition: 'all 0.2s'
            }}
          >
            Quick Buy
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            style={{ 
              flex: 1,
              padding: '10px 20px', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              background: viewMode === 'grid' ? '#d32f2f' : 'transparent',
              color: viewMode === 'grid' ? '#fff' : '#666',
              transition: 'all 0.2s'
            }}
          >
            Grid View
          </button>
        </div>
      </div>

      {/* Product Display */}
      {categories.map((category) => (
        <div key={category.id} style={{ marginBottom: '40px' }}>
          <h2 className={styles.categoryTitle}>
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
                      >
                        {isPremium ? '🌋' : '✨'}
                      </div>
                      <div className={styles.productName}>
                        {product.name}
                      </div>
                    </div>
                    <div className={styles.productAction}>
                      <div className={styles.priceBlock}>
                        <span className={styles.mrp}><s>₹{Math.round(product.price * 1.5)}</s></span>
                        <span className={styles.price}>₹{product.price}</span>
                      </div>
                      <div className={styles.qtyControl}>
                        <button className={styles.qtyBtn} onClick={() => handleUpdateQuantity(product.id, -1)}>-</button>
                        <span className={styles.qtyValue}>{cart[product.id] || 0}</span>
                        <button className={`${styles.qtyBtn} ${styles.qtyBtnPlus}`} onClick={() => handleUpdateQuantity(product.id, 1)}>+</button>
                      </div>
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
        <div className={styles.stickyFooter}>
          <div className={styles.footerTotals}>
            <span className={styles.footerTotalLabel}>Total Estimate</span>
            <span className={styles.footerTotalValue}>₹{cartTotal.toLocaleString()}</span>
            <span className={styles.footerItems}>{cartItemsCount} items selected</span>
          </div>
          <a href="/cart" style={{ textDecoration: 'none' }}>
            <button className={styles.footerBtn}>
              Submit
            </button>
          </a>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className={styles.modalOverlay} onClick={() => setSelectedImage(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setSelectedImage(null)}>×</button>
            <div style={{ height: '200px', backgroundColor: '#fff5e6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '6rem' }}>{selectedImage.price > 300 ? '🌋' : '✨'}</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', color: '#d32f2f', marginBottom: '10px' }}>{selectedImage.name}</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>{selectedImage.description}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#d32f2f' }}>₹{selectedImage.price}</p>
          </div>
        </div>
      )}

    </div>
  );
}
