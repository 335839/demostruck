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
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/login', { state: { from: '/cabinet' } });
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/offers/saved')
      .then(res => setOffers(res.data))
      .catch(() => setFetchError('Failed to load saved offers.'))
      .finally(() => setFetching(false));
  }, [isAuthenticated]);

  if (loading || fetching) return <div className="spinner" />;

  return (
    <div className="page-wrap" style={{ maxWidth: 960 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4, marginTop: 0 }}>My Cabinet</h1>
        <p style={{ color: 'var(--text)' }}>Welcome, <strong>{user?.email}</strong></p>
      </div>

      <h2 style={{ marginBottom: 16 }}>Saved Offers</h2>

      {fetchError ? (
        <div style={{ color: '#dc2626', fontSize: 14 }}>{fetchError}</div>
      ) : offers.length === 0 ? (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '36px', textAlign: 'center', color: 'var(--text)' }}>
          No saved offers yet.{' '}
          <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/assets')}>
            Explore assets →
          </span>
        </div>
      ) : (
        <div className="table-scroll" style={{ border: '1px solid var(--border)', borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 600 }}>
            <thead>
              <tr style={{ background: 'var(--code-bg)', borderBottom: '1px solid var(--border)' }}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Asset</th>
                <th className="hide-mobile" style={thStyle}>Scenario</th>
                <th className="hide-mobile" style={thStyle}>Term</th>
                <th style={thStyle}>Package</th>
                <th style={thStyle}>Position</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {offers.map(item => {
                const o = item.offer_snapshot || {};
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>{o.asset?.name ?? '—'}</span>{' '}
                      <span style={{ color: 'var(--text)', fontSize: 12 }}>{o.asset?.ticker}</span>
                    </td>
                    <td className="hide-mobile" style={tdStyle}>{o.scenario?.display_title ?? '—'}</td>
                    <td className="hide-mobile" style={tdStyle}>{o.term?.display_title ?? '—'}</td>
                    <td style={tdStyle}>{o.package?.title ?? '—'}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--accent)' }}>{fmt(o.position_amount, o.currency)}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => navigate('/offer', { state: { offer: o } })}
                        style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--text-h)', fontFamily: 'inherit' }}
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

const thStyle = { padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--text)', letterSpacing: 0.5, textTransform: 'uppercase' };
const tdStyle = { padding: '12px 16px', color: 'var(--text-h)' };
