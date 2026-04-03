import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const FEATURED_TICKERS = ['BTC', 'ETH', 'AAPL', 'NVDA'];

const CMS_DEFAULTS = {
  hero_headline: 'Get a bigger position on assets you believe in',
  hero_subheadline: 'Limited downside. Simulated. No real money.',
  disclaimer: 'This is a simulation only. No real investment is made.',
};

function Change({ value, label }) {
  const pos = value >= 0;
  return (
    <span style={{ color: pos ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: 13 }}>
      {pos ? '+' : ''}{value?.toFixed(2)}% {label}
    </span>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [cms, setCms] = useState(CMS_DEFAULTS);
  const [assetsLoading, setAssetsLoading] = useState(true);

  useEffect(() => {
    api.get('/assets')
      .then(res => {
        const picks = FEATURED_TICKERS
          .map(t => res.data.find(a => a.ticker === t))
          .filter(Boolean);
        setFeatured(picks);
      })
      .catch(() => {})
      .finally(() => setAssetsLoading(false));

    api.get('/cms')
      .then(res => setCms({ ...CMS_DEFAULTS, ...res.data }))
      .catch(() => {});
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '72px 24px 56px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ maxWidth: 700, margin: '0 auto 16px', lineHeight: 1.1 }}>
          {cms.hero_headline}
        </h1>
        <p style={{ fontSize: 20, color: 'var(--text)', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.5 }}>
          {cms.hero_subheadline}
        </p>
        <button
          onClick={() => navigate('/assets')}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '14px 36px',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Explore Assets
        </button>
      </div>

      {/* Featured asset cards */}
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text)', marginBottom: 24, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>
          Popular assets
        </p>
        {assetsLoading ? (
          <div className="spinner" />
        ) : featured.length > 0 ? (
          <div className="asset-grid" style={{ maxWidth: 880, margin: '0 auto' }}>
            {featured.map(asset => (
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
                <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: 17, marginBottom: 2 }}>{asset.name}</div>
                <div style={{ color: 'var(--text)', fontSize: 13, marginBottom: 12 }}>{asset.ticker}</div>
                <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: 22, marginBottom: 8 }}>
                  {asset.currency} {asset.price?.toLocaleString()}
                </div>
                <Change value={asset.change_1m_pct} label="1M" />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* How it works */}
      {cms.how_it_works && (
        <div style={{ padding: '0 24px 48px', textAlign: 'center' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px', background: 'var(--code-bg)', borderRadius: 12 }}>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>{cms.how_it_works}</p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '14px 24px',
        fontSize: 12,
        color: 'var(--text)',
        textAlign: 'center',
        marginTop: 'auto',
      }}>
        {cms.disclaimer}
      </div>
    </div>
  );
}
