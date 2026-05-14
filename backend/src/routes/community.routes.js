const express = require('express');
const router = express.Router();
const { getPosts, createPost } = require('../controllers/community.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/posts', protect, getPosts);
router.post('/post', protect, createPost);

module.exports = router;
