import { useEffect, useState } from 'react';
import api from '../../api';

const CLASS_OPTIONS = ['crypto', 'commodity', 'equity', 'etf'];

export default function AdminAssets() {
  const [assets, setAssets] = useState([]);
  const [editing, setEditing] = useState(null); // asset id being edited
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => api.get('/admin/assets').then(res => setAssets(res.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const startEdit = asset => {
    setEditing(asset.id);
    setForm({
      name: asset.name,
      ticker: asset.ticker,
      asset_class: asset.asset_class,
      active: asset.active,
      display_order: asset.display_order,
    });
    setMsg(null);
  };

  const cancelEdit = () => { setEditing(null); setForm({}); };

  const save = async id => {
    setSaving(true);
    try {
      await api.put(`/admin/assets/${id}`, form);
      setMsg('Saved.');
      setEditing(null);
      load();
    } catch (e) {
      setMsg('Save failed: ' + (e.response?.data?.detail || e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Assets</h2>

      <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--code-bg)', borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Ticker', 'Class', 'Active', 'Order', 'Actions'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map(asset => (
              <>
                <tr key={asset.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={tdStyle}>{asset.name}</td>
                  <td style={tdStyle}><code style={{ fontSize: 12 }}>{asset.ticker}</code></td>
                  <td style={tdStyle}>{asset.asset_class}</td>
                  <td style={tdStyle}>
                    <span style={{ color: asset.active ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {asset.active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={tdStyle}>{asset.display_order}</td>
                  <td style={tdStyle}>
                    <button onClick={() => startEdit(asset)} style={editBtn}>Edit</button>
                  </td>
                </tr>

                {editing === asset.id && (
                  <tr key={asset.id + '_edit'} style={{ background: 'var(--code-bg)', borderBottom: '1px solid var(--border)' }}>
                    <td colSpan={6} style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <Field label="Name">
                          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inlineInput} />
                        </Field>
                        <Field label="Ticker">
                          <input value={form.ticker} onChange={e => setForm(f => ({ ...f, ticker: e.target.value }))} style={{ ...inlineInput, width: 80 }} />
                        </Field>
                        <Field label="Class">
                          <select value={form.asset_class} onChange={e => setForm(f => ({ ...f, asset_class: e.target.value }))} style={inlineInput}>
                            {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </Field>
                        <Field label="Order">
                          <input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))} style={{ ...inlineInput, width: 60 }} />
                        </Field>
                        <Field label="Active">
                          <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} style={{ accentColor: 'var(--accent)', width: 18, height: 18 }} />
                        </Field>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => save(asset.id)} disabled={saving} style={saveBtn}>{saving ? '…' : 'Save'}</button>
                          <button onClick={cancelEdit} style={cancelBtn}>Cancel</button>
                        </div>
                      </div>
                      {msg && <div style={{ marginTop: 8, fontSize: 13, color: msg.startsWith('Save failed') ? '#dc2626' : '#16a34a' }}>{msg}</div>}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text)', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

const thStyle = { padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: 'var(--text)' };
const tdStyle = { padding: '11px 16px', color: 'var(--text-h)' };
const inlineInput = { border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: 13, background: 'var(--bg)', color: 'var(--text-h)', width: 140 };
const editBtn = { background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12, color: 'var(--text-h)' };
const saveBtn = { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 };
const cancelBtn = { background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--text-h)' };
