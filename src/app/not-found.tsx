import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h2 style={{ color: '#e94560', fontSize: 18, marginBottom: 8 }}>404 — Not Found</h2>
      <p style={{ color: '#8899aa', fontSize: 12, marginBottom: 20 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="wap-btn">← Back to Home</Link>
    </div>
  );
}
