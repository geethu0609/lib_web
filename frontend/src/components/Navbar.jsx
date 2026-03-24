import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Search } from 'lucide-react';

const Navbar = ({ title = 'Dashboard', onNotifOpen, unread = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      {/* Left: title */}
      <div>
        <h1 className="text-base font-bold text-slate-800 leading-tight">{title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="search-wrap hidden md:flex">
          <Search size={14} />
          <input className="search-input" placeholder="Search…" />
        </div>

        {/* Bell */}
        <div className="relative ml-1">
          <button
            onClick={() => onNotifOpen?.()}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
            <Bell size={17} strokeWidth={2} />
          </button>
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366f1,#a5b4fc)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-semibold text-slate-700">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50 ml-1"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
