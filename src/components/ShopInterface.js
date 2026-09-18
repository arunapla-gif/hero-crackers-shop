'use client';

import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import styles from './ShopInterface.module.css';
import { useCart } from '@/context/CartContext';

export default function ShopInterface({ categories }) {
  const [selectedImage, setSelectedImage] = useState(null); // for thumbnail modal
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  const toggleCategory = (categoryId) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  const { cart, updateQuantity, isCartOpen, setIsCartOpen, cartItemsCount, cartTotal } = useCart();

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

        {/* View Toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={() => setViewMode('grid')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid ' + (viewMode === 'grid' ? 'var(--color-primary)' : 'rgba(0,0,0,0.1)'),
              background: viewMode === 'grid' ? 'rgba(229, 57, 53, 0.1)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--color-primary)' : '#666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🔲</span> Grid
          </button>
          <button 
            onClick={() => setViewMode('list')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid ' + (viewMode === 'list' ? 'var(--color-primary)' : 'rgba(0,0,0,0.1)'),
              background: viewMode === 'list' ? 'rgba(229, 57, 53, 0.1)' : 'transparent',
              color: viewMode === 'list' ? 'var(--color-primary)' : '#666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>📄</span> Quick Buy List
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
          <h2 
            className={styles.categoryTitle} 
            onClick={() => toggleCategory(category.id)}
            style={{ 
              color: 'var(--color-primary)', 
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              userSelect: 'none'
            }}
          >
            {category.name}
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#888', transition: 'transform 0.3s' }}>
              {collapsedCategories[category.id] ? '+' : '-'}
            </span>
          </h2>
          
          {!collapsedCategories[category.id] && (
            category.products.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic' }}>More products coming soon.</p>
            ) : (
              viewMode === 'list' ? (
                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(20,20,25,0.8)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <tr>
                        <th style={{ padding: '12px 15px', fontWeight: 'normal', color: '#888' }}>Product</th>
                        <th style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'normal', color: '#888', width: '80px' }}>MRP</th>
                        <th style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'normal', color: '#888', width: '100px' }}>Price</th>
                        <th style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'normal', color: '#888', width: '130px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.products.map((product, index) => (
                        <ProductCard 
                          key={product.id} 
                          product={product} 
                          index={index}
                          viewMode={viewMode}
                          cartQuantity={cart[product.id]?.quantity || 0}
                          onAddToCart={() => {
                            updateQuantity(product, 1);
                            setIsCartOpen(true);
                          }}
                          onUpdateQuantity={(delta) => updateQuantity(product, delta)}
                          onProductClick={() => setSelectedImage(product)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {category.products.map((product, index) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      index={index}
                      viewMode={viewMode}
                      cartQuantity={cart[product.id]?.quantity || 0}
                      onAddToCart={() => {
                        updateQuantity(product, 1);
                        setIsCartOpen(true);
                      }}
                      onUpdateQuantity={(delta) => updateQuantity(product, delta)}
                      onProductClick={() => setSelectedImage(product)}
                    />
                  ))}
                </div>
              )
            )
          )}
        </div>
      ))}

      {/* Sticky Cart Summary */}
      {cartItemsCount > 0 && !isCartOpen && (
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

      {/* Image Modal / Enhanced PDP */}
      {selectedImage && (
        <div 
          className={styles.modalOverlay} 
          style={{ 
            background: 'rgba(0,0,0,0.8)', 
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 3000,
            padding: '20px'
          }} 
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className={`enhanced-modal-content ${styles.modalContent}`} 
            style={{ 
              background: '#1A1A1A', 
              border: '1px solid rgba(255,193,7,0.3)', 
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)', 
              borderRadius: '24px',
              maxWidth: '900px',
              width: '100%',
              display: 'flex',
              overflow: 'hidden',
              position: 'relative',
              animation: 'fadeInUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              maxHeight: '90vh'
            }} 
            onClick={e => e.stopPropagation()}
          >
            <button 
              className={styles.closeModalBtn} 
              style={{ 
                position: 'absolute', top: '15px', right: '15px', 
                background: 'rgba(255,255,255,0.1)', color: '#fff', 
                border: 'none', borderRadius: '50%', width: '40px', height: '40px', 
                fontSize: '1.5rem', cursor: 'pointer', zIndex: 10
              }} 
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            
            {/* Left Side: Media */}
            <div className="modal-media" style={{ flex: '1 1 50%', backgroundColor: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {/* Placeholder for real video/image */}
               <div style={{ textAlign: 'center', color: '#fff' }}>
                 <span className="modal-emoji" style={{ filter: 'drop-shadow(0 0 30px rgba(255,193,7,0.4))' }}>{selectedImage.price > 300 ? '🌋' : '✨'}</span>
                 <p className="modal-placeholder-text" style={{ marginTop: '20px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Media Placeholder</p>
               </div>
            </div>

            {/* Right Side: Details */}
            <div className="modal-details" style={{ flex: '1 1 50%', color: '#fff', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8rem', color: '#FFC107', textTransform: 'uppercase', letterSpacing: '1px' }}>Hero Crackers</span>
                <h3 className="modal-title" style={{ color: '#FFF', margin: '5px 0', lineHeight: 1.1 }}>{selectedImage.name}</h3>
                <p className="modal-price" style={{ fontWeight: 'bold', color: '#FFC107', margin: '10px 0' }}>₹{selectedImage.price} <span style={{fontSize:'1rem', color:'#888', fontWeight:'normal'}}>Inc. GST</span></p>
              </div>

              {/* Safety Warning */}
              <div style={{ marginBottom: '25px', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '15px 0' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#888', marginBottom: '10px', textTransform: 'uppercase' }}>Safety Warning</h4>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: '#ccc', flex: 1, minWidth: '70px' }}>
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <span style={{ fontSize: '0.75rem', textAlign: 'center' }}>Caution</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: '#ccc', flex: 1, minWidth: '70px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📏</span>
                    <span style={{ fontSize: '0.75rem', textAlign: 'center' }}>Keep 5M Away</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: '#ccc', flex: 1, minWidth: '70px' }}>
                    <span style={{ fontSize: '1.5rem' }}>👨‍👦</span>
                    <span style={{ fontSize: '0.75rem', textAlign: 'center' }}>Adult Supervision</span>
                  </div>
                </div>
              </div>

              {/* Effects */}
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#888', marginBottom: '10px', textTransform: 'uppercase' }}>Effects</h4>
                <ul style={{ color: '#ccc', margin: 0, paddingLeft: '20px', lineHeight: 1.6, fontSize: '0.9rem' }}>
                  <li>{selectedImage.description || 'Vibrant display with spectacular colors.'}</li>
                  <li>Produces bright sparks and a thunderous finale.</li>
                  <li>Approx. Duration: 15-20 Seconds</li>
                </ul>
              </div>

              {/* Add to Cart */}
              <div style={{ marginTop: 'auto' }}>
                <button 
                  onClick={() => {
                    updateQuantity(selectedImage, 1);
                    setSelectedImage(null);
                    setIsCartOpen(true);
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #FFC107, #FF9800)',
                    color: '#000',
                    border: 'none',
                    padding: '16px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 5px 20px rgba(255, 193, 7, 0.4)',
                    transition: 'transform 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                  onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.target.style.transform = 'translateY(0)'}
                >
                  <span>🛒</span> ADD TO CART
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        /* Desktop Default */
        .enhanced-modal-content {
          flex-direction: row;
        }
        .modal-media {
          min-height: 400px;
        }
        .modal-details {
          padding: 40px 30px;
        }
        .modal-emoji {
          font-size: 8rem;
        }
        .modal-title {
          font-size: 2.5rem;
        }
        .modal-price {
          font-size: 2rem;
        }

        /* Tablet (max-width: 900px) */
        @media (max-width: 900px) {
          .enhanced-modal-content {
            flex-direction: column;
            overflow-y: auto;
          }
          .modal-media {
            min-height: 300px;
            flex: 0 0 auto !important;
          }
          .modal-details {
            padding: 30px 25px;
            flex: 1 1 auto !important;
          }
          .modal-emoji {
            font-size: 6rem;
          }
          .modal-title {
            font-size: 2rem;
          }
          .modal-price {
            font-size: 1.8rem;
          }
        }

        /* Mobile (max-width: 600px) */
        @media (max-width: 600px) {
          .modal-media {
            min-height: 220px;
          }
          .modal-details {
            padding: 20px 15px;
          }
          .modal-emoji {
            font-size: 5rem;
          }
          .modal-title {
            font-size: 1.6rem;
          }
          .modal-price {
            font-size: 1.5rem;
          }
          .modal-placeholder-text {
            font-size: 0.8rem;
            margin-top: 10px !important;
          }
        }
      `}</style>

    </div>
  );
}
