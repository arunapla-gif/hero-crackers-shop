import React from 'react';

export default function TransportMaster({ 
  transports, setTransports,
  transportName, setTransportName, transportPhone, setTransportPhone,
  editingTransportId, setEditingTransportId 
}) {

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
    <div style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h3 style={{ color: 'var(--admin-text-primary)', fontSize: '1.5rem', margin: 0 }}>
          {editingTransportId ? 'Edit Transport Agency' : 'Add Transport Agency'}
        </h3>
        {editingTransportId && (
          <button type="button" onClick={() => {
            setEditingTransportId(null);
            setTransportName(''); setTransportPhone('');
          }} className="admin-btn-secondary admin-btn-danger" style={{ border: 'none', padding: '0.25rem 0.5rem' }}>✕ Cancel Edit</button>
        )}
      </div>
      <form onSubmit={handleAddTransport} style={{ marginBottom: '40px' }}>
        <label className="admin-form-label">Agency Name</label>
        <input type="text" value={transportName} onChange={e => setTransportName(e.target.value)} required className="admin-form-input" placeholder="e.g. KPN Travels" />
        <label className="admin-form-label">Phone / Contact (Optional)</label>
        <input type="text" value={transportPhone} onChange={e => setTransportPhone(e.target.value)} className="admin-form-input" placeholder="e.g. 9876543210" />
        
        <button type="submit" className={`action-btn ${editingTransportId ? 'admin-btn-accent' : 'admin-btn-primary'}`}>
          {editingTransportId ? 'Update Agency' : 'Save Agency'}
        </button>
      </form>
      
      <h3 style={{ color: 'var(--admin-text-primary)', fontSize: '1.5rem', marginBottom: '25px' }}>Existing Agencies</h3>
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
            {transports.map(t => (
              <tr key={t.id} className="admin-table-tr" style={{ opacity: t.isActive ? 1 : 0.5 }}>
                <td className="admin-table-td" style={{ color: 'var(--admin-text-primary)', fontWeight: 'bold' }}>{t.name}</td>
                <td className="admin-table-td">{t.phone || '-'}</td>
                <td className="admin-table-td">
                  <span className={`admin-status-badge ${t.isActive ? 'active' : 'disabled'}`}>
                    {t.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="admin-table-td" style={{ textAlign: 'right' }}>
                  <button onClick={() => handleEditTransport(t)} className="admin-table-action-btn">Edit</button>
                  <button onClick={() => handleToggleTransport(t.id, t.isActive)} className={`admin-table-action-btn ${t.isActive ? 'danger' : 'success'}`}>
                    {t.isActive ? 'Disable' : 'Enable'}
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
