'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { useSession } from '../providers/SessionProvider';

const NAV_LINKS = [
  { href: '/', label: 'Home', auth: null },
  { href: '/products', label: 'Marketplace', auth: null },
  { href: '/orders', label: 'My Orders', auth: 'user' },
  { href: '/dashboard', label: 'Admin', auth: 'admin' },
];

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading, logout, refreshProfile, user } = useSession();
  const [isRefreshing, setRefreshing] = useState(false);

  const filteredLinks = useMemo(() => {
    return NAV_LINKS.filter((link) => {
      if (link.auth === 'admin') {
        return user?.role === 'admin';
      }
      if (link.auth === 'user') {
        return isAuthenticated;
      }
      return true;
    });
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleRefreshProfile = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-brand">
          <Link href="/">
            <span className="brand-mark">ExportHub</span>
          </Link>
        </div>
        <nav className="site-nav">
          {filteredLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={isActive ? 'active' : ''}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="session-controls">
          {loading ? (
            <span className="session-status">Loading…</span>
          ) : isAuthenticated ? (
            <>
              <div className="session-details">
                <span className="session-name">{user?.full_name}</span>
                <span className="session-role">{user?.role === 'admin' ? 'Administrator' : 'Member'}</span>
              </div>
              <button
                type="button"
                className="ghost"
                onClick={handleRefreshProfile}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing…' : 'Sync'}
              </button>
              <button type="button" className="ghost" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="ghost">
                Log in
              </Link>
              <Link href="/signup" className="primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <p>© {new Date().getFullYear()} ExportHub. Connecting global buyers and sellers.</p>
      </footer>
    </div>
  );
}
