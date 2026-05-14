const express = require('express');
const router = express.Router();
const { createRoadmap, getRoadmaps, updateTopic } = require('../controllers/roadmap.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/generate', protect, createRoadmap);
router.get('/', protect, getRoadmaps);
router.patch('/:id/topic', protect, updateTopic);

module.exports = router;
