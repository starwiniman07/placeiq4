const mongoose = require('mongoose');

const hrQuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    category: { type: String, default: 'General' }, // 'Behavioral', 'Situational', etc.
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    tips: { type: String }, // Optional AI-generated tip
    createdAt: { type: Date, default: Date.now }
});

const HRQuestion = mongoose.model('HRQuestion', hrQuestionSchema);
module.exports = HRQuestion;
