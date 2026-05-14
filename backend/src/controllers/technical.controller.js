const Question = require('../models/Question.model');
const CodingChallenge = require('../models/CodingChallenge.model');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// @desc    Get technical questions for a subject (DSA, DBMS, etc)
// @route   GET /api/technical/questions?topic=DSA&limit=10
// @access  Private
const getTechnicalQuestions = async (req, res) => {
    try {
        const { topic, limit = 10 } = req.query;
        let query = { subject: 'Technical' };
        
        if (topic) {
            query.topic = topic.toUpperCase();
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

// @desc    Get coding challenge details
// @route   GET /api/technical/challenge/:id
const getChallenge = async (req, res) => {
    try {
        const challenge = await CodingChallenge.findById(req.params.id);
        if (!challenge) {
            // Default challenge if none exists
            return res.json({
                _id: "default_id",
                title: "Two Sum",
                description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                difficulty: "Easy",
                starterCode: {
                    javascript: "function twoSum(nums, target) {\n    // Write your code here\n}",
                    python: "def two_sum(nums, target):\n    pass"
                }
            });
        }
        res.json(challenge);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Evaluate student code submission
// @route   POST /api/technical/challenge/:id/evaluate
const submitCode = async (req, res) => {
    try {
        const { code, language, description } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
        You are a Technical Interviewer. Analyze the following code submission.
        
        Problem: ${description}
        Language: ${language}
        Code:
        ${code}
        
        Provide a JSON response with:
        - score: 0-100
        - complexity: { time: "O(?)", space: "O(?)" }
        - feedback: "Code quality and style feedback"
        - improvements: ["Point 1", "Point 2"]
        
        Return EXCLUSIVELY raw JSON.
        `;

        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        let cleanedText = responseText.replace(/```json|```/g, "").trim();
        const evaluation = JSON.parse(cleanedText);

        res.json(evaluation);
    } catch (error) {
        res.status(500).json({ message: 'AI Evaluation failed', error: error.message });
    }
};

module.exports = { getTechnicalQuestions, getChallenge, submitCode };
