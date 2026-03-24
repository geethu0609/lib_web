const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { getNotifications, markRead, getUnreadCount, markAllRead } = require('../controllers/notificationController');

router.use(auth);
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/mark-all-read', markAllRead);
router.patch('/:id/read', markRead);

module.exports = router;
