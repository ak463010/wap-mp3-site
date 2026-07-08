import Link from 'next/link';
import { getFolder, getSongsByFolder } from '@/lib/data';
import { notFound } from 'next/navigation';

export default async function FolderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const folder = getFolder(id);
  if (!folder) notFound();

  const songs = getSongsByFolder(id);

  return (
    <>
      <div className="wap-breadcrumb">
        <Link href="/">Home</Link> &gt; <Link href="/folders">Folders</Link> &gt; {folder.name}
      </div>

      <div className="wap-card" style={{ borderLeft: '3px solid #f5a623' }}>
        <h3>📁 {folder.name}</h3>
        {folder.description && <p style={{ fontSize: 11, color: '#8899aa' }}>{folder.description}</p>}
        <div className="meta" style={{ marginTop: 4 }}>
          Created: {new Date(folder.createdAt).toLocaleDateString()} | Songs: {songs.length}
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="wap-card">
          <p style={{ color: '#556677', textAlign: 'center', padding: 20 }}>
            No songs in this folder yet.
          </p>
        </div>
      ) : (
        <div className="wap-card" style={{ padding: 0 }}>
          {songs.map(song => (
            <div key={song.id} className="song-entry">
              <div className="song-icon">🎵</div>
              <div className="song-info">
                <Link href={`/songs/${song.id}`} className="title">{song.title}</Link>
                <div className="artist">{song.artist}</div>
                <div className="extra">
                  <span>📥 {song.downloads}</span>
                  {song.genre && <span>{song.genre}</span>}
                </div>
              </div>
              <Link href={`/api/songs/${song.id}/download`} className="song-dl-btn">DL</Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
