import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const FEATURED_TICKERS = ['BTC', 'ETH', 'AAPL', 'NVDA'];

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

  useEffect(() => {
    api.get('/assets').then(res => {
      const picks = FEATURED_TICKERS
        .map(t => res.data.find(a => a.ticker === t))
        .filter(Boolean);
      setFeatured(picks);
    }).catch(() => {});
  }, []);

  return (
    <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{ padding: '72px 32px 48px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ maxWidth: 720, margin: '0 auto 16px' }}>
          Get a bigger position on assets you believe in
        </h1>
        <p style={{ fontSize: 20, color: 'var(--text)', maxWidth: 560, margin: '0 auto 36px' }}>
          Limited downside. Simulated. No real money.
        </p>
        <button
          onClick={() => navigate('/assets')}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '14px 32px',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Explore Assets
        </button>
      </div>

      {/* Featured asset cards */}
      {featured.length > 0 && (
        <div style={{ padding: '48px 32px' }}>
          <p style={{ color: 'var(--text)', marginBottom: 24, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>
            Popular assets
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {featured.map(asset => (
              <div
                key={asset.id}
                onClick={() => navigate(`/assets/${asset.id}`)}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '20px 24px',
                  minWidth: 160,
                  cursor: 'pointer',
                  background: 'var(--bg)',
                  textAlign: 'left',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: 18 }}>{asset.name}</div>
                <div style={{ color: 'var(--text)', fontSize: 13, marginBottom: 12 }}>{asset.ticker}</div>
                <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 20, marginBottom: 6 }}>
                  {asset.currency} {asset.price?.toLocaleString()}
                </div>
                <Change value={asset.change_1m_pct} label="1M" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '16px 32px',
        fontSize: 13,
        color: 'var(--text)',
        marginTop: 'auto',
      }}>
        This is a simulation only. No real investment is made.
      </div>
    </div>
  );
}
