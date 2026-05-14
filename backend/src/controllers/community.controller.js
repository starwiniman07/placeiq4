const CommunityPost = require('../models/CommunityPost.model');

// @desc    Get all community posts
// @route   GET /api/community/posts
// @access  Private
const getPosts = async (req, res) => {
    try {
        const posts = await CommunityPost.find().populate('user', 'name').sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new community post
// @route   POST /api/community/post
// @access  Private
const createPost = async (req, res) => {
    try {
        const { title, content, type, tags, attachments } = req.body;
        const post = await CommunityPost.create({
            user: req.user._id,
            title,
            content,
            type,
            tags,
            attachments
        });
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getPosts, createPost };
