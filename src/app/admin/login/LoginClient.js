'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import styles from './Login.module.css';

export default function LoginClient({ admins = [] }) {
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState('idle'); // 'idle' | 'authenticating' | 'verified'
  const pinInputRef = useRef(null);

  const handleSelectProfile = (admin) => {
    setSelectedAdmin(admin);
    setPassword('');
    setError('');
    // Use double requestAnimationFrame to ensure the browser paints the profile change
    // BEFORE focusing the input, eliminating any main-thread hitch or keyboard freeze.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        pinInputRef.current?.focus({ preventScroll: true });
      });
    });
  };

  const handleBackToProfiles = () => {
    setSelectedAdmin(null);
    setPassword('');
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    
    setError('');
    setLoading(true);
    setAuthStatus('authenticating');

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
        setLoading(false);
        setAuthStatus('idle');
        requestAnimationFrame(() => {
          pinInputRef.current?.focus({ preventScroll: true });
        });
      } else {
        setAuthStatus('verified');
        window.location.href = '/admin';
      }
    } catch (err) {
      setError('A connection error occurred.');
      setLoading(false);
      setAuthStatus('idle');
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginContainer}>
        {/* Top Navigation: Return to Home */}
        <div className={styles.topNavRow}>
          <Link href="/" className={styles.homeButton} title="Return to Storefront Homepage">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Home</span>
          </Link>
        </div>

        <div className={styles.loginCard}>
          <div className={styles.cardHighlight}></div>

          {/* Identity Selection View */}
          <div 
            className={`${styles.viewSection} ${!selectedAdmin ? styles.viewActive : styles.viewHidden}`}
            aria-hidden={!!selectedAdmin}
          >
            <div className={styles.loginHeader}>
              <h2 className={styles.loginTitle}>Command Center</h2>
              <p className={styles.loginSubtitle}>Select Identity</p>
            </div>
            
            <div className={styles.profilesGrid}>
              {admins.map((admin) => (
                <button
                  key={admin.id}
                  type="button"
                  onClick={() => handleSelectProfile(admin)}
                  className={styles.profileBtn}
                >
                  <div className={styles.profileAvatar}>
                    {admin.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={styles.profileName}>{admin.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PIN Typing View */}
          <div 
            className={`${styles.viewSection} ${selectedAdmin ? styles.viewActive : styles.viewHidden}`}
            aria-hidden={!selectedAdmin}
          >
            {selectedAdmin && (
              <div className={styles.selectedProfile}>
                <button 
                  type="button" 
                  onClick={handleBackToProfiles}
                  className={styles.backBtn}
                  title="Switch Profile"
                >
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                
                <div className={styles.selectedAvatar}>
                  {selectedAdmin.name.charAt(0).toUpperCase()}
                </div>
                <h2 className={styles.selectedName}>{selectedAdmin.name}</h2>
                <p className={styles.selectedRole}>Authorized Personnel</p>
              </div>
            )}
            
            <form onSubmit={handleLogin}>
              {error && (
                <div className={styles.errorMessage}>
                  <svg style={{ marginRight: '8px', width: '20px', height: '20px', flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
              
              <div className={styles.pinInputContainer}>
                <input
                  ref={pinInputRef}
                  id="pin-password"
                  name="password"
                  type="password"
                  inputMode="text"
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                  className={styles.pinInput}
                  placeholder="••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading || password.length < 4}
                className={styles.submitBtn}
                style={authStatus === 'verified' ? {
                  background: 'linear-gradient(90deg, #10b981, #059669)',
                  color: '#fff',
                  boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)'
                } : {}}
              >
                {authStatus === 'authenticating' && <div className={styles.spinner}></div>}
                {authStatus === 'verified' && <span style={{ marginRight: '8px', fontSize: '1.2rem' }}>✓</span>}
                {authStatus === 'authenticating' && 'VERIFYING PIN...'}
                {authStatus === 'verified' && 'ACCESS GRANTED • OPENING...'}
                {authStatus === 'idle' && 'ACCESS SYSTEM'}
              </button>
            </form>
          </div>

        </div>
        
        <div className={styles.footerText}>
          SECURE ACCESS PORTAL &copy; {new Date().getFullYear()} &bull;
          <Link href="/" className={styles.footerHomeLink}>
            Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
