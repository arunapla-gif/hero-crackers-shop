'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginClient({ admins }) {
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Handle mounting animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // If there's only one admin, auto-select them
  useEffect(() => {
    if (admins && admins.length === 1 && !selectedAdmin) {
      setSelectedAdmin(admins[0]);
    }
  }, [admins, selectedAdmin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedAdmin.email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials. Please try again.');
        setPassword('');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      setError('A connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at top, #3e1f00, #0a0a0a, #000);
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
          margin: 0;
          color: white;
        }

        .login-bg-orb {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          filter: blur(100px);
          mix-blend-mode: screen;
          animation: pulseOrb 4s infinite alternate;
          z-index: 0;
        }
        
        .orb-1 {
          top: 20%;
          left: 20%;
          background: rgba(245, 158, 11, 0.15);
        }
        
        .orb-2 {
          bottom: 20%;
          right: 20%;
          background: rgba(220, 38, 38, 0.15);
          animation-delay: 2s;
        }

        @keyframes pulseOrb {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.2); opacity: 1; }
        }

        .login-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 450px;
          transition: all 1s ease;
          transform: translateY(40px);
          opacity: 0;
          padding: 20px;
        }
        
        .login-container.mounted {
          transform: translateY(0);
          opacity: 1;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
        }

        .card-highlight {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #fbbf24, #f97316, #ef4444);
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .login-title {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          margin-bottom: 8px;
        }

        .login-subtitle {
          font-size: 0.85rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }

        .profiles-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .profile-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
          outline: none;
        }

        .profile-btn:hover, .profile-btn:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(245, 158, 11, 0.5);
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
        }

        .profile-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24, #ea580c);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 16px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
          border: 3px solid rgba(0,0,0,0.3);
          transition: transform 0.3s ease;
        }

        .profile-btn:hover .profile-avatar {
          transform: scale(1.1);
        }

        .profile-name {
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .login-form-container {
          animation: fadeInRight 0.5s ease;
        }

        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .selected-profile {
          text-align: center;
          margin-bottom: 30px;
          position: relative;
        }

        .back-btn {
          position: absolute;
          left: 0;
          top: 0;
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .back-btn:hover {
          color: white;
          background: rgba(255,255,255,0.1);
        }

        .selected-avatar {
          width: 90px;
          height: 90px;
          margin: 0 auto 16px auto;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24, #ea580c);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: bold;
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.4);
          border: 4px solid rgba(0,0,0,0.5);
        }

        .selected-name {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .selected-role {
          font-size: 0.75rem;
          color: #f59e0b;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 600;
          margin-top: 4px;
        }

        .error-message {
          background: rgba(127, 29, 29, 0.5);
          border: 1px solid rgba(239, 68, 68, 0.5);
          color: #fca5a5;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          margin-bottom: 24px;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pin-input {
          width: 100%;
          padding: 20px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          color: white;
          font-size: 2rem;
          font-weight: bold;
          letter-spacing: 0.5em;
          text-align: center;
          outline: none;
          transition: all 0.3s ease;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
          margin-bottom: 24px;
        }

        .pin-input:focus {
          border-color: rgba(245, 158, 11, 0.8);
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.5), 0 0 0 2px rgba(245, 158, 11, 0.3);
        }
        
        .pin-input::placeholder {
          color: #4b5563;
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(90deg, #fbbf24, #f97316);
          border: none;
          border-radius: 12px;
          color: black;
          font-weight: 800;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .submit-btn:hover:not(:disabled) {
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.6);
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .spinner {
          border: 3px solid rgba(0,0,0,0.2);
          border-top-color: black;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
          margin-right: 12px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .footer-text {
          text-align: center;
          margin-top: 32px;
          font-size: 0.75rem;
          color: #6b7280;
          letter-spacing: 0.1em;
          font-weight: 500;
        }
      `}</style>

      <div className="login-wrapper">
        <div className="login-bg-orb orb-1"></div>
        <div className="login-bg-orb orb-2"></div>

        <div className={`login-container ${mounted ? 'mounted' : ''}`}>
          <div className="login-card">
            <div className="card-highlight"></div>

            {!selectedAdmin ? (
              <div>
                <div className="login-header">
                  <h2 className="login-title">Command Center</h2>
                  <p className="login-subtitle">Select Identity</p>
                </div>
                
                <div className="profiles-grid">
                  {admins.map((admin) => (
                    <button
                      key={admin.id}
                      onClick={() => setSelectedAdmin(admin)}
                      className="profile-btn"
                    >
                      <div className="profile-avatar">
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="profile-name">{admin.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="login-form-container">
                <div className="selected-profile">
                  <button 
                    type="button" 
                    onClick={() => { setSelectedAdmin(null); setPassword(''); setError(''); }}
                    className="back-btn"
                    title="Switch Profile"
                  >
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  </button>
                  
                  <div className="selected-avatar">
                    {selectedAdmin.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="selected-name">{selectedAdmin.name}</h2>
                  <p className="selected-role">Authorized Personnel</p>
                </div>
                
                <form onSubmit={handleLogin}>
                  {error && (
                    <div className="error-message">
                      <svg style={{marginRight: '8px', width: '20px', height: '20px'}} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  )}
                  
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    autoFocus
                    required
                    className="pin-input"
                    placeholder="••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="submit"
                    disabled={loading || password.length < 4}
                    className="submit-btn"
                  >
                    {loading && <div className="spinner"></div>}
                    {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
                  </button>
                </form>
              </div>
            )}
          </div>
          
          <div className="footer-text">
            SECURE ACCESS PORTAL &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </>
  );
}
