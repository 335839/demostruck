import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const FEATURED_TICKERS = ['BTC', 'ETH', 'AAPL', 'NVDA'];

const CMS_DEFAULTS = {
  hero_headline: 'Get a bigger position on assets you believe in',
  hero_subheadline: 'Limited downside. Simulated. No real money.',
  disclaimer: 'This is a simulation only. No real investment is made.',
};

const HOW_IT_WORKS_STEPS = [
  { n: 1, title: 'Choose an asset', desc: 'Pick from crypto, commodities, or equities' },
  { n: 2, title: 'Set your view', desc: 'Tell us if you think it goes up, down, or stays flat' },
  { n: 3, title: 'Pick protection', desc: 'Choose how much downside protection you want' },
  { n: 4, title: 'Get your offer', desc: 'See your simulated position instantly' },
];

/* ── Animated particle canvas ── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.4 + 0.3,
      opacity: Math.random() * 0.4 + 0.05,
      opDir: Math.random() > 0.5 ? 1 : -1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity += p.opDir * 0.002;
        if (p.opacity > 0.55 || p.opacity < 0.03) p.opDir *= -1;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 180, 41, ${p.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      aria-hidden="true"
    />
  );
}

/* ── Price change badge ── */
function PriceChange({ value, size = 14 }) {
  if (value == null) return <span style={{ color: 'var(--color-text-muted)', fontSize: size }}>—</span>;
  const pos = value >= 0;
  return (
    <span style={{ color: pos ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600, fontSize: size }}>
      {pos ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
    </span>
  );
}

/* ── Horizontally scrolling ticker strip ── */
function TickerStrip({ assets }) {
  if (!assets.length) {
    return (
      <div style={{
        background: '#0d0d14',
        borderTop: '1px solid var(--color-gold-dark)',
        borderBottom: '1px solid var(--color-gold-dark)',
        padding: '12px 24px',
        color: 'var(--color-text-muted)',
        fontSize: 13,
        textAlign: 'center',
        letterSpacing: 2,
      }}>
        — — —
      </div>
    );
  }

  // Duplicate for seamless loop
  const items = [...assets, ...assets];
  const duration = Math.max(assets.length * 3.5, 24);

  return (
    <div style={{
      background: '#0d0d14',
      borderTop: '1px solid var(--color-gold-dark)',
      borderBottom: '1px solid var(--color-gold-dark)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        display: 'flex',
        width: 'max-content',
        animation: `ticker-scroll ${duration}s linear infinite`,
        willChange: 'transform',
      }}>
        {items.map((asset, i) => (
          <div
            key={`${asset.id}-${i}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '11px 28px',
              borderRight: '1px solid var(--color-border)',
              whiteSpace: 'nowrap',
              minWidth: 190,
            }}
          >
            <span style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: 13, letterSpacing: 0.5 }}>
              {asset.ticker}
            </span>
            <span style={{ color: 'var(--color-text)', fontSize: 13 }}>
              {asset.currency}{' '}
              {asset.price != null ? asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}
            </span>
            <PriceChange value={asset.change_1m_pct} size={12} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Premium asset card ── */
function AssetCard({ asset, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--color-bg-card-hover)' : 'var(--color-bg-card)',
        border: `1px solid ${hovered ? 'var(--color-gold)' : 'var(--color-border)'}`,
        borderRadius: 16,
        padding: '24px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.22s',
        boxShadow: hovered ? '0 0 28px rgba(240,180,41,0.1)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Shimmer sweep on hover */}
      {hovered && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '55%',
          height: '100%',
          background: 'linear-gradient(105deg, transparent, rgba(240,180,41,0.06), transparent)',
          animation: 'shimmer 1.3s linear infinite',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 17, marginBottom: 2 }}>
        {asset.name}
      </div>
      <div style={{ color: 'var(--color-text-muted)', fontSize: 12, letterSpacing: 1, marginBottom: 18 }}>
        {asset.ticker}
      </div>
      <div style={{
        fontWeight: 800,
        color: '#fff',
        fontSize: 24,
        marginBottom: 8,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
      }}>
        {asset.currency}{' '}
        {asset.price != null ? asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}
      </div>
      <div style={{ marginBottom: 22 }}>
        <PriceChange value={asset.change_1m_pct} />
        <span style={{ color: 'var(--color-text-muted)', fontSize: 12, marginLeft: 6 }}>1M</span>
      </div>
      <div style={{
        background: hovered ? 'var(--color-gold)' : 'transparent',
        color: hovered ? '#0a0a0f' : 'var(--color-gold)',
        border: '1px solid var(--color-gold)',
        borderRadius: 8,
        padding: '8px 14px',
        fontSize: 13,
        fontWeight: 700,
        transition: 'all 0.2s',
        textAlign: 'center',
      }}>
        View Offer →
      </div>
    </div>
  );
}

/* ── Section heading with gold underline ── */
function SectionHeading({ children }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 52 }}>
      <h2 style={{
        fontSize: 'clamp(1.75rem, 3vw, 2.4rem)',
        fontWeight: 800,
        color: '#fff',
        margin: '0 0 14px',
        letterSpacing: '-0.02em',
      }}>
        {children}
      </h2>
      <div style={{ width: 48, height: 3, background: 'var(--color-gold)', margin: '0 auto', borderRadius: 2 }} />
    </div>
  );
}

/* ── Main export ── */
export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [cms, setCms] = useState(CMS_DEFAULTS);
  const [assetsLoading, setAssetsLoading] = useState(true);

  useEffect(() => {
    api.get('/assets')
      .then(res => {
        const data = res.data;
        setAllAssets(data);
        const picks = FEATURED_TICKERS
          .map(t => data.find(a => a.ticker === t))
          .filter(Boolean);
        setFeatured(picks);
      })
      .catch(() => {})
      .finally(() => setAssetsLoading(false));

    api.get('/cms')
      .then(res => setCms({ ...CMS_DEFAULTS, ...res.data }))
      .catch(() => {});
  }, []);

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>

      {/* ────────────────────────────────────────
          HERO
      ──────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: 'calc(88vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'var(--color-bg)',
      }}>
        <ParticleCanvas />

        {/* Radial gold glow behind headline */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '44%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 720,
            height: 480,
            background: 'radial-gradient(ellipse at center, rgba(240,180,41,0.09) 0%, transparent 68%)',
            pointerEvents: 'none',
          }}
        />

        {/* Hero content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: 820,
          padding: '0 24px',
        }}>
          {/* Eyebrow label */}
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            color: 'var(--color-gold)',
            textTransform: 'uppercase',
            marginBottom: 28,
          }}>
            Simulated · Structured · Smart
          </div>

          {/* Main headline */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.04,
            margin: '0 0 22px',
            letterSpacing: '-0.03em',
          }}>
            {cms.hero_headline}
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--color-text-muted)',
            maxWidth: 540,
            margin: '0 auto 40px',
            lineHeight: 1.65,
          }}>
            {cms.hero_subheadline}
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/assets')}
              style={{
                background: 'var(--color-gold)',
                color: '#0a0a0f',
                border: 'none',
                borderRadius: 10,
                padding: '14px 36px',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: 0.3,
                transition: 'background 0.2s, transform 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-gold-dark)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-gold)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Explore Assets
            </button>
            <button
              onClick={scrollToHowItWorks}
              style={{
                background: 'transparent',
                color: 'var(--color-gold)',
                border: '1px solid var(--color-gold)',
                borderRadius: 10,
                padding: '14px 36px',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s, transform 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(240,180,41,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              How it works
            </button>
          </div>

          {/* Trust line */}
          <p style={{
            marginTop: 30,
            fontSize: 12,
            color: 'var(--color-text-muted)',
            opacity: 0.65,
            letterSpacing: 0.3,
          }}>
            Simulation only · No real money · No sign-up required
          </p>
        </div>
      </section>

      {/* ────────────────────────────────────────
          LIVE TICKER STRIP
      ──────────────────────────────────────── */}
      <TickerStrip assets={allAssets} />

      {/* ────────────────────────────────────────
          POPULAR ASSETS
      ──────────────────────────────────────── */}
      <section style={{ padding: '88px 32px', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <SectionHeading>Popular Assets</SectionHeading>

        {assetsLoading ? (
          <div className="spinner" />
        ) : featured.length > 0 ? (
          <div className="home-asset-grid">
            {featured.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onClick={() => navigate(`/assets/${asset.id}`)}
              />
            ))}
          </div>
        ) : null}
      </section>

      {/* ────────────────────────────────────────
          HOW IT WORKS
      ──────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          background: 'var(--color-bg-card)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          padding: '88px 32px',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHeading>How it works</SectionHeading>

          <div style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center', gap: 0 }}>
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <div key={step.n} style={{ display: 'flex', alignItems: 'flex-start', flex: '1 1 180px', minWidth: 160, maxWidth: 230 }}>
                <div style={{ textAlign: 'center', padding: '0 12px', flex: 1 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: '2px solid var(--color-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 18,
                    color: 'var(--color-gold)',
                    margin: '0 auto 16px',
                    flexShrink: 0,
                  }}>
                    {step.n}
                  </div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 8 }}>{step.title}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 13, lineHeight: 1.65 }}>{step.desc}</div>
                </div>
                {i < HOW_IT_WORKS_STEPS.length - 1 && (
                  <div className="step-connector">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────
          FOOTER
      ──────────────────────────────────────── */}
      <footer style={{
        background: '#08080d',
        borderTop: '1px solid var(--color-border)',
        padding: '52px 32px 32px',
        marginTop: 'auto',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 32,
            marginBottom: 36,
          }}>
            {/* Brand + disclaimer */}
            <div style={{ maxWidth: 360 }}>
              <div style={{ fontWeight: 900, fontSize: 22, color: 'var(--color-gold)', marginBottom: 10 }}>
                Struck
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13, lineHeight: 1.65 }}>
                {cms.disclaimer}
              </p>
            </div>

            {/* Footer links */}
            <div style={{ display: 'flex', gap: 36, alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { label: 'Assets', to: '/assets' },
                { label: 'FAQ',    to: '/faq' },
                { label: 'Login',  to: '/login' },
              ].map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--color-gold)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: 20,
            fontSize: 12,
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            opacity: 0.55,
          }}>
            © {new Date().getFullYear()} Struck. Simulation only. Not financial advice.
          </div>
        </div>
      </footer>

    </div>
  );
}
