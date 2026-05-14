const express = require('express');
const router = express.Router();
const { getTechnicalQuestions, getChallenge, submitCode } = require('../controllers/technical.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/questions', protect, getTechnicalQuestions);
router.get('/challenge/:id', protect, getChallenge);
router.post('/challenge/:id/evaluate', protect, submitCode);

module.exports = router;
