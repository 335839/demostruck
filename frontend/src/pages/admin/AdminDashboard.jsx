import { useEffect, useState } from 'react';
import api from '../../api';

function StatCard({ label, value }) {
  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '24px 28px',
      minWidth: 160,
    }}>
      <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-h)', marginBottom: 6 }}>{value ?? '…'}</div>
      <div style={{ fontSize: 14, color: 'var(--text)' }}>{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Dashboard</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <StatCard label="Total leads"  value={stats?.total_leads} />
        <StatCard label="Total users"  value={stats?.total_users} />
        <StatCard label="Total assets" value={stats?.total_assets} />
      </div>
    </div>
  );
}
