import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function ReportsDashboard({ products }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeReport, setActiveReport] = useState('SALES'); // SALES, ITEMS, AGENTS, TRANSPORT, PNL
  const [selectedAgentDetails, setSelectedAgentDetails] = useState(null);
  const [loadingAction, setLoadingAction] = useState({ id: null, action: null });

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

  const salesSummary = data?.salesSummary || { totalRevenue: 0, paidRevenue: 0, unpaidRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
  const itemWiseSales = data?.itemWiseSales || [];
  const agentPerformance = data?.agentPerformance || [];
  const transportLogs = data?.transportLogs || [];
  const pnl = data?.pnl || { totalExpenses: 0, netProfit: 0, expenseByCategory: [] };

  // Utility to set date ranges quickly
  const setQuickDate = (daysAgo) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - daysAgo);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const handleWhatsAppAgentReport = async (agent) => {
    setLoadingAction({ id: agent.name, action: 'whatsapp' });
    try {
      const res = await fetch('/api/reports/agent-pdf/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: agent.name,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          totalValue: agent.totalRevenue
        })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        let errMsg = errorData.error || 'Failed to trigger WhatsApp message';
        throw new Error(errMsg);
      }
      alert(`Report sent to Admin WhatsApp successfully!`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoadingAction({ id: null, action: null });
    }
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
        backgroundColor: activeReport === tab ? 'var(--admin-card-bg)' : 'transparent',
        color: activeReport === tab ? 'var(--admin-accent)' : 'var(--admin-text-secondary)',
        border: 'none',
        borderBottom: activeReport === tab ? '3px solid var(--admin-accent)' : '3px solid transparent',
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
      <div className="admin-card" style={{ marginBottom: '25px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
          <div>
            <label className="admin-form-label">START DATE</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="admin-form-input" style={{ padding: '10px', minWidth: '150px' }} />
          </div>
          <div>
            <label className="admin-form-label">END DATE</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="admin-form-input" style={{ padding: '10px', minWidth: '150px' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="admin-table-action-btn" onClick={setToday}>Today</button>
            <button className="admin-table-action-btn" onClick={() => setQuickDate(7)}>Last 7 Days</button>
            <button className="admin-table-action-btn" onClick={() => setQuickDate(30)}>Last 30 Days</button>
            {startDate && endDate && (
              <div style={{ alignSelf: 'flex-end', paddingBottom: '10px' }}>
                <button type="button" className="admin-btn-text danger" style={{ fontWeight: 'bold' }} onClick={() => { setStartDate(''); setEndDate(''); }}>✕ Clear</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '50px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>Crunching numbers...</div>
      ) : (
        <>
          {/* Sub Navigation */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--admin-border)', marginBottom: '25px', overflowX: 'auto' }}>
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
                <div className="admin-card" style={{ padding: '30px', background: 'linear-gradient(135deg, var(--admin-card-bg) 0%, rgba(99, 102, 241, 0.15) 100%)', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Booked Revenue</h4>
                  <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--admin-accent)' }}>₹{salesSummary.totalRevenue.toLocaleString()}</div>
                  <p style={{ margin: '10px 0 0 0', color: 'var(--admin-text-secondary)' }}>From {salesSummary.totalOrders} valid orders</p>
                </div>
                
                <div className="admin-card" style={{ padding: '30px', background: 'linear-gradient(135deg, var(--admin-card-bg) 0%, rgba(16, 185, 129, 0.15) 100%)', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Cash Collected (Paid)</h4>
                  <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--admin-success)' }}>₹{salesSummary.paidRevenue.toLocaleString()}</div>
                  <p style={{ margin: '10px 0 0 0', color: 'var(--admin-text-secondary)' }}>Actual money received</p>
                </div>
                
                <div className="admin-card" style={{ padding: '30px', background: 'linear-gradient(135deg, var(--admin-card-bg) 0%, rgba(239, 68, 68, 0.15) 100%)', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Unpaid / Credit</h4>
                  <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--admin-danger)' }}>₹{salesSummary.unpaidRevenue.toLocaleString()}</div>
                  <p style={{ margin: '10px 0 0 0', color: 'var(--admin-text-secondary)' }}>Pending collection</p>
                </div>
                
                <div className="admin-card" style={{ padding: '30px', border: '1px solid var(--admin-border)' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Avg Order Value</h4>
                  <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--admin-text-primary)' }}>₹{Math.round(salesSummary.avgOrderValue).toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* 2. ITEM WISE SALES */}
            {activeReport === 'ITEMS' && (
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: 'var(--admin-text-primary)', margin: 0 }}>Product Sales Leaderboard</h3>
                  <button onClick={handleExport} className="admin-btn-secondary">⬇️ Export CSV</button>
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead className="admin-table-thead">
                      <tr>
                        <th className="admin-table-th">Rank</th>
                        <th className="admin-table-th">Product Name</th>
                        <th className="admin-table-th" style={{ textAlign: 'center' }}>Total Qty Sold</th>
                        <th className="admin-table-th" style={{ textAlign: 'right' }}>Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemWiseSales.map((item, idx) => (
                        <tr key={item.id} className="admin-table-tr">
                          <td className="admin-table-td" style={{ color: 'var(--admin-text-secondary)' }}>#{idx + 1}</td>
                          <td className="admin-table-td" style={{ color: 'var(--admin-text-primary)', fontWeight: 'bold' }}>{item.name}</td>
                          <td className="admin-table-td" style={{ color: 'var(--admin-accent)', textAlign: 'center', fontWeight: 'bold' }}>{item.qty} boxes</td>
                          <td className="admin-table-td" style={{ color: 'var(--admin-success)', textAlign: 'right', fontWeight: 'bold' }}>₹{item.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. AGENT PERFORMANCE */}
            {activeReport === 'AGENTS' && (
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: 'var(--admin-text-primary)', margin: 0 }}>Agent / Reference Performance</h3>
                  <button onClick={handleExport} className="admin-btn-secondary">⬇️ Export CSV</button>
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead className="admin-table-thead">
                      <tr>
                        <th className="admin-table-th">Rank</th>
                        <th className="admin-table-th">Agent Name</th>
                        <th className="admin-table-th" style={{ textAlign: 'center' }}>Orders Generated</th>
                        <th className="admin-table-th" style={{ textAlign: 'right' }}>Total Revenue Brought</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentPerformance.map((agent, idx) => (
                        <tr key={agent.name} className="admin-table-tr">
                          <td className="admin-table-td" style={{ color: 'var(--admin-text-secondary)' }}>#{idx + 1}</td>
                          <td 
                            className="admin-table-td"
                            style={{ color: 'var(--admin-primary)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => setSelectedAgentDetails(agent)}
                            title="Click to view detailed orders"
                          >
                            {agent.name}
                          </td>
                          <td className="admin-table-td" style={{ color: 'var(--admin-text-primary)', textAlign: 'center' }}>{agent.orderCount}</td>
                          <td className="admin-table-td" style={{ color: 'var(--admin-accent)', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{agent.totalRevenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedAgentDetails && (
                  <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'var(--admin-input-bg)', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                      <h4 style={{ margin: 0, color: 'var(--admin-text-primary)' }}>Agent Breakdown: {selectedAgentDetails.name}</h4>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => handleWhatsAppAgentReport(selectedAgentDetails)}
                          disabled={loadingAction.id === selectedAgentDetails.name && loadingAction.action === 'whatsapp'}
                          className="admin-btn-primary action-btn"
                          style={{ padding: '5px 15px', fontSize: '0.85rem' }}
                        >
                          {loadingAction.id === selectedAgentDetails.name ? 'Sending...' : '📲 Send Report to Admin'}
                        </button>
                        <button type="button" onClick={() => setSelectedAgentDetails(null)} className="admin-btn-text danger" style={{ fontWeight: 'bold' }}>Close ✕</button>
                      </div>
                    </div>
                    <div className="admin-table-wrapper" style={{ borderRadius: '4px' }}>
                      <table className="admin-table" style={{ fontSize: '0.9rem' }}>
                        <thead className="admin-table-thead">
                          <tr>
                            <th className="admin-table-th" style={{ padding: '10px' }}>S.No</th>
                            <th className="admin-table-th" style={{ padding: '10px' }}>Order No</th>
                            <th className="admin-table-th" style={{ padding: '10px' }}>Customer Name</th>
                            <th className="admin-table-th" style={{ padding: '10px' }}>City</th>
                            <th className="admin-table-th" style={{ padding: '10px' }}>Status</th>
                            <th className="admin-table-th" style={{ padding: '10px', textAlign: 'right' }}>Order Value</th>
                            <th className="admin-table-th" style={{ padding: '10px' }}>Notes/Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAgentDetails.orders.map((o, i) => {
                            let city = '';
                            if (o.shippingAddress) {
                              const parts = o.shippingAddress.split(',').map(s => s.trim());
                              if (parts.length >= 3) city = parts[parts.length - 2];
                              else if (parts.length > 0) city = parts[parts.length - 1];
                            }
                            return (
                              <tr key={o.id} className="admin-table-tr">
                                <td className="admin-table-td" style={{ padding: '10px', color: 'var(--admin-text-secondary)' }}>{i + 1}</td>
                                <td className="admin-table-td" style={{ padding: '10px', color: 'var(--admin-text-primary)' }}>order-2026-27-{String(o.orderNumber).padStart(5, '0')}</td>
                                <td className="admin-table-td" style={{ padding: '10px', color: 'var(--admin-text-primary)', fontWeight: 'bold' }}>{o.user?.name || o.customerName || 'Walk-in'}</td>
                                <td className="admin-table-td" style={{ padding: '10px', color: 'var(--admin-text-secondary)' }}>{city || '-'}</td>
                                <td className="admin-table-td" style={{ padding: '10px' }}>
                                  <span className={`admin-order-badge ${o.status.toLowerCase()}`}>
                                    {o.status}
                                  </span>
                                </td>
                                <td className="admin-table-td" style={{ padding: '10px', color: 'var(--admin-text-primary)', textAlign: 'right', fontWeight: 'bold' }}>₹{o.totalAmount.toLocaleString()}</td>
                                <td className="admin-table-td" style={{ padding: '10px', color: 'var(--admin-text-secondary)' }}>{o.remarks || '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. TRANSPORT LOGS */}
            {activeReport === 'TRANSPORT' && (
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: 'var(--admin-text-primary)', margin: 0 }}>Transport & Logistics</h3>
                  <button onClick={handleExport} className="admin-btn-secondary">⬇️ Export CSV</button>
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead className="admin-table-thead">
                      <tr>
                        <th className="admin-table-th">Transport Agency</th>
                        <th className="admin-table-th" style={{ textAlign: 'center' }}>Parcels Dispatched</th>
                        <th className="admin-table-th" style={{ textAlign: 'right' }}>Total Order Value Shipped</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transportLogs.map((t) => (
                        <tr key={t.name} className="admin-table-tr">
                          <td className="admin-table-td" style={{ color: 'var(--admin-text-primary)', fontWeight: 'bold' }}>{t.name}</td>
                          <td className="admin-table-td" style={{ color: 'var(--admin-info)', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>{t.parcelCount}</td>
                          <td className="admin-table-td" style={{ color: 'var(--admin-text-secondary)', textAlign: 'right' }}>₹{t.totalValue.toLocaleString()}</td>
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
                <div className="admin-card" style={{ flex: '1 1 300px' }}>
                  <h3 style={{ color: 'var(--admin-text-primary)', margin: '0 0 25px 0' }}>P&L Summary (Cash Basis)</h3>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.1rem' }}>
                    <span style={{ color: 'var(--admin-text-secondary)' }}>Total Cash In (Paid Orders):</span>
                    <strong style={{ color: 'var(--admin-success)' }}>₹{salesSummary.paidRevenue.toLocaleString()}</strong>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.1rem', paddingBottom: '15px', borderBottom: '1px solid var(--admin-border)' }}>
                    <span style={{ color: 'var(--admin-text-secondary)' }}>Total Cash Out (Expenses):</span>
                    <strong style={{ color: 'var(--admin-danger)' }}>- ₹{pnl.totalExpenses.toLocaleString()}</strong>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem' }}>
                    <span style={{ color: 'var(--admin-text-primary)', fontWeight: 'bold' }}>Net Cash Flow:</span>
                    <strong style={{ color: pnl.netProfit >= 0 ? 'var(--admin-success)' : 'var(--admin-danger)' }}>
                      ₹{pnl.netProfit.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="admin-card" style={{ flex: '2 1 400px' }}>
                  <h3 style={{ color: 'var(--admin-text-primary)', margin: '0 0 25px 0' }}>Expense Breakdown</h3>
                  {pnl.expenseByCategory.length === 0 ? (
                    <p style={{ color: 'var(--admin-text-secondary)' }}>No expenses logged for this period.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {pnl.expenseByCategory.map(([cat, amount]) => (
                        <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--admin-text-primary)', fontWeight: 'bold' }}>{cat}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '60%' }}>
                            <div style={{ height: '8px', backgroundColor: 'var(--admin-danger)', borderRadius: '4px', width: `${Math.max(5, (amount / pnl.totalExpenses) * 100)}%` }}></div>
                            <span style={{ color: 'var(--admin-text-secondary)', minWidth: '80px', textAlign: 'right' }}>₹{amount.toLocaleString()}</span>
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
