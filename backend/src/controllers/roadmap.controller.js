const Roadmap = require('../models/Roadmap.model');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

const createRoadmap = async (req, res) => {
    try {
        const { currentSkills, targetRole } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = `
        You are a career counselor. A student wants to become: ${targetRole}. 
        Their current skills are: ${currentSkills}. 
        Generate a detailed week-by-week roadmap for 8 weeks. 
        Return JSON with: { weeks: [ { week: 1, title: 'string', tasks: ['task1','task2','task3'], resources: ['resource1','resource2'], milestone: 'string' } ] }
        Return ONLY raw JSON.
        `;

        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        let cleanedText = responseText.replace(/```json|```/g, "").trim();
        const aiResponse = JSON.parse(cleanedText);

        const roadmap = await Roadmap.create({
            user: req.user._id,
            targetRole,
            currentSkills,
            weeks: aiResponse.weeks
        });
        
        res.status(201).json(roadmap);
    } catch (error) {
        console.error("Roadmap error:", error);
        res.status(500).json({ message: 'Roadmap generation failed', error: error.message });
    }
};

const getRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(roadmaps);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateTopic = async (req, res) => {
    try {
        const { weekIndex, isCompleted } = req.body;
        const roadmap = await Roadmap.findById(req.params.id);
        
        if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
        
        roadmap.weeks[weekIndex].isCompleted = isCompleted;
        
        // Recalculate progress
        const completedWeeks = roadmap.weeks.filter(w => w.isCompleted).length;
        roadmap.totalProgress = Math.round((completedWeeks / roadmap.weeks.length) * 100);
        
        await roadmap.save();
        res.json(roadmap);
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
};

module.exports = { createRoadmap, getRoadmaps, updateTopic };
