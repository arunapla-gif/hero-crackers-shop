'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginClient({ admins }) {
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        setError(data.error || 'Login failed');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        
        {!selectedAdmin ? (
          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
              Who's watching?
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 mb-8">
              Select your admin profile
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {admins.map((admin) => (
                <button
                  key={admin.id}
                  onClick={() => setSelectedAdmin(admin)}
                  className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-transparent hover:border-blue-500 bg-gray-50 hover:bg-blue-50 transition-all cursor-pointer group"
                >
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-md group-hover:scale-110 transition-transform">
                    {admin.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{admin.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <button 
                type="button" 
                onClick={() => { setSelectedAdmin(null); setPassword(''); setError(''); }}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto mb-4"
              >
                ← Change Profile
              </button>
              <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-md">
                {selectedAdmin.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="mt-2 text-center text-2xl font-bold text-gray-900">
                Welcome, {selectedAdmin.name}
              </h2>
            </div>
            
            <form className="mt-6 space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Enter PIN / Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    autoFocus
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-center tracking-[0.5em] font-bold text-lg"
                    placeholder="••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors shadow-md"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
