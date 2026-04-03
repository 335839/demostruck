import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';

function fmt(n, currency) {
  if (n == null) return '—';
  return `${currency ?? ''} ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();
}

export default function LeadForm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const offer = state?.offer;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!offer) { navigate('/'); return null; }

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    if (!consent) { setError('Please accept the policy consent to continue.'); return; }
    setLoading(true);
    try {
      await api.post('/leads', {
        name,
        email,
        phone: phone || undefined,
        comment: comment || undefined,
        policy_consent: consent,
        offer_snapshot: offer,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 520, margin: '64px auto', padding: '0 20px', textAlign: 'center', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>Thank you, {name}!</h1>
        <p style={{ color: 'var(--text)', marginBottom: 32, lineHeight: 1.6 }}>
          We've received your interest and will be in touch at <strong>{email}</strong>.
        </p>
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', textAlign: 'left', marginBottom: 32 }}>
          {[
            ['Asset', `${offer.asset?.name} (${offer.asset?.ticker})`],
            ['Position amount', fmt(offer.position_amount, offer.currency)],
            ['Term', offer.term?.display_title],
            ['View', offer.scenario?.display_title],
            ['Protection', offer.package?.title],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 14, color: 'var(--text)', gap: 12 }}>
              <span>{label}</span>
              <strong style={{ color: label === 'Position amount' ? 'var(--accent)' : 'var(--text-h)' }}>{value}</strong>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/')} style={btnStyle}>Back to home</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: '0 20px', boxSizing: 'border-box', width: '100%' }}>
      <button onClick={() => navigate('/offer', { state: { offer } })} style={backBtn}>← Back to offer</button>

      <h1 style={{ fontSize: 28, marginBottom: 8 }}>I'm interested</h1>
      <p style={{ color: 'var(--text)', marginBottom: 24, lineHeight: 1.6 }}>
        Tell us about yourself and we'll reach out about this offer.
      </p>

      {/* Offer summary */}
      <div style={{ border: '1px solid var(--accent-border)', borderRadius: 10, padding: '14px 18px', background: 'var(--accent-bg)', marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 6 }}>
          {offer.asset?.name} · {offer.scenario?.display_title} · {offer.term?.display_title} · {offer.package?.title}
        </div>
        <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--accent)' }}>{fmt(offer.position_amount, offer.currency)} position</div>
        <div style={{ fontSize: 13, color: 'var(--text)' }}>on {fmt(offer.amount, offer.currency)} invested</div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Full name *</label>
          <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle} placeholder="Jane Smith" />
        </div>
        <div>
          <label style={labelStyle}>Email *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} placeholder="jane@example.com" />
        </div>
        <div>
          <label style={labelStyle}>Phone (optional)</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} placeholder="+1 555 000 0000" />
        </div>
        <div>
          <label style={labelStyle}>Comment (optional)</label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Any questions or notes…" />
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 2, accentColor: 'var(--accent)', flexShrink: 0 }} />
          I agree to be contacted about this offer *
        </label>

        {error && <div style={{ color: '#dc2626', fontSize: 14, padding: '10px 14px', background: 'rgba(220,38,38,0.06)', borderRadius: 8 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.7 : 1, cursor: loading ? 'default' : 'pointer' }}>
          {loading ? 'Submitting…' : 'Submit interest'}
        </button>
      </form>

      <p style={{ fontSize: 12, color: 'var(--text)', marginTop: 20, textAlign: 'center' }}>
        This is a simulation only. No real investment is made.
      </p>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-h)', marginBottom: 6 };
const inputStyle = { width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 15, color: 'var(--text-h)', background: 'var(--bg)', boxSizing: 'border-box', fontFamily: 'inherit' };
const btnStyle = { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '13px', fontSize: 15, fontWeight: 600, cursor: 'pointer' };
const backBtn = { background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '0 0 20px', fontSize: 14 };
