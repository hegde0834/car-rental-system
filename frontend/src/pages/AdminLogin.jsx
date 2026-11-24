import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';

export default function AdminLogin() {
  const nav = useNavigate();
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.me()
      .then((r) => r.loggedIn && nav('/admin', { replace: true }))
      .catch(() => {});
  }, [nav]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.login(username, password);
      nav('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="logo" style={{ marginBottom: 20 }}>
          <span className="logo-mark">🚗</span>
          <span className="logo-title">Mysuru<span className="logo-accent">Drive</span></span>
        </div>
        <h2>Admin Sign In</h2>
        <p className="muted" style={{ marginBottom: 20, fontSize: 14 }}>
          Enter staff credentials to manage bookings and fleet inventory.
        </p>

        <label>
          Username
          <input
            value={username}
            onChange={(e) => setU(e.target.value)}
            autoFocus
            placeholder="e.g. admin"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setP(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="btn btn-vibrant btn-block" disabled={busy}>
          {busy ? 'Verifying Credentials…' : 'Sign In To Dashboard'}
        </button>

        <Link to="/" className="back">← Return to Public Website</Link>
      </form>
    </div>
  );
}
