import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Bell, ShieldAlert,
  LogOut, GraduationCap, ChevronRight, Plus
} from 'lucide-react';

const adminLinks = [
  { key: 'channels',      label: 'All Channels',       icon: LayoutDashboard },
  { key: 'create',        label: 'Create Channel',      icon: Plus },
  { key: 'reports',       label: 'Malpractice Reports', icon: ShieldAlert },
  { key: 'notifications', label: 'Notifications',       icon: Bell },
];
const facultyLinks = [
  { key: 'assignments',   label: 'My Assignments', icon: LayoutDashboard },
  { key: 'monitor',       label: 'Live Monitor',   icon: ShieldAlert },
  { key: 'notifications', label: 'Notifications',  icon: Bell },
];

const Sidebar = ({ tab, setTab, unread }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? adminLinks : facultyLinks;

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <GraduationCap size={18} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight tracking-tight">ExamGuard</p>
          <p className="text-slate-500 text-xs mt-0.5">Invigilation System</p>
        </div>
      </div>

      {/* User pill */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-xs font-semibold truncate leading-tight">{user?.name}</p>
          <p className="text-slate-500 text-xs capitalize mt-0.5">{user?.role}</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Online" />
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-1">
        <p className="sidebar-section-label">Navigation</p>
        {links.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`sidebar-link${tab === key ? ' active' : ''}`}
          >
            <span className="link-icon">
              <Icon size={15} strokeWidth={tab === key ? 2.5 : 2} />
            </span>
            <span className="flex-1 text-left">{label}</span>
            {key === 'notifications' && unread > 0 && (
              <span className="sidebar-badge">{unread > 9 ? '9+' : unread}</span>
            )}
            {tab === key && <ChevronRight size={13} className="opacity-50 flex-shrink-0" />}
          </button>
        ))}
      </nav>

      {/* Divider + logout */}
      <div className="px-3 pb-4 pt-2 border-t border-white/5">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="sidebar-link"
          style={{ color: '#f87171' }}
        >
          <span className="link-icon">
            <LogOut size={15} />
          </span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
