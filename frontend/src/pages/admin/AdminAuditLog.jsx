import { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/audit-log').then(res => {
      setLogs(res.data);
    }).catch(err => {
      if (err.response?.status === 403) {
        setError('Access denied. Superadmin only.');
      } else {
        setError('Failed to load audit log');
      }
    });
  }, []);

  const cellStyle = {
    padding: '10px 12px',
    borderBottom: '1px solid var(--border)',
    fontSize: 13,
    color: 'var(--text-h)',
    verticalAlign: 'top',
  };

  const headerStyle = {
    ...cellStyle,
    color: 'var(--text)',
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    background: 'var(--bg)',
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 20, color: 'var(--text-h)' }}>Audit Log</h2>

      {error ? (
        <div style={{ color: '#dc2626', fontSize: 14 }}>{error}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border)', borderRadius: 10 }}>
            <thead>
              <tr>
                <th style={headerStyle}>Time</th>
                <th style={headerStyle}>User</th>
                <th style={headerStyle}>Action</th>
                <th style={headerStyle}>Entity</th>
                <th style={headerStyle}>Entity ID</th>
                <th style={headerStyle}>Old</th>
                <th style={headerStyle}>New</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ ...cellStyle, color: 'var(--text)', textAlign: 'center' }}>
                    No audit log entries yet
                  </td>
                </tr>
              )}
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={cellStyle}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={cellStyle}>{log.user_email ?? '—'}</td>
                  <td style={cellStyle}>
                    <span style={{
                      background: log.action === 'create' ? '#dcfce7' : log.action === 'delete' ? '#fee2e2' : '#fef9c3',
                      color: log.action === 'create' ? '#16a34a' : log.action === 'delete' ? '#dc2626' : '#b45309',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={cellStyle}>{log.entity_type}</td>
                  <td style={{ ...cellStyle, fontFamily: 'monospace', fontSize: 11, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.entity_id}
                  </td>
                  <td style={{ ...cellStyle, fontFamily: 'monospace', fontSize: 11, maxWidth: 160 }}>
                    {log.old_value ? JSON.stringify(log.old_value) : '—'}
                  </td>
                  <td style={{ ...cellStyle, fontFamily: 'monospace', fontSize: 11, maxWidth: 160 }}>
                    {log.new_value ? JSON.stringify(log.new_value) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
