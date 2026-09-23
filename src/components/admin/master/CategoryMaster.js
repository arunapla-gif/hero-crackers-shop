import React from 'react';

export default function CategoryMaster({ 
  categories, setCategories,
  categoryName, setCategoryName, editingCategoryId, setEditingCategoryId 
}) {

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

  return (
    <div style={{ maxWidth: '500px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h3 style={{ color: 'var(--admin-text-primary)', fontSize: '1.5rem', margin: 0 }}>
          {editingCategoryId ? 'Edit Category' : 'Add Category'}
        </h3>
        {editingCategoryId && (
          <button onClick={() => {
            setEditingCategoryId(null);
            setCategoryName('');
          }} className="admin-btn-danger action-btn" style={{ padding: '8px 16px', borderRadius: '30px', boxShadow: 'none' }}>✕ Cancel Edit</button>
        )}
      </div>
      <form onSubmit={handleAddCategory} style={{ marginBottom: '40px' }}>
        <label className="admin-form-label">Category Name</label>
        <input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} required className="admin-form-input" />
        <button type="submit" className={`admin-btn-primary action-btn ${editingCategoryId ? 'admin-btn-accent' : 'admin-btn-info'}`}>
          {editingCategoryId ? 'Update Category' : 'Save Category'}
        </button>
      </form>
      
      <h3 style={{ color: 'var(--admin-text-primary)', fontSize: '1.5rem', marginBottom: '25px' }}>Existing Categories</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {categories.map(c => (
          <span key={c.id} className="admin-badge">
            {c.name}
            <button onClick={() => handleEditCategory(c)} className="admin-badge-action">✎</button>
          </span>
        ))}
      </div>
    </div>
  );
}
