export default function AdminLoading() {
  return (
    <div style={{ 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh', 
      padding: '40px 20px', 
      fontFamily: '"Inter", sans-serif' 
    }}>
      <style>{`
        @keyframes shimmerPulse {
          0% { opacity: 0.45; }
          50% { opacity: 0.85; }
          100% { opacity: 0.45; }
        }
        .skeleton-item {
          background: #e2e8f0;
          border-radius: 8px;
          animation: shimmerPulse 1.2s infinite ease-in-out;
        }
      `}</style>
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <div className="skeleton-item" style={{ width: '280px', height: '45px', marginBottom: '12px' }}></div>
            <div className="skeleton-item" style={{ width: '380px', height: '18px' }}></div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="skeleton-item" style={{ width: '130px', height: '42px', borderRadius: '30px' }}></div>
            <div className="skeleton-item" style={{ width: '110px', height: '42px', borderRadius: '30px' }}></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <div className="skeleton-item" style={{ width: '110px', height: '38px', borderRadius: '8px' }}></div>
          <div className="skeleton-item" style={{ width: '110px', height: '38px', borderRadius: '8px' }}></div>
          <div className="skeleton-item" style={{ width: '110px', height: '38px', borderRadius: '8px' }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="skeleton-item" style={{ height: '100px', borderRadius: '16px' }}></div>
          <div className="skeleton-item" style={{ height: '100px', borderRadius: '16px' }}></div>
          <div className="skeleton-item" style={{ height: '100px', borderRadius: '16px' }}></div>
          <div className="skeleton-item" style={{ height: '100px', borderRadius: '16px' }}></div>
        </div>

        <div className="skeleton-item" style={{ height: '350px', borderRadius: '16px' }}></div>
      </div>
    </div>
  );
}
