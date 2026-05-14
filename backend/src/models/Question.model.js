const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    subject: { type: String, required: true }, // 'Aptitude' or 'Technical'
    topic: { type: String, required: true }, // 'Quantitative', 'Logical', 'DSA', 'DBMS', etc.
    tags: [{ type: String }], // 'Time & Work', 'TCS', etc.
    createdAt: { type: Date, default: Date.now }
});

// Indices for faster querying
questionSchema.index({ subject: 1, topic: 1 });
questionSchema.index({ tags: 1 });

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
