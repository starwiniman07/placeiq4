const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    personalInfo: {
        fullName: String,
        email: String,
        phone: String,
        location: String,
        linkedin: String,
        portfolio: String
    },
    education: [{
        institution: String,
        degree: String,
        year: String,
        score: String
    }],
    experience: [{
        company: String,
        role: String,
        duration: String,
        description: String
    }],
    projects: [{
        title: String,
        description: String,
        technologies: [String],
        link: String
    }],
    skills: [String],
    summary: String,
    scorecard: {
        score: Number,
        atsCompatibility: String,
        keywordOptimization: String,
        skillGaps: [String],
        recommendations: [String]
    },
    lastAnalyzed: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
