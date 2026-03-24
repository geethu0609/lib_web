const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { generateMockEvent } = require('../controllers/mockAiController');

router.post('/mock-event/:roomId', auth, generateMockEvent);

module.exports = router;
