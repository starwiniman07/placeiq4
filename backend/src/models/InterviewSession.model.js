const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    interviewType: { type: String, required: true }, // 'HR Round', 'Technical Round', etc.
    targetRole: { type: String },
    transcript: [{
        role: { type: String, enum: ['interviewer', 'student'] },
        text: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    scorecard: {
        metrics: {
            confidence: Number,
            fluency: Number,
            communication: Number,
            technicalAccuracy: Number,
            relevance: Number,
            overallScore: Number
        },
        strengths: [String],
        improvements: [String],
        overallFeedback: String
    },
    durationSeconds: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
module.exports = InterviewSession;
