const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { getNotifications, markRead } = require('../controllers/notificationController');

router.use(auth);
router.get('/', getNotifications);
router.patch('/:id/read', markRead);

module.exports = router;
