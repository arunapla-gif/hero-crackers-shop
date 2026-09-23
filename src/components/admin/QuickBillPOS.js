import { useState, useMemo, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatOrderNumber } from '@/lib/utils';


export default function QuickBillPOS({ products, categories, references, handleRefreshData, isRefreshing, initialPosState, onClearPosState }) {
  const queryClient = useQueryClient();

  const [quickBillCart, setQuickBillCart] = useState({}); // { productId: quantity }
  const [quickBillCustomer, setQuickBillCustomer] = useState({ name: '', phone: '', address: 'Walk-in / Store Pickup', city: '', referredBy: '', remarks: '' });
  const [paymentState, setPaymentState] = useState({ status: 'UNPAID', method: 'CASH', details: '' });
  const [isMobileCartView, setIsMobileCartView] = useState(false);
  const [isFetchingCustomer, setIsFetchingCustomer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' or categoryId
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [localCustomItems, setLocalCustomItems] = useState([]); // Array to hold dynamically added custom products
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customItemForm, setCustomItemForm] = useState({ name: '', price: '' });

  const toggleCategory = (catId) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const allProducts = useMemo(() => [...(products || []), ...localCustomItems], [products, localCustomItems]);

  // Group and filter products by category, filtering out the hidden 'custom-items' category
  const categorizedProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    const query = searchQuery.trim().toLowerCase();
    const sortedCategories = [...(categories || [])].sort((a, b) => (a.sequence || 0) - (b.sequence || 0)).filter(c => c.slug !== 'custom-items');

    const groups = sortedCategories.map(cat => {
      let catProducts = products.filter(p => p.categoryId === cat.id);
      catProducts.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

      if (query) {
        catProducts = catProducts.filter(p =>
          p.name.toLowerCase().includes(query) ||
          cat.name.toLowerCase().includes(query)
        );
      }

      return {
        category: cat,
        products: catProducts
      };
    });

    // Handle uncategorized products
    let uncategorized = products.filter(p => !p.categoryId || !categories?.some(c => c.id === p.categoryId));
    if (query) {
      uncategorized = uncategorized.filter(p => p.name.toLowerCase().includes(query));
    }
    if (uncategorized.length > 0) {
      uncategorized.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
      groups.push({
        category: { id: 'uncategorized', name: 'Other Fireworks', sequence: 9999 },
        products: uncategorized
      });
    }

    // Filter by selected category pill
    if (selectedCategory !== 'ALL') {
      return groups.filter(g => g.category.id === selectedCategory);
    }

    // When viewing all, only return groups that have matching products
    return groups.filter(g => g.products.length > 0);
  }, [products, categories, searchQuery, selectedCategory]);

  // Compute total cart quantity per category for badges
  const categoryCartCounts = useMemo(() => {
    const counts = {};
    Object.entries(quickBillCart).forEach(([prodId, qty]) => {
      if (qty > 0) {
        const prod = allProducts.find(p => p.id === prodId);
        const catId = prod?.categoryId || 'uncategorized';
        counts[catId] = (counts[catId] || 0) + qty;
      }
    });
    return counts;
  }, [quickBillCart, allProducts]);
  
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
          referredBy: order.referredBy || '',
          remarks: order.remarks || ''
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
      const p = allProducts.find(prod => prod.id === id);
      return sum + ((p?.price || 0) * qty);
    }, 0);
  }, [quickBillCart, allProducts]);

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
      setQuickBillCustomer({ name: '', phone: '', address: 'Walk-in / Store Pickup', city: '', referredBy: '', remarks: '' });
      setPaymentState({ status: 'UNPAID', method: 'CASH', details: '' });
      setLocalCustomItems([]); // clear custom items mapping on success
      if (onClearPosState) onClearPosState();
    }
  });

  const addCustomItemMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch('/api/pos/custom-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to add custom item');
      return res.json();
    },
    onSuccess: (newProduct) => {
      setLocalCustomItems(prev => [...prev, newProduct]);
      updateQuickBillQty(newProduct.id, 1);
      setIsAddingCustom(false);
      setCustomItemForm({ name: '', price: '' });
      queryClient.invalidateQueries(['products']); // Refresh global product list eventually
    },
    onError: (err) => {
      alert('Error creating custom item: ' + err.message);
    }
  });

  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!customItemForm.name.trim() || !customItemForm.price) return;
    addCustomItemMutation.mutate(customItemForm);
  };

  const handleGenerateQuickBill = (e) => {
    e.preventDefault();
    if (Object.keys(quickBillCart).length === 0) return alert('Cart is empty!');
    if (quickBillTotal < 3000) return alert('Minimum order Rs.3000');
    if (!quickBillCustomer.name.trim()) return alert('Customer Name is mandatory.');
    if (!quickBillCustomer.phone.trim()) return alert('Phone Number is mandatory.');
    if (!quickBillCustomer.city.trim()) return alert('City is mandatory.');
    
    const items = Object.entries(quickBillCart).map(([id, qty]) => {
      const p = allProducts.find(prod => prod.id === id);
      return { productId: id, quantity: qty, price: p.price };
    });
    
    const payload = {
      customerName: quickBillCustomer.name,
      customerPhone: quickBillCustomer.phone,
      shippingAddress: quickBillCustomer.address + `, ${quickBillCustomer.city}`,
      referredBy: quickBillCustomer.referredBy,
      remarks: quickBillCustomer.remarks,
      totalAmount: quickBillTotal,
      paymentStatus: paymentState.status,
      paymentMethod: paymentState.status === 'PAID' ? paymentState.method : null,
      paymentDetails: paymentState.status === 'PAID' ? paymentState.details : null,
      skipWhatsApp: true, // Do not send automated WhatsApp for admin POS bills
      source: 'POS',
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
            background-color: var(--admin-card-bg); 
            padding: 15px 20px; 
            border-bottom: 1px solid var(--admin-border);
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
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
            background-color: var(--admin-card-bg);
            padding: 5px;
            border-radius: 10px;
          }
          .qty-btn { padding: 8px 25px !important; }
        }
      `}</style>
      
      {/* Sticky Top Bar for Mobile */}
      <div className="mobile-top-bar">
        <div>
          <div style={{ color: 'var(--admin-text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Cart Total ({Object.keys(quickBillCart).length} items)</div>
          <div style={{ color: 'var(--admin-accent)', fontWeight: 'bold', fontSize: '1.5rem', lineHeight: '1' }}>₹{quickBillTotal.toLocaleString()}</div>
        </div>
        <button 
          type="button"
          onClick={() => setIsMobileCartView(!isMobileCartView)}
          className={`admin-btn-primary ${isMobileCartView ? 'admin-btn-secondary' : ''}`}
          style={{ padding: '10px 20px', fontSize: '1rem', boxShadow: 'none' }}
        >
          {isMobileCartView ? '← Back to Products' : 'View Cart 🛒'}
        </button>
      </div>

      <div className="pos-container" style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Left Panel: Scrollable Product Matrix */}
        <div className="products-panel admin-card" style={{ flex: '1 1 600px', padding: '20px', maxHeight: '850px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--admin-border)', paddingBottom: '15px', marginBottom: '15px' }}>
            <h2 style={{ color: 'var(--admin-text-primary)', margin: 0, fontSize: '1.6rem' }}>Product Matrix</h2>
            <button 
              type="button"
              onClick={handleRefreshData} 
              disabled={isRefreshing}
              className="admin-btn-primary admin-btn-info"
              style={{ padding: '8px 16px', fontSize: '0.85rem', opacity: isRefreshing ? 0.7 : 1, boxShadow: 'none' }}>
              {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
            </button>
          </div>

          {/* Quick Search Bar */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: 'var(--admin-text-secondary)', fontSize: '1rem', pointerEvents: 'none' }}>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crackers by name or category..."
                className="admin-search-input"
                style={{
                  paddingLeft: '38px',
                  paddingRight: searchQuery ? '36px' : '12px',
                  maxWidth: 'none'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="admin-btn-text"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    fontSize: '1rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>


          {/* Category Filter Pills (Horizontal Scrollable Bar) */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            overflowX: 'auto', 
            paddingBottom: '10px', 
            marginBottom: '18px',
            scrollbarWidth: 'thin'
          }}>
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`admin-pill-btn-sm ${selectedCategory === 'ALL' ? 'active' : ''}`}
            >
              All Categories ({products.length})
            </button>
            {categories.map((cat) => {
              const catProdCount = products.filter(p => p.categoryId === cat.id).length;
              if (catProdCount === 0) return null;
              const cartCount = categoryCartCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.id)}
                  className={`admin-pill-btn-sm ${isSelected ? 'active' : ''}`}
                >
                  <span>{cat.name} ({catProdCount})</span>
                  {cartCount > 0 && (
                    <span className="admin-pill-badge">
                      {cartCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Categorized Products List */}
          {categorizedProducts.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔍</div>
              <p>No products found matching &quot;{searchQuery}&quot;</p>
              <button 
                type="button" 
                onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
                className="admin-btn-primary"
                style={{ marginTop: '10px', padding: '6px 14px', fontSize: '0.85rem' }}
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {categorizedProducts.map((group) => {
                const cat = group.category;
                const isCollapsed = !!collapsedCategories[cat.id];
                const cartCount = categoryCartCounts[cat.id] || 0;

                return (
                  <div 
                    key={cat.id} 
                    style={{ 
                      borderRadius: '12px', 
                      border: '1px solid var(--admin-border)',
                      overflow: 'hidden',
                      backgroundColor: 'var(--admin-bg)'
                    }}
                  >
                    {/* Category Header Bar */}
                    <div
                      onClick={() => toggleCategory(cat.id)}
                      className="category-header-hover"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 16px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        borderBottom: isCollapsed ? 'none' : '1px solid var(--admin-border)',
                        transition: 'background-color 0.15s ease',
                        backgroundColor: 'var(--admin-input-bg)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--admin-accent)', fontSize: '0.85rem', transition: 'transform 0.2s ease', display: 'inline-block', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                          ▼
                        </span>
                        <strong style={{ color: 'var(--admin-text-primary)', fontSize: '1.05rem', letterSpacing: '0.3px' }}>
                          {cat.name}
                        </strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-secondary)', backgroundColor: 'var(--admin-card-bg)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
                          {group.products.length} {group.products.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      {cartCount > 0 && (
                        <span style={{ 
                          backgroundColor: 'rgba(212,175,55,0.15)', 
                          color: 'var(--admin-accent)', 
                          fontSize: '0.78rem', 
                          fontWeight: 'bold', 
                          padding: '3px 10px', 
                          borderRadius: '12px',
                          border: '1px solid rgba(212,175,55,0.4)'
                        }}>
                          {cartCount} in cart
                        </span>
                      )}
                    </div>

                    {/* Category Products Items */}
                    {!isCollapsed && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px' }}>
                        {group.products.map((product, pIndex) => {
                          const qty = quickBillCart[product.id] || 0;
                          const displayNumber = product.sequence || (pIndex + 1);

                          return (
                            <div 
                              key={product.id} 
                              className="product-row" 
                              style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '10px 14px', 
                                backgroundColor: qty > 0 ? 'rgba(212,175,55,0.15)' : 'var(--admin-card-bg)', 
                                borderRadius: '8px', 
                                border: qty > 0 ? '1px solid var(--admin-accent)' : '1px solid var(--admin-border)',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div className="product-info" style={{ flex: 1 }}>
                                <div style={{ color: 'var(--admin-text-primary)', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                  <span style={{ color: 'var(--admin-accent)', minWidth: '24px', fontWeight: 'bold' }}>{displayNumber}.</span>
                                  <span>{product.name}</span>
                                </div>
                                <div style={{ color: 'var(--admin-text-secondary)', fontSize: '0.9rem', marginTop: '3px', paddingLeft: '24px' }}>
                                  <strong style={{ color: 'var(--admin-accent)' }}>₹{product.price}</strong>
                                  {product.basePrice && product.basePrice > product.price && (
                                    <span style={{ textDecoration: 'line-through', marginLeft: '8px', opacity: 0.6, fontSize: '0.8rem' }}>
                                      ₹{product.basePrice}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="qty-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button type="button" className="qty-btn admin-table-action-btn" onClick={() => updateQuickBillQty(product.id, -1)} style={{ padding: '4px 12px', fontSize: '1.2rem', fontWeight: 'bold' }}>-</button>
                                <span style={{ fontSize: '1.15rem', fontWeight: 'bold', color: qty > 0 ? 'var(--admin-accent)' : 'var(--admin-text-primary)', width: '28px', textAlign: 'center' }}>{qty}</span>
                                <button type="button" className="qty-btn admin-table-action-btn" onClick={() => updateQuickBillQty(product.id, 1)} style={{ padding: '4px 12px', fontSize: '1.2rem', fontWeight: 'bold' }}>+</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* Right Panel: Sticky Cart Summary */}
      <div className="cart-panel" style={{ flex: '1 1 350px', position: 'sticky', top: '20px' }}>
        <form onSubmit={handleGenerateQuickBill} className="admin-card" style={{ padding: '30px' }}>
          
          {initialPosState && (
            <div style={{ padding: '10px 15px', backgroundColor: initialPosState.type === 'edit' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(212,175,55,0.2)', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: initialPosState.type === 'edit' ? 'var(--admin-info)' : 'var(--admin-accent)', fontWeight: 'bold' }}>
                {initialPosState.type === 'edit' ? `Editing Order #${formatOrderNumber(initialPosState.order.orderNumber, initialPosState.order.createdAt)}` : 
                 initialPosState.type === 'repeat' ? 'Repeating Order (Same Customer)' : 'Duplicating Order (New Customer)'}
              </span>
              <button type="button" onClick={() => {
                onClearPosState();
                setQuickBillCart({});
                setQuickBillCustomer({ name: '', phone: '', address: 'Walk-in / Store Pickup', city: '', referredBy: '' });
              }} className="admin-btn-text danger" style={{ fontWeight: 'bold' }}>✕ Cancel</button>
            </div>
          )}

          <h2 style={{ color: 'var(--admin-text-primary)', margin: '0 0 25px 0', fontSize: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Cart Summary</span>
            <span style={{ color: 'var(--admin-accent)', fontSize: '1.2rem' }}>{Object.keys(quickBillCart).length} Items</span>
          </h2>
          
          <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
            {Object.entries(quickBillCart).length === 0 ? (
              <div style={{ color: 'var(--admin-text-secondary)', textAlign: 'center', padding: '20px 0' }}>Cart is empty</div>
            ) : (
              Object.entries(quickBillCart).map(([id, qty], index) => {
                const p = allProducts.find(prod => prod.id === id);
                return (
                  <div key={id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--admin-text-secondary)', fontSize: '0.95rem' }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                      <span style={{ color: 'var(--admin-accent)', marginRight: '8px', fontWeight: 'bold' }}>{index + 1}.</span>
                      {p?.name}
                    </span>
                    <span style={{ color: 'var(--admin-text-primary)', fontWeight: 'bold' }}>{qty} x ₹{p?.price}</span>
                  </div>
                )
              })
            )}
          </div>

          {/* Add Custom Item */}
          <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--admin-border)' }}>
            {!isAddingCustom ? (
              <button 
                type="button" 
                onClick={() => setIsAddingCustom(true)}
                className="admin-btn-secondary"
                style={{ border: '1px dashed var(--admin-accent)', color: 'var(--admin-accent)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}
              >
                <span>➕</span> Add Custom Item
              </button>
            ) : (
              <div style={{ backgroundColor: 'var(--admin-input-bg)', padding: '15px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--admin-text-secondary)', fontWeight: 'bold' }}>Custom Item</span>
                  <button type="button" className="admin-btn-text" onClick={() => setIsAddingCustom(false)}>✕</button>
                </div>
                <input 
                  type="text" 
                  placeholder="Item Name (e.g. Extra Sparklers)" 
                  value={customItemForm.name}
                  onChange={e => setCustomItemForm(prev => ({ ...prev, name: e.target.value }))}
                  className="admin-form-input"
                  style={{ marginBottom: '8px', padding: '8px 12px' }} 
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="number" 
                    placeholder="Price (₹)" 
                    value={customItemForm.price}
                    onChange={e => setCustomItemForm(prev => ({ ...prev, price: e.target.value }))}
                    className="admin-form-input"
                    style={{ marginBottom: '0', padding: '8px 12px', flex: 1 }} 
                  />
                  <button 
                    type="button" 
                    onClick={handleAddCustomItem}
                    disabled={addCustomItemMutation.isPending || !customItemForm.name || !customItemForm.price}
                    className="admin-btn-primary"
                    style={{ padding: '8px 16px', flex: 1, opacity: (!customItemForm.name || !customItemForm.price || addCustomItemMutation.isPending) ? 0.5 : 1 }}
                  >
                    {addCustomItemMutation.isPending ? 'Saving...' : 'Add to Bill'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--admin-text-secondary)' }}>Grand Total</span>
            <strong style={{ fontSize: '2.5rem', color: 'var(--admin-accent)', letterSpacing: '-1px' }}>₹{quickBillTotal.toLocaleString()}</strong>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label className="admin-form-label">Customer Name *</label>
            <input type="text" value={quickBillCustomer.name} onChange={e => setQuickBillCustomer({...quickBillCustomer, name: e.target.value})} className="admin-form-input" placeholder="Customer Name" required />
            
            <label className="admin-form-label">Phone Number * {isFetchingCustomer && <span style={{color: 'var(--admin-info)', fontSize: '0.8rem'}}> (Searching...)</span>}</label>
            <input type="text" value={quickBillCustomer.phone} onChange={e => setQuickBillCustomer({...quickBillCustomer, phone: e.target.value})} className="admin-form-input" placeholder="10-digit Mobile Number" required />
            
            <label className="admin-form-label">Address / Notes</label>
            <input type="text" value={quickBillCustomer.address} onChange={e => setQuickBillCustomer({...quickBillCustomer, address: e.target.value})} className="admin-form-input" />

            <label className="admin-form-label">City *</label>
            <input type="text" value={quickBillCustomer.city} onChange={e => setQuickBillCustomer({...quickBillCustomer, city: e.target.value})} className="admin-form-input" placeholder="City Name" required />

            <label className="admin-form-label">Referred By (Optional)</label>
            <select 
              value={quickBillCustomer.referredBy} 
              onChange={e => setQuickBillCustomer({...quickBillCustomer, referredBy: e.target.value})} 
              className="admin-form-input"
            >
              <option value="">-- None / Walk-in --</option>
              {references?.filter(r => r.isActive).map(ref => (
                <option key={ref.id} value={ref.name}>{ref.name} {ref.phone ? `(${ref.phone})` : ''}</option>
              ))}
            </select>

            <label className="admin-form-label">Remarks / Internal Notes</label>
            <textarea 
              value={quickBillCustomer.remarks} 
              onChange={e => setQuickBillCustomer({...quickBillCustomer, remarks: e.target.value})} 
              className="admin-form-input"
              style={{ minHeight: '60px', resize: 'vertical' }}
              placeholder="Any special instructions or internal notes" 
            />

            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.4)', marginBottom: '20px' }}>
              <label className="admin-form-label">Payment Status</label>
              <select 
                value={paymentState.status} 
                onChange={e => setPaymentState({...paymentState, status: e.target.value})} 
                className="admin-form-input"
              >
                <option value="UNPAID">🔴 Unpaid (Estimate / Pending)</option>
                <option value="PAID">🟢 Paid in Full</option>
                <option value="CREDIT">🟣 Credit (Collect Later)</option>
              </select>

              {paymentState.status === 'PAID' && (
                <div className="mobile-stack" style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="admin-form-label">Payment Method</label>
                    <select 
                      value={paymentState.method} 
                      onChange={e => setPaymentState({...paymentState, method: e.target.value})} 
                      className="admin-form-input"
                    >
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="BANK">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-form-label">Reference / Txn ID</label>
                    <input 
                      type="text" 
                      value={paymentState.details} 
                      onChange={e => setPaymentState({...paymentState, details: e.target.value})} 
                      className="admin-form-input" 
                      placeholder="e.g. UTR Number" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className={`admin-btn-primary action-btn ${generateBillMutation.isPending ? 'admin-btn-secondary' : (initialPosState?.type === 'edit' ? 'admin-btn-info' : 'admin-btn-success')}`}
            disabled={generateBillMutation.isPending || Object.keys(quickBillCart).length === 0}
            style={{ 
              width: '100%', 
              padding: '16px', 
              fontSize: '1.2rem'
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
