import { useEffect, useRef, useState } from 'react';
import api from '../../api';

const DEFAULT_FORM = { multiplier: '', premium_pct: '', stop_out_pct: '', enabled: true };

export default function AdminOfferRules() {
  const [assets, setAssets] = useState([]);
  const [config, setConfig] = useState(null);
  const [rules, setRules] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [modal, setModal] = useState(null); // { asset, scenario, term, pkg, rule | null }
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const modalRef = useRef(null);

  const loadRules = () => api.get('/admin/offer-rules').then(res => setRules(res.data)).catch(() => {});

  useEffect(() => {
    Promise.all([
      api.get('/admin/assets'),
      api.get('/config'),
    ]).then(([assetRes, configRes]) => {
      setAssets(assetRes.data);
      setConfig(configRes.data);
      if (assetRes.data.length > 0) setSelectedAsset(assetRes.data[0].id);
    }).catch(() => {});
    loadRules();
  }, []);

  // Build rule lookup: ruleMap[asset_id][scenario_id][term_id][package_id] = rule
  const ruleMap = {};
  for (const r of rules) {
    if (!ruleMap[r.asset_id]) ruleMap[r.asset_id] = {};
    if (!ruleMap[r.asset_id][r.scenario_id]) ruleMap[r.asset_id][r.scenario_id] = {};
    if (!ruleMap[r.asset_id][r.scenario_id][r.term_id]) ruleMap[r.asset_id][r.scenario_id][r.term_id] = {};
    ruleMap[r.asset_id][r.scenario_id][r.term_id][r.package_id] = r;
  }

  const openModal = (asset, scenario, term, pkg) => {
    const rule = ruleMap[asset.id]?.[scenario.id]?.[term.id]?.[pkg.id] ?? null;
    setModal({ asset, scenario, term, pkg, rule });
    setForm(rule
      ? { multiplier: rule.multiplier, premium_pct: rule.premium_pct, stop_out_pct: rule.stop_out_pct, enabled: rule.enabled }
      : DEFAULT_FORM
    );
    setSaveMsg(null);
  };

  const closeModal = () => { setModal(null); setSaveMsg(null); };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    const payload = {
      multiplier: Number(form.multiplier),
      premium_pct: Number(form.premium_pct),
      stop_out_pct: Number(form.stop_out_pct),
      enabled: form.enabled,
    };
    try {
      if (modal.rule) {
        await api.put(`/admin/offer-rules/${modal.rule.id}`, payload);
      } else {
        await api.post('/admin/offer-rules', {
          ...payload,
          asset_id: modal.asset.id,
          scenario_id: modal.scenario.id,
          term_id: modal.term.id,
          package_id: modal.pkg.id,
        });
      }
      await loadRules();
      setSaveMsg('Saved.');
      setTimeout(closeModal, 600);
    } catch (e) {
      setSaveMsg('Error: ' + (e.response?.data?.detail || e.message));
    } finally {
      setSaving(false);
    }
  };

  if (!config) return <div style={{ color: 'var(--text)' }}>Loading…</div>;

  const asset = assets.find(a => a.id === selectedAsset);

  return (
    <div>
      <h2 style={{ marginBottom: 8 }}>Offer Rules</h2>
      <p style={{ color: 'var(--text)', fontSize: 14, marginBottom: 20 }}>
        Click any cell to create or edit a rule. Columns are protection packages.
      </p>

      {/* Asset selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, color: 'var(--text)', marginRight: 10 }}>Asset:</label>
        <select
          value={selectedAsset}
          onChange={e => setSelectedAsset(e.target.value)}
          style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', fontSize: 14, background: 'var(--bg)', color: 'var(--text-h)' }}
        >
          {assets.map(a => (
            <option key={a.id} value={a.id}>{a.name} ({a.ticker})</option>
          ))}
        </select>
      </div>

      {/* Matrix */}
      {asset && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--code-bg)', borderBottom: '1px solid var(--border)' }}>
                <th style={thStyle}>Scenario</th>
                <th style={thStyle}>Term</th>
                {config.packages.map(pkg => (
                  <th key={pkg.id} style={{ ...thStyle, color: 'var(--accent)' }}>{pkg.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.scenarios.flatMap(scenario =>
                config.terms.map((term, ti) => (
                  <tr key={scenario.id + term.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    {ti === 0 && (
                      <td rowSpan={config.terms.length} style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-h)', borderRight: '1px solid var(--border)', background: 'var(--code-bg)' }}>
                        {scenario.display_title}
                      </td>
                    )}
                    <td style={{ ...tdStyle, borderRight: '1px solid var(--border)', color: 'var(--text)' }}>{term.display_title}</td>
                    {config.packages.map(pkg => {
                      const rule = ruleMap[selectedAsset]?.[scenario.id]?.[term.id]?.[pkg.id];
                      return (
                        <td
                          key={pkg.id}
                          onClick={() => openModal(asset, scenario, term, pkg)}
                          style={{
                            ...tdStyle,
                            borderRight: '1px solid var(--border)',
                            cursor: 'pointer',
                            background: rule ? (rule.enabled ? 'rgba(170,59,255,0.05)' : 'rgba(220,38,38,0.04)') : 'transparent',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-bg)'}
                          onMouseLeave={e => e.currentTarget.style.background = rule ? (rule.enabled ? 'rgba(170,59,255,0.05)' : 'rgba(220,38,38,0.04)') : 'transparent'}
                        >
                          {rule ? (
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-h)' }}>{rule.multiplier}×</div>
                              <div style={{ color: 'var(--text)', fontSize: 12 }}>{rule.premium_pct}% prem · {rule.stop_out_pct}% SO</div>
                              {!rule.enabled && <div style={{ color: '#dc2626', fontSize: 11 }}>disabled</div>}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 18, lineHeight: 1 }}>+</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div ref={modalRef} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px', width: 360, boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>
              {modal.asset.name} · {modal.scenario.display_title} · {modal.term.display_title}
            </div>
            <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-h)', marginBottom: 20 }}>
              {modal.pkg.title} — {modal.rule ? 'Edit rule' : 'New rule'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FormField label="Multiplier (e.g. 3.0)">
                <input type="number" step="0.1" value={form.multiplier} onChange={e => setForm(f => ({ ...f, multiplier: e.target.value }))} style={modalInput} />
              </FormField>
              <FormField label="Premium % (e.g. 2.5)">
                <input type="number" step="0.1" value={form.premium_pct} onChange={e => setForm(f => ({ ...f, premium_pct: e.target.value }))} style={modalInput} />
              </FormField>
              <FormField label="Stop-out % (e.g. 15.0)">
                <input type="number" step="0.1" value={form.stop_out_pct} onChange={e => setForm(f => ({ ...f, stop_out_pct: e.target.value }))} style={modalInput} />
              </FormField>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-h)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))} style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
                Enabled
              </label>
            </div>

            {saveMsg && (
              <div style={{ marginTop: 12, fontSize: 13, color: saveMsg.startsWith('Error') ? '#dc2626' : '#16a34a' }}>{saveMsg}</div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleSave} disabled={saving} style={{ ...saveBtn, flex: 1 }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={closeModal} style={cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

const thStyle = { padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: 'var(--text)' };
const tdStyle = { padding: '10px 14px', verticalAlign: 'middle' };
const modalInput = { width: '100%', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 12px', fontSize: 14, background: 'var(--bg)', color: 'var(--text-h)', boxSizing: 'border-box' };
const saveBtn = { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600 };
const cancelBtn = { background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', fontSize: 14, color: 'var(--text-h)' };
