import React from 'react';

export default function ReferenceMaster({ 
  references, setReferences,
  referenceName, setReferenceName, referencePhone, setReferencePhone,
  editingReferenceId, setEditingReferenceId 
}) {

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

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h3 style={{ color: 'var(--admin-text-primary)', fontSize: '1.5rem', margin: 0 }}>
          {editingReferenceId ? 'Edit Reference Agent' : 'Add Reference Agent'}
        </h3>
        {editingReferenceId && (
          <button type="button" onClick={() => {
            setEditingReferenceId(null);
            setReferenceName(''); setReferencePhone('');
          }} className="admin-btn-secondary admin-btn-danger" style={{ border: 'none', padding: '0.25rem 0.5rem' }}>✕ Cancel Edit</button>
        )}
      </div>
      <form onSubmit={handleAddReference} style={{ marginBottom: '40px' }}>
        <label className="admin-form-label">Agent / Referrer Name</label>
        <input type="text" value={referenceName} onChange={e => setReferenceName(e.target.value)} required className="admin-form-input" placeholder="e.g. Ramesh" />
        <label className="admin-form-label">Phone Number (Optional)</label>
        <input type="text" value={referencePhone} onChange={e => setReferencePhone(e.target.value)} className="admin-form-input" placeholder="e.g. 9876543210" />
        
        <button type="submit" className={`action-btn ${editingReferenceId ? 'admin-btn-accent' : 'admin-btn-primary'}`}>
          {editingReferenceId ? 'Update Agent' : 'Save Agent'}
        </button>
      </form>
      
      <h3 style={{ color: 'var(--admin-text-primary)', fontSize: '1.5rem', marginBottom: '25px' }}>Existing Agents</h3>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead className="admin-table-thead">
            <tr>
              <th className="admin-table-th">Name</th>
              <th className="admin-table-th">Phone</th>
              <th className="admin-table-th">Status</th>
              <th className="admin-table-th" style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {references.map(r => (
              <tr key={r.id} className="admin-table-tr" style={{ opacity: r.isActive ? 1 : 0.5 }}>
                <td className="admin-table-td" style={{ color: 'var(--admin-text-primary)', fontWeight: 'bold' }}>{r.name}</td>
                <td className="admin-table-td">{r.phone || '-'}</td>
                <td className="admin-table-td">
                  <span className={`admin-status-badge ${r.isActive ? 'active' : 'disabled'}`}>
                    {r.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="admin-table-td" style={{ textAlign: 'right' }}>
                  <button onClick={() => handleEditReference(r)} className="admin-table-action-btn">Edit</button>
                  <button onClick={() => handleToggleReference(r.id, r.isActive)} className={`admin-table-action-btn ${r.isActive ? 'danger' : 'success'}`}>
                    {r.isActive ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
