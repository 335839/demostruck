import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../api';

const BADGE_COLORS = {
  crypto:    { bg: 'rgba(170,59,255,0.12)', color: '#aa3bff' },
  commodity: { bg: 'rgba(234,179,8,0.12)',  color: '#b45309' },
  equity:    { bg: 'rgba(59,130,246,0.12)', color: '#1d4ed8' },
  etf:       { bg: 'rgba(34,197,94,0.12)',  color: '#15803d' },
};

function Badge({ cls }) {
  const s = BADGE_COLORS[cls] || {};
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 4, padding: '3px 10px', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
      {cls}
    </span>
  );
}

function Change({ value, label }) {
  const pos = value >= 0;
  return (
    <span style={{ color: pos ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
      {pos ? '+' : ''}{value?.toFixed(2)}%{label ? ` ${label}` : ''}
    </span>
  );
}

function SelectorBtn({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        background: selected ? 'var(--accent-bg)' : 'var(--bg)',
        color: selected ? 'var(--accent)' : 'var(--text-h)',
        borderRadius: 8,
        padding: '8px 20px',
        fontSize: 14,
        fontWeight: selected ? 600 : 400,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

function PackageCard({ pkg, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        background: selected ? 'var(--accent-bg)' : 'var(--bg)',
        borderRadius: 10,
        padding: '14px 18px',
        cursor: 'pointer',
        flex: '1 1 130px',
        textAlign: 'left',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ fontWeight: 700, color: 'var(--text-h)', marginBottom: 4, fontSize: 15 }}>{pkg.title}</div>
      <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>{pkg.description}</div>
    </div>
  );
}

const TICK_COUNT = 6;

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

export default function AssetPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  const [scenario, setScenario] = useState(null);
  const [term, setTerm] = useState(null);
  const [pkg, setPkg] = useState(null);
  const [amount, setAmount] = useState(1000);
  const [submitting, setSubmitting] = useState(false);
  const [offerError, setOfferError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get(`/assets/${id}`),
      api.get('/config'),
    ])
      .then(([assetRes, configRes]) => {
        setAsset(assetRes.data);
        setConfig(configRes.data);
      })
      .catch(() => setError('Failed to load asset data.'))
      .finally(() => setLoading(false));
  }, [id, retry]);

  const handleGetOffer = async () => {
    if (!scenario || !term || !pkg) {
      setOfferError('Please select a scenario, term, and protection package.');
      return;
    }
    setSubmitting(true);
    setOfferError(null);
    try {
      const res = await api.post('/offer', {
        asset_id: id,
        scenario_id: scenario,
        term_id: term,
        package_id: pkg,
        amount: Number(amount),
      });
      navigate('/offer', { state: { offer: res.data } });
    } catch (err) {
      const msg = err.response?.data?.detail || 'No offer available for this combination.';
      setOfferError(msg);
    } finally {
      setSubmitting(false);
    }
  };

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

  const history = asset.history || [];
  const step = Math.max(1, Math.floor(history.length / TICK_COUNT));
  const ticks = history.filter((_, i) => i % step === 0).map(d => d.date);

  return (
    <div className="page-wrap">
      {/* Back link */}
      <button
        onClick={() => navigate('/assets')}
        style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: 14, padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: 4 }}
      >
        ← All assets
      </button>

      {/* Asset header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
          <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1 }}>{asset.name}</h1>
          <span style={{ color: 'var(--text)', fontSize: 18 }}>{asset.ticker}</span>
          {asset.asset_class && <Badge cls={asset.asset_class} />}
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-h)' }}>
            {asset.currency} {asset.price?.toLocaleString()}
          </span>
          <Change value={asset.change_1m_pct} label="1M" />
          <Change value={asset.change_1y_pct} label="1Y" />
        </div>
        {asset.short_description && (
          <p style={{ marginTop: 10, color: 'var(--text)', maxWidth: 560, lineHeight: 1.6, fontSize: 15 }}>
            {asset.short_description}
          </p>
        )}
      </div>

      {/* Price chart */}
      {history.length > 0 && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '20px 16px 16px', marginBottom: 40 }}>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            6-month price history
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={history} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                ticks={ticks}
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: 'var(--text)' }}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: 'var(--text)' }}
                width={60}
              />
              <Tooltip
                formatter={(v) => [`${asset.currency} ${v.toLocaleString()}`, 'Close']}
                labelFormatter={formatDate}
                contentStyle={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
              />
              <Line
                type="monotone"
                dataKey="close"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Offer builder */}
      {config && (
        <div style={{ maxWidth: 640 }}>
          <h2 style={{ marginBottom: 28, marginTop: 0 }}>Build your offer</h2>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 10, fontSize: 15 }}>Market view</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {config.scenarios.map(s => (
                <SelectorBtn key={s.id} label={s.display_title} selected={scenario === s.id} onClick={() => setScenario(s.id)} />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 10, fontSize: 15 }}>Term</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {config.terms.map(t => (
                <SelectorBtn key={t.id} label={t.display_title} selected={term === t.id} onClick={() => setTerm(t.id)} />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 10, fontSize: 15 }}>Protection package</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {config.packages.map(p => (
                <PackageCard key={p.id} pkg={p} selected={pkg === p.id} onClick={() => setPkg(p.id)} />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 10, fontSize: 15 }}>
              Amount ({asset.currency})
            </div>
            <input
              type="number"
              value={amount}
              min={100}
              onChange={e => setAmount(e.target.value)}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 18,
                width: 180,
                color: 'var(--text-h)',
                background: 'var(--bg)',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {offerError && (
            <div style={{ color: '#dc2626', fontSize: 14, marginBottom: 16, padding: '10px 14px', background: 'rgba(220,38,38,0.06)', borderRadius: 8 }}>
              {offerError}
            </div>
          )}

          <button
            onClick={handleGetOffer}
            disabled={submitting}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '14px 40px',
              fontSize: 16,
              fontWeight: 600,
              cursor: submitting ? 'default' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Calculating…' : 'Get Offer'}
          </button>
        </div>
      )}
    </div>
  );
}
