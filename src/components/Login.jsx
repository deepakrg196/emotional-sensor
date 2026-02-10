import React, { useState } from 'react';
import { login as apiLogin } from '../api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Login({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = apiLogin({ email, password });
      login(user.email);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="animated-bg-blob blob-1"></div>
      <div className="animated-bg-blob blob-2"></div>
      <div className="animated-bg-blob blob-3"></div>
      <div className="panel auth-panel">
        <h2 className="panel-title">Welcome back</h2>
        <form className="form" onSubmit={submit}>
        {error ? <div className="error" role="alert">{error}</div> : null}
        <label className="form-label">
          <span>Email</span>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label className="form-label">
          <span>Password</span>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <button className="btn primary" disabled={loading} type="submit">{loading ? 'Signing in…' : 'Sign in'}</button>
        <p className="meta">No account? <button type="button" className="link" onClick={onSwitch}>Create one</button></p>
      </form>
      </div>
    </div>
  );
}
