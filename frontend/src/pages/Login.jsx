import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, GraduationCap } from 'lucide-react';

const DEMO = [
  { role: 'Admin',   email: 'admin@university.edu',  pw: 'admin123' },
  { role: 'Faculty', email: 'sarah@university.edu',   pw: 'faculty123' },
];

const Login = () => {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin' : '/faculty');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ── Animated background blobs ── */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* ── Centered card ── */}
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >

        {/* Logo + brand */}
        <div className="login-brand">
          <div className="login-logo">
            <GraduationCap size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <p className="login-brand-name">ExamGuard</p>
            <p className="login-brand-sub">AI Invigilation System</p>
          </div>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1>Welcome back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">

          <div className="login-field">
            <label className="form-label">Email Address</label>
            <div className="login-input-wrap">
              <Mail size={15} className="login-input-icon" />
              <input
                type="email"
                placeholder="you@university.edu"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                className="form-input login-input-padded"
              />
            </div>
          </div>

          <div className="login-field">
            <label className="form-label">Password</label>
            <div className="login-input-wrap">
              <Lock size={15} className="login-input-icon" />
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                className="form-input login-input-padded"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              className="login-error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className="login-btn"
            whileHover={!loading ? { scale: 1.02, boxShadow: '0 8px 24px rgba(99,102,241,0.45)' } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            transition={{ duration: 0.18 }}
          >
            {loading ? (
              <span className="login-btn-loading">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Signing in…
              </span>
            ) : 'Sign In'}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>Quick access</span>
        </div>

        {/* Demo credentials */}
        <div className="login-demo">
          {DEMO.map(c => (
            <motion.button
              key={c.role}
              type="button"
              onClick={() => setForm({ email: c.email, password: c.pw })}
              className="login-demo-btn"
              whileHover={{ scale: 1.015, backgroundColor: '#f5f3ff' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <span className="login-demo-role">{c.role}</span>
              <span className="login-demo-email">{c.email}</span>
            </motion.button>
          ))}
          <p className="login-demo-hint">Click a row to auto-fill</p>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
