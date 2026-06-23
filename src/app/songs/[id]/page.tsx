import Link from 'next/link';
import { getSong } from '@/lib/data';
import { notFound } from 'next/navigation';
import { formatFileSize } from '@/lib/format';

export default async function SongDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const song = getSong(id);

  if (!song) {
    notFound();
  }

  return (
    <>
      <div className="wap-breadcrumb">
        <Link href="/">Home</Link> &gt; <Link href="/songs">Songs</Link> &gt; {song.title}
      </div>

      <div className="song-detail-header">
        <div className="song-icon" style={{ width: 48, height: 48, fontSize: 24, margin: '0 auto 8px' }}>
          🎵
        </div>
        <h2>{song.title}</h2>
        <div className="artist">{song.artist}</div>
      </div>

      <div className="wap-card" style={{ borderLeft: '3px solid #66bb6a' }}>
        <h3>📋 Song Details</h3>
        <div className="song-detail-info">
          <span className="label">Title:</span>
          <span className="value">{song.title}</span>

          <span className="label">Artist:</span>
          <span className="value">{song.artist}</span>

          {song.album && <>
            <span className="label">Album:</span>
            <span className="value">{song.album}</span>
          </>}

          {song.genre && <>
            <span className="label">Genre:</span>
            <span className="value">{song.genre}</span>
          </>}

          {song.year && <>
            <span className="label">Year:</span>
            <span className="value">{song.year}</span>
          </>}

          <span className="label">File Size:</span>
          <span className="value">{formatFileSize(song.fileSize)}</span>

          <span className="label">Downloads:</span>
          <span className="value">📥 {song.downloads}</span>

          <span className="label">Added:</span>
          <span className="value">{new Date(song.createdAt).toLocaleDateString()}</span>
        </div>

        {song.description && (
          <p style={{ fontSize: 11, color: '#8899aa', marginTop: 8, borderTop: '1px solid #2a3a5e', paddingTop: 8 }}>
            {song.description}
          </p>
        )}
      </div>

      <div className="download-section">
        <Link href={`/api/songs/${song.id}/download`} className="download-btn">
          ⬇ DOWNLOAD MP3
        </Link>
        <div className="download-count">
          This song has been downloaded {song.downloads} times
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <Link href="/songs" className="wap-btn" style={{ fontSize: 11 }}>
          ← Back to Songs
        </Link>
      </div>
    </>
  );
}
