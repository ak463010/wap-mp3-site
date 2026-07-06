'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/songs', label: 'Songs' },
  { href: '/folders', label: 'Folders' },
  { href: '/songs/upload', label: 'Upload' },
  { href: '/news', label: 'News' },
  { href: '/latest', label: 'Updates' },
  { href: '/about', label: 'About' },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [time, setTime] = useState('');

  useEffect(() => {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const t = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setTime(`${d} | ${t}`);
  }, []);

  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <div className="wap-container">
      {/* WAP Header */}
      <div className="wap-header">
        <h1>◈ MP3WAP ◈</h1>
        <div className="subtitle">~ Free MP3 Downloads ~</div>
        <div className="time-display">{time}</div>
      </div>

      {/* Navigation */}
      <nav className="wap-nav">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? 'active' : ''}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="wap-separator" />

      {/* Content */}
      <main className="wap-content">
        {children}
      </main>

      {/* Footer */}
      <div className="wap-separator" />
      <footer className="wap-footer">
        <div>MP3WAP v2.0 — Powered by Next.js</div>
        <div style={{ marginTop: 4 }}>
          <a href="/">Home</a> | <a href="/songs">Songs</a> |{' '}
          <a href="/folders">Folders</a> | <a href="/news">News</a> |{' '}
          <a href="/songs/upload">Upload</a>
        </div>
        <div style={{ marginTop: 4 }}>
          Best viewed on mobile | All files for download purposes only
        </div>
      </footer>
    </div>
  );
}
