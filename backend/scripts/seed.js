const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const Question = require('../src/models/Question.model');
const HRQuestion = require('../src/models/HRQuestion.model');
const User = require('../src/models/User.model');
const Interviewer = require('../src/models/Interviewer.model');

const aptitudeQuestions = [
    // Add 10-15 per topic
    { questionText: "A can do a job in 10 days, B in 15 days. How long together?", options: ["5 days", "6 days", "8 days", "9 days"], correctAnswer: "6 days", explanation: "1/10 + 1/15 = 5/30 = 1/6", difficulty: "Easy", subject: "Aptitude", topic: "Quantitative", tags: ["Time & Work", "TCS"] },
    { questionText: "Profit % if CP=400, SP=500?", options: ["20%", "25%", "30%", "15%"], correctAnswer: "25%", explanation: "100/400 = 25%", difficulty: "Easy", subject: "Aptitude", topic: "Quantitative", tags: ["Profit & Loss", "Accenture"] },
    { questionText: "2, 6, 12, 20, 30, ?", options: ["36", "40", "42", "48"], correctAnswer: "42", explanation: "Diff: 4, 6, 8, 10, 12", difficulty: "Easy", subject: "Aptitude", topic: "Logical", tags: ["Series"] },
    { questionText: "Which is a synonym of 'Abundant'?", options: ["Scarcity", "Plentiful", "Rare", "Little"], correctAnswer: "Plentiful", explanation: "Abundant means plenty.", difficulty: "Easy", subject: "Aptitude", topic: "Verbal", tags: ["Synonyms"] },
    { questionText: "In a pie chart, 90 degrees represents what %?", options: ["10%", "20%", "25%", "30%"], correctAnswer: "25%", explanation: "90/360 = 1/4 = 25%", difficulty: "Medium", subject: "Aptitude", topic: "Data Interpretation", tags: ["Pie Chart"] },
    // TECHNICAL
    { questionText: "Time complexity of Binary Search?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correctAnswer: "O(log n)", explanation: "Binary search divides the search space in half each step.", difficulty: "Easy", subject: "Technical", topic: "DSA", tags: ["Searching"] },
    { questionText: "Which SQL clause is used to filter groups?", options: ["WHERE", "HAVING", "ORDER BY", "GROUP BY"], correctAnswer: "HAVING", explanation: "HAVING is used for aggregate functions.", difficulty: "Medium", subject: "Technical", topic: "DBMS", tags: ["SQL"] },
    { questionText: "What is an abstract class?", options: ["A class with no methods", "A class that cannot be instantiated", "A class with only static methods", "A private class"], correctAnswer: "A class that cannot be instantiated", explanation: "Abstract classes serve as blueprints.", difficulty: "Medium", subject: "Technical", topic: "OOP", tags: ["Abstraction"] },
    { questionText: "What is virtual memory?", options: ["Extra RAM", "A technique that allows execution of processes larger than physical memory", "A type of cache", "Flash storage"], correctAnswer: "A technique that allows execution of processes larger than physical memory", explanation: "OS uses disk space to simulate RAM.", difficulty: "Medium", subject: "Technical", topic: "OS", tags: ["Memory"] },
    { questionText: "Which layer is responsible for routing?", options: ["Data Link", "Network", "Transport", "Physical"], correctAnswer: "Network", explanation: "IP and routing happen at Layer 3.", difficulty: "Easy", subject: "Technical", topic: "Networks", tags: ["OSI Model"] }
];

const hrQuestions = [
    { questionText: "Tell me about yourself", category: "General", difficulty: "Easy", tips: "Mention project highlights." },
    { questionText: "Why should we hire you?", category: "Behavioral", difficulty: "Medium", tips: "Link your skills to company goals." },
    { questionText: "Describe a conflict you had with a teammate.", category: "Situational", difficulty: "Hard", tips: "Use STAR method." },
    { questionText: "Where do you see yourself in 5 years?", category: "General", difficulty: "Easy", tips: "Show growth mindset." }
];

const mockInterviewers = [
  { name: "Sarah Drasner", designation: "Senior Frontend Engineer", company: "Google", yearsOfExperience: 8, domains: ["Software Dev"], pricePerSession: 800, rating: 4.9, reviewCount: 120, photoUrl: "https://i.pravatar.cc/150?u=sarah" },
  { name: "Alex Xu", designation: "Systems Architect", company: "Meta", yearsOfExperience: 12, domains: ["Software Dev", "Data Analyst"], pricePerSession: 1200, rating: 4.8, reviewCount: 85, photoUrl: "https://i.pravatar.cc/150?u=alex" },
  { name: "Jessica Pointing", designation: "Quantum Researcher", company: "Microsoft", yearsOfExperience: 5, domains: ["Software Dev"], pricePerSession: 1500, rating: 5.0, reviewCount: 56, photoUrl: "https://i.pravatar.cc/150?u=jessica" },
  { name: "Prateek Shukla", designation: "SDE-2", company: "Amazon", yearsOfExperience: 4, domains: ["Software Dev"], pricePerSession: 600, rating: 4.7, reviewCount: 92, photoUrl: "https://i.pravatar.cc/150?u=prateek" },
  { name: "Anjali Gupta", designation: "HR Manager", company: "TCS", yearsOfExperience: 10, domains: ["HR"], pricePerSession: 400, rating: 4.6, reviewCount: 210, photoUrl: "https://i.pravatar.cc/150?u=anjali" }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB for seeding...");

        await Question.deleteMany({});
        await HRQuestion.deleteMany({});
        await Interviewer.deleteMany({});
        await User.deleteMany({ role: 'interviewer' });

        await Question.insertMany(aptitudeQuestions);
        await HRQuestion.insertMany(hrQuestions);

        for (const i of mockInterviewers) {
            const user = await User.create({
                name: i.name,
                email: `${i.name.toLowerCase().replace(' ', '.')}@example.com`,
                password: 'password123',
                role: 'interviewer'
            });

            await Interviewer.create({
                user: user._id,
                ...i,
                availableTimeSlots: [
                    { date: new Date(), slots: ['10:00 AM', '11:00 AM', '04:00 PM'] },
                    { date: new Date(Date.now() + 86400000), slots: ['09:00 AM', '02:00 PM'] }
                ]
            });
        }

        console.log("Seeding complete with correct model mapping!");
        process.exit();
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedDB();
