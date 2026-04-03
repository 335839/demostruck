import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ADMIN_ROLES = ['superadmin', 'product_admin', 'content_admin', 'sales_admin'];

const NAV_LINKS = [
  { to: '/admin',             label: 'Dashboard' },
  { to: '/admin/assets',      label: 'Assets' },
  { to: '/admin/offer-rules', label: 'Offer Rules' },
  { to: '/admin/leads',       label: 'Leads' },
  { to: '/admin/users',       label: 'Users' },
  { to: '/admin/cms',         label: 'CMS' },
  { to: '/admin/audit-log',   label: 'Audit Log' },
];

export default function AdminLayout() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) { navigate('/login', { state: { from: pathname } }); return; }
    if (!ADMIN_ROLES.includes(user?.role)) { navigate('/'); }
  }, [loading, isAuthenticated, user, navigate, pathname]);

  const handleLogout = async () => { await logout(); navigate('/'); };

  if (loading || !user) return null;

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 200,
        borderRight: '1px solid var(--border)',
        padding: '24px 0',
        flexShrink: 0,
      }}>
        {NAV_LINKS.map(link => {
          const active = pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'block',
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--accent)' : 'var(--text-h)',
                textDecoration: 'none',
                background: active ? 'var(--accent-bg)' : 'transparent',
                borderRight: active ? '3px solid var(--accent)' : '3px solid transparent',
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 28px',
          height: 48,
          borderBottom: '1px solid var(--border)',
          fontSize: 13,
          color: 'var(--text)',
        }}>
          <span>Admin Panel</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>{user.email} <span style={{ color: 'var(--accent)', fontSize: 11 }}>({user.role})</span></span>
            <button onClick={handleLogout} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12, color: 'var(--text-h)' }}>
              Logout
            </button>
          </div>
        </div>

        <div style={{ padding: '28px', flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
