const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const { createChannel, addRooms, getChannels, getMalpracticeReports, getFacultyUsers, acknowledgeEvent } = require('../controllers/adminController');

router.use(auth, requireRole('admin'));
router.post('/channels', createChannel);
router.post('/channels/:id/rooms', addRooms);
router.get('/channels', getChannels);
router.get('/malpractice', getMalpracticeReports);
router.get('/faculty-users', getFacultyUsers);
router.post('/events/:id/acknowledge', acknowledgeEvent);

module.exports = router;
