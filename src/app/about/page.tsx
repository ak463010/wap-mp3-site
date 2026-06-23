import Link from 'next/link';
import { getSongs, getFolders, getNews } from '@/lib/data';

export default function AboutPage() {
  const songs = getSongs();
  const folders = getFolders();
  const newsItems = getNews();
  const totalDownloads = songs.reduce((sum, s) => sum + (s.downloads || 0), 0);
  const totalSize = songs.reduce((sum, s) => sum + (s.fileSize || 0), 0);

  return (
    <>
      <div className="wap-breadcrumb">
        <Link href="/">Home</Link> &gt; About
      </div>

      <div className="wap-card" style={{ borderLeft: '3px solid #00bcd4' }}>
        <h3>◈ About MP3WAP</h3>
        <p style={{ fontSize: 11, marginTop: 4 }}>
          MP3WAP is a retro-styled MP3 download site inspired by the classic WAP
          (Wireless Application Protocol) sites from the early 2000s. Built with
          modern technology but keeping that old-school mobile web feel.
        </p>
      </div>

      <div className="wap-card" style={{ borderLeft: '3px solid #66bb6a' }}>
        <h3>📊 Site Statistics</h3>
        <div className="song-detail-info">
          <span className="label">Total Songs:</span>
          <span className="value">{songs.length}</span>
          <span className="label">Total Folders:</span>
          <span className="value">{folders.length}</span>
          <span className="label">News Articles:</span>
          <span className="value">{newsItems.length}</span>
          <span className="label">Total Downloads:</span>
          <span className="value">{totalDownloads}</span>
          <span className="label">Total Size:</span>
          <span className="value">
            {(totalSize / (1024 * 1024)).toFixed(2)} MB
          </span>
        </div>
      </div>

      <div className="wap-card" style={{ borderLeft: '3px solid #f5a623' }}>
        <h3>✨ Features</h3>
        <ul style={{ fontSize: 11, paddingLeft: 16, marginTop: 4, lineHeight: 2 }}>
          <li>🎵 Upload and download MP3 songs</li>
          <li>📁 Create folders to organize music</li>
          <li>📰 Publish news and announcements</li>
          <li>⚡ Real-time activity feed</li>
          <li>🔍 Search songs by title, artist, album</li>
          <li>📱 Mobile-optimized WAP interface</li>
          <li>📊 Download tracking for each song</li>
          <li>🏷️ Genre categorization</li>
        </ul>
      </div>

      <div className="wap-card" style={{ borderLeft: '3px solid #4fc3f7' }}>
        <h3>🔧 Tech Stack</h3>
        <div className="song-detail-info">
          <span className="label">Framework:</span><span className="value">Next.js 16</span>
          <span className="label">Language:</span><span className="value">TypeScript</span>
          <span className="label">Styling:</span><span className="value">Custom CSS (WAP)</span>
          <span className="label">Storage:</span><span className="value">JSON File System</span>
          <span className="label">Uploads:</span><span className="value">Local File System</span>
        </div>
      </div>

      <div className="wap-card" style={{ borderLeft: '3px solid #8899aa' }}>
        <h3>📞 Contact</h3>
        <p style={{ fontSize: 11 }}>
          For inquiries, suggestions, or to report issues, contact the admin.
        </p>
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <Link href="/" className="wap-btn" style={{ fontSize: 11 }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
