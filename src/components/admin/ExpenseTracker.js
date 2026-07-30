import { useState } from 'react';
import { getTheme, getStyles } from './theme';

export default function ExpenseTracker({ isDarkMode, expenses, setExpenses }) {
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme, isDarkMode);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, amount, category, date })
    });
    if (res.ok) {
      const added = await res.json();
      setExpenses([added, ...expenses]);
      setDescription('');
      setAmount('');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const totalToday = expenses
    .filter(e => new Date(e.date).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={styles.cardStyle}>
      <h2 style={{ color: theme.textPrimary, margin: '0 0 20px 0' }}>Accounts & Petty Cash</h2>
      
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ backgroundColor: `${theme.danger}15`, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.danger}40`, marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: theme.danger, fontSize: '1.2rem' }}>Total Expenses Today</h3>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: theme.textPrimary }}>₹{totalToday.toLocaleString('en-IN')}</p>
          </div>

          <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '20px' }}>Log New Expense</h3>
          <form onSubmit={handleAddExpense}>
            <label style={styles.labelStyle}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={styles.inputStyle} />
            
            <label style={styles.labelStyle}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={styles.inputStyle}>
              <option value="General">General / Other</option>
              <option value="Wages">Wages / Staff</option>
              <option value="Transport">Transport / Loading</option>
              <option value="Tea/Snacks">Tea / Snacks</option>
              <option value="Stationary">Stationary / Supplies</option>
            </select>

            <label style={styles.labelStyle}>Amount (₹)</label>
            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required style={styles.inputStyle} placeholder="0.00" />

            <label style={styles.labelStyle}>Description / Notes</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} required style={styles.inputStyle} placeholder="e.g. Tea for packing boys" />

            <button type="submit" className="action-btn" style={styles.btnPrimary}>Save Expense</button>
          </form>
        </div>

        <div style={{ flex: '2 1 500px' }}>
          <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '20px' }}>Recent Expenses</h3>
          <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: theme.cardBg }}>
                <tr>
                  <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Date</th>
                  <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Category</th>
                  <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Description</th>
                  <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>Amount</th>
                  <th style={{ padding: '15px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}`, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: theme.textSecondary }}>No expenses logged yet.</td>
                  </tr>
                ) : (
                  expenses.map(e => (
                    <tr key={e.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '15px', color: theme.textPrimary }}>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '15px', color: theme.accent }}>
                        <span style={{ backgroundColor: `${theme.accent}15`, padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          {e.category}
                        </span>
                      </td>
                      <td style={{ padding: '15px', color: theme.textSecondary }}>{e.description}</td>
                      <td style={{ padding: '15px', color: theme.danger, fontWeight: 'bold' }}>₹{e.amount}</td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        <button onClick={() => handleDeleteExpense(e.id)} style={{ padding: '6px 12px', backgroundColor: 'transparent', border: `1px solid ${theme.danger}`, borderRadius: '6px', color: theme.danger, cursor: 'pointer', fontSize: '0.9rem' }}>✕ Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
