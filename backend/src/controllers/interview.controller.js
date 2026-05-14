const InterviewSession = require('../models/InterviewSession.model');

// @desc    Save completed AI interview session
// @route   POST /api/interview/session
// @access  Private
const saveInterviewSession = async (req, res) => {
    try {
        const { interviewType, targetRole, transcript, scorecard, durationSeconds } = req.body;

        const session = await InterviewSession.create({
            user: req.user._id,
            interviewType,
            targetRole,
            transcript,
            scorecard,
            durationSeconds
        });

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get past interview sessions for user
// @route   GET /api/interview/sessions
// @access  Private
const getUserSessions = async (req, res) => {
    try {
        const sessions = await InterviewSession.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { saveInterviewSession, getUserSessions };
