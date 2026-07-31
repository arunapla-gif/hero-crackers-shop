import { useState, useMemo, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getTheme, getStyles } from './theme';
import { formatOrderNumber } from '@/lib/utils';


export default function QuickBillPOS({ isDarkMode, products, categories, references, handleRefreshData, isRefreshing, initialPosState, onClearPosState }) {
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme, isDarkMode);
  const queryClient = useQueryClient();

  const [quickBillCart, setQuickBillCart] = useState({}); // { productId: quantity }
  const [quickBillCustomer, setQuickBillCustomer] = useState({ name: '', phone: '', address: 'Walk-in / Store Pickup', city: '', referredBy: '' });
  const [paymentState, setPaymentState] = useState({ status: 'UNPAID', method: 'CASH', details: '' });
  const [isMobileCartView, setIsMobileCartView] = useState(false);
  const [isFetchingCustomer, setIsFetchingCustomer] = useState(false);
  
  // Populate cart if initialPosState is provided (Edit or Duplicate)
  useEffect(() => {
    if (initialPosState && initialPosState.order) {
      const { order, type } = initialPosState;
      const initialCart = {};
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          initialCart[item.productId] = item.quantity;
        });
      }
      setQuickBillCart(initialCart);
      
      // If editing or repeating, try to populate customer details
      if (type === 'edit' || type === 'repeat') {
        let extractedAddress = order.shippingAddress || '';
        let extractedCity = '';
        if (extractedAddress.includes(',')) {
          const parts = extractedAddress.split(',');
          extractedCity = parts.pop().trim();
          extractedAddress = parts.join(',').trim();
        }
        
        setQuickBillCustomer({
          name: order.user?.name || order.customerName || 'Customer',
          phone: order.customerPhone || '',
          address: extractedAddress,
          city: extractedCity,
          referredBy: order.referredBy || ''
        });
        setPaymentState({
          status: order.paymentStatus || 'UNPAID',
          method: order.paymentMethod || 'CASH',
          details: order.paymentDetails || ''
        });
      }
      // If duplicate, leave customer blank so they can enter the new target person
    }
  }, [initialPosState]);

  // Auto-fill customer details when phone number reaches 10 digits
  useEffect(() => {
    const phone = quickBillCustomer.phone.replace(/[^0-9]/g, '');
    if (phone.length === 10 && !initialPosState?.type) {
      const fetchCustomer = async () => {
        setIsFetchingCustomer(true);
        try {
          const res = await fetch(`/api/customers?phone=${phone}`);
          if (res.ok) {
            const customers = await res.json();
            if (customers.length > 0) {
              const c = customers[0];
              setQuickBillCustomer(prev => ({
                ...prev,
                name: c.name || prev.name,
                address: c.fullAddress || prev.address,
                city: c.city || prev.city
              }));
            }
          }
        } catch (err) {
          console.error('Error fetching customer', err);
        } finally {
          setIsFetchingCustomer(false);
        }
      };
      // Debounce slightly to prevent multiple calls
      const timeoutId = setTimeout(fetchCustomer, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [quickBillCustomer.phone, initialPosState]);

  const updateQuickBillQty = (productId, delta) => {
    setQuickBillCart(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      const newCart = { ...prev };
      if (next === 0) delete newCart[productId];
      else newCart[productId] = next;
      return newCart;
    });
  };

  const quickBillTotal = useMemo(() => {
    return Object.entries(quickBillCart).reduce((sum, [id, qty]) => {
      const p = products.find(prod => prod.id === id);
      return sum + ((p?.price || 0) * qty);
    }, 0);
  }, [quickBillCart, products]);

  const generateBillMutation = useMutation({
    mutationFn: async (payload) => {
      const isEdit = initialPosState?.type === 'edit';
      const url = isEdit ? `/api/orders/${initialPosState.order.id}` : '/api/orders';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'generate'} bill`);
      return res.json();
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries(['orders']);
      setQuickBillCart({});
      setQuickBillCustomer({ name: '', phone: '', address: 'Walk-in / Store Pickup', city: '', referredBy: '' });
      setPaymentState({ status: 'UNPAID', method: 'CASH', details: '' });
      if (onClearPosState) onClearPosState();
    }
  });

  const handleGenerateQuickBill = (e) => {
    e.preventDefault();
    if (Object.keys(quickBillCart).length === 0) return alert('Cart is empty!');
    if (quickBillTotal < 3000) return alert('Minimum order Rs.3000');
    if (!quickBillCustomer.name.trim()) return alert('Customer Name is mandatory.');
    if (!quickBillCustomer.phone.trim()) return alert('Phone Number is mandatory.');
    if (!quickBillCustomer.city.trim()) return alert('City is mandatory.');
    
    const items = Object.entries(quickBillCart).map(([id, qty]) => {
      const p = products.find(prod => prod.id === id);
      return { productId: id, quantity: qty, price: p.price };
    });
    
    const payload = {
      customerName: quickBillCustomer.name,
      customerPhone: quickBillCustomer.phone,
      shippingAddress: quickBillCustomer.address + `, ${quickBillCustomer.city}`,
      referredBy: quickBillCustomer.referredBy,
      totalAmount: quickBillTotal,
      paymentStatus: paymentState.status,
      paymentMethod: paymentState.status === 'PAID' ? paymentState.method : null,
      paymentDetails: paymentState.status === 'PAID' ? paymentState.details : null,
      items
    };
    
    generateBillMutation.mutate(payload);
  };

  return (
    <>
      <style>{`
        .mobile-top-bar { display: none; }
        @media (max-width: 768px) {
          .mobile-top-bar { 
            display: flex !important; 
            position: sticky; 
            top: 0; 
            z-index: 50; 
            background-color: ${theme.cardBg}; 
            padding: 15px 20px; 
            border-bottom: 1px solid ${theme.border};
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 15px rgba(0,0,0,${isDarkMode ? '0.5' : '0.05'});
            margin: -20px -20px 20px -20px;
          }
          .products-panel { 
            display: ${isMobileCartView ? 'none' : 'block'} !important; 
            width: 100% !important; 
            flex: none !important; 
            max-height: none !important; 
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: transparent !important;
          }
          .cart-panel { 
            display: ${isMobileCartView ? 'block' : 'none'} !important; 
            width: 100% !important; 
            flex: none !important; 
            position: relative !important; 
            top: 0 !important; 
            padding: 0 !important;
          }
          .pos-container { gap: 0 !important; }
          .product-row { 
            flex-direction: column !important; 
            align-items: flex-start !important; 
            gap: 15px !important; 
            padding: 15px !important;
          }
          .qty-controls { 
            width: 100% !important; 
            justify-content: space-between !important; 
            background-color: ${theme.cardBg};
            padding: 5px;
            border-radius: 10px;
          }
          .qty-btn { padding: 8px 25px !important; }
        }
      `}</style>
      
      {/* Sticky Top Bar for Mobile */}
      <div className="mobile-top-bar">
        <div>
          <div style={{ color: theme.textSecondary, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Cart Total ({Object.keys(quickBillCart).length} items)</div>
          <div style={{ color: theme.accent, fontWeight: 'bold', fontSize: '1.5rem', lineHeight: '1' }}>₹{quickBillTotal.toLocaleString()}</div>
        </div>
        <button 
          type="button"
          onClick={() => setIsMobileCartView(!isMobileCartView)}
          style={{ ...styles.btnPrimary, padding: '10px 20px', fontSize: '1rem', backgroundColor: isMobileCartView ? theme.textSecondary : theme.accent, boxShadow: 'none' }}
        >
          {isMobileCartView ? '← Back to Products' : 'View Cart 🛒'}
        </button>
      </div>

      <div className="pos-container" style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Left Panel: Scrollable Product Matrix */}
        <div className="products-panel" style={{ flex: '1 1 600px', backgroundColor: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: `0 10px 25px rgba(0,0,0,${isDarkMode ? '0.2' : '0.05'})`, padding: '20px', maxHeight: '800px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ color: theme.textPrimary, margin: 0, fontSize: '1.8rem' }}>Product Matrix</h2>
          <button 
            type="button"
            onClick={handleRefreshData} 
            disabled={isRefreshing}
            style={{ ...styles.btnPrimary, padding: '8px 16px', fontSize: '0.9rem', backgroundColor: theme.info, opacity: isRefreshing ? 0.7 : 1, boxShadow: 'none' }}>
            {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {products.map((product, index) => {
            const globalIndex = index + 1;
            const qty = quickBillCart[product.id] || 0;
            const cat = categories.find(c => c.id === product.categoryId);
            
            return (
              <div key={product.id} className="product-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', backgroundColor: theme.bg, borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                <div className="product-info" style={{ flex: 1 }}>
                  <div style={{ color: theme.textPrimary, fontWeight: '600', fontSize: '1.05rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ color: theme.accent, minWidth: '25px' }}>{product.sequence || globalIndex}.</span>
                    <span>{product.name}</span>
                    {cat && (
                      <span style={{ fontSize: '0.75rem', padding: '2px 6px', backgroundColor: theme.inputBg, color: theme.textSecondary, borderRadius: '4px', textTransform: 'uppercase' }}>
                        {cat.name}
                      </span>
                    )}
                  </div>
                  <div style={{ color: theme.textSecondary, fontSize: '0.9rem', marginTop: '4px', paddingLeft: '33px' }}>₹{product.price}</div>
                </div>
                <div className="qty-controls" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <button type="button" className="qty-btn action-btn" onClick={() => updateQuickBillQty(product.id, -1)} style={styles.qtyBtnStyle}>-</button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: theme.textPrimary, width: '30px', textAlign: 'center' }}>{qty}</span>
                  <button type="button" className="qty-btn action-btn" onClick={() => updateQuickBillQty(product.id, 1)} style={styles.qtyBtnStyle}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel: Sticky Cart Summary */}
      <div className="cart-panel" style={{ flex: '1 1 350px', position: 'sticky', top: '20px' }}>
        <form onSubmit={handleGenerateQuickBill} style={{ backgroundColor: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: `0 10px 25px rgba(0,0,0,${isDarkMode ? '0.2' : '0.05'})`, padding: '30px' }}>
          
          {initialPosState && (
            <div style={{ padding: '10px 15px', backgroundColor: initialPosState.type === 'edit' ? `${theme.info}20` : `${theme.accent}20`, borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: initialPosState.type === 'edit' ? theme.info : theme.accent, fontWeight: 'bold' }}>
                {initialPosState.type === 'edit' ? `Editing Order #${formatOrderNumber(initialPosState.order.orderNumber)}` : 
                 initialPosState.type === 'repeat' ? 'Repeating Order (Same Customer)' : 'Duplicating Order (New Customer)'}
              </span>
              <button type="button" onClick={() => {
                onClearPosState();
                setQuickBillCart({});
                setQuickBillCustomer({ name: '', phone: '', address: 'Walk-in / Store Pickup', city: '', referredBy: '' });
              }} style={{ background: 'transparent', border: 'none', color: theme.cancelled, cursor: 'pointer', fontWeight: 'bold' }}>✕ Cancel</button>
            </div>
          )}

          <h2 style={{ color: theme.textPrimary, margin: '0 0 25px 0', fontSize: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Cart Summary</span>
            <span style={{ color: theme.accent, fontSize: '1.2rem' }}>{Object.keys(quickBillCart).length} Items</span>
          </h2>
          
          <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '20px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>
            {Object.entries(quickBillCart).length === 0 ? (
              <div style={{ color: theme.textSecondary, textAlign: 'center', padding: '20px 0' }}>Cart is empty</div>
            ) : (
              Object.entries(quickBillCart).map(([id, qty], index) => {
                const p = products.find(prod => prod.id === id);
                return (
                  <div key={id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: theme.textSecondary, fontSize: '0.95rem' }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                      <span style={{ color: theme.accent, marginRight: '8px', fontWeight: 'bold' }}>{index + 1}.</span>
                      {p?.name}
                    </span>
                    <span style={{ color: theme.textPrimary, fontWeight: 'bold' }}>{qty} x ₹{p?.price}</span>
                  </div>
                )
              })
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <span style={{ fontSize: '1.2rem', color: theme.textSecondary }}>Grand Total</span>
            <strong style={{ fontSize: '2.5rem', color: theme.accent, letterSpacing: '-1px' }}>₹{quickBillTotal.toLocaleString()}</strong>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={styles.labelStyle}>Customer Name *</label>
            <input type="text" value={quickBillCustomer.name} onChange={e => setQuickBillCustomer({...quickBillCustomer, name: e.target.value})} style={styles.inputStyle} placeholder="Customer Name" required />
            
            <label style={styles.labelStyle}>Phone Number * {isFetchingCustomer && <span style={{color: theme.info, fontSize: '0.8rem'}}> (Searching...)</span>}</label>
            <input type="text" value={quickBillCustomer.phone} onChange={e => setQuickBillCustomer({...quickBillCustomer, phone: e.target.value})} style={styles.inputStyle} placeholder="10-digit Mobile Number" required />
            
            <label style={styles.labelStyle}>Address / Notes</label>
            <input type="text" value={quickBillCustomer.address} onChange={e => setQuickBillCustomer({...quickBillCustomer, address: e.target.value})} style={styles.inputStyle} />

            <label style={styles.labelStyle}>City *</label>
            <input type="text" value={quickBillCustomer.city} onChange={e => setQuickBillCustomer({...quickBillCustomer, city: e.target.value})} style={styles.inputStyle} placeholder="City Name" required />

            <label style={styles.labelStyle}>Referred By (Optional)</label>
            <select 
              value={quickBillCustomer.referredBy} 
              onChange={e => setQuickBillCustomer({...quickBillCustomer, referredBy: e.target.value})} 
              style={styles.inputStyle}
            >
              <option value="">-- None / Walk-in --</option>
              {references?.filter(r => r.isActive).map(ref => (
                <option key={ref.id} value={ref.name}>{ref.name} {ref.phone ? `(${ref.phone})` : ''}</option>
              ))}
            </select>

            <div style={{ backgroundColor: `${theme.info}15`, padding: '15px', borderRadius: '12px', border: `1px solid ${theme.info}40`, marginBottom: '20px' }}>
              <label style={styles.labelStyle}>Payment Status</label>
              <select 
                value={paymentState.status} 
                onChange={e => setPaymentState({...paymentState, status: e.target.value})} 
                style={styles.inputStyle}
              >
                <option value="UNPAID">🔴 Unpaid (Estimate / Pending)</option>
                <option value="PAID">🟢 Paid in Full</option>
                <option value="CREDIT">🟣 Credit (Collect Later)</option>
              </select>

              {paymentState.status === 'PAID' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={styles.labelStyle}>Payment Method</label>
                    <select 
                      value={paymentState.method} 
                      onChange={e => setPaymentState({...paymentState, method: e.target.value})} 
                      style={styles.inputStyle}
                    >
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="BANK">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label style={styles.labelStyle}>Reference / Txn ID</label>
                    <input 
                      type="text" 
                      value={paymentState.details} 
                      onChange={e => setPaymentState({...paymentState, details: e.target.value})} 
                      style={styles.inputStyle} 
                      placeholder="e.g. UTR Number" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="action-btn"
            disabled={generateBillMutation.isPending || Object.keys(quickBillCart).length === 0}
            style={{ 
              ...styles.btnPrimary, 
              width: '100%', 
              padding: '16px', 
              fontSize: '1.2rem', 
              backgroundColor: generateBillMutation.isPending ? theme.border : (initialPosState?.type === 'edit' ? theme.info : theme.success), 
              boxShadow: generateBillMutation.isPending ? 'none' : `0 4px 15px ${(initialPosState?.type === 'edit' ? theme.info : theme.success)}50` 
            }}
          >
            {generateBillMutation.isPending ? 'Processing...' : (initialPosState?.type === 'edit' ? '🔄 Save Order Changes' : '⚡ Submit')}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
