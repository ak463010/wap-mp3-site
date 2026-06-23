'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../admin/admin.css';

interface Stats {
  totalSongs: number;
  totalFolders: number;
  totalNews: number;
  totalDownloads: number;
  totalSizeMB: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [authState, setAuthState] = useState<'loading' | 'login' | 'ok'>('loading');
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSongs, setRecentSongs] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => {
        if (r.status === 401) {
          setAuthState('login');
          return null;
        }
        setAuthState('ok');
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setStats(data.stats);
        setRecentSongs(data.recentSongs || []);
        setRecentUpdates(data.recentUpdates || []);
        setSettings(data.settings || {});
      })
      .catch(() => setAuthState('login'));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.refresh();
        window.location.reload();
      } else {
        const data = await res.json();
        setLoginError(data.error || 'Login failed');
      }
    } catch {
      setLoginError('Connection failed');
    } finally {
      setLoginLoading(false);
    }
  };

  // Show login form when not authenticated
  if (authState === 'loading') return null;
  if (authState === 'login') {
    return (
      <div className="admin-body">
        <div className="admin-login-page">
          <div className="admin-login-box">
            <h1>MP3WAP</h1>
            <p>Sign in to the admin panel</p>

            {loginError && <div className="admin-alert admin-alert-error">{loginError}</div>}

            <form onSubmit={handleLogin}>
              <label className="admin-label">Username</label>
              <input className="admin-input" type="text" value={username}
                onChange={e => setUsername(e.target.value)} placeholder="admin"
                autoFocus />

              <label className="admin-label">Password</label>
              <input className="admin-input" type="password" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••" />

              <button type="submit" className="admin-btn admin-btn-primary" disabled={loginLoading}>
                {loginLoading ? 'Signing in...' : 'Sign In'}
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

  return (
    <>
      <div className="admin-header-bar">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your MP3WAP site</p>
        </div>
        <Link href="/admin/songs" className="admin-btn admin-btn-primary">
          + Add Song
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon stat-icon-purple">🎵</div>
          <div>
            <div className="admin-stat-value">{stats?.totalSongs ?? '-'}</div>
            <div className="admin-stat-label">Total Songs</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon stat-icon-green">📁</div>
          <div>
            <div className="admin-stat-value">{stats?.totalFolders ?? '-'}</div>
            <div className="admin-stat-label">Folders</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon stat-icon-blue">📰</div>
          <div>
            <div className="admin-stat-value">{stats?.totalNews ?? '-'}</div>
            <div className="admin-stat-label">News Articles</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon stat-icon-amber">📥</div>
          <div>
            <div className="admin-stat-value">{stats?.totalDownloads?.toLocaleString() ?? '-'}</div>
            <div className="admin-stat-label">Total Downloads</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon stat-icon-red">💾</div>
          <div>
            <div className="admin-stat-value">{stats?.totalSizeMB ?? '-'} MB</div>
            <div className="admin-stat-label">Storage Used</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Songs */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>🎵 Recent Songs</h3>
            <Link href="/admin/songs" className="admin-btn admin-btn-ghost admin-btn-sm">View All</Link>
          </div>
          {recentSongs.length === 0 ? (
            <div className="admin-empty">
              <div className="icon">🎵</div>
              <h3>No songs yet</h3>
              <p>Upload your first song to get started.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Downloads</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSongs.map((song: any) => (
                  <tr key={song.id}>
                    <td style={{ fontWeight: 500 }}>{song.title}</td>
                    <td style={{ color: '#8b8fa3' }}>{song.artist}</td>
                    <td>{song.downloads}</td>
                    <td style={{ color: '#8b8fa3', fontSize: 12 }}>
                      {new Date(song.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Activity */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>⚡ Recent Activity</h3>
            <Link href="/latest" className="admin-btn admin-btn-ghost admin-btn-sm">View All</Link>
          </div>
          {recentUpdates.length === 0 ? (
            <div className="admin-empty">
              <div className="icon">⚡</div>
              <h3>No activity yet</h3>
              <p>Activity will appear here as you add content.</p>
            </div>
          ) : (
            <div>
              {recentUpdates.map((upd: any) => (
                <div key={upd.id} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '8px 0', borderBottom: '1px solid #2a2d3a', fontSize: 13
                }}>
                  <span style={{ fontSize: 16 }}>{upd.icon}</span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{upd.title}</div>
                    <div style={{ color: '#8b8fa3', fontSize: 12 }}>{upd.description}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', color: '#8b8fa3', fontSize: 11, whiteSpace: 'nowrap' }}>
                    {new Date(upd.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>🚀 Quick Actions</h3>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/admin/songs" className="admin-btn admin-btn-primary">🎵 Manage Songs</Link>
          <Link href="/admin/folders" className="admin-btn admin-btn-success">📁 Manage Folders</Link>
          <Link href="/admin/news" className="admin-btn" style={{ background: '#3b82f6', color: '#fff' }}>📰 Manage News</Link>
          <Link href="/" className="admin-btn admin-btn-ghost" target="_blank">🌐 View Site</Link>
        </div>
      </div>

      {/* Settings Info */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>⚙️ Site Settings</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', gap: 8 }}>
              <span style={{ color: '#8b8fa3' }}>{key.replace(/_/g, ' ')}:</span>
              <span style={{ fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
