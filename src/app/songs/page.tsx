import Link from 'next/link';
import { getSongs, getSongsBySearch } from '@/lib/data';

export default async function SongsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const query = sp.q?.trim() || '';
  const songs = query ? getSongsBySearch(query) : getSongs();

  return (
    <>
      <div className="wap-breadcrumb">
        <Link href="/">Home</Link> &gt; Songs
      </div>

      <div className="wap-search">
        <form action="/songs" method="GET" style={{ display: 'flex', gap: 4, width: '100%' }}>
          <input className="wap-input" type="text" name="q" defaultValue={query} placeholder="Search songs, artists..." />
          <button type="submit">SEARCH</button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ color: '#4fc3f7', fontSize: 14, fontWeight: 'bold' }}>
          🎵 All Songs {query && <span style={{ color: '#8899aa', fontWeight: 'normal' }}>— &quot;{query}&quot;</span>}
        </h2>
        <Link href="/songs/upload" className="wap-btn" style={{ fontSize: 10 }}>
          + Upload
        </Link>
      </div>

      <div className="wap-stats" style={{ marginBottom: 8 }}>
        <span>Total: <span className="num">{songs.length}</span> songs</span>
        <span>Downloads: <span className="num">{songs.reduce((s, x) => s + (x.downloads || 0), 0)}</span></span>
      </div>

      {songs.length === 0 ? (
        <div className="wap-card">
          <p style={{ color: '#556677', textAlign: 'center', padding: 20 }}>
            {query ? `No songs found for "${query}".` : 'No songs uploaded yet.'}
          </p>
          {query && (
            <div style={{ textAlign: 'center', padding: 4 }}>
              <Link href="/songs" className="wap-btn" style={{ fontSize: 10 }}>Clear Search</Link>
            </div>
          )}
        </div>
      ) : (
        <div className="wap-card" style={{ padding: 0 }}>
          {songs.map(song => (
            <div key={song.id} className="song-entry">
              <div className="song-icon">🎵</div>
              <div className="song-info">
                <Link href={`/songs/${song.id}`} className="title">
                  {song.title}
                  {song.genre && <span style={{ color: '#e94560', fontSize: 9, marginLeft: 4 }}>[{song.genre}]</span>}
                </Link>
                <div className="artist">{song.artist}</div>
                <div className="extra">
                  <span>📥 {song.downloads}</span>
                  {song.album && <span>💿 {song.album}</span>}
                  <span>📅 {new Date(song.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Link href={`/api/songs/${song.id}/download`} className="song-dl-btn">
                ⬇ DL
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
