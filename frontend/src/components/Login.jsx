import { useState } from 'react';
import api from '../utils/api';

export default function Login({ onLogin, onSwitch }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-icon">💬</div>
        <h1 className="auth-heading">TaskChat</h1>
        <p className="auth-sub">Manage tasks through conversation</p>

        <form onSubmit={handle} className="auth-form">
          <label>Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoFocus
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          No account?{' '}
          <button type="button" onClick={onSwitch} className="text-link">
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
