import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import AssetList from './pages/AssetList';
import AssetPage from './pages/AssetPage';
import OfferPage from './pages/OfferPage';

function Navbar() {
  const { pathname } = useLocation();

  const linkStyle = (path) => ({
    color: pathname === path ? 'var(--text-h)' : 'var(--text)',
    fontWeight: pathname === path ? 600 : 400,
    textDecoration: 'none',
    fontSize: 15,
    padding: '4px 0',
    borderBottom: pathname === path ? '2px solid var(--accent)' : '2px solid transparent',
  });

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
      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        <Link to="/assets" style={linkStyle('/assets')}>Assets</Link>
        <span style={{ color: 'var(--text)', fontSize: 15, cursor: 'default' }}>Login</span>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assets" element={<AssetList />} />
        <Route path="/assets/:id" element={<AssetPage />} />
        <Route path="/offer" element={<OfferPage />} />
      </Routes>
    </BrowserRouter>
  );
}
