import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Create account</h1>
      <p style={{ color: 'var(--text)', marginBottom: 32 }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Log in</Link>
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Confirm password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={inputStyle} />
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 14 }}>{error}</div>}

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-h)', marginBottom: 6 };
const inputStyle = { width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 15, color: 'var(--text-h)', background: 'var(--bg)', boxSizing: 'border-box' };
const btnStyle = { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 600, cursor: 'pointer' };
