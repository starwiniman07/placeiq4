const express = require('express');
const router = express.Router();
const { getHRQuestions, evaluateHRAnswer } = require('../controllers/hr.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/questions', protect, getHRQuestions);
router.post('/evaluate', protect, evaluateHRAnswer);

module.exports = router;
