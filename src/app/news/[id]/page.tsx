import Link from 'next/link';
import { getNewsItem } from '@/lib/data';
import { notFound } from 'next/navigation';

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getNewsItem(id);
  if (!item) notFound();

  return (
    <>
      <div className="wap-breadcrumb">
        <Link href="/">Home</Link> &gt; <Link href="/news">News</Link> &gt; {item.title}
      </div>

      <div className="wap-card" style={{ borderLeft: '3px solid #e94560' }}>
        <h3>📰 {item.title}</h3>
        <div className="news-meta" style={{ marginBottom: 10 }}>
          By {item.author || 'Admin'} | {new Date(item.createdAt).toLocaleDateString()}
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {item.content}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <Link href="/news" className="wap-btn" style={{ fontSize: 11 }}>
          ← Back to News
        </Link>
      </div>
    </>
  );
}
