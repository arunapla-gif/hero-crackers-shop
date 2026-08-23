import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTheme, getStyles } from './theme';

export default function ReportsDashboard({ isDarkMode, products }) {
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme, isDarkMode);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeReport, setActiveReport] = useState('SALES'); // SALES, ITEMS, AGENTS, TRANSPORT, PNL

  // Fetch Report Data
  const { data, isLoading } = useQuery({
    queryKey: ['reports', { startDate, endDate }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const res = await fetch(`/api/reports?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch report data');
      return res.json();
    }
  });

  const orders = data?.orders || [];
  const expenses = data?.expenses || [];

  // Filter out cancelled orders for most revenue metrics
  const validOrders = useMemo(() => orders.filter(o => o.status !== 'CANCELLED'), [orders]);

  // --- AGGREGATIONS ---

  // 1. Sales Summary
  const salesSummary = useMemo(() => {
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const paidRevenue = validOrders.filter(o => o.paymentStatus === 'PAID').reduce((sum, o) => sum + o.totalAmount, 0);
    const unpaidRevenue = validOrders.filter(o => o.paymentStatus !== 'PAID').reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = validOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return { totalRevenue, paidRevenue, unpaidRevenue, totalOrders, avgOrderValue };
  }, [validOrders]);

  // 2. Item-Wise Sales
  const itemWiseSales = useMemo(() => {
    const itemMap = {};
    validOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemMap[item.productId]) {
          const product = products.find(p => p.id === item.productId);
          itemMap[item.productId] = {
            id: item.productId,
            name: product ? product.name : 'Unknown Product',
            qty: 0,
            revenue: 0
          };
        }
        itemMap[item.productId].qty += item.quantity;
        itemMap[item.productId].revenue += (item.price * item.quantity);
      });
    });
    return Object.values(itemMap).sort((a, b) => b.revenue - a.revenue);
  }, [validOrders, products]);

  // 3. Agent Performance
  const agentPerformance = useMemo(() => {
    const agentMap = {};
    validOrders.forEach(order => {
      const agentName = order.referredBy || 'Direct (No Agent)';
      if (!agentMap[agentName]) {
        agentMap[agentName] = { name: agentName, orderCount: 0, totalRevenue: 0 };
      }
      agentMap[agentName].orderCount += 1;
      agentMap[agentName].totalRevenue += order.totalAmount;
    });
    return Object.values(agentMap).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [validOrders]);

  // 4. Transport Logs
  const transportLogs = useMemo(() => {
    const tMap = {};
    const shippedOrders = validOrders.filter(o => o.status === 'SHIPPED' || o.status === 'DELIVERED');
    shippedOrders.forEach(order => {
      const tName = order.transportName || 'Unknown Transport';
      if (!tMap[tName]) {
        tMap[tName] = { name: tName, parcelCount: 0, totalValue: 0 };
      }
      tMap[tName].parcelCount += 1;
      tMap[tName].totalValue += order.totalAmount;
    });
    return Object.values(tMap).sort((a, b) => b.parcelCount - a.parcelCount);
  }, [validOrders]);

  // 5. Profit & Loss (P&L)
  const pnl = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = salesSummary.paidRevenue - totalExpenses; // Usually calculate based on actual money received
    
    // Group expenses by category
    const expenseByCategory = {};
    expenses.forEach(e => {
      if (!expenseByCategory[e.category]) expenseByCategory[e.category] = 0;
      expenseByCategory[e.category] += e.amount;
    });

    return { totalExpenses, netProfit, expenseByCategory: Object.entries(expenseByCategory).sort((a,b) => b[1] - a[1]) };
  }, [expenses, salesSummary.paidRevenue]);

  // Utility to set date ranges quickly
  const setQuickDate = (daysAgo) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - daysAgo);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  const exportCSV = (dataArray, filename, headers, rowMapper) => {
    const rows = dataArray.map(rowMapper);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${startDate || 'ALL'}_to_${endDate || 'ALL'}.csv`;
    link.click();
  };

  const handleExport = () => {
    if (activeReport === 'ITEMS') {
      exportCSV(itemWiseSales, 'item_sales', ['Product', 'Qty Sold', 'Revenue'], r => [`"${r.name}"`, r.qty, r.revenue]);
    } else if (activeReport === 'AGENTS') {
      exportCSV(agentPerformance, 'agent_performance', ['Agent Name', 'Orders', 'Revenue'], r => [`"${r.name}"`, r.orderCount, r.totalRevenue]);
    } else if (activeReport === 'TRANSPORT') {
      exportCSV(transportLogs, 'transport_logs', ['Transport', 'Parcels', 'Total Value'], r => [`"${r.name}"`, r.parcelCount, r.totalValue]);
    }
  };

  const ReportTabBtn = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveReport(tab)}
      style={{
        padding: '12px 20px',
        backgroundColor: activeReport === tab ? theme.cardBg : 'transparent',
        color: activeReport === tab ? theme.accent : theme.textSecondary,
        border: 'none',
        borderBottom: activeReport === tab ? `3px solid ${theme.accent}` : '3px solid transparent',
        cursor: 'pointer',
        fontSize: '1.05rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s'
      }}
    >
      <span>{icon}</span> {label}
    </button>
  );

  return (
    <div>
      {/* Filters Header */}
      <div style={{ ...styles.cardStyle, marginBottom: '25px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: theme.textSecondary, marginBottom: '5px', fontWeight: 'bold' }}>START DATE</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.dateInputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: theme.textSecondary, marginBottom: '5px', fontWeight: 'bold' }}>END DATE</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.dateInputStyle} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="action-btn" onClick={setToday} style={{ padding: '10px 15px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.textPrimary, borderRadius: '6px', cursor: 'pointer' }}>Today</button>
            <button className="action-btn" onClick={() => setQuickDate(7)} style={{ padding: '10px 15px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.textPrimary, borderRadius: '6px', cursor: 'pointer' }}>Last 7 Days</button>
            <button className="action-btn" onClick={() => setQuickDate(30)} style={{ padding: '10px 15px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.textPrimary, borderRadius: '6px', cursor: 'pointer' }}>Last 30 Days</button>
            {(startDate || endDate) && (
               <button className="action-btn" onClick={() => { setStartDate(''); setEndDate(''); }} style={{ padding: '10px 15px', backgroundColor: 'transparent', border: 'none', color: theme.danger, cursor: 'pointer', fontWeight: 'bold' }}>✕ Clear</button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '50px', textAlign: 'center', color: theme.textSecondary }}>Crunching numbers...</div>
      ) : (
        <>
          {/* Sub Navigation */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: `1px solid ${theme.border}`, marginBottom: '25px', overflowX: 'auto' }}>
            <ReportTabBtn tab="SALES" label="Sales Summary" icon="📊" />
            <ReportTabBtn tab="ITEMS" label="Item Performance" icon="📦" />
            <ReportTabBtn tab="AGENTS" label="Agent Performance" icon="🤝" />
            <ReportTabBtn tab="TRANSPORT" label="Transport Logs" icon="🚚" />
            <ReportTabBtn tab="PNL" label="Profit & Loss" icon="💰" />
          </div>

          {/* Tab Content */}
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            
            {/* 1. SALES SUMMARY */}
            {activeReport === 'SALES' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div style={{ ...styles.cardStyle, padding: '30px', background: `linear-gradient(135deg, ${theme.cardBg} 0%, ${theme.accent}15 100%)`, border: `1px solid ${theme.accent}40` }}>
                  <h4 style={{ margin: '0 0 10px 0', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Booked Revenue</h4>
                  <div style={{ fontSize: '3rem', fontWeight: '800', color: theme.accent }}>₹{salesSummary.totalRevenue.toLocaleString()}</div>
                  <p style={{ margin: '10px 0 0 0', color: theme.textSecondary }}>From {salesSummary.totalOrders} valid orders</p>
                </div>
                
                <div style={{ ...styles.cardStyle, padding: '30px', background: `linear-gradient(135deg, ${theme.cardBg} 0%, ${theme.success}15 100%)`, border: `1px solid ${theme.success}40` }}>
                  <h4 style={{ margin: '0 0 10px 0', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '1px' }}>Cash Collected (Paid)</h4>
                  <div style={{ fontSize: '3rem', fontWeight: '800', color: theme.success }}>₹{salesSummary.paidRevenue.toLocaleString()}</div>
                  <p style={{ margin: '10px 0 0 0', color: theme.textSecondary }}>Actual money received</p>
                </div>
                
                <div style={{ ...styles.cardStyle, padding: '30px', background: `linear-gradient(135deg, ${theme.cardBg} 0%, ${theme.danger}15 100%)`, border: `1px solid ${theme.danger}40` }}>
                  <h4 style={{ margin: '0 0 10px 0', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '1px' }}>Unpaid / Credit</h4>
                  <div style={{ fontSize: '3rem', fontWeight: '800', color: theme.danger }}>₹{salesSummary.unpaidRevenue.toLocaleString()}</div>
                  <p style={{ margin: '10px 0 0 0', color: theme.textSecondary }}>Pending collection</p>
                </div>
                
                <div style={{ ...styles.cardStyle, padding: '30px', border: `1px solid ${theme.border}` }}>
                  <h4 style={{ margin: '0 0 10px 0', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '1px' }}>Avg Order Value</h4>
                  <div style={{ fontSize: '3rem', fontWeight: '800', color: theme.textPrimary }}>₹{Math.round(salesSummary.avgOrderValue).toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* 2. ITEM WISE SALES */}
            {activeReport === 'ITEMS' && (
              <div style={styles.cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: theme.textPrimary, margin: 0 }}>Product Sales Leaderboard</h3>
                  <button onClick={handleExport} className="action-btn" style={{ ...styles.btnPrimary, backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, boxShadow: 'none' }}>⬇️ Export CSV</button>
                </div>
                <div className="table-responsive" style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: theme.cardBg }}>
                      <tr>
                        <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Rank</th>
                        <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Product Name</th>
                        <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}`, textAlign: 'center' }}>Total Qty Sold</th>
                        <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}`, textAlign: 'right' }}>Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemWiseSales.map((item, idx) => (
                        <tr key={item.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                          <td style={{ padding: '15px', color: theme.textSecondary }}>#{idx + 1}</td>
                          <td style={{ padding: '15px', color: theme.textPrimary, fontWeight: 'bold' }}>{item.name}</td>
                          <td style={{ padding: '15px', color: theme.accent, textAlign: 'center', fontWeight: 'bold' }}>{item.qty} boxes</td>
                          <td style={{ padding: '15px', color: theme.success, textAlign: 'right', fontWeight: 'bold' }}>₹{item.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. AGENT PERFORMANCE */}
            {activeReport === 'AGENTS' && (
              <div style={styles.cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: theme.textPrimary, margin: 0 }}>Agent / Reference Performance</h3>
                  <button onClick={handleExport} className="action-btn" style={{ ...styles.btnPrimary, backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, boxShadow: 'none' }}>⬇️ Export CSV</button>
                </div>
                <div className="table-responsive" style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: theme.cardBg }}>
                      <tr>
                        <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Rank</th>
                        <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Agent Name</th>
                        <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}`, textAlign: 'center' }}>Orders Generated</th>
                        <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}`, textAlign: 'right' }}>Total Revenue Brought</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentPerformance.map((agent, idx) => (
                        <tr key={agent.name} style={{ borderBottom: `1px solid ${theme.border}` }}>
                          <td style={{ padding: '15px', color: theme.textSecondary }}>#{idx + 1}</td>
                          <td style={{ padding: '15px', color: theme.textPrimary, fontWeight: 'bold' }}>{agent.name}</td>
                          <td style={{ padding: '15px', color: theme.textPrimary, textAlign: 'center' }}>{agent.orderCount}</td>
                          <td style={{ padding: '15px', color: theme.accent, textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{agent.totalRevenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. TRANSPORT LOGS */}
            {activeReport === 'TRANSPORT' && (
              <div style={styles.cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: theme.textPrimary, margin: 0 }}>Transport & Logistics</h3>
                  <button onClick={handleExport} className="action-btn" style={{ ...styles.btnPrimary, backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, boxShadow: 'none' }}>⬇️ Export CSV</button>
                </div>
                <div className="table-responsive" style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: theme.cardBg }}>
                      <tr>
                        <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Transport Agency</th>
                        <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}`, textAlign: 'center' }}>Parcels Dispatched</th>
                        <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}`, textAlign: 'right' }}>Total Order Value Shipped</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transportLogs.map((t) => (
                        <tr key={t.name} style={{ borderBottom: `1px solid ${theme.border}` }}>
                          <td style={{ padding: '15px', color: theme.textPrimary, fontWeight: 'bold' }}>{t.name}</td>
                          <td style={{ padding: '15px', color: theme.info, textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>{t.parcelCount}</td>
                          <td style={{ padding: '15px', color: theme.textSecondary, textAlign: 'right' }}>₹{t.totalValue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. PROFIT AND LOSS */}
            {activeReport === 'PNL' && (
              <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px', ...styles.cardStyle }}>
                  <h3 style={{ color: theme.textPrimary, margin: '0 0 25px 0' }}>P&L Summary (Cash Basis)</h3>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.1rem' }}>
                    <span style={{ color: theme.textSecondary }}>Total Cash In (Paid Orders):</span>
                    <strong style={{ color: theme.success }}>₹{salesSummary.paidRevenue.toLocaleString()}</strong>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.1rem', paddingBottom: '15px', borderBottom: `1px solid ${theme.border}` }}>
                    <span style={{ color: theme.textSecondary }}>Total Cash Out (Expenses):</span>
                    <strong style={{ color: theme.danger }}>- ₹{pnl.totalExpenses.toLocaleString()}</strong>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem' }}>
                    <span style={{ color: theme.textPrimary, fontWeight: 'bold' }}>Net Cash Flow:</span>
                    <strong style={{ color: pnl.netProfit >= 0 ? theme.success : theme.danger }}>
                      ₹{pnl.netProfit.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div style={{ flex: '2 1 400px', ...styles.cardStyle }}>
                  <h3 style={{ color: theme.textPrimary, margin: '0 0 25px 0' }}>Expense Breakdown</h3>
                  {pnl.expenseByCategory.length === 0 ? (
                    <p style={{ color: theme.textSecondary }}>No expenses logged for this period.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {pnl.expenseByCategory.map(([cat, amount]) => (
                        <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: theme.textPrimary, fontWeight: 'bold' }}>{cat}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '60%' }}>
                            <div style={{ height: '8px', backgroundColor: theme.danger, borderRadius: '4px', width: `${Math.max(5, (amount / pnl.totalExpenses) * 100)}%` }}></div>
                            <span style={{ color: theme.textSecondary, minWidth: '80px', textAlign: 'right' }}>₹{amount.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
}
