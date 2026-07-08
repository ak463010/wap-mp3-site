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

  useEffect(() => {
    const loadNews = async () => {
      try {
        const res = await fetch('/api/news');
        const data = await res.json();
        setNews(data.news || []);
      } catch (e) {}
    };

    loadNews();
  }, []);

  return (
    <>
      <div className="wap-breadcrumb">
        <Link href="/">Home</Link> &gt; News
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ color: '#e94560', fontSize: 14, fontWeight: 'bold' }}>📰 News & Updates</h2>
      </div>

      {news.length === 0 ? (
        <div className="wap-card">
          <p style={{ color: '#556677', textAlign: 'center', padding: 20 }}>
            No news published yet.
          </p>
        </div>
      ) : (
        news.map(item => (
          <div key={item.id} className="wap-card">
            <Link href={`/news/${item.id}`} className="news-title">
              {item.title}
            </Link>
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
