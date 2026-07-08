'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './admin.css';

interface Stats {
  totalSongs: number;
  totalFolders: number;
  totalNews: number;
  totalDownloads: number;
  totalSizeMB: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSongs, setRecentSongs] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data.stats);
        setRecentSongs(data.recentSongs || []);
        setRecentUpdates(data.recentUpdates || []);
        setSettings(data.settings || {});
      })
      .catch(() => {});
  }, []);

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

      <div className="admin-dashboard-grid">
        {/* Recent Songs */}
        <div className="admin-card admin-table-card">
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
                <div key={upd.id} className="admin-activity-item">
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
        <div className="admin-quick-actions">
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
        <div className="admin-settings-grid">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="admin-setting-row">
              <span style={{ color: '#8b8fa3' }}>{key.replace(/_/g, ' ')}:</span>
              <span style={{ fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
