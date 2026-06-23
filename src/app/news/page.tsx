'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  author?: string;
  createdAt: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [loading, setLoading] = useState(false);

  const loadNews = async () => {
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      setNews(data.news || []);
    } catch (e) {}
  };

  useEffect(() => { loadNews(); }, []);

  const handlePublish = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent, author: newAuthor || 'Admin' }),
      });
      const data = await res.json();
      if (data.success) {
        setNewTitle('');
        setNewContent('');
        setNewAuthor('');
        setShowForm(false);
        loadNews();
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this news post?')) return;
    try {
      await fetch(`/api/news/${id}`, { method: 'DELETE' });
      loadNews();
    } catch (e) {}
  };

  return (
    <>
      <div className="wap-breadcrumb">
        <Link href="/">Home</Link> &gt; News
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ color: '#e94560', fontSize: 14, fontWeight: 'bold' }}>📰 News & Updates</h2>
        <button onClick={() => setShowForm(!showForm)} className="wap-btn" style={{ fontSize: 10 }}>
          {showForm ? '✕ Cancel' : '+ Publish'}
        </button>
      </div>

      {showForm && (
        <div className="wap-card" style={{ borderLeft: '3px solid #e94560', marginBottom: 8 }}>
          <h3>📝 Publish News</h3>
          <label className="wap-label">Title</label>
          <input className="wap-input" type="text" value={newTitle}
            onChange={e => setNewTitle(e.target.value)} placeholder="News title" />

          <label className="wap-label">Content</label>
          <textarea className="wap-textarea" value={newContent}
            onChange={e => setNewContent(e.target.value)} placeholder="Write your news content..."
            style={{ minHeight: 120 }} />

          <label className="wap-label">Author (optional)</label>
          <input className="wap-input" type="text" value={newAuthor}
            onChange={e => setNewAuthor(e.target.value)} placeholder="Your name" />

          <div style={{ marginTop: 10 }}>
            <button onClick={handlePublish} className="wap-btn wap-btn-success wap-btn-block"
              disabled={loading || !newTitle.trim() || !newContent.trim()}>
              {loading ? '⏳ Publishing...' : '📰 PUBLISH NEWS'}
            </button>
          </div>
        </div>
      )}

      {news.length === 0 ? (
        <div className="wap-card">
          <p style={{ color: '#556677', textAlign: 'center', padding: 20 }}>
            No news published yet.
          </p>
        </div>
      ) : (
        news.map(item => (
          <div key={item.id} className="wap-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Link href={`/news/${item.id}`} className="news-title">
                  {item.title}
                </Link>
              </div>
              <button onClick={() => handleDelete(item.id)}
                style={{
                  background: 'none', border: '1px solid #e94560', color: '#e94560',
                  fontFamily: 'monospace', fontSize: 9, padding: '1px 5px', cursor: 'pointer',
                  marginLeft: 8, flexShrink: 0
                }}>
                DEL
              </button>
            </div>
            <div className="news-excerpt">{item.excerpt || item.content.substring(0, 150)}</div>
            <div className="news-meta">
              By {item.author || 'Admin'} | {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))
      )}
    </>
  );
}
