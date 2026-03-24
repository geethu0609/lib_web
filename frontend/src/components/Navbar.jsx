import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const { data } = await api.get('/notifications');
        setUnread(data.filter(n => !n.read).length);
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>ExamGuard — Invigilation System</span>
      <div style={styles.right}>
        <span style={styles.userInfo}>{user?.name} <em style={styles.role}>({user?.role})</em></span>
        {unread > 0 && <span style={styles.badge}>{unread} alert{unread > 1 ? 's' : ''}</span>}
        <button onClick={handleLogout} style={styles.btn}>Logout</button>
      </div>
    </nav>
  );
};

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a2340', color: '#fff', padding: '0 2rem', height: '56px' },
  brand: { fontWeight: 700, fontSize: '1.05rem', letterSpacing: '0.5px' },
  right: { display: 'flex', alignItems: 'center', gap: '1rem' },
  userInfo: { fontSize: '0.9rem' },
  role: { color: '#a0aec0', fontStyle: 'normal' },
  badge: { background: '#c0392b', color: '#fff', borderRadius: '12px', padding: '2px 10px', fontSize: '0.78rem', fontWeight: 600 },
  btn: { background: 'transparent', border: '1px solid #4a5568', color: '#cbd5e0', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
};

export default Navbar;
