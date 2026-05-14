const mongoose = require('mongoose');

const technicalQuestionSchema = new mongoose.Schema({
    subject: { type: String, required: true }, // 'DBMS', 'OOPs', 'OS', etc.
    type: { type: String, enum: ['MCQ', 'Interview'], required: true },
    questionText: { type: String, required: true },
    options: [{ type: String }], // only for MCQ
    correctOptionIndex: { type: Number }, // only for MCQ
    idealAnswer: { type: String }, // for interview questions
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    companyTags: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

const TechnicalQuestion = mongoose.model('TechnicalQuestion', technicalQuestionSchema);
module.exports = TechnicalQuestion;
