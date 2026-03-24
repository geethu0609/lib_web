import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import api from '../api/axios';

const Layout = ({ children, tab, setTab, title }) => {
  const [unread, setUnread] = useState(0);
  const markingRef = useRef(false);

  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnread(data.count);
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnread();
    const id = setInterval(fetchUnread, 15000);
    return () => clearInterval(id);
  }, [fetchUnread]);

  // Called when notifications panel is opened (bell click or tab switch)
  const markAllRead = useCallback(async () => {
    if (markingRef.current || unread === 0) return;
    markingRef.current = true;
    try {
      await api.put('/notifications/mark-all-read');
      setUnread(0);
    } catch {}
    finally { markingRef.current = false; }
  }, [unread]);

  // Reset badge whenever notifications tab becomes active
  useEffect(() => {
    if (tab === 'notifications') markAllRead();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen" style={{ background: '#f0f4f8' }}>
      <Sidebar tab={tab} setTab={setTab} unread={unread} />
      <div className="flex flex-col flex-1" style={{ marginLeft: '232px' }}>
        <Navbar title={title} onNotifOpen={markAllRead} unread={unread} />
        <motion.main
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="flex-1 p-8"
        >
          <div className="max-w-screen-xl mx-auto">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;
