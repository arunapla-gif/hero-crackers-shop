import React from 'react';
import { supabase } from '@/lib/supabase';

export default function ProductMaster({
  theme, styles, products, setProducts, categories,
  newProduct, setNewProduct, imageFile, setImageFile,
  isUploading, setIsUploading, editingProductId, setEditingProductId,
  globalDiscount, setGlobalDiscount, isApplyingDiscount, setIsApplyingDiscount,
  isDragLocked, setIsDragLocked, draggedItemIndex, setDraggedItemIndex
}) {

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

      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
      if (!ALLOWED_TYPES.includes(imageFile.type)) {
        alert('Invalid file format. Only JPG, PNG, and WebP images are allowed.');
        setIsUploading(false);
        return;
      }

      const MAX_SIZE = 5 * 1024 * 1024;
      if (imageFile.size > MAX_SIZE) {
        alert('File size exceeds the 5 MB limit.');
        setIsUploading(false);
        return;
      }

      const fileExt = imageFile.type === 'image/jpeg' ? 'jpg' : imageFile.type === 'image/png' ? 'png' : 'webp';
      const fileName = `${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}.${fileExt}`;
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
      setNewProduct({ name: '', description: '', basePrice: '', price: '', discount: '', stockShop: '', categoryId: categories.length > 0 ? categories[0].id : '', imageUrl: '', sequence: '', packageString: '' });
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
      sequence: product.sequence || '',
      packageString: product.packageString || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
      {/* Form */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h3 style={{ color: 'var(--admin-text-primary)', fontSize: '1.5rem', margin: 0 }}>
            {editingProductId ? 'Edit Product' : 'Create Product'}
          </h3>
          {editingProductId && (
            <button onClick={() => {
              setEditingProductId(null);
              setNewProduct({ name: '', description: '', basePrice: '', price: '', discount: '', stockShop: '', categoryId: categories.length > 0 ? categories[0].id : '', imageUrl: '', sequence: '', packageString: '' });
            }} className="admin-btn-danger action-btn" style={{ padding: '8px 16px', borderRadius: '30px', boxShadow: 'none' }}>✕ Cancel Edit</button>
          )}
        </div>
        <form onSubmit={handleAddProduct}>
          <label className="admin-form-label">Product Name</label>
          <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required className="admin-form-input" />
          
          <label className="admin-form-label">Category</label>
          <select value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})} required className="admin-form-input">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          
          <div className="mobile-stack" style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label className="admin-form-label">MRP (Base)</label>
              <input type="number" step="0.01" value={newProduct.basePrice} onChange={e => setNewProduct({...newProduct, basePrice: e.target.value})} required className="admin-form-input" />
            </div>
            <div style={{ flex: 1 }}>
              <label className="admin-form-label">Selling Price</label>
              <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required className="admin-form-input" />
            </div>
          </div>

          <label className="admin-form-label">Product Image</label>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="admin-form-input" style={{ padding: '10px' }} />

          <label className="admin-form-label">Display Order (Sequence)</label>
          <input type="number" value={newProduct.sequence} onChange={e => setNewProduct({...newProduct, sequence: e.target.value})} className="admin-form-input" placeholder="0" />

          <label className="admin-form-label">Packaging Size (Optional)</label>
          <input type="text" value={newProduct.packageString} onChange={e => setNewProduct({...newProduct, packageString: e.target.value})} className="admin-form-input" placeholder="e.g., 5 Pcs" />

          <button type="submit" disabled={isUploading} className={`admin-btn-primary action-btn ${editingProductId ? 'admin-btn-accent' : 'admin-btn-info'}`} style={{ width: '100%', marginTop: '10px', opacity: isUploading ? 0.7 : 1 }}>
            {isUploading ? 'Saving...' : editingProductId ? 'Update Product' : 'Save Product'}
          </button>
        </form>
      </div>

      {/* Table and Global Strategy */}
      <div>
        {/* Global Pricing Strategy */}
        <div style={{ backgroundColor: `rgba(99, 102, 241, 0.1)`, border: `1px solid rgba(99, 102, 241, 0.3)`, borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
          <h3 style={{ color: 'var(--admin-accent)', fontSize: '1.2rem', margin: '0 0 15px 0' }}>Global Pricing Strategy (Reverse MRP)</h3>
          <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.9rem', marginBottom: '15px', lineHeight: '1.4' }}>
            Set a global discount percentage. The system will keep your Selling Price fixed, but will artificially inflate the MRP (Base Price) across all products so you can advertise this massive discount.
          </p>
          <form className="mobile-stack" onSubmit={handleApplyGlobalDiscount} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label className="admin-form-label" style={{ color: 'var(--admin-accent)' }}>Discount Percentage (%)</label>
              <input 
                type="number" 
                value={globalDiscount} 
                onChange={e => setGlobalDiscount(e.target.value)} 
                placeholder="e.g. 80" 
                min="0" 
                max="99" 
                required 
                className="admin-form-input" 
              />
            </div>
            <button type="submit" disabled={isApplyingDiscount} className="admin-btn-primary admin-btn-accent action-btn" style={{ padding: '12px 24px', opacity: isApplyingDiscount ? 0.7 : 1 }}>
              {isApplyingDiscount ? 'Applying...' : '⚡ Apply Global Discount'}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h3 style={{ color: 'var(--admin-text-primary)', fontSize: '1.5rem', margin: 0 }}>Product Directory</h3>
          <button 
            type="button"
            onClick={() => setIsDragLocked(!isDragLocked)} 
            className={`admin-btn-primary action-btn ${isDragLocked ? '' : 'admin-btn-accent'}`}
            style={{ padding: '8px 16px', fontSize: '0.9rem', backgroundColor: isDragLocked ? 'var(--admin-text-secondary)' : undefined, boxShadow: 'none' }}>
            {isDragLocked ? '🔒 Unlock Reordering' : '🔓 Lock Reordering'}
          </button>
        </div>
        <div className="table-responsive" style={{ overflowY: 'auto', maxHeight: '550px', border: `1px solid var(--admin-border)`, borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--admin-bg)', zIndex: 1, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <tr>
                <th style={{ padding: '15px', color: 'var(--admin-text-secondary)', borderBottom: `1px solid var(--admin-border)` }}>Order</th>
                <th style={{ padding: '15px', color: 'var(--admin-text-secondary)', borderBottom: `1px solid var(--admin-border)` }}>Item</th>
                <th style={{ padding: '15px', color: 'var(--admin-text-secondary)', borderBottom: `1px solid var(--admin-border)` }}>PKG</th>
                <th style={{ padding: '15px', color: 'var(--admin-text-secondary)', borderBottom: `1px solid var(--admin-border)` }}>Price</th>
                <th style={{ padding: '15px', color: 'var(--admin-text-secondary)', borderBottom: `1px solid var(--admin-border)`, textAlign: 'right' }}>Actions</th>
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
                  style={{ borderBottom: `1px solid var(--admin-border)`, transition: 'background 0.2s', cursor: isDragLocked ? 'default' : 'grab' }} 
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--admin-bg)'} 
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: 'var(--admin-text-secondary)', cursor: isDragLocked ? 'default' : 'grab', fontSize: '1.2rem', opacity: isDragLocked ? 0.3 : 1 }}>⠿</span>
                      <span style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--admin-input-bg)', border: `1px solid var(--admin-border)`, borderRadius: '6px', color: 'var(--admin-text-primary)', fontWeight: 'bold' }}>
                        {product.sequence || index + 1}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '15px', color: 'var(--admin-text-primary)' }}>{product.name}</td>
                  <td style={{ padding: '15px', color: 'var(--admin-text-secondary)' }}>{product.packageString || '-'}</td>
                  <td style={{ padding: '15px', color: 'var(--admin-accent)', fontWeight: 'bold' }}>₹{product.price}</td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <button className="admin-btn-secondary action-btn" onClick={() => handleEditProduct(product)} style={{ padding: '6px 12px', fontSize: '0.9rem', boxShadow: 'none' }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
