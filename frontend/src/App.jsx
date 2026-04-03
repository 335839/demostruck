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

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAssets from './pages/admin/AdminAssets';
import AdminOfferRules from './pages/admin/AdminOfferRules';
import AdminLeads from './pages/admin/AdminLeads';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCMS from './pages/admin/AdminCMS';
import AdminAuditLog from './pages/admin/AdminAuditLog';
import FAQ from './pages/FAQ';

const ADMIN_ROLES = ['superadmin', 'product_admin', 'content_admin', 'sales_admin'];

function Navbar() {
  const { pathname } = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user && ADMIN_ROLES.includes(user.role);

  const linkStyle = (path) => ({
    color: pathname.startsWith(path) && path !== '/' ? 'var(--text-h)' : pathname === '/' && path === '/' ? 'var(--text-h)' : 'var(--text)',
    fontWeight: (pathname.startsWith(path) && path !== '/') || (pathname === '/' && path === '/') ? 600 : 400,
    textDecoration: 'none',
    fontSize: 15,
  });

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      height: 56,
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      <Link to="/" style={{ textDecoration: 'none', fontWeight: 800, fontSize: 20, color: 'var(--text-h)', letterSpacing: -0.5 }}>
        Struck
      </Link>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <Link to="/assets" style={linkStyle('/assets')}>Assets</Link>
        <Link to="/faq" style={linkStyle('/faq')}>FAQ</Link>
        {isAdmin && <Link to="/admin" style={linkStyle('/admin')}>Admin</Link>}
        {isAuthenticated ? (
          <>
            <Link to="/cabinet" style={linkStyle('/cabinet')}>Cabinet</Link>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: 15, padding: 0 }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle('/login')}>Login</Link>
            <Link to="/register" style={{ ...linkStyle('/register'), background: 'var(--accent)', color: '#fff', padding: '6px 14px', borderRadius: 6, fontWeight: 600 }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function Layout() {
  return (
    <>
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

          {/* Public routes with main navbar */}
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
