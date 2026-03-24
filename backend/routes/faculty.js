const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const { getFacultyChannels, activateRoom, getRoomEvents, dismissEvent, informAdmin } = require('../controllers/facultyController');

router.use(auth, requireRole('faculty'));
router.get('/channels', getFacultyChannels);
router.post('/rooms/:id/activate', activateRoom);
router.get('/rooms/:id/events', getRoomEvents);
router.post('/events/:id/dismiss', dismissEvent);
router.post('/events/:id/inform', informAdmin);

module.exports = router;
