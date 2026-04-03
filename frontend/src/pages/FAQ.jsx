import { useEffect, useState } from 'react';
import api from '../api';

const DEFAULT_FAQS = [
  { q: 'What is a structured product?', a: 'A structured product combines an investment with built-in protection, so your downside is limited.' },
  { q: 'Is this real money?', a: 'No. This is a simulation only. No real investment or transaction takes place.' },
  { q: 'What is a stop-out?', a: 'A stop-out is the price level at which your protection ends and maximum loss is reached.' },
  { q: 'What is the position amount?', a: 'The position amount is the total exposure you get on the asset, larger than your investment due to the multiplier.' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ borderTop: '1px solid var(--border)', cursor: 'pointer' }}
      onClick={() => setOpen(o => !o)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', gap: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-h)', lineHeight: 1.4 }}>{q}</span>
        <span style={{ color: 'var(--accent)', fontSize: 20, flexShrink: 0, fontWeight: 300 }}>
          {open ? '−' : '+'}
        </span>
      </div>
      {open && (
        <div style={{ paddingBottom: 20, fontSize: 15, color: 'var(--text)', lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cms')
      .then(res => {
        const data = res.data;
        const built = [];
        let i = 1;
        while (data[`faq_${i}_q`] && data[`faq_${i}_a`]) {
          built.push({ q: data[`faq_${i}_q`], a: data[`faq_${i}_a`] });
          i++;
        }
        if (built.length > 0) setFaqs(built);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrap" style={{ maxWidth: 760 }}>
      <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 36 }}>FAQ</h1>
      <p style={{ color: 'var(--text)', marginBottom: 40, fontSize: 16 }}>
        Frequently asked questions about Struck and structured products.
      </p>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div>
          {faqs.map((item, idx) => (
            <FAQItem key={idx} q={item.q} a={item.a} />
          ))}
          <div style={{ borderTop: '1px solid var(--border)' }} />
        </div>
      )}
    </div>
  );
}
