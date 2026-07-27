export const darkTheme = {
  bg: '#0f172a',
  cardBg: '#1e293b',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  accent: '#f59e0b',
  accentHover: '#d97706',
  border: '#334155',
  inputBg: '#0f172a',
  danger: '#ef4444',
  success: '#10b981',
  info: '#3b82f6',
  shipped: '#8b5cf6',
  cancelled: '#ef4444',
};

export const lightTheme = {
  bg: '#f8fafc',
  cardBg: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  accent: '#d97706',
  accentHover: '#b45309',
  border: '#e2e8f0',
  inputBg: '#f1f5f9',
  danger: '#dc2626',
  success: '#059669',
  info: '#2563eb',
  shipped: '#7c3aed',
  cancelled: '#dc2626',
};

export const getTheme = (isDarkMode) => isDarkMode ? darkTheme : lightTheme;

export const getStyles = (theme, isDarkMode) => ({
  cardStyle: {
    backgroundColor: theme.cardBg,
    borderRadius: '16px',
    padding: '30px',
    boxShadow: isDarkMode ? '0 10px 25px rgba(0,0,0,0.2)' : '0 10px 25px rgba(0,0,0,0.05)',
    border: `1px solid ${theme.border}`,
    color: theme.textPrimary,
    transition: 'all 0.3s'
  },
  listCardStyle: {
    backgroundColor: theme.cardBg,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: isDarkMode ? '0 5px 15px rgba(0,0,0,0.1)' : '0 5px 15px rgba(0,0,0,0.02)',
    border: `1px solid ${theme.border}`,
    color: theme.textPrimary,
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s',
  },
  inputStyle: {
    width: '100%',
    padding: '12px 16px',
    margin: '8px 0 20px 0',
    backgroundColor: theme.inputBg,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    color: theme.textPrimary,
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  searchInputStyle: {
    width: '100%',
    maxWidth: '350px',
    padding: '14px 20px',
    backgroundColor: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: '30px',
    color: theme.textPrimary,
    fontSize: '1.05rem',
    outline: 'none',
    boxShadow: `inset 0 2px 4px rgba(0,0,0,${isDarkMode ? '0.2' : '0.02'})`,
    transition: 'border-color 0.3s, box-shadow 0.3s',
  },
  dateInputStyle: {
    width: '100%',
    maxWidth: '160px',
    padding: '12px 20px',
    backgroundColor: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: '30px',
    color: theme.textSecondary,
    fontSize: '0.9rem',
    outline: 'none',
    boxShadow: `inset 0 2px 4px rgba(0,0,0,${isDarkMode ? '0.2' : '0.02'})`,
    transition: 'border-color 0.3s, box-shadow 0.3s',
  },
  labelStyle: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  btnPrimary: {
    padding: '12px 24px',
    backgroundColor: theme.accent,
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
    boxShadow: `0 4px 10px ${theme.accent}40`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  qtyBtnStyle: {
    padding: '5px 12px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    backgroundColor: theme.inputBg,
    border: `1px solid ${theme.border}`,
    color: theme.textPrimary,
    cursor: 'pointer',
    borderRadius: '8px',
    outline: 'none'
  }
});

export const statusBadge = (status, theme) => {
  let color = theme.textSecondary;
  if(status === 'PENDING') color = theme.accent;
  if(status === 'PROCESSING') color = theme.info;
  if(status === 'SHIPPED') color = theme.shipped;
  if(status === 'DELIVERED') color = theme.success;
  if(status === 'CANCELLED') color = theme.cancelled;
  
  return (
    <span style={{ 
      padding: '6px 14px', 
      borderRadius: '20px', 
      fontSize: '0.75rem', 
      fontWeight: 'bold',
      letterSpacing: '0.5px',
      backgroundColor: `${color}15`, 
      color: color, 
      border: `1px solid ${color}40`,
      boxShadow: `0 0 10px ${color}20`,
      textTransform: 'uppercase',
      display: 'inline-block'
    }}>
      <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color, marginRight: '6px', marginBottom: '1px' }}></span>
      {status}
    </span>
  );
};
