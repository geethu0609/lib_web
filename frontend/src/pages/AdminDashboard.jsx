import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const [tab, setTab] = useState('channels');
  const [channels, setChannels] = useState([]);
  const [reports, setReports] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ exam_name: '', date: '', start_time: '', end_time: '' });
  const [rooms, setRooms] = useState([{ room_number: '', faculty_id: '' }]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

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

  const addRoom = () => setRooms([...rooms, { room_number: '', faculty_id: '' }]);
  const removeRoom = (i) => setRooms(rooms.filter((_, idx) => idx !== i));
  const updateRoom = (i, field, val) => {
    const updated = [...rooms];
    updated[i][field] = val;
    setRooms(updated);
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const { data: channel } = await api.post('/admin/channels', form);
      await api.post(`/admin/channels/${channel._id}/rooms`, { rooms });
      setMsg('Channel and rooms saved successfully.');
      setForm({ exam_name: '', date: '', start_time: '', end_time: '' });
      setRooms([{ room_number: '', faculty_id: '' }]);
      fetchAll();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error saving channel');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (s) => {
    const colors = { inactive: '#718096', active: '#276749', completed: '#2b6cb0' };
    return <span style={{ ...styles.badge, background: colors[s] || '#718096' }}>{s}</span>;
  };

  const eventStatusBadge = (s) => {
    const colors = { pending: '#b7791f', dismissed: '#718096', confirmed: '#c0392b' };
    return <span style={{ ...styles.badge, background: colors[s] || '#718096' }}>{s}</span>;
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.tabs}>
          {['channels', 'create', 'reports', 'notifications'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...styles.tab, ...(tab === t ? styles.activeTab : {}) }}>
              {t === 'channels' ? 'All Channels' : t === 'create' ? 'Create Channel' : t === 'reports' ? 'Malpractice Reports' : 'Notifications'}
            </button>
          ))}
        </div>

        {tab === 'create' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Create Exam Channel</h2>
            <form onSubmit={handleCreateChannel}>
              <div style={styles.grid2}>
                <div style={styles.field}>
                  <label style={styles.label}>Exam Name</label>
                  <input style={styles.input} value={form.exam_name} onChange={e => setForm({ ...form, exam_name: e.target.value })} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Date</label>
                  <input style={styles.input} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Start Time</label>
                  <input style={styles.input} type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>End Time</label>
                  <input style={styles.input} type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} required />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <h3 style={styles.subTitle}>Rooms</h3>
                  <button type="button" onClick={addRoom} style={styles.addBtn}>+ Add Room</button>
                </div>
                {rooms.map((room, i) => (
                  <div key={i} style={styles.roomRow}>
                    <input
                      style={{ ...styles.input, flex: 1 }}
                      placeholder="Room Number (e.g. A101)"
                      value={room.room_number}
                      onChange={e => updateRoom(i, 'room_number', e.target.value)}
                      required
                    />
                    <select
                      style={{ ...styles.input, flex: 2 }}
                      value={room.faculty_id}
                      onChange={e => updateRoom(i, 'faculty_id', e.target.value)}
                      required
                    >
                      <option value="">— Select Faculty —</option>
                      {facultyList.map(f => <option key={f._id} value={f._id}>{f.name} ({f.email})</option>)}
                    </select>
                    {rooms.length > 1 && (
                      <button type="button" onClick={() => removeRoom(i)} style={styles.removeBtn}>✕</button>
                    )}
                  </div>
                ))}
              </div>

              {msg && <p style={{ color: msg.includes('success') ? '#276749' : '#c0392b', marginTop: '0.8rem' }}>{msg}</p>}
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? 'Saving...' : 'Save Channel'}
              </button>
            </form>
          </div>
        )}

        {tab === 'channels' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>All Exam Channels</h2>
            {channels.length === 0 ? <p style={styles.empty}>No channels created yet.</p> : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Exam Name</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Rooms</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map(ch => (
                    <>
                      <tr key={ch._id} style={styles.tr}>
                        <td style={styles.td}>{ch.exam_name}</td>
                        <td style={styles.td}>{new Date(ch.date).toLocaleDateString()}</td>
                        <td style={styles.td}>{ch.start_time} – {ch.end_time}</td>
                        <td style={styles.td}>{statusBadge(ch.status)}</td>
                        <td style={styles.td}>{ch.rooms?.length || 0} room(s)</td>
                        <td style={styles.td}>
                          <button style={styles.linkBtn} onClick={() => setSelectedChannel(selectedChannel === ch._id ? null : ch._id)}>
                            {selectedChannel === ch._id ? 'Hide Rooms' : 'View Rooms'}
                          </button>
                        </td>
                      </tr>
                      {selectedChannel === ch._id && ch.rooms?.map(room => (
                        <tr key={room._id} style={{ background: '#f7fafc' }}>
                          <td style={{ ...styles.td, paddingLeft: '2rem', color: '#4a5568' }} colSpan={2}>↳ Room {room.room_number}</td>
                          <td style={styles.td} colSpan={2}>{room.faculty_id?.name || '—'}</td>
                          <td style={styles.td}>{statusBadge(room.status)}</td>
                          <td style={styles.td}></td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'reports' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Malpractice Reports</h2>
            {reports.length === 0 ? <p style={styles.empty}>No malpractice events recorded.</p> : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Exam</th>
                    <th style={styles.th}>Room</th>
                    <th style={styles.th}>Faculty</th>
                    <th style={styles.th}>Timestamp</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Evidence</th>
                    <th style={styles.th}>Bounding Box</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(ev => (
                    <tr key={ev._id} style={styles.tr}>
                      <td style={styles.td}>{ev.channel_id?.exam_name || '—'}</td>
                      <td style={styles.td}>{ev.room_id?.room_number || '—'}</td>
                      <td style={styles.td}>{ev.faculty_id?.name || '—'}</td>
                      <td style={styles.td}>{new Date(ev.timestamp).toLocaleString()}</td>
                      <td style={styles.td}>{eventStatusBadge(ev.status)}</td>
                      <td style={styles.td}>
                        <a href={ev.image_url} target="_blank" rel="noreferrer" style={styles.linkBtn}>View Image</a>
                      </td>
                      <td style={{ ...styles.td, fontSize: '0.78rem', color: '#718096' }}>
                        x:{ev.bounding_box?.x} y:{ev.bounding_box?.y} w:{ev.bounding_box?.width} h:{ev.bounding_box?.height}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'notifications' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Notifications</h2>
            {notifications.length === 0 ? <p style={styles.empty}>No notifications.</p> : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Message</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>Read</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map(n => (
                    <tr key={n._id} style={{ ...styles.tr, background: n.read ? '#fff' : '#fffbeb' }}>
                      <td style={styles.td}>{n.message}</td>
                      <td style={styles.td}><span style={{ ...styles.badge, background: n.type === 'alert' ? '#c0392b' : '#2b6cb0' }}>{n.type}</span></td>
                      <td style={styles.td}>{new Date(n.createdAt).toLocaleString()}</td>
                      <td style={styles.td}>{n.read ? '✓' : '●'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: '#f0f2f5' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' },
  tabs: { display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0' },
  tab: { padding: '10px 22px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#718096', borderBottom: '2px solid transparent', marginBottom: '-2px' },
  activeTab: { color: '#1a2340', borderBottomColor: '#1a2340', fontWeight: 600 },
  section: { background: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  sectionTitle: { margin: '0 0 1.2rem', fontSize: '1.1rem', color: '#1a2340', fontWeight: 700 },
  subTitle: { margin: 0, fontSize: '0.95rem', color: '#2d3748', fontWeight: 600 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.82rem', color: '#4a5568', fontWeight: 600 },
  input: { padding: '9px 11px', border: '1px solid #cbd5e0', borderRadius: '4px', fontSize: '0.9rem', outline: 'none' },
  roomRow: { display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '0.6rem' },
  addBtn: { background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem' },
  removeBtn: { background: '#fed7d7', color: '#c0392b', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' },
  submitBtn: { marginTop: '1.2rem', padding: '10px 28px', background: '#1a2340', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
  thead: { background: '#f7fafc' },
  th: { padding: '10px 12px', textAlign: 'left', color: '#4a5568', fontWeight: 600, borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f0f2f5' },
  td: { padding: '10px 12px', color: '#2d3748', verticalAlign: 'middle' },
  badge: { color: '#fff', borderRadius: '10px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 },
  linkBtn: { background: 'none', border: 'none', color: '#2b6cb0', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: 0 },
  empty: { color: '#a0aec0', textAlign: 'center', padding: '2rem 0' },
};

export default AdminDashboard;
