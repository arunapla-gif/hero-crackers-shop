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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '30px' }}>
        
        <input 
          type="text"
          placeholder="Search for fireworks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '15px 25px',
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            fontSize: '1.2rem',
            outline: 'none',
            backdropFilter: 'blur(10px)',
            transition: 'border-color 0.3s'
          }}
          onFocus={e => e.target.style.borderColor = '#ff1361'}
          onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
        />

        <div style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.5)', padding: '5px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '400px', margin: '0 auto', justifyContent: 'center' }}>
          <button 
            onClick={() => setViewMode('quick')}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              border: 'none', 
              borderRadius: '25px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              background: viewMode === 'quick' ? 'linear-gradient(135deg, #FF1361, #FF5722)' : 'transparent',
              color: viewMode === 'quick' ? '#fff' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s',
              boxShadow: viewMode === 'quick' ? '0 5px 15px rgba(255, 19, 97, 0.3)' : 'none'
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
              background: viewMode === 'grid' ? 'linear-gradient(135deg, #FF1361, #FF5722)' : 'transparent',
              color: viewMode === 'grid' ? '#fff' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s',
              boxShadow: viewMode === 'grid' ? '0 5px 15px rgba(255, 19, 97, 0.3)' : 'none'
            }}
          >
            Grid View
          </button>
        </div>
      </div>

      {/* Product Display */}
      {filteredCategories.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', padding: '50px 0' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No fireworks found matching "{searchQuery}"</p>
          <p>Try searching for something else!</p>
        </div>
      ) : filteredCategories.map((category) => (
        <div key={category.id} style={{ marginBottom: '60px' }}>
          <h2 className={styles.categoryTitle} style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
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
                        <span className={styles.price} style={{ color: isPremium ? '#ffc107' : '#ff1361' }}>₹{product.price}</span>
                      </div>
                      
                      {cart[product.id] ? (
                        <div className={styles.qtyControl} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '20px' }}>
                          <button onClick={() => updateQuantity(product, -1)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>-</button>
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>{cart[product.id].quantity}</span>
                          <button onClick={() => updateQuantity(product, 1)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>+</button>
                        </div>
                      ) : (
                        <button 
                          className={styles.addToCartBtn} 
                          onClick={() => {
                            updateQuantity(product, 1);
                            setIsCartOpen(true);
                          }}
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fff',
                            padding: '8px 20px',
                            borderRadius: '30px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            backdropFilter: 'blur(5px)'
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
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 19, 97, 0.3)',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.5)'
        }}>
          <div className={styles.footerTotals}>
            <span className={styles.footerTotalLabel} style={{ color: 'rgba(255,255,255,0.7)' }}>Total Estimate</span>
            <span className={styles.footerTotalValue} style={{ color: '#ffc107' }}>₹{cartTotal.toLocaleString()}</span>
            <span className={styles.footerItems} style={{ color: '#fff' }}>{cartItemsCount} items selected</span>
          </div>
          <button 
            className={styles.footerBtn}
            onClick={() => setIsCartOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #FF1361, #FF5722)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 0 15px rgba(255, 19, 97, 0.4)'
            }}
          >
            View Cart
          </button>
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
