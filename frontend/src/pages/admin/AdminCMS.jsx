import { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminCMS() {
  const [entries, setEntries] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/cms').then(res => {
      setEntries(res.data);
      const d = {};
      res.data.forEach(e => { d[e.key] = e.value; });
      setDrafts(d);
    }).catch(() => setError('Failed to load CMS content'));
  }, []);

  const handleSave = async (key) => {
    setSaving(s => ({ ...s, [key]: true }));
    try {
      await api.put(`/admin/cms/${key}`, { value: drafts[key] });
      setSaved(s => ({ ...s, [key]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 2000);
    } catch {
      setError(`Failed to save "${key}"`);
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid var(--border)',
    borderRadius: 6,
    background: 'var(--bg)',
    color: 'var(--text-h)',
    fontSize: 14,
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 20, color: 'var(--text-h)' }}>CMS Content</h2>

      {error && (
        <div style={{ color: '#dc2626', marginBottom: 16, fontSize: 14 }}>{error}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {entries.map(entry => (
          <div
            key={entry.key}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '16px 20px',
              background: 'var(--bg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 8, fontFamily: 'monospace' }}>
                  {entry.key}
                </div>
                <textarea
                  rows={drafts[entry.key]?.length > 100 ? 3 : 2}
                  value={drafts[entry.key] ?? ''}
                  onChange={e => setDrafts(d => ({ ...d, [entry.key]: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <button
                onClick={() => handleSave(entry.key)}
                disabled={saving[entry.key]}
                style={{
                  marginTop: 26,
                  padding: '8px 18px',
                  background: saved[entry.key] ? '#16a34a' : 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: saving[entry.key] ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  flexShrink: 0,
                  minWidth: 72,
                  opacity: saving[entry.key] ? 0.7 : 1,
                }}
              >
                {saved[entry.key] ? 'Saved' : saving[entry.key] ? '...' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
