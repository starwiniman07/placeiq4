const Question = require('../models/Question.model');
const QuizSession = require('../models/QuizSession.model');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// @desc    Get questions for a specific topic
// @route   GET /api/aptitude/questions?topic=Quantitative&limit=10
// @access  Private
const getQuestions = async (req, res) => {
    try {
        const { topic, limit = 10 } = req.query;
        let query = { subject: 'Aptitude' };
        
        if (topic) {
            // Map common URL params to DB topics if necessary, or just capitalize
            const formattedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
            query.topic = formattedTopic;
        }

        const questions = await Question.aggregate([
            { $match: query },
            { $sample: { size: parseInt(limit) } }
        ]);

        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Submit an answer and get AI explanation
// @route   POST /api/aptitude/evaluate
// @access  Private
const evaluateAnswer = async (req, res) => {
    try {
        const { questionId, selectedOptionIndex, timeTakenSeconds } = req.body;
        
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const selectedAnswer = question.options[selectedOptionIndex];
        const isCorrect = question.correctAnswer === selectedAnswer;
        
        // Generate AI explanation using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
        You are a tutor for aptitude exams. 
        Question: ${question.questionText}
        Options: ${question.options.join(", ")}
        Correct Answer: ${question.correctAnswer}
        Candidate selected: ${selectedAnswer}
        
        Provide a step-by-step clear explanation for the answer. 
        Also, give a quick tip for solving such problems faster.
        Keep it concise and friendly. Use markdown.
        `;

        const result = await model.generateContent(prompt);
        const explanation = await result.response.text();

        res.json({
            isCorrect,
            correctAnswer: question.correctAnswer,
            explanation,
            averageTimeSeconds: 60, // Default or store in model
            timeDifference: timeTakenSeconds - 60
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Save completed quiz session
// @route   POST /api/aptitude/session
// @access  Private
const saveQuizSession = async (req, res) => {
    try {
        const session = await QuizSession.create({
            user: req.user._id,
            ...req.body
        });
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get leaderboard data
// @route   GET /api/aptitude/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await QuizSession.aggregate([
            {
                $group: {
                    _id: "$user",
                    highestScore: { $max: "$score" },
                    totalTimeTaken: { $min: "$timeTakenTotalSeconds" }
                }
            },
            { $sort: { highestScore: -1, totalTimeTaken: 1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            { $unwind: "$userInfo" },
            {
                $project: {
                    name: "$userInfo.name",
                    college: "$userInfo.college",
                    highestScore: 1,
                    totalTimeTaken: 1
                }
            }
        ]);
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getQuestions, evaluateAnswer, saveQuizSession, getLeaderboard };
