import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, Mail, Lock, ArrowRight, AlertCircle, UserPlus } from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import api from '../services/api';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isNoUser, setIsNoUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsNoUser(false);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message || 'Login failed.';
      // When hosted on a static provider like GitHub Pages, POST /api returns 405 (Method Not Allowed).
      // Automatically fallback to preview session so visitors are not blocked.
      if (err.status === 405 || msg.includes('405')) {
        login({
          id: 1,
          name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') || 'Goutham Reddy',
          email: email,
          role: 'Lead Architect',
          system_role: (email === 'rgoutham079@gmail.com' || email.toLowerCase().includes('admin')) ? 'OWNER' : 'USER',
          profile_image: 'https://github.com/tembarenigoutham.png'
        }, 'demo-preview-token');
        navigate('/dashboard');
        return;
      }

      setError(msg);
      if (err.status === 404 || msg.toLowerCase().includes('no user found')) {
        setIsNoUser(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.25rem',
      backgroundColor: 'var(--bg-main)',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: '1.25rem', right: '1.5rem' }}>
        <ThemeToggle showLabel />
      </div>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '1rem',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <Layers size={24} />
          </div>
          <h1 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
            Sign In to DevCollab
          </h1>
          <p className="page-subtitle">Developer collaboration workspace</p>
        </div>

        {/* Error Alert Box with Action */}
        {error && (
          <div className="alert alert-danger" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>{error}</span>
            </div>
            {isNoUser && (
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
                style={{ width: '100%', marginTop: '0.25rem' }}
              >
                <UserPlus size={14} /> Create an Account Now
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0 0.75rem', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or test deployment</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          </div>

          <button
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            onClick={() => {
              login({
                id: 1,
                name: 'Goutham Reddy',
                email: 'rgoutham079@gmail.com',
                role: 'Lead Architect',
                system_role: 'OWNER',
                profile_image: 'https://github.com/tembarenigoutham.png'
              }, 'demo-preview-token');
              navigate('/dashboard');
            }}
          >
            ⚡ Explore Demo Workspace (Instant Preview)
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          New to the team?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
