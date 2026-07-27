import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTheme, getStyles } from './theme';

export default function MasterDataPanel({ isDarkMode, products, setProducts, categories, setCategories, godowns, setGodowns }) {
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme, isDarkMode);

  const [activeMasterTab, setActiveMasterTab] = useState('product');
  
  // Forms state
  const [categoryName, setCategoryName] = useState('');
  const [godownName, setGodownName] = useState('');
  const [godownLocation, setGodownLocation] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', basePrice: '', price: '', discount: '', stockShop: '', categoryId: categories.length > 0 ? categories[0].id : '', imageUrl: '', sequence: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [isDragLocked, setIsDragLocked] = useState(true);
  
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (editingCategoryId) {
      const res = await fetch(`/api/categories/${editingCategoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName })
      });
      if (res.ok) {
        alert('Category updated!');
        const updated = await res.json();
        setCategories(categories.map(c => c.id === editingCategoryId ? updated : c));
        setCategoryName('');
        setEditingCategoryId(null);
      }
    } else {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName })
      });
      if (res.ok) {
        alert('Category added!');
        const added = await res.json();
        setCategories([...categories, added]);
        setCategoryName('');
      }
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleAddGodown = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/godowns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: godownName, location: godownLocation })
    });
    if (res.ok) {
      const added = await res.json();
      setGodowns([...godowns, { ...added, stocks: [] }]);
      setGodownName(''); setGodownLocation('');
    }
  };

  const handleUpdateGodownStock = async (godownId, productId, quantity) => {
    await fetch('/api/godowns/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ godownId, productId, quantity })
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    let finalImageUrl = newProduct.imageUrl;

    if (imageFile) {
      if (!supabase) {
        alert('Supabase is not configured. Please add the environment variables.');
        setIsUploading(false);
        return;
      }
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error } = await supabase.storage.from('product-images').upload(fileName, imageFile);
      
      if (error) {
        alert('Error uploading image: ' + error.message);
        setIsUploading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      finalImageUrl = publicUrlData.publicUrl;
    }

    const method = editingProductId ? 'PATCH' : 'POST';
    const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProduct, imageUrls: finalImageUrl ? [finalImageUrl] : [] })
    });
    
    if (res.ok) {
      const savedProduct = await res.json();
      if (editingProductId) {
        setProducts(prev => prev.map(p => p.id === editingProductId ? savedProduct : p).sort((a, b) => a.sequence - b.sequence || a.name.localeCompare(b.name)));
        setEditingProductId(null);
      } else {
        setProducts([...products, savedProduct].sort((a, b) => a.sequence - b.sequence || a.name.localeCompare(b.name)));
      }
      setNewProduct({ name: '', description: '', basePrice: '', price: '', discount: '', stockShop: '', categoryId: categories.length > 0 ? categories[0].id : '', imageUrl: '', sequence: '' });
      setImageFile(null);
    }
    setIsUploading(false);
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      description: product.description || '',
      basePrice: product.basePrice,
      price: product.price,
      discount: product.discount || '',
      stockShop: product.stockShop || '',
      categoryId: product.categoryId,
      imageUrl: product.imageUrls?.[0] || '',
      sequence: product.sequence || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={styles.cardStyle}>
      {/* Sub-navigation */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {['product', 'category', 'godown'].map(tab => (
          <button 
            key={tab}
            className="tab-btn"
            onClick={() => setActiveMasterTab(tab)} 
            style={{ 
              padding: '10px 24px', 
              borderRadius: '30px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              transition: 'all 0.2s',
              backgroundColor: activeMasterTab === tab ? theme.accent : 'transparent', 
              color: activeMasterTab === tab ? '#fff' : theme.textSecondary,
              border: `1px solid ${activeMasterTab === tab ? theme.accent : theme.border}`,
              boxShadow: activeMasterTab === tab ? `0 4px 12px ${theme.accent}40` : 'none'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Master
          </button>
        ))}
      </div>

      {/* Product Master */}
      {activeMasterTab === 'product' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
          {/* Form */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', margin: 0 }}>
                {editingProductId ? 'Edit Product' : 'Create Product'}
              </h3>
              {editingProductId && (
                <button onClick={() => {
                  setEditingProductId(null);
                  setNewProduct({ name: '', description: '', basePrice: '', price: '', discount: '', stockShop: '', categoryId: categories.length > 0 ? categories[0].id : '', imageUrl: '', sequence: '' });
                }} style={{ background: 'transparent', border: 'none', color: theme.danger, cursor: 'pointer', fontWeight: 'bold' }}>✕ Cancel Edit</button>
              )}
            </div>
            <form onSubmit={handleAddProduct}>
              <label style={styles.labelStyle}>Product Name</label>
              <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required style={styles.inputStyle} />
              
              <label style={styles.labelStyle}>Category</label>
              <select value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})} required style={styles.inputStyle}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.labelStyle}>MRP (Base)</label>
                  <input type="number" step="0.01" value={newProduct.basePrice} onChange={e => setNewProduct({...newProduct, basePrice: e.target.value})} required style={styles.inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.labelStyle}>Selling Price</label>
                  <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required style={styles.inputStyle} />
                </div>
              </div>

              <label style={styles.labelStyle}>Product Image</label>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ ...styles.inputStyle, padding: '10px' }} />

              <label style={styles.labelStyle}>Display Order (Sequence)</label>
              <input type="number" value={newProduct.sequence} onChange={e => setNewProduct({...newProduct, sequence: e.target.value})} style={styles.inputStyle} placeholder="0" />

              <button type="submit" disabled={isUploading} className="action-btn" style={{ ...styles.btnPrimary, width: '100%', marginTop: '10px', opacity: isUploading ? 0.7 : 1, backgroundColor: editingProductId ? theme.accent : theme.info }}>
                {isUploading ? 'Saving...' : editingProductId ? 'Update Product' : 'Save Product'}
              </button>
            </form>
          </div>

          {/* Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', margin: 0 }}>Product Directory</h3>
              <button 
                type="button"
                onClick={() => setIsDragLocked(!isDragLocked)} 
                style={{ ...styles.btnPrimary, padding: '8px 16px', fontSize: '0.9rem', backgroundColor: isDragLocked ? theme.textSecondary : theme.accent, boxShadow: 'none' }}>
                {isDragLocked ? '🔒 Unlock Reordering' : '🔓 Lock Reordering'}
              </button>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: '550px', border: `1px solid ${theme.border}`, borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: theme.bg, zIndex: 1, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <tr>
                    <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Order</th>
                    <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Item</th>
                    <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Price</th>
                    <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}`, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr 
                      key={product.id} 
                      draggable={!isDragLocked}
                      onDragStart={(e) => {
                        if (isDragLocked) {
                          e.preventDefault();
                          return;
                        }
                        setDraggedItemIndex(index);
                        e.dataTransfer.effectAllowed = 'move';
                        e.currentTarget.style.opacity = '0.5';
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.style.opacity = '1';
                        setDraggedItemIndex(null);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async (e) => {
                        e.preventDefault();
                        if (isDragLocked || draggedItemIndex === null || draggedItemIndex === index) return;
                        
                        const newProducts = [...products];
                        const draggedItem = newProducts.splice(draggedItemIndex, 1)[0];
                        newProducts.splice(index, 0, draggedItem);
                        
                        const updatedProducts = newProducts.map((p, i) => ({
                          ...p,
                          sequence: i + 1
                        }));
                        
                        setProducts(updatedProducts);
                        setDraggedItemIndex(null);
                        
                        try {
                          await fetch('/api/products/bulk-sequence', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updatedProducts.map(p => ({ id: p.id, sequence: p.sequence })))
                          });
                        } catch (err) {
                          console.error("Failed to sync sequence", err);
                        }
                      }}
                      style={{ borderBottom: `1px solid ${theme.border}`, transition: 'background 0.2s', cursor: isDragLocked ? 'default' : 'grab' }} 
                      onMouseOver={e => e.currentTarget.style.backgroundColor = theme.bg} 
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: theme.textSecondary, cursor: isDragLocked ? 'default' : 'grab', fontSize: '1.2rem', opacity: isDragLocked ? 0.3 : 1 }}>⠿</span>
                          <span style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '6px', color: theme.textPrimary, fontWeight: 'bold' }}>
                            {product.sequence || index + 1}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '15px', color: theme.textPrimary }}>{product.name}</td>
                      <td style={{ padding: '15px', color: theme.accent, fontWeight: 'bold' }}>₹{product.price}</td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        <button onClick={() => handleEditProduct(product)} style={{ padding: '6px 12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '6px', color: theme.textPrimary, cursor: 'pointer', fontSize: '0.9rem' }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Category Master */}
      {activeMasterTab === 'category' && (
        <div style={{ maxWidth: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', margin: 0 }}>
              {editingCategoryId ? 'Edit Category' : 'Add Category'}
            </h3>
            {editingCategoryId && (
              <button onClick={() => {
                setEditingCategoryId(null);
                setCategoryName('');
              }} style={{ background: 'transparent', border: 'none', color: theme.danger, cursor: 'pointer', fontWeight: 'bold' }}>✕ Cancel Edit</button>
            )}
          </div>
          <form onSubmit={handleAddCategory} style={{ marginBottom: '40px' }}>
            <label style={styles.labelStyle}>Category Name</label>
            <input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} required style={styles.inputStyle} />
            <button type="submit" className="action-btn" style={{...styles.btnPrimary, backgroundColor: editingCategoryId ? theme.accent : theme.info}}>
              {editingCategoryId ? 'Update Category' : 'Save Category'}
            </button>
          </form>
          
          <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '25px' }}>Existing Categories</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {categories.map(c => (
              <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '20px', color: theme.textSecondary, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                {c.name}
                <button onClick={() => handleEditCategory(c)} style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>✎</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Godown Master */}
      {activeMasterTab === 'godown' && (
        <div>
          <div style={{ display: 'flex', gap: '40px', marginBottom: '50px', alignItems: 'start', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 400px' }}>
              <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '25px' }}>Register Godown</h3>
              <form onSubmit={handleAddGodown}>
                <label style={styles.labelStyle}>Godown Name</label>
                <input type="text" value={godownName} onChange={e => setGodownName(e.target.value)} required style={styles.inputStyle} />
                <label style={styles.labelStyle}>Location / Address</label>
                <input type="text" value={godownLocation} onChange={e => setGodownLocation(e.target.value)} style={styles.inputStyle} />
                <button type="submit" className="action-btn" style={styles.btnPrimary}>Register Godown</button>
              </form>
            </div>
            
            <div style={{ flex: '1 1 400px' }}>
              <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '25px' }}>Registered Locations</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                {godowns.map(g => (
                  <div key={g.id} style={{ padding: '20px', backgroundColor: theme.bg, borderRadius: '12px', border: `1px solid ${theme.border}`, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: theme.accent, fontSize: '1.2rem' }}>{g.name}</h4>
                    <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>{g.location || 'No location specified'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding: '30px', backgroundColor: theme.bg, borderRadius: '12px', border: `1px solid ${theme.border}`, boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
            <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', margin: '0 0 10px 0' }}>Global Stock Matrix</h3>
            <p style={{ color: theme.textSecondary, marginBottom: '25px' }}>Click any cell to instantly update the inventory level.</p>
            
            {godowns.length === 0 ? <p style={{ color: theme.accent }}>Please register a Godown first.</p> : (
              <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: theme.cardBg }}>
                    <tr>
                      <th style={{ padding: '15px', color: theme.textPrimary, borderBottom: `1px solid ${theme.border}` }}>Product</th>
                      {godowns.map(g => (
                        <th key={g.id} style={{ padding: '15px', color: theme.accent, borderBottom: `1px solid ${theme.border}` }}>{g.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '15px', color: theme.textSecondary }}>{product.name}</td>
                        {godowns.map(godown => {
                          const qty = godown.stocks?.find(s => s.productId === product.id)?.quantity || 0;
                          return (
                            <td key={godown.id} style={{ padding: '15px' }}>
                              <input 
                                type="number" 
                                defaultValue={qty}
                                onBlur={(e) => e.target.value !== String(qty) && handleUpdateGodownStock(godown.id, product.id, e.target.value)}
                                style={{ width: '80px', padding: '8px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '6px', color: theme.textPrimary, outline: 'none' }}
                              />
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
