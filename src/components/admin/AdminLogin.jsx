import React, { useState } from 'react';
import { adminApi, setToken } from './adminApi';

function AdminLogin({ onLoggedIn }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { token } = await adminApi.login(password);
      setToken(token);
      onLoggedIn();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-shell admin-shell--centered">
      <form className="admin-login" onSubmit={handleSubmit}>
        <h1 className="admin-login__title">Admin Portal</h1>
        <label className="admin-login__label">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
            className="admin-login__input"
          />
        </label>
        {error && <p className="admin-login__error">{error}</p>}
        <button type="submit" className="admin-btn admin-btn--primary" disabled={busy || !password}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
