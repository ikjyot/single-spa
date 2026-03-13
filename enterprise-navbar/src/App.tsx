import { useState, useEffect } from 'react';
import { userSession$ } from '@comp/auth-utility';
import type { UserSession } from '@comp/auth-utility';
// 1. Import the Single-SPA routing interceptor!
import { navigateToUrl } from 'single-spa';

// 1. THE ENTERPRISE FIX: Create a robust, reusable Cross-MFE Link component and avoid page refresh. With just n
const MfeLink = ({ href, children, style, className }: { href: string, children: React.ReactNode, style?: React.CSSProperties, className?: string }) => {
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Explicitly stop React's Synthetic Event
    navigateToUrl(href); // Safely pass just the string URL to Single-SPA
  };

  return (
    <a href={href} onClick={handleNavigation} style={style} className={className}>
      {children}
    </a>
  );
};

export default function App() {
  const [session, setSession] = useState<UserSession>({
    isAuthenticated: false,
    username: null,
    roles: [],
  });

  useEffect(() => {
    // 1. Subscribe to the enterprise event bus
    const subscription = userSession$.subscribe((currentSession: UserSession) => {
      console.log('Navbar received new session:', currentSession);
      setSession(currentSession);
    });

    // 2. Prevent memory leaks on unmount
    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = session.roles.includes('admin');

  return (
    <div style={{ padding: '1rem', color: 'white', display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold', color: '#f8f6f6ff' }}>Enterprise Portal</div>
      {/* 2. Add onClick={navigateToUrl} to intercept the hard reload */}
      <MfeLink href="/dashboard" style={{ color: '#f8f6f6ff', textDecoration: 'none' }}>Dashboard</MfeLink>
      <MfeLink href="/profile" style={{ color: '#f8f6f6ff', textDecoration: 'none' }}>Profile</MfeLink>

      {/* 3. Granular RBAC conditionally rendering the UI */}
      {isAdmin && (
        <MfeLink href="/admin" style={{ color: '#f8f6f6ff', textDecoration: 'none', border: '1px solid #f8f6f6ff', padding: '2px 8px', borderRadius: '4px' }}>
          Admin Settings
        </MfeLink>
      )}

      <div style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#f8f6f6ff' }}>
        {session.isAuthenticated
          ? `Welcome, ${session.username}`
          : 'Connecting to Auth...'}
      </div>
    </div>
  );
}