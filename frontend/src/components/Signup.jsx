import React, { useState } from 'react';
import { signup as apiSignup } from '../api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Signup({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = apiSignup({ email, password });
      signup(user.email);
    } catch (err) {
      setError(err.message || 'Signup failed');
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
        <h2 className="panel-title">Create your account</h2>
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
        <button className="btn primary" disabled={loading} type="submit">{loading ? 'Creating…' : 'Sign up'}</button>
        <p className="meta">Already have an account? <button type="button" className="link" onClick={onSwitch}>Sign in</button></p>
      </form>
      </div>
    </div>
  );
}
