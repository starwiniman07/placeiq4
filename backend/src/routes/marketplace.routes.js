const express = require('express');
const router = express.Router();
const { getInterviewers, getInterviewerById, confirmPayment } = require('../controllers/marketplace.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/interviewers', getInterviewers);
router.get('/interviewer/:id', getInterviewerById);
router.post('/confirm-payment', protect, confirmPayment);

module.exports = router;
