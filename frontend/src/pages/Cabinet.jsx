import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

function fmt(n, currency) {
  if (n == null) return '—';
  return `${currency ?? ''} ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();
}

export default function Cabinet() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/login', { state: { from: '/cabinet' } });
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/offers/saved')
      .then(res => setOffers(res.data))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [isAuthenticated]);

  if (loading || fetching) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text)' }}>Loading…</div>;

  return (
    <div style={{ padding: '40px 32px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>My Cabinet</h1>
      <p style={{ color: 'var(--text)', marginBottom: 36 }}>Welcome, <strong>{user?.email}</strong></p>

      <h2 style={{ marginBottom: 16 }}>Saved Offers</h2>

      {offers.length === 0 ? (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '32px', textAlign: 'center', color: 'var(--text)' }}>
          No saved offers yet.{' '}
          <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/assets')}>
            Explore assets →
          </span>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--code-bg)', borderBottom: '1px solid var(--border)' }}>
                {['Date', 'Asset', 'Scenario', 'Term', 'Package', 'Position', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {offers.map(item => {
                const o = item.offer_snapshot || {};
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td style={tdStyle}>{o.asset?.name ?? '—'} <span style={{ color: 'var(--text)', fontSize: 12 }}>{o.asset?.ticker}</span></td>
                    <td style={tdStyle}>{o.scenario?.display_title ?? '—'}</td>
                    <td style={tdStyle}>{o.term?.display_title ?? '—'}</td>
                    <td style={tdStyle}>{o.package?.title ?? '—'}</td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--accent)' }}>{fmt(o.position_amount, o.currency)}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => navigate('/offer', { state: { offer: o } })}
                        style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--text-h)' }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: 'var(--text)' };
const tdStyle = { padding: '12px 16px', color: 'var(--text-h)' };
