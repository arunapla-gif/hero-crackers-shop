'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import './admin/admin.css';

const TabLoadingSkeleton = ({ title = 'Loading panel...' }) => (
  <div className="admin-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>
    <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }} />
    <div style={{ fontSize: '1rem', fontWeight: 500 }}>{title}</div>
  </div>
);

const OrderManager = dynamic(() => import('./admin/OrderManager'), {
  ssr: false,
  loading: () => <TabLoadingSkeleton title="Loading Orders & Analytics..." />
});
const QuickBillPOS = dynamic(() => import('./admin/QuickBillPOS'), {
  ssr: false,
  loading: () => <TabLoadingSkeleton title="Loading Quick Bill POS..." />
});
const MasterDataPanel = dynamic(() => import('./admin/MasterDataPanel'), {
  ssr: false,
  loading: () => <TabLoadingSkeleton title="Loading Master Data..." />
});
const ExpenseTracker = dynamic(() => import('./admin/ExpenseTracker'), {
  ssr: false,
  loading: () => <TabLoadingSkeleton title="Loading Accounts & Expenses..." />
});
const ReportsDashboard = dynamic(() => import('./admin/ReportsDashboard'), {
  ssr: false,
  loading: () => <TabLoadingSkeleton title="Loading Reports Dashboard..." />
});
const CustomerDirectory = dynamic(() => import('./admin/CustomerDirectory'), {
  ssr: false,
  loading: () => <TabLoadingSkeleton title="Loading Customer Directory..." />
});

export default function AdminDashboardClient({ initialProducts, categories: initialCategories, initialGodowns, initialReferences, initialTransports, initialExpenses, initialCustomers }) {
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

      <div className="admin-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 20px' }}>
        
        {/* Header */}
        <div className="header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h1 className="header-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--admin-text-primary)', margin: '0 0 2px 0', transition: 'color 0.3s' }}>
              Command Center
            </h1>
            <p style={{ color: 'var(--admin-text-secondary)', margin: 0, fontSize: '0.88rem' }}>Manage orders, inventory, and masters seamlessly.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              className="action-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{ 
                padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
                backgroundColor: 'var(--admin-card-bg)', color: 'var(--admin-text-primary)', border: `1px solid var(--admin-border)`,
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button 
              className="action-btn"
              onClick={handleLogout}
              style={{ 
                padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
                backgroundColor: '#ef4444', color: 'white', border: 'none',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
        
        {/* Main Navigation */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', borderBottom: `1px solid var(--admin-border)`, flexWrap: 'wrap' }}>
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
          />
        )}
      </div>
    </div>
  );
}
