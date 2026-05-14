const express = require('express');
const router = express.Router();
const { mockInitiate, mockConfirm } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/mock-initiate', protect, mockInitiate);
router.post('/mock-confirm', protect, mockConfirm);

module.exports = router;
