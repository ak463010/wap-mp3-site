'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FolderItem {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export default function FoldersPage() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [songCounts, setSongCounts] = useState<Record<string, number>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const loadFolders = async () => {
    try {
      const res = await fetch('/api/folders');
      const data = await res.json();
      setFolders(data.folders || []);

      // Get song counts per folder
      const res2 = await fetch('/api/songs');
      const data2 = await res2.json();
      const songs = data2.songs || [];
      const counts: Record<string, number> = {};
      songs.forEach((s: any) => {
        if (s.folderId) counts[s.folderId] = (counts[s.folderId] || 0) + 1;
      });
      setSongCounts(counts);
    } catch (e) {}
  };

  useEffect(() => { loadFolders(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      const data = await res.json();
      if (data.success) {
        setNewName('');
        setNewDesc('');
        setShowCreate(false);
        loadFolders();
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this folder? Songs inside won\'t be deleted, just uncategorized.')) return;
    try {
      await fetch(`/api/folders/${id}`, { method: 'DELETE' });
      loadFolders();
    } catch (e) {}
  };

  return (
    <>
      <div className="wap-breadcrumb">
        <Link href="/">Home</Link> &gt; Folders
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ color: '#f5a623', fontSize: 14, fontWeight: 'bold' }}>📁 Music Folders</h2>
        <button onClick={() => setShowCreate(!showCreate)} className="wap-btn" style={{ fontSize: 10 }}>
          {showCreate ? '✕ Cancel' : '+ New Folder'}
        </button>
      </div>

      {showCreate && (
        <div className="wap-card" style={{ borderLeft: '3px solid #f5a623', marginBottom: 8 }}>
          <h3>📁 Create New Folder</h3>
          <label className="wap-label">Folder Name</label>
          <input className="wap-input" type="text" value={newName}
            onChange={e => setNewName(e.target.value)} placeholder="e.g. Bollywood Hits" />

          <label className="wap-label">Description (optional)</label>
          <input className="wap-input" type="text" value={newDesc}
            onChange={e => setNewDesc(e.target.value)} placeholder="Describe this folder" />

          <div style={{ marginTop: 10 }}>
            <button onClick={handleCreate} className="wap-btn wap-btn-primary wap-btn-block"
              disabled={loading || !newName.trim()}>
              {loading ? '⏳ Creating...' : '➕ CREATE FOLDER'}
            </button>
          </div>
        </div>
      )}

      {folders.length === 0 && !showCreate ? (
        <div className="wap-card">
          <p style={{ color: '#556677', textAlign: 'center', padding: 20 }}>
            No folders created yet. Create folders to organize your songs!
          </p>
        </div>
      ) : (
        <div className="wap-card" style={{ padding: 0 }}>
          {folders.map(folder => (
            <div key={folder.id} className="folder-entry">
              <div className="folder-icon">📁</div>
              <div className="folder-info">
                <Link href={`/folders/${folder.id}`} className="name">
                  {folder.name}
                </Link>
                <div className="desc">
                  {songCounts[folder.id] || 0} songs
                  {folder.description && <> — {folder.description}</>}
                </div>
              </div>
              <button onClick={() => handleDelete(folder.id)}
                style={{
                  background: 'none', border: '1px solid #e94560', color: '#e94560',
                  fontFamily: 'monospace', fontSize: 10, padding: '2px 6px', cursor: 'pointer'
                }}>
                DEL
              </button>
            </div>
          ))}
        </div>
      )}

      {folders.length > 0 && (
        <div className="wap-stats" style={{ marginTop: 8 }}>
          <span>Total Folders: <span className="num">{folders.length}</span></span>
          <span>Total Songs: <span className="num">{Object.values(songCounts).reduce((a, b) => a + b, 0)}</span></span>
        </div>
      )}
    </>
  );
}
