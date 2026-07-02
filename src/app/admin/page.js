export default function AdminDashboard() {
  return (
    <div style={{ padding: '50px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '30px' }}>
        Admin Dashboard
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Pending Estimates Panel */}
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: 'var(--color-primary)', marginBottom: '20px' }}>Pending Estimates</h2>
          
          <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong>Estimate #1024</strong>
              <span style={{ color: '#ffae00', fontWeight: 'bold' }}>PENDING</span>
            </div>
            <p><strong>Customer:</strong> Guest Checkout (Pending Call)</p>
            <p><strong>Total:</strong> ₹1,299</p>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button style={{ padding: '8px 15px', backgroundColor: 'green', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Mark Paid</button>
              <button style={{ padding: '8px 15px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>View Details</button>
            </div>
          </div>
        </div>

        {/* Product Management Panel */}
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: 'var(--color-primary)' }}>Products</h2>
            <button style={{ padding: '8px 15px', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Product</button>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '10px 0' }}>Name</th>
                <th style={{ padding: '10px 0' }}>Price</th>
                <th style={{ padding: '10px 0' }}>Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px 0' }}>Sivakasi Royal Chakkars</td>
                <td>₹1,299</td>
                <td style={{ color: 'green', fontWeight: 'bold' }}>In Stock (50)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px 0' }}>Giant Flowerpots</td>
                <td>₹450</td>
                <td style={{ color: 'green', fontWeight: 'bold' }}>In Stock (120)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
