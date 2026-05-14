const mongoose = require('mongoose');

const codingChallengeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    topic: { type: String, required: true }, // 'arrays', 'trees', 'dp', etc.
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    starterCode: {
        python: { type: String },
        java: { type: String },
        cpp: { type: String },
        javascript: { type: String }
    },
    testCases: [{
        input: { type: String },
        expectedOutput: { type: String }
    }],
    companyTags: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

const CodingChallenge = mongoose.model('CodingChallenge', codingChallengeSchema);
module.exports = CodingChallenge;
