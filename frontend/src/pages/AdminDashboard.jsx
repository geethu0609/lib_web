import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Users, ShieldAlert, Bell, Plus, Trash2,
  ChevronDown, ChevronUp, ExternalLink, CheckCircle2, Search
} from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Btn from '../components/Btn';

const tabTitles = {
  channels:      'All Channels',
  create:        'Create Channel',
  reports:       'Malpractice Reports',
  notifications: 'Notifications',
};

const AdminDashboard = () => {
  const [tab, setTab] = useState('channels');
  const [channels, setChannels] = useState([]);
  const [reports, setReports] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ exam_name: '', date: '', start_time: '', end_time: '' });
  const [rooms, setRooms] = useState([{ room_number: '', faculty_id: '' }]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [msg, setMsg] = useState({ text: '', ok: false });
  const [loading, setLoading] = useState(false);
  const [reportSearch, setReportSearch] = useState('');
  const [reportFilter, setReportFilter] = useState('all');

  const fetchAll = async () => {
    const [ch, rp, notifs] = await Promise.all([
      api.get('/admin/channels'),
      api.get('/admin/malpractice'),
      api.get('/notifications'),
    ]);
    setChannels(ch.data);
    setReports(rp.data);
    setNotifications(notifs.data);
  };

  useEffect(() => {
    api.get('/admin/faculty-users').then(r => setFacultyList(r.data));
    fetchAll();
  }, []);

  const addRoom    = () => setRooms([...rooms, { room_number: '', faculty_id: '' }]);
  const removeRoom = (i) => setRooms(rooms.filter((_, idx) => idx !== i));
  const updateRoom = (i, field, val) => {
    const u = [...rooms]; u[i][field] = val; setRooms(u);
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', ok: false });
    try {
      const { data: channel } = await api.post('/admin/channels', form);
      await api.post(`/admin/channels/${channel._id}/rooms`, { rooms });
      setMsg({ text: 'Channel and rooms saved successfully.', ok: true });
      setForm({ exam_name: '', date: '', start_time: '', end_time: '' });
      setRooms([{ room_number: '', faculty_id: '' }]);
      fetchAll();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Error saving channel', ok: false });
    } finally {
      setLoading(false);
    }
  };

  const handleNotifOpen = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
  };

  const totalRooms  = channels.reduce((a, c) => a + (c.rooms?.length || 0), 0);
  const activeExams = channels.filter(c => c.status === 'active').length;
  const alertCount  = reports.filter(r => r.status === 'confirmed').length;
  const unread      = notifications.filter(n => !n.isRead && !n.read).length;

  const filteredReports = reports.filter(r => {
    const matchSearch = !reportSearch ||
      r.channel_id?.exam_name?.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.room_id?.room_number?.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.faculty_id?.name?.toLowerCase().includes(reportSearch.toLowerCase());
    const matchFilter =
      reportFilter === 'all' ||
      (reportFilter === 'pending' && !r.acknowledged) ||
      (reportFilter === 'acknowledged' && r.acknowledged);
    return matchSearch && matchFilter;
  });

  const handleAcknowledge = async (id) => {
    const { data } = await api.post(`/admin/events/${id}/acknowledge`);
    setReports(prev => prev.map(r => r._id === id ? { ...r, acknowledged: data.acknowledged, acknowledgedAt: data.acknowledgedAt } : r));
  };

  return (
    <Layout tab={tab} setTab={setTab} title={tabTitles[tab]}>

      {/* ── Stat row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        <StatCard icon={BookOpen}    label="Total Channels"    value={channels.length} color="#6366f1" bg="#eef2ff" />
        <StatCard icon={Users}       label="Total Rooms"       value={totalRooms}      color="#0891b2" bg="#ecfeff" />
        <StatCard icon={ShieldAlert} label="Active Exams"      value={activeExams}     color="#059669" bg="#ecfdf5" sub={activeExams > 0 ? 'In progress' : undefined} />
        <StatCard icon={Bell}        label="Confirmed Alerts"  value={alertCount}      color="#dc2626" bg="#fef2f2" sub={alertCount > 0 ? 'Needs review' : undefined} />
      </div>

      <AnimatePresence mode="wait">

        {/* ══ CREATE CHANNEL ══ */}
        {tab === 'create' && (
          <motion.div key="create"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="card"
          >
            <div className="card-header">
              <div>
                <h2 className="text-sm font-bold text-slate-800">New Exam Channel</h2>
                <p className="text-xs text-slate-400 mt-0.5">Fill in the details and assign faculty to rooms</p>
              </div>
            </div>

            <form onSubmit={handleCreateChannel} className="card-body">
              {/* Channel fields — 2-col grid */}
              <div className="form-grid mb-7">
                {[
                  { label: 'Exam Name',   key: 'exam_name',   type: 'text', placeholder: 'e.g. Final Semester Exam' },
                  { label: 'Date',        key: 'date',        type: 'date' },
                  { label: 'Start Time',  key: 'start_time',  type: 'time' },
                  { label: 'End Time',    key: 'end_time',    type: 'time' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="form-label">{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                ))}
              </div>

              {/* Room assignments */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-700">Room Assignments</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{rooms.length} room{rooms.length !== 1 ? 's' : ''} added</p>
                  </div>
                  <Btn variant="outline" size="sm" icon={Plus} onClick={addRoom} type="button">Add Room</Btn>
                </div>

                <div className="space-y-3">
                  {rooms.map((room, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="room-row"
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: '#eef2ff', color: '#4f46e5' }}>
                        {i + 1}
                      </div>
                      <input
                        className="form-input"
                        style={{ flex: '0 0 140px' }}
                        placeholder="Room No. (e.g. A101)"
                        value={room.room_number}
                        onChange={e => updateRoom(i, 'room_number', e.target.value)}
                        required
                      />
                      <select
                        className="form-input"
                        style={{ flex: 1 }}
                        value={room.faculty_id}
                        onChange={e => updateRoom(i, 'faculty_id', e.target.value)}
                        required
                      >
                        <option value="">— Select Faculty —</option>
                        {facultyList.map(f => (
                          <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                        ))}
                      </select>
                      {rooms.length > 1 && (
                        <button type="button" onClick={() => removeRoom(i)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors flex-shrink-0">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              {msg.text && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-5 flex items-center gap-2 p-3.5 rounded-xl text-sm"
                  style={msg.ok
                    ? { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }
                    : { background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
                  <CheckCircle2 size={15} />
                  {msg.text}
                </motion.div>
              )}

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => { setForm({ exam_name: '', date: '', start_time: '', end_time: '' }); setRooms([{ room_number: '', faculty_id: '' }]); setMsg({ text: '', ok: false }); }}
                  className="btn btn-ghost btn-md">Clear</button>
                <Btn type="submit" variant="primary" size="lg" disabled={loading}>
                  {loading ? 'Saving…' : 'Save Channel'}
                </Btn>
              </div>
            </form>
          </motion.div>
        )}

        {/* ══ ALL CHANNELS ══ */}
        {tab === 'channels' && (
          <motion.div key="channels"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="card"
          >
            <div className="card-header">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Exam Channels</h2>
                <p className="text-xs text-slate-400 mt-0.5">{channels.length} channel{channels.length !== 1 ? 's' : ''} total</p>
              </div>
              <Btn variant="primary" size="sm" icon={Plus} onClick={() => setTab('create')}>New Channel</Btn>
            </div>

            {channels.length === 0 ? <EmptyState message="No channels yet. Create your first exam channel." /> : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      {['Exam Name', 'Date', 'Time', 'Status', 'Rooms', 'Actions'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {channels.map(ch => (
                      <>
                        <tr key={ch._id}>
                          <td className="font-semibold text-slate-800">{ch.exam_name}</td>
                          <td>{new Date(ch.date).toLocaleDateString()}</td>
                          <td className="font-mono text-xs">{ch.start_time} – {ch.end_time}</td>
                          <td><Badge status={ch.status} /></td>
                          <td>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                              <Users size={11} /> {ch.rooms?.length || 0}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedChannel(selectedChannel === ch._id ? null : ch._id)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              {selectedChannel === ch._id
                                ? <><ChevronUp size={13} /> Hide</>
                                : <><ChevronDown size={13} /> Rooms</>}
                            </button>
                          </td>
                        </tr>
                        <AnimatePresence>
                          {selectedChannel === ch._id && ch.rooms?.map(room => (
                            <motion.tr key={room._id}
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              style={{ background: '#f8fafc' }}
                            >
                              <td colSpan={2} style={{ paddingLeft: '2.5rem' }}>
                                <span className="text-indigo-400 mr-1.5 text-xs">↳</span>
                                <span className="text-xs font-semibold text-slate-600">Room {room.room_number}</span>
                              </td>
                              <td colSpan={2} className="text-xs text-slate-500">{room.faculty_id?.name || '—'}</td>
                              <td><Badge status={room.status} /></td>
                              <td />
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ══ REPORTS ══ */}
        {tab === 'reports' && (
          <motion.div key="reports"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="card"
          >
            <div className="card-header">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Malpractice Reports</h2>
                <p className="text-xs text-slate-400 mt-0.5">{filteredReports.length} of {reports.length} events</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Filter pills */}
                <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#f1f5f9' }}>
                  {['all', 'pending', 'acknowledged'].map(f => (
                    <button key={f}
                      onClick={() => setReportFilter(f)}
                      className="text-xs font-semibold px-3 py-1 rounded-lg capitalize transition-all"
                      style={reportFilter === f
                        ? { background: '#fff', color: '#4f46e5', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                        : { color: '#94a3b8' }}
                    >{f}</button>
                  ))}
                </div>
                <div className="search-wrap">
                  <Search size={14} />
                  <input
                    className="search-input"
                    placeholder="Search reports…"
                    value={reportSearch}
                    onChange={e => setReportSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {filteredReports.length === 0 ? <EmptyState message="No malpractice events recorded." /> : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      {['Room', 'Exam / Channel', 'Faculty', 'Timestamp', 'Ack. Status', 'Evidence', 'Action'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map(ev => (
                      <tr key={ev._id}>
                        <td className="font-semibold text-slate-800">{ev.room_id?.room_number || '—'}</td>
                        <td>{ev.channel_id?.exam_name || '—'}</td>
                        <td>{ev.faculty_id?.name || '—'}</td>
                        <td className="text-xs text-slate-400">{new Date(ev.timestamp).toLocaleString()}</td>
                        <td>
                          {ev.acknowledged
                            ? <span className="badge badge-active">Acknowledged</span>
                            : <span className="badge badge-pending">Pending</span>}
                        </td>
                        <td>
                          <a href={ev.image_url} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                            <ExternalLink size={11} /> View
                          </a>
                        </td>
                        <td>
                          {ev.acknowledged
                            ? <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                <CheckCircle2 size={13} color="#16a34a" /> Done
                              </span>
                            : <button
                                onClick={() => handleAcknowledge(ev._id)}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                                style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                              >Acknowledge</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0`}
                      style={{ background: n.type === 'alert' ? '#fee2e2' : '#ede9fe' }}>
                      {n.type === 'alert'
                        ? <ShieldAlert size={15} color="#b91c1c" />
                        : <Bell size={15} color="#6d28d9" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge status={n.type} />
                      {(!n.isRead && !n.read) && <span className="relative flex w-2 h-2">
                        <span className="ping-ring" />
                        <span className="relative w-2 h-2 rounded-full bg-indigo-500" />
                      </span>}
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

const EmptyState = ({ message }) => (
  <div className="empty-state">
    <div className="empty-icon-wrap">
      <BookOpen size={22} color="#cbd5e1" />
    </div>
    <p className="text-sm">{message}</p>
  </div>
);

export default AdminDashboard;
