'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [folderId, setFolderId] = useState('');
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/folders')
      .then(res => res.json())
      .then(data => setFolders(data.folders || []))
      .catch(() => {});
  }, []);

  const genres = [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Jazz', 'Classical', 'Electronic',
    'Country', 'Blues', 'Reggae', 'Metal', 'Folk', 'Indie', 'Latin',
    'Alternative', 'Dance', 'Soul', 'Funk', 'Punk', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !artist) {
      setMessage({ type: 'error', text: 'Title, Artist, and MP3 file are required!' });
      return;
    }

    if (!file.name.toLowerCase().endsWith('.mp3')) {
      setMessage({ type: 'error', text: 'Only MP3 files are allowed!' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('album', album);
    formData.append('genre', genre);
    formData.append('year', year);
    formData.append('description', description);
    formData.append('folderId', folderId);

    try {
      const res = await fetch('/api/songs', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `✅ "${data.song.title}" uploaded successfully!` });
        setTitle('');
        setArtist('');
        setAlbum('');
        setGenre('');
        setYear('');
        setDescription('');
        setFile(null);
        setFolderId('');
        (e.target as HTMLFormElement).reset();
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="wap-breadcrumb">
        <Link href="/">Home</Link> &gt; Upload Song
      </div>

      <div className="wap-card" style={{ borderLeft: '3px solid #66bb6a' }}>
        <h3>📤 Upload New MP3</h3>
        <div className="meta">Share your music with the world</div>

        {message && (
          <div className={`wap-alert wap-alert-${message.type}`} style={{ marginTop: 8 }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="wap-label">MP3 File *</label>
          <input
            type="file"
            accept=".mp3,audio/mpeg"
            className="wap-input"
            style={{ padding: 6 }}
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
          {file && (
            <div style={{ fontSize: 10, color: '#66bb6a', marginTop: 2 }}>
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}

          <label className="wap-label">Song Title *</label>
          <input className="wap-input" type="text" value={title}
            onChange={e => setTitle(e.target.value)} placeholder="Enter song title" />

          <label className="wap-label">Artist / Singer *</label>
          <input className="wap-input" type="text" value={artist}
            onChange={e => setArtist(e.target.value)} placeholder="Enter artist name" />

          <label className="wap-label">Album</label>
          <input className="wap-input" type="text" value={album}
            onChange={e => setAlbum(e.target.value)} placeholder="Album name (optional)" />

          <label className="wap-label">Genre</label>
          <select className="wap-select" value={genre} onChange={e => setGenre(e.target.value)}>
            <option value="">— Select Genre —</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <label className="wap-label">Year</label>
          <input className="wap-input" type="number" value={year}
            onChange={e => setYear(e.target.value)} placeholder="e.g. 2026" min="1900" max="2099" />

          <label className="wap-label">Folder (optional)</label>
          <select className="wap-select" value={folderId} onChange={e => setFolderId(e.target.value)}>
            <option value="">— No Folder —</option>
            {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>

          <label className="wap-label">Description</label>
          <textarea className="wap-textarea" value={description}
            onChange={e => setDescription(e.target.value)} placeholder="Add a description..." />

          <div style={{ marginTop: 14 }}>
            <button type="submit" className="wap-btn wap-btn-success wap-btn-block"
              disabled={loading}>
              {loading ? '⏳ Uploading...' : '⬆ UPLOAD MP3'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <Link href="/folders" className="wap-btn" style={{ fontSize: 10, marginRight: 4 }}>
          + Create Folder
        </Link>
        <Link href="/songs" className="wap-btn" style={{ fontSize: 10 }}>
          ← Back to Songs
        </Link>
      </div>
    </>
  );
}
