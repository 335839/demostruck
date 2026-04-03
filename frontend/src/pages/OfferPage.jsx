import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

function Row({ label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '10px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ color: 'var(--text)', fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 15 }}>{value}</span>
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
    <div style={{ padding: '48px 32px', maxWidth: 560, margin: '0 auto', textAlign: 'left' }}>
      {/* Primary KPI */}
      <div style={{
        textAlign: 'center',
        padding: '36px 24px',
        border: '1px solid var(--accent-border)',
        borderRadius: 16,
        background: 'var(--accent-bg)',
        marginBottom: 32,
      }}>
        <div style={{ fontSize: 13, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          Your position in {offer.asset?.name}
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, color: 'var(--accent)', letterSpacing: -2, lineHeight: 1 }}>
          {fmt(offer.position_amount, currency)}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text)', marginTop: 8 }}>Position amount</div>
      </div>

      {/* Summary card */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '8px 24px', marginBottom: 28 }}>
        <Row label="Your investment"    value={fmt(offer.amount, currency)} />
        <Row label="Multiplier"         value={`${offer.multiplier}×`} />
        <Row label="Term"               value={offer.term?.display_title} />
        <Row label="Market view"        value={offer.scenario?.display_title} />
        <Row label="Protection"         value={offer.package?.title} />
        <Row label="Entry price"        value={fmt(offer.entry_price, currency)} />
        <Row label="Cost / Premium"     value={fmt(offer.premium_cost, currency)} />
        <Row label={`Stop-out price (${offer.stop_out_pct}% below entry)`} value={fmt(offer.stop_out_price, currency)} />
      </div>

      {/* I'm Interested */}
      <button
        onClick={() => navigate('/lead', { state: { offer } })}
        style={{
          width: '100%',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '16px',
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 12,
        }}
      >
        I'm Interested
      </button>

      {/* Save Offer (authenticated only) */}
      {isAuthenticated && (
        <div style={{ marginBottom: 12 }}>
          {saved ? (
            <div style={{ textAlign: 'center', color: '#16a34a', fontSize: 14, padding: '10px' }}>
              ✓ Offer saved to your cabinet
            </div>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%',
                background: 'none',
                color: 'var(--accent)',
                border: '1px solid var(--accent-border)',
                borderRadius: 8,
                padding: '12px',
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? 'default' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Save Offer'}
            </button>
          )}
          {saveError && <div style={{ color: '#dc2626', fontSize: 13, textAlign: 'center', marginTop: 6 }}>{saveError}</div>}
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        style={{
          width: '100%',
          background: 'none',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '12px',
          fontSize: 14,
          cursor: 'pointer',
          marginBottom: 24,
        }}
      >
        ← Back
      </button>

      <p style={{ fontSize: 12, color: 'var(--text)', textAlign: 'center' }}>
        This is a simulation only. No real investment is made. Past performance is not indicative of future results.
      </p>
    </div>
  );
}
