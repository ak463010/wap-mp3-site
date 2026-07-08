'use client';

import { useEffect, useState } from 'react';

export default function AdminNewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const loadNews = async () => {
    const res = await fetch('/api/admin/news');
    const data = await res.json();
    setNews(data.news || []);
  };

  useEffect(() => { loadNews(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setTitle(''); setContent(''); setAuthor('Admin');
    setShowModal(true); setMessage(null);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setMessage({ type: 'error', text: 'Title and content are required!' });
      return;
    }
    try {
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, author: author || 'Admin' }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'News published!' });
        setShowModal(false);
        loadNews();
      }
    } catch { setMessage({ type: 'error', text: 'Failed' }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this news article?')) return;
    try {
      await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
      loadNews();
    } catch {}
  };

  return (
    <>
      <div className="admin-header-bar">
        <div>
          <h1>📰 News</h1>
          <p>Manage site announcements — {news.length} articles</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>
          + Publish News
        </button>
      </div>

      {message && (
        <div className={`admin-alert admin-alert-${message.type}`}>{message.text}</div>
      )}

      <div className="admin-card admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Date</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {news.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="admin-empty">
                    <div className="icon">📰</div>
                    <h3>No news articles</h3>
                    <p>Publish your first announcement.</p>
                  </div>
                </td>
              </tr>
            ) : news.map((item: any) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.title}</td>
                <td style={{ color: '#8b8fa3' }}>{item.author}</td>
                <td style={{ fontSize: 12, color: '#8b8fa3' }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="actions">
                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(item.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>📰 Publish News</h3>
            <p>Create a new announcement for your site</p>

            <label className="admin-label">Title</label>
            <input className="admin-input" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="News title" />

            <label className="admin-label">Content</label>
            <textarea className="admin-textarea" value={content} onChange={e => setContent(e.target.value)}
              placeholder="Write your news content..." style={{ minHeight: 150 }} />

            <label className="admin-label">Author</label>
            <input className="admin-input" value={author} onChange={e => setAuthor(e.target.value)} />

            <div className="admin-flex admin-gap-2 admin-mt-4">
              <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                Publish
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
