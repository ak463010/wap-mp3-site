import Link from 'next/link';
import { getLatestUpdates } from '@/lib/data';

export default function LatestUpdatesPage() {
  const updates = getLatestUpdates(50);

  const grouped = updates.reduce<Record<string, typeof updates>>((acc, u) => {
    const date = new Date(u.createdAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(u);
    return acc;
  }, {});

  return (
    <>
      <div className="wap-breadcrumb">
        <Link href="/">Home</Link> &gt; Latest Updates
      </div>

      <h2 style={{ color: '#4fc3f7', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
        ⚡ Latest Updates
      </h2>

      <div className="wap-stats" style={{ marginBottom: 8 }}>
        <span>Total Updates: <span className="num">{updates.length}</span></span>
      </div>

      {updates.length === 0 ? (
        <div className="wap-card">
          <p style={{ color: '#556677', textAlign: 'center', padding: 20 }}>
            No recent activity.
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="wap-card" style={{ padding: 0 }}>
            <div style={{
              background: '#0f3460', padding: '6px 10px', fontSize: 11,
              color: '#8899aa', borderBottom: '1px solid #2a3a5e'
            }}>
              📅 {date}
            </div>
            {items.map(update => (
              <div key={update.id} className="activity-entry">
                <span className="activity-icon">{update.icon}</span>
                <span className="activity-desc">
                  <span style={{ color: '#e0e0e0' }}>
                    {update.type === 'song_added' && '🎵 New Song: '}
                    {update.type === 'news_posted' && '📰 News: '}
                    {update.type === 'folder_created' && '📁 New Folder: '}
                    {update.type === 'site_update' && '🔧 Site: '}
                  </span>
                  {update.type === 'song_added' ? (
                    <Link href={`/songs/${update.refId}`} style={{ color: '#4fc3f7' }}>{update.title}</Link>
                  ) : update.type === 'news_posted' ? (
                    <Link href={`/news/${update.refId}`} style={{ color: '#f5a623' }}>{update.title}</Link>
                  ) : update.type === 'folder_created' ? (
                    <Link href={`/folders/${update.refId}`} style={{ color: '#f5a623' }}>{update.title}</Link>
                  ) : (
                    <span>{update.title}</span>
                  )}
                </span>
                <span className="activity-time" style={{ color: '#556677' }}>
                  {new Date(update.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        ))
      )}

      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <Link href="/" className="wap-btn" style={{ fontSize: 11 }}>
          ← Back to Home
        </Link>
      </div>
    </>
  );
}
