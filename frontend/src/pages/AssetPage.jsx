import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../api';

function Change({ value, label }) {
  const pos = value >= 0;
  return (
    <span style={{ color: pos ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
      {pos ? '+' : ''}{value?.toFixed(2)}% {label}
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
        padding: '16px 20px',
        cursor: 'pointer',
        flex: '1 1 140px',
        textAlign: 'left',
      }}
    >
      <div style={{ fontWeight: 700, color: 'var(--text-h)', marginBottom: 4 }}>{pkg.title}</div>
      <div style={{ fontSize: 13, color: 'var(--text)' }}>{pkg.description}</div>
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

  const [scenario, setScenario] = useState(null);
  const [term, setTerm] = useState(null);
  const [pkg, setPkg] = useState(null);
  const [amount, setAmount] = useState(1000);
  const [submitting, setSubmitting] = useState(false);
  const [offerError, setOfferError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/assets/${id}`),
      api.get('/config'),
    ])
      .then(([assetRes, configRes]) => {
        setAsset(assetRes.data);
        setConfig(configRes.data);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load asset.'); setLoading(false); });
  }, [id]);

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

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text)' }}>Loading…</div>;
  if (error)   return <div style={{ padding: 48, textAlign: 'center', color: '#dc2626' }}>{error}</div>;

  // Thin out history for x-axis labels
  const history = asset.history || [];
  const step = Math.max(1, Math.floor(history.length / TICK_COUNT));
  const ticks = history.filter((_, i) => i % step === 0).map(d => d.date);

  return (
    <div style={{ padding: '40px 32px', textAlign: 'left' }}>
      {/* Asset header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 32 }}>{asset.name}</h1>
          <span style={{ color: 'var(--text)', fontSize: 18 }}>{asset.ticker}</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-h)' }}>
            {asset.currency} {asset.price?.toLocaleString()}
          </span>
          <Change value={asset.change_1m_pct} label="1M" />
          <Change value={asset.change_1y_pct} label="1Y" />
        </div>
        {asset.short_description && (
          <p style={{ marginTop: 8, color: 'var(--text)', maxWidth: 560 }}>{asset.short_description}</p>
        )}
      </div>

      {/* Price chart */}
      {history.length > 0 && (
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '24px 16px 16px',
          marginBottom: 40,
        }}>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 1 }}>
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
                contentStyle={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}
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
          <h2 style={{ marginBottom: 24 }}>Build your offer</h2>

          {/* Scenario */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 10 }}>Market view</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {config.scenarios.map(s => (
                <SelectorBtn
                  key={s.id}
                  label={s.display_title}
                  selected={scenario === s.id}
                  onClick={() => setScenario(s.id)}
                />
              ))}
            </div>
          </div>

          {/* Term */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 10 }}>Term</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {config.terms.map(t => (
                <SelectorBtn
                  key={t.id}
                  label={t.display_title}
                  selected={term === t.id}
                  onClick={() => setTerm(t.id)}
                />
              ))}
            </div>
          </div>

          {/* Protection package */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 10 }}>Protection</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {config.packages.map(p => (
                <PackageCard
                  key={p.id}
                  pkg={p}
                  selected={pkg === p.id}
                  onClick={() => setPkg(p.id)}
                />
              ))}
            </div>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 10 }}>Amount ({asset.currency})</div>
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
                width: 200,
                color: 'var(--text-h)',
                background: 'var(--bg)',
              }}
            />
          </div>

          {offerError && (
            <div style={{ color: '#dc2626', fontSize: 14, marginBottom: 16 }}>{offerError}</div>
          )}

          <button
            onClick={handleGetOffer}
            disabled={submitting}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '14px 36px',
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
