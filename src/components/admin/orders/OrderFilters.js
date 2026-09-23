export default function OrderFilters({
  isDarkMode,
  orderFilter, setOrderFilter,
  sourceFilter, setSourceFilter,
  orderSearch, setOrderSearch,
  startDate, setStartDate,
  endDate, setEndDate,
  setPage,
  orders,
  selectedOrders, setSelectedOrders,
  handleBulkStatusChange,
  handleBulkMarkPaid,
  exportToCSV
}) {

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length && orders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  return (
    <>
      {/* Advanced Filters & Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-stack mobile-stack">
          <input 
            type="text" 
            className="admin-search-input search-input"
            placeholder="🔍 Search ID, Phone, Reference..." 
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter') setPage(1); }}
          />
          
          {/* Date Pickers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="date" value={startDate} onChange={e => {setStartDate(e.target.value); setPage(1);}} className="admin-date-input date-input" />
            <span style={{ color: 'var(--admin-text-secondary)' }}>to</span>
            <input type="date" value={endDate} onChange={e => {setEndDate(e.target.value); setPage(1);}} className="admin-date-input date-input" />
            {(startDate || endDate) && (
              <button type="button" className="admin-btn-secondary admin-btn-danger" onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }} style={{ border: 'none', padding: '0.25rem 0.5rem' }}>✕ Clear</button>
            )}
          </div>
        </div>
        
        {/* Export Button */}
        <button className="admin-btn-secondary action-btn" onClick={exportToCSV} style={{ boxShadow: 'none' }}>
          📊 Export CSV
        </button>
      </div>

      {/* Segmented Control for Filters */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div className="admin-filter-group">
          {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(f => (
            <button 
              key={f}
              className={`admin-filter-btn filter-btn ${orderFilter === f ? `active status-${f}` : ''}`}
              onClick={() => { setOrderFilter(f); setPage(1); }}
            >
              {f}
            </button>
          ))}
        </div>
        
        <select 
          value={sourceFilter} 
          onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
          className="admin-search-input"
          style={{ width: 'auto', minWidth: '150px' }}
        >
          <option value="ALL">All Sources</option>
          <option value="WEBSITE">🌐 Website Orders</option>
          <option value="POS">🏬 Admin POS Orders</option>
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="admin-bulk-bar">
          <div style={{ color: 'var(--admin-text-primary)', fontWeight: 'bold' }}>
            <span style={{ color: 'var(--admin-accent)', fontSize: '1.2rem' }}>{selectedOrders.length}</span> Orders Selected
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="admin-btn-primary action-btn" onClick={() => handleBulkStatusChange('CONFIRMED')} style={{ padding: '8px 16px', fontSize: '0.85rem', boxShadow: 'none', backgroundColor: 'var(--admin-confirmed)' }}>Bulk Confirm</button>
            <button className="admin-btn-primary admin-btn-info action-btn" onClick={() => handleBulkStatusChange('PROCESSING')} style={{ padding: '8px 16px', fontSize: '0.85rem', boxShadow: 'none' }}>Bulk Process</button>
            <button className="admin-btn-primary action-btn" onClick={() => handleBulkStatusChange('PACKED')} style={{ padding: '8px 16px', fontSize: '0.85rem', boxShadow: 'none', backgroundColor: 'var(--admin-packed)' }}>Bulk Pack</button>
            <button className="admin-btn-primary admin-btn-shipped action-btn" onClick={() => handleBulkStatusChange('SHIPPED')} style={{ padding: '8px 16px', fontSize: '0.85rem', boxShadow: 'none' }}>Bulk Dispatch (No Tracking)</button>
            <button className="admin-btn-primary admin-btn-success action-btn" onClick={() => handleBulkStatusChange('DELIVERED')} style={{ padding: '8px 16px', fontSize: '0.85rem', boxShadow: 'none' }}>Bulk Deliver</button>
            <button className="admin-btn-primary admin-btn-success action-btn" onClick={handleBulkMarkPaid} style={{ padding: '8px 16px', fontSize: '0.85rem', boxShadow: 'none' }}>Bulk Mark Paid</button>
            <button className="admin-btn-danger action-btn" onClick={() => handleBulkStatusChange('CANCELLED')} style={{ padding: '8px 16px', fontSize: '0.85rem', boxShadow: 'none', borderRadius: '30px' }}>Bulk Cancel</button>
          </div>
        </div>
      )}

      {/* Select All Utility */}
      <div style={{ marginBottom: '15px', paddingLeft: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--admin-text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>
          <input 
            type="checkbox" 
            className="custom-checkbox"
            checked={orders.length > 0 && selectedOrders.length === orders.length}
            onChange={handleSelectAll}
          />
          Select All {orders.length} Current Page Orders
        </label>
      </div>
    </>
  );
}
