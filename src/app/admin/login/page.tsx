'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../admin.css';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-body">
      <div className="admin-login-page">
        <div className="admin-login-box">
          <h1>MP3WAP</h1>
          <p>Sign in to the admin panel</p>

          {error && <div className="admin-alert admin-alert-error">{error}</div>}

          <form onSubmit={handleLogin}>
            <label className="admin-label">Username</label>
            <input className="admin-input" type="text" value={username}
              onChange={e => setUsername(e.target.value)} placeholder="admin"
              autoFocus />

            <label className="admin-label">Password</label>
            <input className="admin-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••" />

            <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#8b8fa3' }}>
            Default: admin / admin123
          </div>
        </div>
      </div>
    </div>
  );
}
