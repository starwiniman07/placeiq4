const express = require('express');
const router = express.Router();
const multer = require('multer');
const { performAnalysis, extractTextFromBuffer } = require('../controllers/resume.controller');
const { protect } = require('../middleware/auth.middleware');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/extract-text', protect, upload.single('resume'), extractTextFromBuffer);
router.post('/analyze', protect, performAnalysis);

module.exports = router;
