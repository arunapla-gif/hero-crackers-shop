import React from 'react';

export default function GodownMaster({ 
  godowns, setGodowns, products, 
  godownName, setGodownName, godownLocation, setGodownLocation 
}) {

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

  return (
    <div>
      <div style={{ display: 'flex', gap: '40px', marginBottom: '50px', alignItems: 'start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px' }}>
          <h3 style={{ color: 'var(--admin-text-primary)', fontSize: '1.5rem', marginBottom: '25px' }}>Register Godown</h3>
          <form onSubmit={handleAddGodown}>
            <label className="admin-form-label">Godown Name</label>
            <input type="text" value={godownName} onChange={e => setGodownName(e.target.value)} required className="admin-form-input" />
            <label className="admin-form-label">Location / Address</label>
            <input type="text" value={godownLocation} onChange={e => setGodownLocation(e.target.value)} className="admin-form-input" />
            <button type="submit" className="admin-btn-primary action-btn">Register Godown</button>
          </form>
        </div>
        
        <div style={{ flex: '1 1 400px' }}>
          <h3 style={{ color: 'var(--admin-text-primary)', fontSize: '1.5rem', marginBottom: '25px' }}>Registered Locations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {godowns.map(g => (
              <div key={g.id} style={{ padding: '20px', backgroundColor: 'var(--admin-bg)', borderRadius: '12px', border: `1px solid var(--admin-border)`, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 5px 0', color: 'var(--admin-accent)', fontSize: '1.2rem' }}>{g.name}</h4>
                <span style={{ color: 'var(--admin-text-secondary)', fontSize: '0.9rem' }}>{g.location || 'No location specified'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '30px', backgroundColor: 'var(--admin-bg)', borderRadius: '12px', border: `1px solid var(--admin-border)`, boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: 'var(--admin-text-primary)', fontSize: '1.5rem', margin: '0 0 10px 0' }}>Global Stock Matrix</h3>
        <p style={{ color: 'var(--admin-text-secondary)', marginBottom: '25px' }}>Click any cell to instantly update the inventory level.</p>
        
        {godowns.length === 0 ? <p style={{ color: 'var(--admin-accent)' }}>Please register a Godown first.</p> : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead className="admin-table-thead">
                <tr>
                  <th className="admin-table-th">Product</th>
                  {godowns.map(g => (
                    <th key={g.id} className="admin-table-th admin-table-th-accent">{g.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="admin-table-tr">
                    <td className="admin-table-td">{product.name}</td>
                    {godowns.map(godown => {
                      const qty = godown.stocks?.find(s => s.productId === product.id)?.quantity || 0;
                      return (
                        <td key={godown.id} className="admin-table-td">
                          <input 
                            type="number" 
                            defaultValue={qty}
                            onBlur={(e) => e.target.value !== String(qty) && handleUpdateGodownStock(godown.id, product.id, e.target.value)}
                            className="admin-table-input"
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
  );
}
