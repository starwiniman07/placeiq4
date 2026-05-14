const express = require('express');
const router = express.Router();
const { saveInterviewSession, getUserSessions } = require('../controllers/interview.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/session', protect, saveInterviewSession);
router.get('/sessions', protect, getUserSessions);

module.exports = router;
