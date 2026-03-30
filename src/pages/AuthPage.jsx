import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

const EmailIcon = () => (
  <svg className="auth-input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg className="auth-input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UserIcon = () => (
  <svg className="auth-input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const isLogin = location.pathname === '/login';

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const t = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(t);
  }, [isLogin]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post('/api/auth/signin', { email: form.email, password: form.password });
        login(res.data.token, res.data.user);
        navigate(res.data.user.role === 'admin' ? '/admin' : '/');
      } else {
        const res = await axios.post('/api/auth/signup', form);
        login(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || (isLogin ? 'Login failed' : 'Signup failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper auth-page-redesign">
      <div className="auth-decorations">
        <div className="auth-deco auth-deco-pizza" />
        <div className="auth-deco auth-deco-soda" />
        <div className="auth-deco auth-deco-burger" />
        <div className="auth-deco auth-deco-fries" />
      </div>

      <div className={`auth-card-compact ${isAnimating ? 'auth-card-animating' : ''}`}>
        <h1 className="auth-tagline-compact">Welcome to Cheesy Happiness</h1>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-compact">
          {!isLogin && (
            <div className="auth-input-group-compact">
              <div className="auth-input-wrap-compact">
                <UserIcon />
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  autoComplete="name"
                  className="auth-input-compact"
                />
              </div>
            </div>
          )}

          <div className="auth-input-group-compact">
            <div className="auth-input-wrap-compact">
              <EmailIcon />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                required
                autoComplete="email"
                className="auth-input-compact"
              />
            </div>
          </div>

          <div className="auth-input-group-compact">
            <div className="auth-input-wrap-compact">
              <LockIcon />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="auth-input-compact"
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn-compact"
            disabled={loading}
          >
            {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <p className="auth-toggle-compact">
          {isLogin ? (
            <>
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="auth-toggle-link-compact">Create Account</Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link to="/login" className="auth-toggle-link-compact">Sign In</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
