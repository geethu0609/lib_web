import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Bell, ShieldAlert, Zap, Square,
  CheckCircle2, AlertTriangle, Clock, Radio
} from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Btn from '../components/Btn';

const tabTitles = {
  assignments:   'My Assignments',
  monitor:       'Live Monitor',
  notifications: 'Notifications',
};

const FacultyDashboard = () => {
  const [tab, setTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [events, setEvents] = useState([]);
  const [msg, setMsg] = useState('');
  const pollRef = useRef(null);

  const fetchAssignments  = async () => { const { data } = await api.get('/faculty/channels'); setAssignments(data); };
  const fetchNotifications = async () => { const { data } = await api.get('/notifications'); setNotifications(data); };

  useEffect(() => { fetchAssignments(); fetchNotifications(); }, []);

  useEffect(() => {
    if (tab === 'notifications') {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
    }
  }, [tab]);

  const fetchEvents = async (roomId) => {
    const { data } = await api.get(`/faculty/rooms/${roomId}/events`);
    setEvents(data);
  };

  const startMonitoring = (roomId) => {
    setActiveRoom(roomId);
    fetchEvents(roomId);
    pollRef.current = setInterval(() => fetchEvents(roomId), 8000);
  };

  const stopMonitoring = () => {
    clearInterval(pollRef.current);
    setActiveRoom(null);
    setEvents([]);
  };

  useEffect(() => () => clearInterval(pollRef.current), []);

  const handleActivate = async (roomId) => {
    try {
      await api.post(`/faculty/rooms/${roomId}/activate`);
      setAssignments(prev => prev.map(a =>
        a.room._id === roomId ? { ...a, room: { ...a.room, status: 'active' } } : a
      ));
      startMonitoring(roomId);
      setTab('monitor');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error activating room');
    }
  };

  const handleStop = async () => {
    if (activeRoom) {
      try {
        await api.post(`/faculty/rooms/${activeRoom}/deactivate`);
        setAssignments(prev => prev.map(a =>
          a.room._id === activeRoom ? { ...a, room: { ...a.room, status: 'inactive' } } : a
        ));
      } catch {}
    }
    stopMonitoring();
  };

  const handleDismiss     = async (id) => { await api.post(`/faculty/events/${id}/dismiss`); fetchEvents(activeRoom); };
  const handleInformAdmin = async (id) => { await api.post(`/faculty/events/${id}/inform`); fetchEvents(activeRoom); fetchNotifications(); };
  const handleMockEvent   = async (roomId) => {
    try { await api.post(`/ai/mock-event/${roomId}`); fetchEvents(roomId); }
    catch (err) { setMsg(err.response?.data?.message || 'Error generating event'); }
  };
  const markRead = async (id) => { await api.patch(`/notifications/${id}/read`); fetchNotifications(); };

  const unread        = notifications.filter(n => !n.isRead && !n.read).length;
  const activeCount   = assignments.filter(a => a.room?.status === 'active').length;
  const pendingEvents = events.filter(e => e.status === 'pending').length;

  return (
    <Layout tab={tab} setTab={setTab} title={tabTitles[tab]}>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        <StatCard icon={BookOpen}    label="Assignments"    value={assignments.length} color="#6366f1" bg="#eef2ff" />
        <StatCard icon={Radio}       label="Active Rooms"   value={activeCount}        color="#059669" bg="#ecfdf5" sub={activeCount > 0 ? 'Monitoring' : undefined} />
        <StatCard icon={ShieldAlert} label="Pending Alerts" value={pendingEvents}      color="#dc2626" bg="#fef2f2" sub={pendingEvents > 0 ? 'Action needed' : undefined} />
        <StatCard icon={Bell}        label="Unread Notifs"  value={unread}             color="#d97706" bg="#fffbeb" />
      </div>

      {/* Error banner */}
      {msg && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl text-sm"
          style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
          <AlertTriangle size={14} className="flex-shrink-0" /> {msg}
        </motion.div>
      )}

      <AnimatePresence mode="wait">

        {/* ══ ASSIGNMENTS ══ */}
        {tab === 'assignments' && (
          <motion.div key="assignments"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="card"
          >
            <div className="card-header">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Assigned Exam Rooms</h2>
                <p className="text-xs text-slate-400 mt-0.5">{assignments.length} assignment{assignments.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {assignments.length === 0 ? (
              <EmptyState message="No assignments yet. Check back after the admin creates a channel." />
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      {['Exam Name', 'Date', 'Time', 'Room', 'Status', 'Action'].map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(({ room, channel }) => (
                      <tr key={room._id}>
                        <td className="font-semibold text-slate-800">{channel?.exam_name || '—'}</td>
                        <td>{channel?.date ? new Date(channel.date).toLocaleDateString() : '—'}</td>
                        <td className="font-mono text-xs">{channel?.start_time} – {channel?.end_time}</td>
                        <td>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                            style={{ background: '#eef2ff', color: '#4f46e5' }}>
                            <BookOpen size={10} /> {room.room_number}
                          </span>
                        </td>
                        <td><Badge status={room.status} /></td>
                        <td>
                          {room.status === 'inactive' ? (
                            <Btn variant="success" size="sm" onClick={() => handleActivate(room._id)}>Activate</Btn>
                          ) : (
                            <Btn variant="primary" size="sm" onClick={() => { startMonitoring(room._id); setTab('monitor'); }}>
                              Monitor
                            </Btn>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ══ LIVE MONITOR ══ */}
        {tab === 'monitor' && (
          <motion.div key="monitor"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* Status bar */}
            <div className="monitor-bar">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-3 h-3">
                  {activeRoom && <span className="ping-ring" style={{ background: '#10b981' }} />}
                  <span className={`relative w-2.5 h-2.5 rounded-full ${activeRoom ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {activeRoom ? 'Session Active' : 'No Active Session'}
                </span>
                {activeRoom && <span className="text-xs text-slate-400 hidden sm:inline">· Auto-refreshing every 8s</span>}
              </div>
              {activeRoom && (
                <div className="flex items-center gap-2">
                  <Btn variant="amber" size="sm" icon={Zap} onClick={() => handleMockEvent(activeRoom)}>
                    Simulate AI Alert
                  </Btn>
                  <Btn variant="danger" size="sm" icon={Square} onClick={handleStop}>Stop</Btn>
                </div>
              )}
            </div>

            {/* States */}
            {!activeRoom ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-icon-wrap" style={{ background: '#f1f5f9' }}>
                    <Radio size={22} color="#cbd5e1" />
                  </div>
                  <p className="text-sm text-slate-500">No active room.</p>
                  <p className="text-xs text-slate-400">Go to <strong>My Assignments</strong> and click <strong>Activate</strong>.</p>
                </div>
              </div>
            ) : events.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-icon-wrap" style={{ background: '#ecfdf5' }}>
                    <CheckCircle2 size={22} color="#10b981" />
                  </div>
                  <p className="text-sm text-slate-500">No malpractice events detected.</p>
                  <p className="text-xs text-slate-400">Click <strong>Simulate AI Alert</strong> to generate a mock event.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {events.map((ev, i) => (
                    <AlertCard key={ev._id} ev={ev} index={i}
                      onDismiss={() => handleDismiss(ev._id)}
                      onInform={() => handleInformAdmin(ev._id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* ══ NOTIFICATIONS ══ */}
        {tab === 'notifications' && (
          <motion.div key="notifications"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="card"
          >
            <div className="card-header">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Notifications</h2>
                <p className="text-xs text-slate-400 mt-0.5">{notifications.length} total</p>
              </div>
              {unread > 0 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: '#fee2e2', color: '#b91c1c' }}>
                  {unread} unread
                </span>
              )}
            </div>

            {notifications.length === 0 ? <EmptyState message="No notifications yet." /> : (
              <div>
                {notifications.map(n => (
                  <div key={n._id} className={`notif-item${(!n.isRead && !n.read) ? ' unread' : ''}`}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: n.type === 'alert' ? '#fee2e2' : '#ede9fe' }}>
                      {n.type === 'alert'
                        ? <ShieldAlert size={15} color="#b91c1c" />
                        : <Bell size={15} color="#6d28d9" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">{n.message}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock size={10} color="#94a3b8" />
                        <p className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge status={n.type} />
                      {(!n.isRead && !n.read) && (
                        <button onClick={() => markRead(n._id)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </Layout>
  );
};

/* ── Premium Alert Card ── */
const AlertCard = ({ ev, index, onDismiss, onInform }) => {
  const isPending = ev.status === 'pending';
  const bb = ev.bounding_box;

  return (
    <motion.div
      className={`alert-card${isPending ? ' pending' : ''}`}
      initial={{ opacity: 0, y: 22, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      whileHover={{ y: -3 }}
    >
      {/* Image + overlays */}
      <div className="alert-img-wrap">
        <img src={ev.image_url} alt="Evidence" />

        {/* Bounding box */}
        {bb && (
          <div className="bbox" style={{
            left:   `${(bb.x / 320) * 100}%`,
            top:    `${(bb.y / 240) * 100}%`,
            width:  `${(bb.width  / 320) * 100}%`,
            height: `${(bb.height / 240) * 100}%`,
          }}>
            <span className="bbox-label">DETECTED</span>
          </div>
        )}

        {/* Top-left: live badge */}
        {isPending && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold text-white"
            style={{ background: 'rgba(185,28,28,0.88)', backdropFilter: 'blur(4px)' }}>
            <span className="relative flex w-2 h-2">
              <span className="ping-ring" />
              <span className="relative w-2 h-2 rounded-full bg-white" />
            </span>
            LIVE
          </div>
        )}

        {/* Top-right: status badge */}
        <div className="absolute top-2.5 right-2.5">
          <Badge status={ev.status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2.5">
          <Clock size={11} />
          {new Date(ev.timestamp).toLocaleString()}
        </div>

        {bb && (
          <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-lg"
            style={{ background: '#f8fafc', border: '1px solid #e8edf3' }}>
            <ShieldAlert size={11} color="#94a3b8" />
            <span className="text-xs font-mono text-slate-400">
              x:{bb.x} y:{bb.y} · {bb.width}×{bb.height}px
            </span>
          </div>
        )}

        {isPending && (
          <div className="flex gap-2">
            <Btn variant="ghost" size="sm" className="flex-1 justify-center" onClick={onDismiss}>
              Dismiss
            </Btn>
            <Btn variant="danger" size="sm" className="flex-1 justify-center" onClick={onInform}>
              Inform Admin
            </Btn>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const EmptyState = ({ message }) => (
  <div className="empty-state">
    <div className="empty-icon-wrap">
      <BookOpen size={22} color="#cbd5e1" />
    </div>
    <p className="text-sm">{message}</p>
  </div>
);

export default FacultyDashboard;
