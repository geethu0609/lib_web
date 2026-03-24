const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const { createChannel, addRooms, getChannels, getMalpracticeReports, getFacultyUsers } = require('../controllers/adminController');

router.use(auth, requireRole('admin'));
router.post('/channels', createChannel);
router.post('/channels/:id/rooms', addRooms);
router.get('/channels', getChannels);
router.get('/malpractice', getMalpracticeReports);
router.get('/faculty-users', getFacultyUsers);

module.exports = router;
