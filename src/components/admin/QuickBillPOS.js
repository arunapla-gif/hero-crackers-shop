import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getTheme, getStyles } from './theme';

export default function QuickBillPOS({ isDarkMode, products, categories, handleRefreshData, isRefreshing }) {
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme, isDarkMode);
  const queryClient = useQueryClient();

  const [quickBillCart, setQuickBillCart] = useState({}); // { productId: quantity }
  const [quickBillCustomer, setQuickBillCustomer] = useState({ name: '', phone: '', address: 'Walk-in / Store Pickup', city: '' });
  
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
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to generate bill');
      return res.json();
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries(['orders']);
      setQuickBillCart({});
      setQuickBillCustomer({ name: '', phone: '', address: 'Walk-in / Store Pickup', city: '' });
      
      // Quickly trigger print for walk-in
      triggerPrint(order);
    }
  });

  const triggerPrint = (order) => {
    const originalContent = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    
    let itemsHtml = order.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return `
        <tr>
          <td style="border: 1px solid #000; padding: 8px;">${product ? product.name : 'Item'}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.quantity}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: right;">₹${item.price * item.quantity}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html><head><title>Print Invoice</title></head><body>
      <div style="padding: 40px; font-family: Arial, sans-serif; color: #000; background-color: #fff;">
        <h1 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px;">HERO CRACKERS</h1>
        <h2 style="text-align: center;">CASH RECEIPT / INVOICE</h2>
        <div style="display: flex; justify-content: space-between; margin-top: 30px;">
          <div>
            <p><strong>Order ID:</strong> ${order.id.slice(-6).toUpperCase()}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Phone:</strong> ${order.customerPhone || 'Walk-in'}</p>
          </div>
        </div>
        <table style="width: 100%; margin-top: 30px; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #000; padding: 8px; text-align: left;">Item</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Qty</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <th colspan="2" style="border: 1px solid #000; padding: 8px; text-align: right;">Total:</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right;">₹${order.totalAmount}</th>
            </tr>
          </tfoot>
        </table>
      </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleGenerateQuickBill = (e) => {
    e.preventDefault();
    if (Object.keys(quickBillCart).length === 0) return alert('Cart is empty!');
    if (quickBillTotal < 3000) return alert('Minimum order Rs.3000');
    
    const items = Object.entries(quickBillCart).map(([id, qty]) => {
      const p = products.find(prod => prod.id === id);
      return { productId: id, quantity: qty, price: p.price };
    });
    
    const payload = {
      customerName: quickBillCustomer.name || 'Walk-in Customer',
      customerPhone: quickBillCustomer.phone || '0000000000',
      shippingAddress: quickBillCustomer.address + (quickBillCustomer.city ? `, ${quickBillCustomer.city}` : ''),
      totalAmount: quickBillTotal,
      items
    };
    
    generateBillMutation.mutate(payload);
  };

  return (
    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      
      {/* Left Panel: Scrollable Product Matrix */}
      <div style={{ flex: '1 1 600px', backgroundColor: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: `0 10px 25px rgba(0,0,0,${isDarkMode ? '0.2' : '0.05'})`, padding: '20px', maxHeight: '800px', overflowY: 'auto' }}>
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
              <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', backgroundColor: theme.bg, borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                <div style={{ flex: 1 }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <button className="qty-btn" onClick={() => updateQuickBillQty(product.id, -1)} style={styles.qtyBtnStyle}>-</button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: theme.textPrimary, width: '30px', textAlign: 'center' }}>{qty}</span>
                  <button className="qty-btn" onClick={() => updateQuickBillQty(product.id, 1)} style={styles.qtyBtnStyle}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel: Sticky Cart Summary */}
      <div style={{ flex: '1 1 350px', position: 'sticky', top: '20px' }}>
        <form onSubmit={handleGenerateQuickBill} style={{ backgroundColor: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: `0 10px 25px rgba(0,0,0,${isDarkMode ? '0.2' : '0.05'})`, padding: '30px' }}>
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
            <label style={styles.labelStyle}>Customer Name (Optional)</label>
            <input type="text" value={quickBillCustomer.name} onChange={e => setQuickBillCustomer({...quickBillCustomer, name: e.target.value})} style={styles.inputStyle} placeholder="Walk-in Customer" />
            
            <label style={styles.labelStyle}>Phone Number (Optional)</label>
            <input type="text" value={quickBillCustomer.phone} onChange={e => setQuickBillCustomer({...quickBillCustomer, phone: e.target.value})} style={styles.inputStyle} placeholder="0000000000" />
            
            <label style={styles.labelStyle}>Address / Notes</label>
            <input type="text" value={quickBillCustomer.address} onChange={e => setQuickBillCustomer({...quickBillCustomer, address: e.target.value})} style={styles.inputStyle} />

            <label style={styles.labelStyle}>City</label>
            <input type="text" value={quickBillCustomer.city} onChange={e => setQuickBillCustomer({...quickBillCustomer, city: e.target.value})} style={{...styles.inputStyle, marginBottom: 0}} placeholder="City Name" />
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
              backgroundColor: generateBillMutation.isPending ? theme.border : theme.success, 
              boxShadow: generateBillMutation.isPending ? 'none' : `0 4px 15px ${theme.success}50` 
            }}
          >
            {generateBillMutation.isPending ? 'Generating...' : '⚡ Generate Bill & Print'}
          </button>
        </form>
      </div>
    </div>
  );
}
