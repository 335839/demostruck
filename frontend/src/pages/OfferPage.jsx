import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Row({ label, value, large }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '10px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ color: 'var(--text)', fontSize: large ? 16 : 14 }}>{label}</span>
      <span style={{
        fontWeight: large ? 700 : 600,
        color: 'var(--text-h)',
        fontSize: large ? 22 : 15,
      }}>
        {value}
      </span>
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
  const offer = state?.offer;

  useEffect(() => {
    if (!offer) navigate('/assets');
  }, [offer, navigate]);

  if (!offer) return null;

  const { currency } = offer;

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
        <div style={{ fontSize: 14, color: 'var(--text)', marginTop: 8 }}>
          Position amount
        </div>
      </div>

      {/* Summary card */}
      <div style={{
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '8px 24px',
        marginBottom: 32,
      }}>
        <Row label="Your investment"    value={fmt(offer.amount, currency)} />
        <Row label="Multiplier"         value={`${offer.multiplier}×`} />
        <Row label="Term"               value={offer.term?.display_title} />
        <Row label="Market view"        value={offer.scenario?.display_title} />
        <Row label="Protection"         value={offer.package?.title} />
        <Row label="Entry price"        value={fmt(offer.entry_price, currency)} />
        <Row label="Cost / Premium"     value={fmt(offer.premium_cost, currency)} />
        <Row
          label={`Stop-out price (${offer.stop_out_pct}% below entry)`}
          value={fmt(offer.stop_out_price, currency)}
        />
      </div>

      {/* CTA */}
      <button
        disabled
        style={{
          width: '100%',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '16px',
          fontSize: 16,
          fontWeight: 600,
          cursor: 'not-allowed',
          opacity: 0.6,
          marginBottom: 20,
        }}
      >
        I'm Interested
      </button>

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

      {/* Disclaimer */}
      <p style={{ fontSize: 12, color: 'var(--text)', textAlign: 'center' }}>
        This is a simulation only. No real investment is made. Past performance is not indicative of future results.
      </p>
    </div>
  );
}
