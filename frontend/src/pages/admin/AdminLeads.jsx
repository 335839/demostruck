import { useEffect, useState } from 'react';
import api from '../../api';

function fmt(n, currency) {
  if (n == null) return '—';
  return `${currency ?? ''} ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();
}

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/admin/leads').then(res => setLeads(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Leads</h2>

      {leads.length === 0 ? (
        <p style={{ color: 'var(--text)' }}>No leads yet.</p>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--code-bg)', borderBottom: '1px solid var(--border)' }}>
                {['Name', 'Email', 'Phone', 'Asset', 'Scenario', 'Amount', 'Position', 'Date'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => {
                const o = lead.offer_snapshot || {};
                const isExpanded = expanded === lead.id;
                return (
                  <>
                    <tr
                      key={lead.id}
                      onClick={() => setExpanded(isExpanded ? null : lead.id)}
                      style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', background: isExpanded ? 'var(--accent-bg)' : 'transparent' }}
                      onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'var(--code-bg)'; }}
                      onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={tdStyle}>{lead.name || '—'}</td>
                      <td style={tdStyle}>{lead.email || '—'}</td>
                      <td style={tdStyle}>{lead.phone || '—'}</td>
                      <td style={tdStyle}>{o.asset?.name ?? '—'}</td>
                      <td style={tdStyle}>{o.scenario?.display_title ?? '—'}</td>
                      <td style={tdStyle}>{fmt(o.amount, o.currency)}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--accent)' }}>{fmt(o.position_amount, o.currency)}</td>
                      <td style={tdStyle}>{new Date(lead.created_at).toLocaleDateString()}</td>
                    </tr>
                    {isExpanded && (
                      <tr key={lead.id + '_exp'} style={{ borderBottom: '1px solid var(--border)', background: 'var(--code-bg)' }}>
                        <td colSpan={8} style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>Full offer snapshot:</div>
                          <pre style={{ margin: 0, fontSize: 12, color: 'var(--text-h)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {JSON.stringify(o, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: 'var(--text)' };
const tdStyle = { padding: '10px 14px', color: 'var(--text-h)' };
