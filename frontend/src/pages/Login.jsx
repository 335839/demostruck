import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(state?.from || '/cabinet');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Log in</h1>
      <p style={{ color: 'var(--text)', marginBottom: 32 }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register</Link>
      </p>

      {state?.registered && (
        <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#15803d', fontSize: 14 }}>
          Account created — please log in.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 14 }}>{error}</div>}

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-h)', marginBottom: 6 };
const inputStyle = { width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 15, color: 'var(--text-h)', background: 'var(--bg)', boxSizing: 'border-box' };
const btnStyle = { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 600, cursor: 'pointer' };
