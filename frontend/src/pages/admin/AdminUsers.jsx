import { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [toggling, setToggling] = useState(null);

  const load = () => api.get('/admin/users').then(res => setUsers(res.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const toggleActive = async (user) => {
    setToggling(user.id);
    try {
      await api.put(`/admin/users/${user.id}`, { is_active: !user.is_active });
      load();
    } catch (e) {
      alert('Failed: ' + (e.response?.data?.detail || e.message));
    } finally {
      setToggling(null);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Users</h2>

      {users.length === 0 ? (
        <p style={{ color: 'var(--text)' }}>No users yet.</p>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--code-bg)', borderBottom: '1px solid var(--border)' }}>
                {['Email', 'Role', 'Active', 'Verified', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={tdStyle}>{user.email}</td>
                  <td style={tdStyle}>
                    <span style={{
                      background: user.role === 'superadmin' ? 'rgba(170,59,255,0.12)' : 'var(--code-bg)',
                      color: user.role === 'superadmin' ? 'var(--accent)' : 'var(--text-h)',
                      borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600,
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: user.is_active ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {user.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: user.is_verified ? '#16a34a' : 'var(--text)' }}>
                      {user.is_verified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={tdStyle}>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => toggleActive(user)}
                      disabled={toggling === user.id}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        padding: '4px 12px',
                        cursor: 'pointer',
                        fontSize: 12,
                        color: user.is_active ? '#dc2626' : '#16a34a',
                      }}
                    >
                      {toggling === user.id ? '…' : user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
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

const thStyle = { padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: 'var(--text)' };
const tdStyle = { padding: '11px 14px', color: 'var(--text-h)' };
