const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

const generateExplanation = async (questionText, options, correctOptionIndex, selectedOptionIndex) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        You are an expert aptitude tutor.
        A student just answered an aptitude question.
        
        Question: ${questionText}
        Options:
        ${options.map((opt, i) => `${i}: ${opt}`).join('\n')}
        
        The correct option is: ${options[correctOptionIndex]}
        The student selected: ${selectedOptionIndex !== null ? options[selectedOptionIndex] : 'Did not answer'}
        
        Provide a concise, highly effective response formatted in markdown containing:
        1. **Explanation**: A clear, step-by-step mathematical or logical explanation.
        2. **Shortcut Method**: A quick trick or shortcut to solve this type of problem faster (if applicable).
        3. **Weak Topic Flag**: A single sentence indicating what core fundamental topic the student should review if they got this wrong.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Explanation could not be generated at this time. Please check your network or API keys.";
    }
};

const evaluateCode = async (problemDescription, submittedCode, language) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        You are an expert software engineer reviewing a student's code.
        
        Problem Description: ${problemDescription}
        Language: ${language}
        Submitted Code:
        \`\`\`${language}
        ${submittedCode}
        \`\`\`
        
        Please provide a structured code review formatted in Markdown:
        1. **Time Complexity**: Big-O notation with a brief explanation.
        2. **Space Complexity**: Big-O notation with a brief explanation.
        3. **Correctness**: Does the code solve the problem? Point out any edge case failures.
        4. **Style & Best Practices**: Suggestions for cleaner, more readable code.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Code evaluation could not be completed at this time.";
    }
};

const analyzeResume = async (resumeData) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        You are an expert ATS (Applicant Tracking System) and HR Recruiter. 
        Analyze the following resume data and provide a detailed scorecard:
        
        Resume Data: ${JSON.stringify(resumeData)}
        
        Please provide a JSON response with:
        - score: 0-100
        - atsCompatibility: "Brief analysis of formatting/structure"
        - keywordOptimization: "Analysis of industry keywords"
        - skillGaps: ["Skill 1", "Skill 2"]
        - recommendations: ["Project idea 1", "Course idea 1"]
        
        Return EXCLUSIVELY raw JSON.
        `;

        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        let cleanedText = responseText.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Resume analysis failed", error);
        return {
            score: 0,
            atsCompatibility: "Failed to analyze",
            keywordOptimization: "Failed to analyze",
            skillGaps: [],
            recommendations: []
        };
    }
};

const generateRoadmap = async (skills, role) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        You are an expert Career Counselor. Create a 4-week intensive personalized placement roadmap.
        
        Student Current Skills: ${skills.join(", ")}
        Target Role: ${role}
        
        Return a JSON response with this structure:
        {
            "weeks": [
                {
                    "weekNumber": 1,
                    "title": "Week Title",
                    "focusArea": "Primary Focus",
                    "topics": [
                        { "name": "Topic Name", "resourceLink": "suggested search query or link" }
                    ]
                }
            ]
        }
        Provide exactly 4 weeks. Return EXCLUSIVELY raw JSON.
        `;

        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        let cleanedText = responseText.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Roadmap generation failed", error);
        return { weeks: [] };
    }
};

module.exports = { generateExplanation, evaluateCode, analyzeResume, generateRoadmap };
