const express = require('express');
const router = express.Router();
const { getQuestions, evaluateAnswer, saveQuizSession, getLeaderboard } = require('../controllers/aptitude.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/questions', protect, getQuestions);
router.post('/evaluate', protect, evaluateAnswer);
router.post('/session', protect, saveQuizSession);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
