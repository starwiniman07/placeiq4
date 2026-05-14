const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User.model');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// Mock storage for analysis results if we don't want to save to DB yet
// In real app, we'd add fields to User or a Resume model

const performAnalysis = async (req, res) => {
    try {
        const { targetRole, resumeText } = req.body;
        
        if (!resumeText) {
            return res.status(400).json({ message: 'No resume text provided' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = `
        Analyze the following resume for the target role: ${targetRole}.
        
        Resume Content:
        ${resumeText}
        
        Return a JSON response with:
        - score: 0-100 (ATS compatibility score)
        - atsCompatibility: "Brief summary of how well it matches ATS standards"
        - keywordOptimization: "Feedback on keywords"
        - skillGaps: ["Skill 1", "Skill 2"]
        - recommendations: ["Actionable tip 1", "Actionable tip 2"]
        
        Return ONLY raw JSON.
        `;

        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        let cleanedText = responseText.replace(/```json|```/g, "").trim();
        const analysis = JSON.parse(cleanedText);

        res.json(analysis);
    } catch (error) {
        console.error("Resume Analysis Error:", error);
        res.status(500).json({ message: 'Analysis failed', error: error.message });
    }
};

const extractTextFromBuffer = async (req, res) => {
    // This would be called from an upload route
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        
        const data = await pdf(req.file.buffer);
        res.json({ text: data.text });
    } catch (error) {
        res.status(500).json({ message: "PDF parsing failed", error: error.message });
    }
};

module.exports = { performAnalysis, extractTextFromBuffer };
