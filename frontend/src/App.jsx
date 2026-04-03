import { useState } from 'react';
import { BrowserRouter, Link, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Home from './pages/Home';
import AssetList from './pages/AssetList';
import AssetPage from './pages/AssetPage';
import OfferPage from './pages/OfferPage';
import LeadForm from './pages/LeadForm';
import Login from './pages/Login';
import Register from './pages/Register';
import Cabinet from './pages/Cabinet';
import FAQ from './pages/FAQ';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAssets from './pages/admin/AdminAssets';
import AdminOfferRules from './pages/admin/AdminOfferRules';
import AdminLeads from './pages/admin/AdminLeads';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCMS from './pages/admin/AdminCMS';
import AdminAuditLog from './pages/admin/AdminAuditLog';

const ADMIN_ROLES = ['superadmin', 'product_admin', 'content_admin', 'sales_admin'];

function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('disclaimer_dismissed') === '1'; } catch { return false; }
  });

  const dismiss = () => {
    try { localStorage.setItem('disclaimer_dismissed', '1'); } catch {}
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="disclaimer-banner">
      <span>Simulation only — no real investment is made</span>
      <button onClick={dismiss} aria-label="Dismiss">✕</button>
    </div>
  );
}

function Navbar() {
  const { pathname } = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user && ADMIN_ROLES.includes(user.role);
  const close = () => setMenuOpen(false);
  const handleLogout = async () => { await logout(); navigate('/'); close(); };

  const lk = (path) => ({
    color: (path === '/' ? pathname === '/' : pathname.startsWith(path)) ? 'var(--text-h)' : 'var(--text)',
    fontWeight: (path === '/' ? pathname === '/' : pathname.startsWith(path)) ? 600 : 400,
    textDecoration: 'none',
    fontSize: 15,
  });

  const mlink = {
    display: 'block',
    padding: '11px 0',
    fontSize: 15,
    color: 'var(--text-h)',
    textDecoration: 'none',
    borderBottom: '1px solid var(--border)',
  };

  return (
    <nav className="nav-root">
      <div className="nav-inner">
        <Link to="/" style={{ textDecoration: 'none', fontWeight: 800, fontSize: 20, color: 'var(--text-h)', letterSpacing: -0.5 }}>
          Struck
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          <Link to="/assets" style={lk('/assets')}>Assets</Link>
          <Link to="/faq" style={lk('/faq')}>FAQ</Link>
          {isAdmin && <Link to="/admin" style={lk('/admin')}>Admin</Link>}
          {isAuthenticated ? (
            <>
              <Link to="/cabinet" style={lk('/cabinet')}>Cabinet</Link>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: 15, padding: 0 }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={lk('/login')}>Login</Link>
              <Link to="/register" style={{ ...lk('/register'), background: 'var(--accent)', color: '#fff', padding: '6px 14px', borderRadius: 6, fontWeight: 600 }}>
                Register
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div className={`nav-mobile${menuOpen ? ' open' : ''}`}>
        <Link to="/assets" style={mlink} onClick={close}>Assets</Link>
        <Link to="/faq" style={mlink} onClick={close}>FAQ</Link>
        {isAdmin && <Link to="/admin" style={mlink} onClick={close}>Admin</Link>}
        {isAuthenticated ? (
          <>
            <Link to="/cabinet" style={mlink} onClick={close}>Cabinet</Link>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', padding: '11px 0', fontSize: 15, color: 'var(--text-h)', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={mlink} onClick={close}>Login</Link>
            <Link to="/register" style={{ ...mlink, color: 'var(--accent)', fontWeight: 600, borderBottom: 'none' }} onClick={close}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function Layout() {
  return (
    <>
      <DisclaimerBanner />
      <Navbar />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin routes (own layout, no main navbar) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="assets" element={<AdminAssets />} />
            <Route path="offer-rules" element={<AdminOfferRules />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="cms" element={<AdminCMS />} />
            <Route path="audit-log" element={<AdminAuditLog />} />
          </Route>

          {/* Public routes with navbar + disclaimer banner */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/assets" element={<AssetList />} />
            <Route path="/assets/:id" element={<AssetPage />} />
            <Route path="/offer" element={<OfferPage />} />
            <Route path="/lead" element={<LeadForm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cabinet" element={<Cabinet />} />
            <Route path="/faq" element={<FAQ />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
