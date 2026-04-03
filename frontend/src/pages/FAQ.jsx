import { useEffect, useState } from 'react';
import api from '../api';

const DEFAULT_FAQS = [
  { q: 'What is a structured product?', a: 'A structured product combines an investment with built-in protection, so your downside is limited.' },
  { q: 'Is this real money?', a: 'No. This is a simulation only. No real investment or transaction takes place.' },
  { q: 'What is a stop-out?', a: 'A stop-out is the price level at which your protection ends and maximum loss is reached.' },
  { q: 'What is the position amount?', a: 'The position amount is the total exposure you get on the asset, larger than your investment due to the multiplier.' },
];

export default function FAQ() {
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);

  useEffect(() => {
    api.get('/cms').then(res => {
      const data = res.data;
      const built = [];
      let i = 1;
      while (data[`faq_${i}_q`] && data[`faq_${i}_a`]) {
        built.push({ q: data[`faq_${i}_q`], a: data[`faq_${i}_a`] });
        i++;
      }
      if (built.length > 0) setFaqs(built);
    }).catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ marginBottom: 40, fontSize: 32 }}>Frequently Asked Questions</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {faqs.map((item, idx) => (
          <div
            key={idx}
            style={{
              borderTop: '1px solid var(--border)',
              padding: '24px 0',
              ...(idx === faqs.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}),
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 17, color: 'var(--text-h)', marginBottom: 10 }}>
              {item.q}
            </div>
            <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6 }}>
              {item.a}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
