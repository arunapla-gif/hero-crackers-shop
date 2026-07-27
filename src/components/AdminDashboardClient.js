'use client';

import { useState } from 'react';
import OrderManager from './admin/OrderManager';
import QuickBillPOS from './admin/QuickBillPOS';
import MasterDataPanel from './admin/MasterDataPanel';
import { getTheme, getStyles } from './admin/theme';

export default function AdminDashboardClient({ initialOrders, initialProducts, categories: initialCategories, initialGodowns }) {
  // Master states used across tabs
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [godowns, setGodowns] = useState(initialGodowns);
  
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'quickbill', 'masters'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialPosState, setInitialPosState] = useState(null); // { type: 'edit'|'duplicate', order: {} }

  const theme = getTheme(isDarkMode);

  const handleEditOrder = (order) => {
    setInitialPosState({ type: 'edit', order });
    setActiveTab('quickbill');
  };

  const handleDuplicateOrder = (order) => {
    setInitialPosState({ type: 'duplicate', order });
    setActiveTab('quickbill');
  };

  const handleRepeatOrder = (order) => {
    setInitialPosState({ type: 'repeat', order });
    setActiveTab('quickbill');
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      if (prodRes.ok) {
        const newProducts = await prodRes.json();
        setProducts(newProducts.sort((a, b) => (a.sequence || 0) - (b.sequence || 0) || a.name.localeCompare(b.name)));
      }
      if (catRes.ok) {
        const newCategories = await catRes.json();
        setCategories(newCategories);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const TabButton = ({ active, onClick, children }) => (
    <button 
      className="tab-btn"
      onClick={onClick}
      style={{
        padding: '14px 28px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        backgroundColor: active ? theme.cardBg : 'transparent',
        color: active ? theme.accent : theme.textSecondary,
        border: 'none',
        borderBottom: active ? `3px solid ${theme.accent}` : '3px solid transparent',
        transition: 'all 0.3s',
        outline: 'none'
      }}
      onMouseOver={e => !active && (e.target.style.color = theme.textPrimary)}
      onMouseOut={e => !active && (e.target.style.color = theme.textSecondary)}
    >
      {children}
    </button>
  );

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '40px 20px', fontFamily: '"Inter", sans-serif', transition: 'background-color 0.3s' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .order-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,${isDarkMode ? '0.4' : '0.1'}) !important; }
        .search-input:focus, .date-input:focus { border-color: ${theme.accent} !important; box-shadow: 0 0 0 3px ${theme.accent}20 !important; }
        .custom-checkbox { width: 22px; height: 22px; cursor: pointer; accent-color: ${theme.accent}; }
        
        button { transition: all 0.2s ease-in-out !important; }
        .action-btn { position: relative; overflow: hidden; }
        .action-btn:hover:not(:disabled) {
           transform: scale(1.03) translateY(-2px) !important;
           filter: brightness(1.2) !important;
           box-shadow: 0 8px 20px rgba(0,0,0,0.3) !important;
           opacity: 0.95;
        }
        .action-btn:active:not(:disabled) {
           transform: scale(0.97) translateY(0) !important;
           filter: brightness(0.9) !important;
        }
        button:disabled { opacity: 0.5 !important; cursor: not-allowed !important; filter: grayscale(1) !important; }
        
        .qty-btn:hover { background-color: ${theme.accent} !important; color: white !important; border-color: ${theme.accent} !important; transform: scale(1.1); }
        .qty-btn:active { transform: scale(0.95) !important; }
        
        .filter-btn:hover { background-color: ${theme.cardBg} !important; opacity: 0.8 !important; transform: translateY(-1px); }
      `}} />

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: theme.textPrimary, margin: '0 0 10px 0', transition: 'color 0.3s' }}>
              Command Center
            </h1>
            <p style={{ color: theme.textSecondary, margin: 0, fontSize: '1.1rem' }}>Manage orders, inventory, and masters seamlessly.</p>
          </div>
          <button 
            className="action-btn"
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{ 
              padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold',
              backgroundColor: theme.cardBg, color: theme.textPrimary, border: `1px solid ${theme.border}`,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
        
        {/* Main Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: `1px solid ${theme.border}`, flexWrap: 'wrap' }}>
          <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>Orders & Analytics</TabButton>
          <TabButton active={activeTab === 'quickbill'} onClick={() => setActiveTab('quickbill')}>⚡ Quick Bill (POS)</TabButton>
          <TabButton active={activeTab === 'masters'} onClick={() => setActiveTab('masters')}>Data Masters</TabButton>
        </div>
        
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <OrderManager 
            isDarkMode={isDarkMode} 
            products={products}
            onEditOrder={handleEditOrder}
            onDuplicateOrder={handleDuplicateOrder}
            onRepeatOrder={handleRepeatOrder}
          />
        )}

        {/* Quick Bill (POS) Tab */}
        {activeTab === 'quickbill' && (
          <QuickBillPOS 
            isDarkMode={isDarkMode}
            products={products}
            categories={categories}
            handleRefreshData={handleRefreshData}
            isRefreshing={isRefreshing}
            initialPosState={initialPosState}
            onClearPosState={() => setInitialPosState(null)}
          />
        )}

        {/* Masters Tab */}
        {activeTab === 'masters' && (
          <MasterDataPanel 
            isDarkMode={isDarkMode}
            products={products}
            setProducts={setProducts}
            categories={categories}
            setCategories={setCategories}
            godowns={godowns}
            setGodowns={setGodowns}
          />
        )}
      </div>
    </div>
  );
}
