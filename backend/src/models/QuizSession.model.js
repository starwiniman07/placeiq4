const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    isMockTest: { type: Boolean, default: false },
    companyPattern: { type: String }, // e.g., 'TCS'
    questionsAttempted: [{
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        selectedOptionIndex: { type: Number },
        isCorrect: { type: Boolean },
        timeTakenSeconds: { type: Number }
    }],
    totalQuestions: { type: Number, required: true },
    score: { type: Number, required: true },
    timeTakenTotalSeconds: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now }
});

const QuizSession = mongoose.model('QuizSession', quizSessionSchema);
module.exports = QuizSession;
