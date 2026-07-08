'use client';

import { useEffect, useState } from 'react';
import { extractMp3Tags, titleFromFileName } from '@/lib/mp3-tags';

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

interface FolderOption {
  id: string;
  name: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Song | null>(null);
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [tagStatus, setTagStatus] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState('');
  const [file, setFile] = useState<File | null>(null);

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

  const resetForm = () => {
    setTitle('');
    setArtist('');
    setAlbum('');
    setGenre('');
    setYear('');
    setDescription('');
    setFolderId('');
    setFile(null);
    setTagStatus('');
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
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
    setFile(null);
    setTagStatus('');
    setShowModal(true);
    setMessage(null);
  };

  const handleFileChange = async (selected: File | null) => {
    setFile(selected);
    setTagStatus('');

    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith('.mp3')) {
      setTagStatus('Only MP3 files are allowed.');
      return;
    }

    try {
      const buffer = await selected.arrayBuffer();
      const tags = extractMp3Tags(new Uint8Array(buffer));
      const found = [tags.title, tags.artist, tags.album, tags.genre, tags.year].filter(Boolean).length;

      setTitle(tags.title || titleFromFileName(selected.name));
      setArtist(tags.artist || 'Unknown Artist');
      setAlbum(tags.album || '');
      setGenre(tags.genre || '');
      setYear(tags.year?.toString() || '');
      setTagStatus(found > 0 ? `Auto-filled ${found} tag${found === 1 ? '' : 's'} from the MP3.` : 'No ID3 tags found; using the file name as title.');
    } catch {
      setTitle(current => current || titleFromFileName(selected.name));
      setTagStatus('Could not read ID3 tags; you can fill details manually.');
    }
  };

  const handleSave = async () => {
    if (editing && (!title.trim() || !artist.trim())) {
      setMessage({ type: 'error', text: 'Title and artist are required!' });
      return;
    }

    if (!editing && !file) {
      setMessage({ type: 'error', text: 'Choose an MP3 file to upload.' });
      return;
    }

    if (file && !file.name.toLowerCase().endsWith('.mp3')) {
      setMessage({ type: 'error', text: 'Only MP3 files are allowed!' });
      return;
    }

    setSaving(true);

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
        const formData = new FormData();
        formData.append('file', file as File);
        formData.append('title', title);
        formData.append('artist', artist);
        formData.append('album', album);
        formData.append('genre', genre);
        formData.append('year', year);
        formData.append('description', description);
        formData.append('folderId', folderId);

        const res = await fetch('/api/admin/songs', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
        setMessage({ type: 'success', text: `MP3 uploaded: ${data.song.title}` });
      }

      setShowModal(false);
      resetForm();
      loadSongs();
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error, 'Save failed') });
    } finally {
      setSaving(false);
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
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            ⬆ Upload MP3
          </button>
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

      <div className="admin-card admin-table-card">
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
                    <p>Upload an MP3 and its ID3 tags will be extracted automatically.</p>
                    <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={openCreate}>
                      Upload MP3
                    </button>
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

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? '✏️ Edit Song' : '⬆ Upload MP3'}</h3>
            <p>{editing ? `Editing: ${editing.title}` : 'Upload an MP3. Title, artist, album, genre, and year are auto-filled from ID3 tags when available.'}</p>

            {!editing && (
              <>
                <label className="admin-label">MP3 File *</label>
                <input
                  className="admin-input"
                  type="file"
                  accept=".mp3,audio/mpeg"
                  onChange={e => handleFileChange(e.target.files?.[0] || null)}
                />
                {file && (
                  <div style={{ fontSize: 12, color: '#8b8fa3', marginTop: 6 }}>
                    {file.name} ({formatBytes(file.size)})
                  </div>
                )}
                {tagStatus && (
                  <div className="admin-help-text">{tagStatus}</div>
                )}
              </>
            )}

            <div className="admin-form-grid">
              <div>
                <label className="admin-label">Title {!editing && '(auto)'}</label>
                <input className="admin-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Auto-filled from MP3 tag" />
              </div>
              <div>
                <label className="admin-label">Artist {!editing && '(auto)'}</label>
                <input className="admin-input" value={artist} onChange={e => setArtist(e.target.value)} placeholder="Auto-filled from MP3 tag" />
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
                <input className="admin-input" type="number" min="1900" max="2099" value={year} onChange={e => setYear(e.target.value)} />
              </div>
              <div>
                <label className="admin-label">Folder</label>
                <select className="admin-select" value={folderId} onChange={e => setFolderId(e.target.value)}>
                  <option value="">— No folder —</option>
                  {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            </div>

            <label className="admin-label">Description</label>
            <textarea className="admin-textarea" value={description} onChange={e => setDescription(e.target.value)} />

            <div className="admin-flex admin-gap-2 admin-mt-4">
              <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Upload MP3'}
              </button>
              <button className="admin-btn admin-btn-ghost" onClick={() => setShowModal(false)} disabled={saving}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
