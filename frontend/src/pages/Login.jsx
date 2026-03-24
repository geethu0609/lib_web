import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin' : '/faculty');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>ExamGuard</h1>
          <p style={styles.subtitle}>AI-Powered Exam Invigilation System</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email Address</label>
          <input
            style={styles.input}
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={styles.hint}>Demo: admin@university.edu / admin123</p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' },
  card: { background: '#fff', borderRadius: '8px', padding: '2.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 2px 16px rgba(0,0,0,0.1)' },
  header: { textAlign: 'center', marginBottom: '2rem' },
  title: { margin: 0, fontSize: '1.8rem', color: '#1a2340', fontWeight: 700 },
  subtitle: { margin: '0.4rem 0 0', color: '#718096', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  label: { fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 },
  input: { padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: '4px', fontSize: '0.95rem', outline: 'none' },
  error: { color: '#c0392b', fontSize: '0.85rem', margin: '0' },
  btn: { marginTop: '0.8rem', padding: '11px', background: '#1a2340', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', fontWeight: 600 },
  hint: { textAlign: 'center', marginTop: '1.2rem', fontSize: '0.78rem', color: '#a0aec0' },
};

export default Login;
