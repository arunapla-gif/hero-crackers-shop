import { useState, useMemo } from 'react';
import { formatOrderNumber } from '@/lib/utils';

export default function CustomerDirectory({ customers = [], orders = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Calculate analytics for each customer
  const enrichedCustomers = useMemo(() => {
    return customers.map(customer => {
      // Find all orders linked to this customer's phone number
      const customerOrders = orders.filter(o => {
        if (!o.customerPhone) return false;
        const normalizedOrderPhone = o.customerPhone.replace(/[^0-9]/g, '').slice(-10);
        return normalizedOrderPhone === customer.primaryPhone;
      });

      const totalRevenue = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const totalCredit = customerOrders.filter(o => o.paymentStatus === 'CREDIT').reduce((sum, o) => sum + o.totalAmount, 0);
      const orderCount = customerOrders.length;

      return {
        ...customer,
        totalRevenue,
        totalCredit,
        orderCount,
        orders: customerOrders // Keep for detailed view
      };
    });
  }, [customers, orders]);

  // Filter based on search term
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return enrichedCustomers;
    const lower = searchTerm.toLowerCase();
    return enrichedCustomers.filter(c => 
      c.name.toLowerCase().includes(lower) || 
      c.primaryPhone.includes(lower) || 
      (c.city && c.city.toLowerCase().includes(lower))
    );
  }, [enrichedCustomers, searchTerm]);

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      
      {/* Left Column: Customer List */}
      <div className="admin-card" style={{ flex: '1 1 400px', padding: '25px', maxHeight: '800px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: 'var(--admin-text-primary)', margin: '0 0 20px 0' }}>Customer Directory</h2>
        
        <input 
          type="text" 
          placeholder="Search by Name, Phone, or City..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="admin-form-input"
          style={{ marginBottom: '20px' }}
        />

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
          {filteredCustomers.length === 0 ? (
            <p style={{ color: 'var(--admin-text-secondary)', textAlign: 'center' }}>No customers found.</p>
          ) : (
            filteredCustomers.map(customer => (
              <div 
                key={customer.id} 
                onClick={() => setSelectedCustomer(customer)}
                style={{ 
                  padding: '15px', 
                  backgroundColor: selectedCustomer?.id === customer.id ? 'rgba(99, 102, 241, 0.15)' : 'var(--admin-bg)', 
                  border: `1px solid ${selectedCustomer?.id === customer.id ? 'var(--admin-accent)' : 'var(--admin-border)'}`, 
                  borderRadius: '10px', 
                  marginBottom: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--admin-text-primary)', fontSize: '1.1rem' }}>{customer.name}</strong>
                  {customer.totalCredit > 0 && <span style={{ backgroundColor: 'var(--admin-danger)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>CREDIT</span>}
                </div>
                <div style={{ color: 'var(--admin-text-secondary)', fontSize: '0.9rem', margin: '5px 0' }}>📞 +91 {customer.primaryPhone}</div>
                <div style={{ color: 'var(--admin-text-secondary)', fontSize: '0.85rem' }}>{customer.city || 'No City'} • {customer.orderCount} Orders</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Customer Details */}
      {selectedCustomer ? (
        <div className="admin-card" style={{ flex: '2 1 500px', padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
            <div>
              <h1 style={{ color: 'var(--admin-text-primary)', margin: '0 0 5px 0', fontSize: '2rem' }}>{selectedCustomer.name}</h1>
              <p style={{ color: 'var(--admin-text-secondary)', fontSize: '1.1rem', margin: 0 }}>📞 +91 {selectedCustomer.primaryPhone}</p>
            </div>
            <button className="admin-btn-secondary action-btn" onClick={() => setSelectedCustomer(null)}>✕ Close</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
            <div style={{ padding: '20px', backgroundColor: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: '12px' }}>
              <div style={{ color: 'var(--admin-text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '5px' }}>Lifetime Value</div>
              <div style={{ color: 'var(--admin-accent)', fontSize: '1.8rem', fontWeight: 'bold' }}>₹{selectedCustomer.totalRevenue.toLocaleString()}</div>
            </div>
            <div style={{ padding: '20px', backgroundColor: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: '12px' }}>
              <div style={{ color: 'var(--admin-text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '5px' }}>Total Orders</div>
              <div style={{ color: 'var(--admin-text-primary)', fontSize: '1.8rem', fontWeight: 'bold' }}>{selectedCustomer.orderCount}</div>
            </div>
            <div style={{ padding: '20px', backgroundColor: selectedCustomer.totalCredit > 0 ? 'rgba(239, 68, 68, 0.15)' : 'var(--admin-bg)', border: `1px solid ${selectedCustomer.totalCredit > 0 ? 'var(--admin-danger)' : 'var(--admin-border)'}`, borderRadius: '12px' }}>
              <div style={{ color: selectedCustomer.totalCredit > 0 ? 'var(--admin-danger)' : 'var(--admin-text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '5px' }}>Pending Credit</div>
              <div style={{ color: selectedCustomer.totalCredit > 0 ? 'var(--admin-danger)' : 'var(--admin-success)', fontSize: '1.8rem', fontWeight: 'bold' }}>₹{selectedCustomer.totalCredit.toLocaleString()}</div>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: 'var(--admin-text-primary)', marginBottom: '15px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>Profile Details</h3>
            <p style={{ color: 'var(--admin-text-secondary)', margin: '5px 0' }}><strong>Full Address:</strong> {selectedCustomer.fullAddress || 'N/A'}</p>
            <p style={{ color: 'var(--admin-text-secondary)', margin: '5px 0' }}><strong>City:</strong> {selectedCustomer.city || 'N/A'}</p>
            <p style={{ color: 'var(--admin-text-secondary)', margin: '5px 0' }}><strong>Alternate Phone:</strong> {selectedCustomer.alternatePhone || 'N/A'}</p>
            <p style={{ color: 'var(--admin-text-secondary)', margin: '5px 0' }}><strong>Joined:</strong> {new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
          </div>

          <div>
            <h3 style={{ color: 'var(--admin-text-primary)', marginBottom: '15px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>Order History</h3>
            {selectedCustomer.orders.length === 0 ? (
              <p style={{ color: 'var(--admin-text-secondary)' }}>No past orders found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedCustomer.orders.map(order => (
                  <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ color: 'var(--admin-text-primary)', fontWeight: 'bold', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span>{formatOrderNumber(order.orderNumber, order.createdAt)}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--admin-accent)', fontWeight: '600' }}>
                          👤 {order.user?.name || 'Customer'}
                        </span>
                      </div>
                      <div style={{ color: 'var(--admin-text-secondary)', fontSize: '0.85rem' }}>{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--admin-accent)', fontWeight: 'bold', marginBottom: '5px' }}>₹{order.totalAmount.toLocaleString()}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', display: 'inline-block',
                        backgroundColor: order.paymentStatus === 'PAID' ? 'var(--admin-success)' : order.paymentStatus === 'CREDIT' ? 'var(--admin-danger)' : 'var(--admin-warning)',
                        color: order.paymentStatus === 'PAID' ? '#fff' : '#000'
                      }}>
                        {order.paymentStatus}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="admin-card" style={{ flex: '2 1 500px', padding: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <p style={{ color: 'var(--admin-text-secondary)', fontSize: '1.2rem' }}>Select a customer from the directory to view details.</p>
        </div>
      )}

    </div>
  );
}
