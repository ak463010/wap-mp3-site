'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  year?: number;
  description?: string;
  downloads: number;
  fileSize: number;
  fileName: string;
  folderId: string;
  createdAt: string;
}

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Song | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState('');

  const loadSongs = async () => {
    const url = search ? `/api/admin/songs?q=${encodeURIComponent(search)}` : '/api/admin/songs';
    const res = await fetch(url);
    const data = await res.json();
    setSongs(data.songs || []);
  };

  useEffect(() => {
    loadSongs();
    fetch('/api/admin/folders').then(r => r.json()).then(data => setFolders(data.folders || [])).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setTitle(''); setArtist(''); setAlbum(''); setGenre('');
    setYear(''); setDescription(''); setFolderId('');
    setShowModal(true);
    setMessage(null);
  };

  const openEdit = (song: Song) => {
    setEditing(song);
    setTitle(song.title);
    setArtist(song.artist);
    setAlbum(song.album || '');
    setGenre(song.genre || '');
    setYear(song.year?.toString() || '');
    setDescription(song.description || '');
    setFolderId(song.folderId || '');
    setShowModal(true);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!title || !artist) {
      setMessage({ type: 'error', text: 'Title and artist are required!' });
      return;
    }

    try {
      if (editing) {
        const res = await fetch(`/api/admin/songs/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, artist, album, genre, year: year ? parseInt(year) : null, description, folderId }),
        });
        if (!res.ok) throw new Error();
        setMessage({ type: 'success', text: 'Song updated!' });
      } else {
        setMessage({ type: 'success', text: 'Song created! (use upload page for files)' });
      }
      setShowModal(false);
      loadSongs();
    } catch {
      setMessage({ type: 'error', text: 'Save failed' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this song permanently?')) return;
    try {
      const res = await fetch(`/api/admin/songs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Song deleted!' });
        loadSongs();
      }
    } catch {}
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  const genres = ['Pop', 'Rock', 'Hip Hop', 'R&B', 'Jazz', 'Classical', 'Electronic',
    'Country', 'Blues', 'Reggae', 'Metal', 'Folk', 'Indie', 'Latin', 'Other'];

  return (
    <>
      <div className="admin-header-bar">
        <div>
          <h1>🎵 Songs</h1>
          <p>Manage your MP3 collection — {songs.length} songs</p>
        </div>
        <div className="admin-flex admin-gap-2">
          <Link href="/songs/upload" className="admin-btn admin-btn-ghost" target="_blank">
            Upload MP3
          </Link>
        </div>
      </div>

      {message && (
        <div className={`admin-alert admin-alert-${message.type}`}>{message.text}</div>
      )}

      <div className="admin-search">
        <input className="admin-input" type="text" placeholder="Search songs..."
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') loadSongs(); }} />
        <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={loadSongs}>
          Search
        </button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Artist</th>
              <th>Genre</th>
              <th>Downloads</th>
              <th>Size</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {songs.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="admin-empty">
                    <div className="icon">🎵</div>
                    <h3>No songs found</h3>
                    <p>Upload MP3s from the upload page.</p>
                    <Link href="/songs/upload" className="admin-btn admin-btn-primary admin-btn-sm" target="_blank">
                      Go to Upload
                    </Link>
                  </div>
                </td>
              </tr>
            ) : songs.map(song => (
              <tr key={song.id}>
                <td style={{ fontWeight: 500 }} className="admin-truncate" title={song.title}>
                  {song.title}
                </td>
                <td style={{ color: '#8b8fa3' }}>{song.artist}</td>
                <td><span className="status-badge status-badge-normal">{song.genre || '-'}</span></td>
                <td>{song.downloads}</td>
                <td style={{ fontSize: 12, color: '#8b8fa3' }}>{formatBytes(song.fileSize)}</td>
                <td className="actions">
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(song)}>
                    ✏️
                  </button>
                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(song.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? '✏️ Edit Song' : '➕ New Song'}</h3>
            <p>{editing ? `Editing: ${editing.title}` : 'Create a new song entry (upload file separately)'}</p>

            <div className="admin-form-grid">
              <div>
                <label className="admin-label">Title *</label>
                <input className="admin-input" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="admin-label">Artist *</label>
                <input className="admin-input" value={artist} onChange={e => setArtist(e.target.value)} />
              </div>
              <div>
                <label className="admin-label">Album</label>
                <input className="admin-input" value={album} onChange={e => setAlbum(e.target.value)} />
              </div>
              <div>
                <label className="admin-label">Genre</label>
                <select className="admin-select" value={genre} onChange={e => setGenre(e.target.value)}>
                  <option value="">—</option>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="admin-label">Year</label>
                <input className="admin-input" type="number" value={year} onChange={e => setYear(e.target.value)} />
              </div>
              <div>
                <label className="admin-label">Folder</label>
                <select className="admin-select" value={folderId} onChange={e => setFolderId(e.target.value)}>
                  <option value="">— No folder —</option>
                  {folders.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            </div>

            <label className="admin-label">Description</label>
            <textarea className="admin-textarea" value={description} onChange={e => setDescription(e.target.value)} />

            <div className="admin-flex admin-gap-2 admin-mt-4">
              <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                {editing ? 'Save Changes' : 'Create Song'}
              </button>
              <button className="admin-btn admin-btn-ghost" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
