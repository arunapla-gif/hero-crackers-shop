'use client';

import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import styles from './ShopInterface.module.css';
import { useCart } from '@/context/CartContext';

export default function ShopInterface({ categories }) {
  const [selectedImage, setSelectedImage] = useState(null); // for thumbnail modal
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState({});
  
  const toggleCategory = (categoryId) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
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
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {category.products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    cartQuantity={cart[product.id]?.quantity || 0}
                    onAddToCart={() => {
                      updateQuantity(product, 1);
                      setIsCartOpen(true);
                    }}
                    onUpdateQuantity={(delta) => updateQuantity(product, delta)}
                  />
                ))}
              </div>
            )
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
