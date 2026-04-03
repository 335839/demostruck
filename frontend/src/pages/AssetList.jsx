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
  const pos = value >= 0;
  return (
    <span style={{ color: pos ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: 13 }}>
      {pos ? '+' : ''}{value?.toFixed(2)}%
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
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'capitalize',
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

  useEffect(() => {
    api.get('/assets')
      .then(res => { setAssets(res.data); setLoading(false); })
      .catch(() => { setError('Failed to load assets.'); setLoading(false); });
  }, []);

  const visible = CLASS_MAP[filter]
    ? assets.filter(a => a.asset_class === CLASS_MAP[filter])
    : assets;

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text)' }}>Loading assets…</div>;
  if (error)   return <div style={{ padding: 48, textAlign: 'center', color: '#dc2626' }}>{error}</div>;

  return (
    <div style={{ padding: '40px 32px' }}>
      <h2 style={{ textAlign: 'left', marginBottom: 8 }}>Assets</h2>
      <p style={{ textAlign: 'left', color: 'var(--text)', marginBottom: 28 }}>
        Choose an asset to build your structured offer
      </p>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '6px 16px',
              fontSize: 14,
              cursor: 'pointer',
              background: filter === f ? 'var(--accent)' : 'var(--bg)',
              color: filter === f ? '#fff' : 'var(--text-h)',
              fontWeight: filter === f ? 600 : 400,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Asset grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16,
      }}>
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
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: 17 }}>{asset.name}</div>
                <div style={{ color: 'var(--text)', fontSize: 13 }}>{asset.ticker}</div>
              </div>
              <Badge cls={asset.asset_class} />
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 22, marginBottom: 8 }}>
              {asset.currency} {asset.price?.toLocaleString()}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>1M: <Change value={asset.change_1m_pct} /></span>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>1Y: <Change value={asset.change_1y_pct} /></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
