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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gray-950 font-sans">
      {/* Background Animated Gradient / Particles */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/40 via-gray-900 to-black"></div>
        
        {/* Animated glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className={`relative z-10 w-full max-w-md p-8 sm:p-10 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl overflow-hidden relative">
          
          {/* Top highlight line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"></div>

          {!selectedAdmin ? (
            <div className="transition-all duration-500 ease-out transform opacity-100 scale-100">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Command Center
                </h2>
                <p className="mt-2 text-sm text-gray-400 font-medium tracking-wide uppercase">
                  Select Identity
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {admins.map((admin) => (
                  <button
                    key={admin.id}
                    onClick={() => setSelectedAdmin(admin)}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 ring-4 ring-black/50">
                      {admin.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-200 tracking-wide">{admin.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="transition-all duration-500 ease-out transform opacity-100 translate-x-0">
              <div className="text-center mb-8 relative">
                <button 
                  type="button" 
                  onClick={() => { setSelectedAdmin(null); setPassword(''); setError(''); }}
                  className="absolute left-0 top-0 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                  title="Switch Profile"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </button>
                
                <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-[0_0_30px_rgba(245,158,11,0.4)] ring-4 ring-black/50">
                  {selectedAdmin.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-white tracking-wide">
                  {selectedAdmin.name}
                </h2>
                <p className="text-xs text-amber-500 mt-1 uppercase tracking-widest font-semibold">Authorized Personnel</p>
              </div>
              
              <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                {error && (
                  <div className="transition-all duration-300 ease-out opacity-100 bg-red-950/50 border border-red-500/50 p-4 rounded-xl flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-red-200">{error}</p>
                  </div>
                )}
                
                <div>
                  <div className="relative mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      autoFocus
                      required
                      className="appearance-none block w-full px-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:border-transparent text-center tracking-[0.5em] font-bold text-2xl transition-all shadow-inner"
                      placeholder="••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="absolute inset-0 rounded-xl pointer-events-none ring-1 ring-inset ring-white/10"></div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading || password.length < 4}
                    className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
                  >
                    {loading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : null}
                    {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 font-medium tracking-wider">
            SECURE ACCESS PORTAL &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
