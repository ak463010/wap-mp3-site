'use client';

import { useEffect, useState } from 'react';

export default function AdminFoldersPage() {
  const [folders, setFolders] = useState<any[]>([]);
  const [songCounts, setSongCounts] = useState<Record<string, number>>({});
  const [showModal, setShowModal] = useState(false);
  const [editFolder, setEditFolder] = useState<any>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const loadData = async () => {
    const [foldRes, songRes] = await Promise.all([
      fetch('/api/admin/folders').then(r => r.json()),
      fetch('/api/admin/songs').then(r => r.json()),
    ]);
    setFolders(foldRes.folders || []);
    const songs = songRes.songs || [];
    const counts: Record<string, number> = {};
    songs.forEach((s: any) => {
      if (s.folderId) counts[s.folderId] = (counts[s.folderId] || 0) + 1;
    });
    setSongCounts(counts);
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setEditFolder(null);
    setNewName('');
    setNewDesc('');
    setShowModal(true);
    setMessage(null);
  };

  const openEdit = (f: any) => {
    setEditFolder(f);
    setNewName(f.name);
    setNewDesc(f.description || '');
    setShowModal(true);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!newName.trim()) { setMessage({ type: 'error', text: 'Name required' }); return; }
    try {
      if (editFolder) {
        await fetch(`/api/admin/folders/${editFolder.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName, description: newDesc }),
        });
        setMessage({ type: 'success', text: 'Folder updated!' });
      } else {
        await fetch('/api/admin/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName, description: newDesc }),
        });
        setMessage({ type: 'success', text: 'Folder created!' });
      }
      setShowModal(false);
      loadData();
    } catch { setMessage({ type: 'error', text: 'Failed' }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this folder? Songs inside won\'t be deleted.')) return;
    try {
      await fetch(`/api/admin/folders/${id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: 'Folder deleted!' });
      loadData();
    } catch {}
  };

  return (
    <>
      <div className="admin-header-bar">
        <div>
          <h1>📁 Folders</h1>
          <p>Organize songs into categories — {folders.length} folders</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>
          + New Folder
        </button>
      </div>

      {message && (
        <div className={`admin-alert admin-alert-${message.type}`}>{message.text}</div>
      )}

      <div className="admin-card admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Songs</th>
              <th>Created</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {folders.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="admin-empty">
                    <div className="icon">📁</div>
                    <h3>No folders yet</h3>
                    <p>Create your first folder to organize songs.</p>
                  </div>
                </td>
              </tr>
            ) : folders.map((folder: any) => (
              <tr key={folder.id}>
                <td style={{ fontWeight: 500 }}>{folder.name}</td>
                <td style={{ color: '#8b8fa3', fontSize: 12 }}>{folder.description || '-'}</td>
                <td><span className="status-badge status-badge-new">{songCounts[folder.id] || 0}</span></td>
                <td style={{ fontSize: 12, color: '#8b8fa3' }}>
                  {new Date(folder.createdAt).toLocaleDateString()}
                </td>
                <td className="actions">
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(folder)}>✏️</button>
                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(folder.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editFolder ? '✏️ Edit Folder' : '📁 New Folder'}</h3>
            <p>{editFolder ? `Editing: ${editFolder.name}` : 'Create a new folder to organize songs'}</p>

            <label className="admin-label">Folder Name</label>
            <input className="admin-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Bollywood Hits" />

            <label className="admin-label">Description</label>
            <input className="admin-input" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Optional description" />

            <div className="admin-flex admin-gap-2 admin-mt-4">
              <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                {editFolder ? 'Save' : 'Create'}
              </button>
              <button className="admin-btn admin-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
