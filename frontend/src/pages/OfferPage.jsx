import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const BADGE_COLORS = {
  crypto:    { bg: 'rgba(170,59,255,0.12)', color: '#aa3bff' },
  commodity: { bg: 'rgba(234,179,8,0.12)',  color: '#b45309' },
  equity:    { bg: 'rgba(59,130,246,0.12)', color: '#1d4ed8' },
  etf:       { bg: 'rgba(34,197,94,0.12)',  color: '#15803d' },
};

function Badge({ cls }) {
  if (!cls) return null;
  const s = BADGE_COLORS[cls] || { bg: 'var(--code-bg)', color: 'var(--text)' };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 4, padding: '3px 10px', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
      {cls}
    </span>
  );
}

function Row({ label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '10px 0',
      borderBottom: '1px solid var(--border)',
      gap: 12,
    }}>
      <span style={{ color: 'var(--text)', fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 15, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function fmt(n, currency) {
  if (n == null) return '—';
  return `${currency ?? ''} ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();
}

export default function OfferPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const offer = state?.offer;

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!offer) navigate('/assets');
  }, [offer, navigate]);

  if (!offer) return null;

  const { currency } = offer;
  const assetClass = offer.asset?.asset_class;

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await api.post('/offers/save', { offer_snapshot: offer });
      setSaved(true);
    } catch (e) {
      setSaveError(e.response?.data?.detail || 'Failed to save offer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '48px 24px', maxWidth: 560, margin: '0 auto', textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
      {/* Asset name + badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>{offer.asset?.name}</h2>
        <span style={{ color: 'var(--text)', fontSize: 15 }}>{offer.asset?.ticker}</span>
        {assetClass && <Badge cls={assetClass} />}
      </div>

      {/* Primary KPI */}
      <div style={{
        textAlign: 'center',
        padding: '32px 24px',
        border: '2px solid var(--accent-border)',
        borderRadius: 16,
        background: 'var(--accent-bg)',
        marginBottom: 28,
      }}>
        <div style={{ fontSize: 12, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, fontWeight: 600 }}>
          Your position amount
        </div>
        <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--accent)', letterSpacing: -2, lineHeight: 1 }}>
          {fmt(offer.position_amount, currency)}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 8 }}>
          on {fmt(offer.amount, currency)} invested · {offer.multiplier}× multiplier
        </div>
      </div>

      {/* Summary card */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '4px 24px', marginBottom: 24 }}>
        <Row label="Your investment"    value={fmt(offer.amount, currency)} />
        <Row label="Term"               value={offer.term?.display_title} />
        <Row label="Market view"        value={offer.scenario?.display_title} />
        <Row label="Protection"         value={offer.package?.title} />
        <Row label="Entry price"        value={fmt(offer.entry_price, currency)} />
        <Row label="Cost / Premium"     value={fmt(offer.premium_cost, currency)} />
        <Row label={`Stop-out (${offer.stop_out_pct}% below entry)`} value={fmt(offer.stop_out_price, currency)} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => navigate('/lead', { state: { offer } })}
          style={{ width: '100%', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '15px', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
        >
          I'm Interested
        </button>

        {isAuthenticated && (
          saved ? (
            <div style={{ textAlign: 'center', color: '#16a34a', fontSize: 14, padding: '10px' }}>
              ✓ Offer saved to your cabinet
            </div>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ width: '100%', background: 'none', color: 'var(--accent)', border: '1px solid var(--accent-border)', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Saving…' : 'Save Offer'}
              </button>
              {saveError && <div style={{ color: '#dc2626', fontSize: 13, textAlign: 'center' }}>{saveError}</div>}
            </>
          )
        )}

        <button
          onClick={() => navigate(`/assets/${offer.asset?.id}`)}
          style={{ width: '100%', background: 'none', color: 'var(--text-h)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
        >
          ↺ Recalculate
        </button>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text)', textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
        This is a simulation only. No real investment is made. Past performance is not indicative of future results.
      </p>
    </div>
  );
}
