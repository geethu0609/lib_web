import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const FacultyDashboard = () => {
  const [tab, setTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [events, setEvents] = useState([]);
  const [msg, setMsg] = useState('');
  const pollRef = useRef(null);

  const fetchAssignments = async () => {
    const { data } = await api.get('/faculty/channels');
    setAssignments(data);
  };

  const fetchNotifications = async () => {
    const { data } = await api.get('/notifications');
    setNotifications(data);
  };

  useEffect(() => {
    fetchAssignments();
    fetchNotifications();
  }, []);

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
      fetchAssignments();
      startMonitoring(roomId);
      setTab('monitor');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error activating room');
    }
  };

  const handleDismiss = async (eventId) => {
    await api.post(`/faculty/events/${eventId}/dismiss`);
    fetchEvents(activeRoom);
  };

  const handleInformAdmin = async (eventId) => {
    await api.post(`/faculty/events/${eventId}/inform`);
    fetchEvents(activeRoom);
    fetchNotifications();
  };

  const handleMockEvent = async (roomId) => {
    try {
      await api.post(`/ai/mock-event/${roomId}`);
      fetchEvents(roomId);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error generating event');
    }
  };

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    fetchNotifications();
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
          {['assignments', 'monitor', 'notifications'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...styles.tab, ...(tab === t ? styles.activeTab : {}) }}>
              {t === 'assignments' ? 'My Assignments' : t === 'monitor' ? 'Live Monitor' : `Notifications${notifications.filter(n => !n.read).length > 0 ? ` (${notifications.filter(n => !n.read).length})` : ''}`}
            </button>
          ))}
        </div>

        {msg && <p style={{ color: '#c0392b', marginBottom: '1rem' }}>{msg}</p>}

        {tab === 'assignments' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Assigned Exam Rooms</h2>
            {assignments.length === 0 ? <p style={styles.empty}>No assignments yet.</p> : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Exam Name</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>Room</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(({ room, channel }) => (
                    <tr key={room._id} style={styles.tr}>
                      <td style={styles.td}>{channel?.exam_name || '—'}</td>
                      <td style={styles.td}>{channel?.date ? new Date(channel.date).toLocaleDateString() : '—'}</td>
                      <td style={styles.td}>{channel?.start_time} – {channel?.end_time}</td>
                      <td style={styles.td}>{room.room_number}</td>
                      <td style={styles.td}>{statusBadge(room.status)}</td>
                      <td style={styles.td}>
                        {room.status === 'inactive' ? (
                          <button style={styles.activateBtn} onClick={() => handleActivate(room._id)}>Activate</button>
                        ) : (
                          <button style={styles.monitorBtn} onClick={() => { startMonitoring(room._id); setTab('monitor'); }}>
                            Monitor
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'monitor' && (
          <div style={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={styles.sectionTitle}>
                Live Monitoring {activeRoom ? <span style={{ color: '#276749', fontSize: '0.85rem' }}>● Active</span> : <span style={{ color: '#718096', fontSize: '0.85rem' }}>○ Inactive</span>}
              </h2>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {activeRoom && (
                  <>
                    <button style={styles.mockBtn} onClick={() => handleMockEvent(activeRoom)}>Simulate AI Alert</button>
                    <button style={styles.stopBtn} onClick={stopMonitoring}>Stop Monitoring</button>
                  </>
                )}
              </div>
            </div>

            {!activeRoom ? (
              <p style={styles.empty}>No active room. Go to Assignments and click Activate or Monitor.</p>
            ) : events.length === 0 ? (
              <p style={styles.empty}>No malpractice events detected. Click "Simulate AI Alert" to generate a mock event.</p>
            ) : (
              <div style={styles.eventGrid}>
                {events.map(ev => (
                  <div key={ev._id} style={styles.eventCard}>
                    <img src={ev.image_url} alt="Evidence" style={styles.eventImg} />
                    <div style={styles.eventBody}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={styles.eventTime}>{new Date(ev.timestamp).toLocaleString()}</span>
                        {eventStatusBadge(ev.status)}
                      </div>
                      <p style={styles.bbInfo}>
                        Bounding Box — x:{ev.bounding_box?.x} y:{ev.bounding_box?.y} w:{ev.bounding_box?.width} h:{ev.bounding_box?.height}
                      </p>
                      {ev.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                          <button style={styles.dismissBtn} onClick={() => handleDismiss(ev._id)}>Dismiss</button>
                          <button style={styles.informBtn} onClick={() => handleInformAdmin(ev._id)}>Inform Admin</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map(n => (
                    <tr key={n._id} style={{ ...styles.tr, background: n.read ? '#fff' : '#fffbeb' }}>
                      <td style={styles.td}>{n.message}</td>
                      <td style={styles.td}><span style={{ ...styles.badge, background: n.type === 'alert' ? '#c0392b' : '#2b6cb0' }}>{n.type}</span></td>
                      <td style={styles.td}>{new Date(n.createdAt).toLocaleString()}</td>
                      <td style={styles.td}>
                        {!n.read && <button style={styles.linkBtn} onClick={() => markRead(n._id)}>Mark Read</button>}
                      </td>
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
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
  thead: { background: '#f7fafc' },
  th: { padding: '10px 12px', textAlign: 'left', color: '#4a5568', fontWeight: 600, borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f0f2f5' },
  td: { padding: '10px 12px', color: '#2d3748', verticalAlign: 'middle' },
  badge: { color: '#fff', borderRadius: '10px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 },
  activateBtn: { background: '#276749', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600 },
  monitorBtn: { background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.83rem' },
  mockBtn: { background: '#744210', color: '#fff', border: 'none', borderRadius: '4px', padding: '7px 14px', cursor: 'pointer', fontSize: '0.83rem' },
  stopBtn: { background: '#c0392b', color: '#fff', border: 'none', borderRadius: '4px', padding: '7px 14px', cursor: 'pointer', fontSize: '0.83rem' },
  eventGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' },
  eventCard: { border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' },
  eventImg: { width: '100%', height: '160px', objectFit: 'cover', display: 'block', background: '#e2e8f0' },
  eventBody: { padding: '0.8rem' },
  eventTime: { fontSize: '0.78rem', color: '#718096' },
  bbInfo: { fontSize: '0.75rem', color: '#a0aec0', margin: '0.4rem 0 0' },
  dismissBtn: { background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '4px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 },
  informBtn: { background: '#c0392b', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 },
  linkBtn: { background: 'none', border: 'none', color: '#2b6cb0', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: 0 },
  empty: { color: '#a0aec0', textAlign: 'center', padding: '2rem 0' },
};

export default FacultyDashboard;
