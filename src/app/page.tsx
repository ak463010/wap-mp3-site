import Link from 'next/link';
import { getSongs, getNews, getLatestUpdates } from '@/lib/data';
import SearchBar from '@/components/SearchBar';

export default function HomePage() {
  const songs = getSongs();
  const newsItems = getNews();
  const updates = getLatestUpdates(5);
  const totalDownloads = songs.reduce((sum, s) => sum + (s.downloads || 0), 0);

  const latestSongs = songs.slice(0, 5);

  return (
    <>
      {/* Welcome Banner */}
      <div className="wap-card" style={{ borderLeft: '3px solid #00bcd4' }}>
        <h3>◈ Welcome to MP3WAP ◈</h3>
        <p style={{ fontSize: 11, color: '#8899aa', marginTop: 4 }}>
          Your destination for free MP3 downloads. Browse songs, explore folders,
          and stay updated with the latest music.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="wap-stats">
        <span>🎵 Songs: <span className="num">{songs.length}</span></span>
        <span>📥 Downloads: <span className="num">{totalDownloads}</span></span>
        <span>📰 News: <span className="num">{newsItems.length}</span></span>
      </div>

      {/* Search */}
      <SearchBar />

      {/* Quick Links */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
        <Link href="/songs" className="wap-btn wap-btn-primary" style={{ flex: 1, textAlign: 'center' }}>
          🎵 Browse Songs
        </Link>
        <Link href="/folders" className="wap-btn" style={{ flex: 1, textAlign: 'center' }}>
          📁 Browse Folders
        </Link>
      </div>

      {/* Latest Songs */}
      <div className="wap-card">
        <h3>🎵 Latest Songs</h3>
        <div className="meta">Recently added tracks</div>

        {latestSongs.length === 0 ? (
          <p style={{ color: '#556677', fontStyle: 'italic', padding: 8 }}>
            No songs uploaded yet.
          </p>
        ) : (
          latestSongs.map(song => (
            <div key={song.id} className="song-entry">
              <div className="song-icon">🎵</div>
              <div className="song-info">
                <Link href={`/songs/${song.id}`} className="title">
                  {song.title}
                </Link>
                <div className="artist">{song.artist}</div>
                <div className="extra">
                  {song.genre && <span>{song.genre}</span>}
                  {song.album && <span>{song.album}</span>}
                  <span>📥 {song.downloads}</span>
                </div>
              </div>
              <Link href={`/api/songs/${song.id}/download`} className="song-dl-btn">
                DL
              </Link>
            </div>
          ))
        )}

        {songs.length > 5 && (
          <div style={{ textAlign: 'center', padding: 8 }}>
            <Link href="/songs" className="wap-btn" style={{ fontSize: 10 }}>
              View All Songs →
            </Link>
          </div>
        )}
      </div>

      {/* Activity Ticker */}
      {updates.length > 0 && (
        <>
          <div className="wap-separator" />
          <div className="wap-card" style={{ borderLeft: '3px solid #f5a623' }}>
            <h3>⚡ Latest Activity</h3>
            <div className="meta">Recent updates on the site</div>
            {updates.map(update => (
              <div key={update.id} className="activity-entry">
                <span className="activity-icon">{update.icon}</span>
                <span className="activity-desc">
                  {update.type === 'song_added' ? (
                    <Link href={`/songs/${update.refId}`}>{update.title}</Link>
                  ) : update.type === 'news_posted' ? (
                    <Link href={`/news/${update.refId}`}>{update.title}</Link>
                  ) : update.type === 'folder_created' ? (
                    <Link href={`/folders/${update.refId}`}>{update.title}</Link>
                  ) : (
                    update.title
                  )}
                  <span style={{ color: '#556677', fontSize: 9, marginLeft: 4 }}>
                    — {update.description}
                  </span>
                </span>
                <span className="activity-time">
                  {new Date(update.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* News Section */}
      {newsItems.length > 0 && (
        <>
          <div className="wap-separator" />
          <div className="wap-card" style={{ borderLeft: '3px solid #e94560' }}>
            <h3>📰 Latest News</h3>
            <div className="meta">Site updates and announcements</div>
            {newsItems.slice(0, 3).map(item => (
              <div key={item.id} className="activity-entry">
                <span className="activity-icon">📰</span>
                <span className="activity-desc">
                  <Link href={`/news/${item.id}`} style={{ color: '#f5a623', fontWeight: 'bold', textDecoration: 'none' }}>
                    {item.title}
                  </Link>
                  <div style={{ fontSize: 10, color: '#556677' }}>{item.excerpt}</div>
                </span>
                <span className="activity-time">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Site Update Info */}
      <div className="wap-ticker">
        <span>📢 MP3WAP v2.0 — Browse MP3 songs, organized folders, latest news, and activity updates! 📢</span>
      </div>
    </>
  );
}
