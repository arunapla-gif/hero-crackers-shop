import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTheme, getStyles } from './theme';

export default function MasterDataPanel({ isDarkMode, products, setProducts, categories, setCategories, godowns, setGodowns, references, setReferences, transports, setTransports }) {
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
  const [referenceName, setReferenceName] = useState('');
  const [referencePhone, setReferencePhone] = useState('');
  const [transportName, setTransportName] = useState('');
  const [transportPhone, setTransportPhone] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [isDragLocked, setIsDragLocked] = useState(true);
  
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingReferenceId, setEditingReferenceId] = useState(null);
  const [editingTransportId, setEditingTransportId] = useState(null);
  
  const [globalDiscount, setGlobalDiscount] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const handleApplyGlobalDiscount = async (e) => {
    e.preventDefault();
    if (!globalDiscount || isNaN(globalDiscount) || globalDiscount < 0 || globalDiscount >= 100) {
      return alert('Please enter a valid discount percentage between 0 and 99.');
    }
    
    if (!confirm(`Are you sure you want to apply a ${globalDiscount}% global discount? This will artificially inflate the MRP (Base Price) for ALL products based on their current Selling Price.`)) return;
    
    setIsApplyingDiscount(true);
    try {
      const res = await fetch('/api/products/bulk-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discount: Number(globalDiscount) })
      });
      
      if (res.ok) {
        alert('Global discount applied successfully!');
        // Refresh products to show updated base prices
        window.location.reload(); 
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to apply global discount');
      }
    } catch (err) {
      alert('An error occurred while applying the discount.');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

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

  const handleAddReference = async (e) => {
    e.preventDefault();
    if (editingReferenceId) {
      const res = await fetch(`/api/references/${editingReferenceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: referenceName, phone: referencePhone })
      });
      if (res.ok) {
        alert('Reference updated!');
        const updated = await res.json();
        setReferences(references.map(r => r.id === editingReferenceId ? updated : r));
        setReferenceName(''); setReferencePhone(''); setEditingReferenceId(null);
      }
    } else {
      const res = await fetch('/api/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: referenceName, phone: referencePhone })
      });
      if (res.ok) {
        alert('Reference added!');
        const added = await res.json();
        setReferences([...references, added]);
        setReferenceName(''); setReferencePhone('');
      }
    }
  };

  const handleEditReference = (ref) => {
    setEditingReferenceId(ref.id);
    setReferenceName(ref.name);
    setReferencePhone(ref.phone || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleReference = async (id, currentStatus) => {
    const res = await fetch(`/api/references/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentStatus })
    });
    if (res.ok) {
      const updated = await res.json();
      setReferences(references.map(r => r.id === id ? updated : r));
    }
  };

  const handleAddTransport = async (e) => {
    e.preventDefault();
    if (editingTransportId) {
      const res = await fetch(`/api/transports/${editingTransportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: transportName, phone: transportPhone })
      });
      if (res.ok) {
        alert('Transport updated!');
        const updated = await res.json();
        setTransports(transports.map(t => t.id === editingTransportId ? updated : t));
        setTransportName(''); setTransportPhone(''); setEditingTransportId(null);
      }
    } else {
      const res = await fetch('/api/transports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: transportName, phone: transportPhone })
      });
      if (res.ok) {
        alert('Transport added!');
        const added = await res.json();
        setTransports([...transports, added]);
        setTransportName(''); setTransportPhone('');
      }
    }
  };

  const handleEditTransport = (t) => {
    setEditingTransportId(t.id);
    setTransportName(t.name);
    setTransportPhone(t.phone || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleTransport = async (id, currentStatus) => {
    const res = await fetch(`/api/transports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentStatus })
    });
    if (res.ok) {
      const updated = await res.json();
      setTransports(transports.map(t => t.id === id ? updated : t));
    }
  };

  return (
    <div style={styles.cardStyle}>
      {/* Sub-navigation */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {['product', 'category', 'godown', 'reference', 'transport'].map(tab => (
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
              
              <div className="mobile-stack" style={{ display: 'flex', gap: '20px' }}>
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

          {/* Table and Global Strategy */}
          <div>
            {/* Global Pricing Strategy */}
            <div style={{ backgroundColor: `${theme.accent}15`, border: `1px solid ${theme.accent}50`, borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
              <h3 style={{ color: theme.accent, fontSize: '1.2rem', margin: '0 0 15px 0' }}>Global Pricing Strategy (Reverse MRP)</h3>
              <p style={{ color: theme.textSecondary, fontSize: '0.9rem', marginBottom: '15px', lineHeight: '1.4' }}>
                Set a global discount percentage. The system will keep your Selling Price fixed, but will artificially inflate the MRP (Base Price) across all products so you can advertise this massive discount.
              </p>
              <form className="mobile-stack" onSubmit={handleApplyGlobalDiscount} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...styles.labelStyle, color: theme.accent }}>Discount Percentage (%)</label>
                  <input 
                    type="number" 
                    value={globalDiscount} 
                    onChange={e => setGlobalDiscount(e.target.value)} 
                    placeholder="e.g. 80" 
                    min="0" 
                    max="99" 
                    required 
                    style={styles.inputStyle} 
                  />
                </div>
                <button type="submit" disabled={isApplyingDiscount} style={{ ...styles.btnPrimary, backgroundColor: theme.accent, padding: '12px 24px', opacity: isApplyingDiscount ? 0.7 : 1 }}>
                  {isApplyingDiscount ? 'Applying...' : '⚡ Apply Global Discount'}
                </button>
              </form>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', margin: 0 }}>Product Directory</h3>
              <button 
                type="button"
                onClick={() => setIsDragLocked(!isDragLocked)} 
                style={{ ...styles.btnPrimary, padding: '8px 16px', fontSize: '0.9rem', backgroundColor: isDragLocked ? theme.textSecondary : theme.accent, boxShadow: 'none' }}>
                {isDragLocked ? '🔒 Unlock Reordering' : '🔓 Lock Reordering'}
              </button>
            </div>
            <div className="table-responsive" style={{ overflowY: 'auto', maxHeight: '550px', border: `1px solid ${theme.border}`, borderRadius: '12px' }}>
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
              <div className="table-responsive" style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
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

      {/* Reference Master */}
      {activeMasterTab === 'reference' && (
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', margin: 0 }}>
              {editingReferenceId ? 'Edit Reference Agent' : 'Add Reference Agent'}
            </h3>
            {editingReferenceId && (
              <button onClick={() => {
                setEditingReferenceId(null);
                setReferenceName(''); setReferencePhone('');
              }} style={{ background: 'transparent', border: 'none', color: theme.danger, cursor: 'pointer', fontWeight: 'bold' }}>✕ Cancel Edit</button>
            )}
          </div>
          <form onSubmit={handleAddReference} style={{ marginBottom: '40px' }}>
            <label style={styles.labelStyle}>Agent / Referrer Name</label>
            <input type="text" value={referenceName} onChange={e => setReferenceName(e.target.value)} required style={styles.inputStyle} placeholder="e.g. Ramesh" />
            <label style={styles.labelStyle}>Phone Number (Optional)</label>
            <input type="text" value={referencePhone} onChange={e => setReferencePhone(e.target.value)} style={styles.inputStyle} placeholder="e.g. 9876543210" />
            
            <button type="submit" className="action-btn" style={{...styles.btnPrimary, backgroundColor: editingReferenceId ? theme.accent : theme.info}}>
              {editingReferenceId ? 'Update Agent' : 'Save Agent'}
            </button>
          </form>
          
          <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '25px' }}>Existing Agents</h3>
          <div className="table-responsive" style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: theme.cardBg }}>
                <tr>
                  <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Name</th>
                  <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Phone</th>
                  <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Status</th>
                  <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}`, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {references.map(r => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${theme.border}`, opacity: r.isActive ? 1 : 0.5 }}>
                    <td style={{ padding: '15px', color: theme.textPrimary, fontWeight: 'bold' }}>{r.name}</td>
                    <td style={{ padding: '15px', color: theme.textSecondary }}>{r.phone || '-'}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        backgroundColor: r.isActive ? `${theme.success}20` : `${theme.danger}20`,
                        color: r.isActive ? theme.success : theme.danger,
                        fontWeight: 'bold'
                      }}>
                        {r.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <button onClick={() => handleEditReference(r)} style={{ padding: '6px 12px', marginRight: '8px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '6px', color: theme.textPrimary, cursor: 'pointer', fontSize: '0.9rem' }}>Edit</button>
                      <button onClick={() => handleToggleReference(r.id, r.isActive)} style={{ padding: '6px 12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '6px', color: r.isActive ? theme.danger : theme.success, cursor: 'pointer', fontSize: '0.9rem' }}>
                        {r.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transport Master */}
      {activeMasterTab === 'transport' && (
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', margin: 0 }}>
              {editingTransportId ? 'Edit Transport Agency' : 'Add Transport Agency'}
            </h3>
            {editingTransportId && (
              <button onClick={() => {
                setEditingTransportId(null);
                setTransportName(''); setTransportPhone('');
              }} style={{ background: 'transparent', border: 'none', color: theme.danger, cursor: 'pointer', fontWeight: 'bold' }}>✕ Cancel Edit</button>
            )}
          </div>
          <form onSubmit={handleAddTransport} style={{ marginBottom: '40px' }}>
            <label style={styles.labelStyle}>Agency Name</label>
            <input type="text" value={transportName} onChange={e => setTransportName(e.target.value)} required style={styles.inputStyle} placeholder="e.g. KPN Travels" />
            <label style={styles.labelStyle}>Phone / Contact (Optional)</label>
            <input type="text" value={transportPhone} onChange={e => setTransportPhone(e.target.value)} style={styles.inputStyle} placeholder="e.g. 9876543210" />
            
            <button type="submit" className="action-btn" style={{...styles.btnPrimary, backgroundColor: editingTransportId ? theme.accent : theme.info}}>
              {editingTransportId ? 'Update Agency' : 'Save Agency'}
            </button>
          </form>
          
          <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '25px' }}>Existing Agencies</h3>
          <div className="table-responsive" style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: theme.cardBg }}>
                <tr>
                  <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Name</th>
                  <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Phone</th>
                  <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Status</th>
                  <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}`, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transports.map(t => (
                  <tr key={t.id} style={{ borderBottom: `1px solid ${theme.border}`, opacity: t.isActive ? 1 : 0.5 }}>
                    <td style={{ padding: '15px', color: theme.textPrimary, fontWeight: 'bold' }}>{t.name}</td>
                    <td style={{ padding: '15px', color: theme.textSecondary }}>{t.phone || '-'}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        backgroundColor: t.isActive ? `${theme.success}20` : `${theme.danger}20`,
                        color: t.isActive ? theme.success : theme.danger,
                        fontWeight: 'bold'
                      }}>
                        {t.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <button onClick={() => handleEditTransport(t)} style={{ padding: '6px 12px', marginRight: '8px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '6px', color: theme.textPrimary, cursor: 'pointer', fontSize: '0.9rem' }}>Edit</button>
                      <button onClick={() => handleToggleTransport(t.id, t.isActive)} style={{ padding: '6px 12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '6px', color: t.isActive ? theme.danger : theme.success, cursor: 'pointer', fontSize: '0.9rem' }}>
                        {t.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
