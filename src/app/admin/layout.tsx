'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import './admin.css';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/songs', label: 'Songs', icon: '🎵' },
  { href: '/admin/folders', label: 'Folders', icon: '📁' },
  { href: '/admin/news', label: 'News', icon: '📰' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const [auth, setAuth] = useState<boolean | null>(null);
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  useEffect(() => {
    if (isLoginPage) {
      setAuth(null);
      return;
    }

    let cancelled = false;
    setAuth(current => current === true ? true : null);

    fetch('/api/admin/stats')
      .then(r => { if (!cancelled) setAuth(r.ok); })
      .catch(() => { if (!cancelled) setAuth(false); });

    return () => { cancelled = true; };
  }, [isLoginPage]);

  useEffect(() => {
    setLoadingPath(null);
  }, [pathname]);

  useEffect(() => {
    if (auth === false && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [auth, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (auth === null) {
    return (
      <div className="admin-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="admin-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (auth === false) {
    return null;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    document.cookie = 'admin_token=; path=/; max-age=0';
    router.push('/admin/login');
  };

  return (
    <div className="admin-body">
      {loadingPath && <div className="admin-top-loader" />}
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <h2>MP3WAP</h2>
            <div className="sub">Admin Panel</div>
          </div>
          <nav className="admin-sidebar-nav">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={() => {
                  if (pathname !== item.href) setLoadingPath(item.href);
                }}
                className={`admin-nav-item ${pathname === item.href ? 'active' : ''}`}
              >
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="admin-sidebar-footer">
            <Link href="/" className="admin-nav-item" target="_blank">
              <span className="icon">🌐</span>
              <span>View Site</span>
            </Link>
            <button onClick={handleLogout} className="admin-nav-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
              <span className="icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
