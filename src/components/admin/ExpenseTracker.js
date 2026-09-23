import { useState } from 'react';

export default function ExpenseTracker({ expenses, setExpenses }) {
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
    <div className="admin-card">
      <h2 style={{ color: 'var(--admin-text-primary)', margin: '0 0 20px 0' }}>Accounts & Petty Cash</h2>
      
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.4)', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--admin-danger)', fontSize: '1.2rem' }}>Total Expenses Today</h3>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--admin-text-primary)' }}>₹{totalToday.toLocaleString('en-IN')}</p>
          </div>

          <h3 style={{ color: 'var(--admin-text-primary)', fontSize: '1.5rem', marginBottom: '20px' }}>Log New Expense</h3>
          <form onSubmit={handleAddExpense}>
            <label className="admin-form-label">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="admin-form-input" />
            
            <label className="admin-form-label">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="admin-form-input">
              <option value="General">General / Other</option>
              <option value="Wages">Wages / Staff</option>
              <option value="Transport">Transport / Loading</option>
              <option value="Tea/Snacks">Tea / Snacks</option>
              <option value="Stationary">Stationary / Supplies</option>
            </select>

            <label className="admin-form-label">Amount (₹)</label>
            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required className="admin-form-input" placeholder="0.00" />

            <label className="admin-form-label">Description / Notes</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="admin-form-input" placeholder="e.g. Tea for packing boys" />

            <button type="submit" className="admin-btn-primary action-btn">Save Expense</button>
          </form>
        </div>

        <div style={{ flex: '2 1 500px' }}>
          <h3 style={{ color: 'var(--admin-text-primary)', fontSize: '1.5rem', marginBottom: '20px' }}>Recent Expenses</h3>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead className="admin-table-thead">
                <tr>
                  <th className="admin-table-th">Date</th>
                  <th className="admin-table-th">Category</th>
                  <th className="admin-table-th">Description</th>
                  <th className="admin-table-th">Amount</th>
                  <th className="admin-table-th" style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr className="admin-table-tr">
                    <td colSpan="5" className="admin-table-td" style={{ textAlign: 'center' }}>No expenses logged yet.</td>
                  </tr>
                ) : (
                  expenses.map(e => (
                    <tr key={e.id} className="admin-table-tr">
                      <td className="admin-table-td" style={{ color: 'var(--admin-text-primary)' }}>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                      <td className="admin-table-td" style={{ color: 'var(--admin-accent)' }}>
                        <span style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          {e.category}
                        </span>
                      </td>
                      <td className="admin-table-td">{e.description}</td>
                      <td className="admin-table-td" style={{ color: 'var(--admin-danger)', fontWeight: 'bold' }}>₹{e.amount}</td>
                      <td className="admin-table-td" style={{ textAlign: 'right' }}>
                        <button onClick={() => handleDeleteExpense(e.id)} className="admin-table-action-btn danger">✕ Delete</button>
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
