const HRQuestion = require('../models/HRQuestion.model');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// @desc    Get all HR questions
// @route   GET /api/hr/questions
// @access  Private
const getHRQuestions = async (req, res) => {
    try {
        let questions = await HRQuestion.find();
        
        // Mock data if empty
        if (questions.length === 0) {
            questions = [
                { _id: 'hr1', questionText: 'Tell me about yourself', category: 'General' },
                { _id: 'hr2', questionText: 'What are your strengths and weaknesses?', category: 'General' },
                { _id: 'hr3', questionText: 'Why should we hire you?', category: 'Behavioral' },
                { _id: 'hr4', questionText: 'Where do you see yourself in 5 years?', category: 'General' },
                { _id: 'hr5', questionText: 'Describe a difficult situation at work and how you handled it.', category: 'Situational' }
            ];
        }
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Evaluate HR answer using Gemini
// @route   POST /api/hr/evaluate
// @access  Private
const evaluateHRAnswer = async (req, res) => {
    try {
        const { questionText, studentAnswer } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        You are an expert HR Interviewer. 
        Evaluate the student's answer to the following HR question based on:
        1. Clarity & Structure (Is it using the STAR method if applicable?)
        2. Relevance (Does it answer the question?)
        3. Confidence (Tone/Content analysis)
        
        Question: ${questionText}
        Answer: ${studentAnswer}
        
        Provide a JSON response with:
        - scores: { clarity: 0-10, relevance: 0-10, confidence: 0-10, structure: 0-10 }
        - feedback: "Overall critique"
        - idealAnswer: "A perfectly rewritten version of their answer for comparison."
        
        Return EXCLUSIVELY raw JSON.
        `;

        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        
        let cleanedText = responseText.replace(/```json|```/g, "").trim();
        const evaluation = JSON.parse(cleanedText);

        res.json(evaluation);
    } catch (error) {
        res.status(500).json({ message: 'Evaluation failed', error: error.message });
    }
};

module.exports = { getHRQuestions, evaluateHRAnswer };
