import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const FILTERS = ['All', 'Crypto', 'Commodity', 'Equity', 'ETF'];
const CLASS_MAP = { All: null, Crypto: 'crypto', Commodity: 'commodity', Equity: 'equity', ETF: 'etf' };

const BADGE_COLORS = {
  crypto:    { bg: 'rgba(170,59,255,0.12)', color: '#aa3bff' },
  commodity: { bg: 'rgba(234,179,8,0.12)',  color: '#b45309' },
  equity:    { bg: 'rgba(59,130,246,0.12)', color: '#1d4ed8' },
  etf:       { bg: 'rgba(34,197,94,0.12)',  color: '#15803d' },
};

function Change({ value }) {
  if (value == null) return null;
  const pos = value >= 0;
  return (
    <span style={{ color: pos ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: 13 }}>
      {pos ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

function Badge({ cls }) {
  const style = BADGE_COLORS[cls] || {};
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      borderRadius: 4,
      padding: '2px 8px',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'capitalize',
      flexShrink: 0,
    }}>
      {cls}
    </span>
  );
}

export default function AssetList() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get('/assets')
      .then(res => { setAssets(res.data); })
      .catch(() => setError('Failed to load assets. Please check your connection.'))
      .finally(() => setLoading(false));
  }, [retry]);

  const visible = CLASS_MAP[filter]
    ? assets.filter(a => a.asset_class === CLASS_MAP[filter])
    : assets;

  if (loading) return <div className="spinner" />;

  if (error) return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>
      <button
        onClick={() => setRetry(r => r + 1)}
        style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="page-wrap">
      <h2 style={{ marginTop: 0, marginBottom: 6 }}>Assets</h2>
      <p style={{ color: 'var(--text)', marginBottom: 28 }}>
        Choose an asset to build your structured offer
      </p>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 20,
              padding: '6px 16px',
              fontSize: 14,
              cursor: 'pointer',
              background: filter === f ? 'var(--accent)' : 'var(--bg)',
              color: filter === f ? '#fff' : 'var(--text-h)',
              fontWeight: filter === f ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Asset grid */}
      {visible.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text)' }}>
          No assets in this category.
        </div>
      ) : (
        <div className="asset-grid">
          {visible.map(asset => (
            <div
              key={asset.id}
              onClick={() => navigate(`/assets/${asset.id}`)}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '20px',
                cursor: 'pointer',
                background: 'var(--bg)',
                textAlign: 'left',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: 16, marginBottom: 2 }}>{asset.name}</div>
                  <div style={{ color: 'var(--text)', fontSize: 13 }}>{asset.ticker}</div>
                </div>
                <Badge cls={asset.asset_class} />
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: 20, marginBottom: 8 }}>
                {asset.currency} {asset.price?.toLocaleString()}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: 'var(--text)' }}>1M: <Change value={asset.change_1m_pct} /></span>
                <span style={{ fontSize: 13, color: 'var(--text)' }}>1Y: <Change value={asset.change_1y_pct} /></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
