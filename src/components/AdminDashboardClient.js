'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OrderManager from './admin/OrderManager';
import QuickBillPOS from './admin/QuickBillPOS';
import MasterDataPanel from './admin/MasterDataPanel';
import ExpenseTracker from './admin/ExpenseTracker';
import ReportsDashboard from './admin/ReportsDashboard';
import CustomerDirectory from './admin/CustomerDirectory';
import './admin/admin.css';

export default function AdminDashboardClient({ initialOrders, initialProducts, categories: initialCategories, initialGodowns, initialReferences, initialTransports, initialExpenses, initialCustomers }) {
  // Master states used across tabs
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [godowns, setGodowns] = useState(initialGodowns);
  const [references, setReferences] = useState(initialReferences || []);
  const [transports, setTransports] = useState(initialTransports || []);
  const [expenses, setExpenses] = useState(initialExpenses || []);
  
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'quickbill', 'masters', 'accounts'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialPosState, setInitialPosState] = useState(null); // { type: 'edit'|'duplicate', order: {} }
  const router = useRouter();

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

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/admin/login';
      }
    } catch (err) {
      console.error('Failed to logout', err);
    }
  };

  const TabButton = ({ active, onClick, children }) => (
    <button 
      className={`admin-tab-btn ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <div className={`admin-theme ${isDarkMode ? 'dark-mode' : ''}`}>
      <style dangerouslySetInnerHTML={{__html: `
        /* Mobile Responsive Utilities */
        @media (max-width: 768px) {
          .admin-container { padding: 20px 10px !important; }
          .header-flex { flex-direction: column !important; align-items: flex-start !important; gap: 20px !important; }
          .header-title { font-size: 2.2rem !important; }
          .admin-tab-btn { padding: 10px 15px !important; font-size: 1rem !important; flex: 1 1 auto; text-align: center; }
          .table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .table-responsive table { min-width: 800px; }
          .mobile-stack { flex-direction: column !important; }
          .mobile-stack > * { width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }
          .mobile-hide { display: none !important; }
          .filter-bar { flex-direction: column !important; align-items: stretch !important; }
          .filter-bar > * { width: 100% !important; }
        }
      `}} />

      <div className="admin-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Header */}
        <div className="header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 className="header-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: 'var(--admin-text-primary)', margin: '0 0 10px 0', transition: 'color 0.3s' }}>
              Command Center
            </h1>
            <p style={{ color: 'var(--admin-text-secondary)', margin: 0, fontSize: '1.1rem' }}>Manage orders, inventory, and masters seamlessly.</p>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button 
              className="action-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{ 
                padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold',
                backgroundColor: 'var(--admin-card-bg)', color: 'var(--admin-text-primary)', border: `1px solid var(--admin-border)`,
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            <button 
              className="action-btn"
              onClick={handleLogout}
              style={{ 
                padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold',
                backgroundColor: '#ef4444', color: 'white', border: 'none',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
        
        {/* Main Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: `1px solid var(--admin-border)`, flexWrap: 'wrap' }}>
          <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>Orders & Analytics</TabButton>
          <TabButton active={activeTab === 'quickbill'} onClick={() => setActiveTab('quickbill')}>⚡ Quick Bill (POS)</TabButton>
          <TabButton active={activeTab === 'masters'} onClick={() => setActiveTab('masters')}>Data Masters</TabButton>
          <TabButton active={activeTab === 'customers'} onClick={() => setActiveTab('customers')}>👥 Customers</TabButton>
          <TabButton active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')}>Accounts & Expenses</TabButton>
          <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')}>📈 Reports</TabButton>
        </div>
        
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <OrderManager 
            isDarkMode={isDarkMode} 
            products={products}
            transports={transports}
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
            references={references}
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
            references={references}
            setReferences={setReferences}
            transports={transports}
            setTransports={setTransports}
          />
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <ExpenseTracker 
            isDarkMode={isDarkMode}
            expenses={expenses}
            setExpenses={setExpenses}
          />
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <ReportsDashboard 
            isDarkMode={isDarkMode}
            products={products}
          />
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <CustomerDirectory 
            isDarkMode={isDarkMode}
            customers={initialCustomers}
            orders={initialOrders}
          />
        )}
      </div>
    </div>
  );
}
