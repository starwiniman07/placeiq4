/**
 * Static Roadmap Data (Instant Generation)
 * Provides pre-built roadmaps for common roles to avoid AI rate limits.
 */

export const STATIC_ROADMAPS: Record<string, any> = {
  "SDE": {
    readinessLevel: "Beginner",
    fitPercentage: 70,
    honestyNote: "Solid foundation in logic, but needs more focus on System Design and advanced Algorithms.",
    topJobRoles: [
      { role: "Software Development Engineer", fitPercent: 85, reason: "Strong logic skills", avgSalary: "₹12-18 LPA" },
      { role: "Backend Developer", fitPercent: 75, reason: "Good understanding of databases", avgSalary: "₹8-12 LPA" }
    ],
    skillGaps: [
      { skill: "System Design", priority: "High", currentLevel: "Beginner", targetLevel: "Intermediate", resource: "Grokking System Design", estimatedDays: 14 },
      { skill: "Data Structures", priority: "Medium", currentLevel: "Intermediate", targetLevel: "Advanced", resource: "LeetCode Study Plan", estimatedDays: 20 }
    ],
    weekThemes: [
      { week: 1, theme: "Language Proficiency & Basics", goal: "Master core syntax and elementary DSA", xpReward: 200 },
      { week: 2, theme: "Advanced Data Structures", goal: "Implement Trees, Graphs, and Heaps", xpReward: 300 },
      { week: 3, theme: "System Design & Databases", goal: "Learn Scalability and SQL optimization", xpReward: 400 },
      { week: 4, theme: "Project & Interview Prep", goal: "Build a portfolio project and mock interviews", xpReward: 500 }
    ],
    roadmap: Array.from({ length: 30 }).map((_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: ${i < 7 ? 'Basics' : i < 14 ? 'Advanced DSA' : i < 21 ? 'Backend' : 'Mock Prep'}`,
      theme: "Development",
      tasks: [`Study Topic ${i + 1}`, `Solve 2 Problems`, `Review Theory`],
      estimatedHours: 4,
      milestone: (i + 1) % 7 === 0,
      milestoneTitle: (i + 1) % 7 === 0 ? `Week ${Math.ceil((i + 1) / 7)} Mastery` : ""
    }))
  },
  "FRONTEND": {
    readinessLevel: "Intermediate",
    fitPercentage: 80,
    honestyNote: "Excellent styling skills. Need to focus on state management and performance.",
    topJobRoles: [
      { role: "Frontend Engineer", fitPercent: 90, reason: "React proficiency", avgSalary: "₹10-15 LPA" }
    ],
    skillGaps: [
      { skill: "React Performance", priority: "High", currentLevel: "Intermediate", targetLevel: "Expert", resource: "Kent C. Dodds Blog", estimatedDays: 10 }
    ],
    weekThemes: [
      { week: 1, theme: "Modern JavaScript", goal: "Master ES6+ and Asynchronous JS", xpReward: 200 },
      { week: 2, theme: "React Patterns", goal: "Hooks, HOCs, and Custom Hooks", xpReward: 300 },
      { week: 3, theme: "State Management", goal: "Redux Toolkit and Context API", xpReward: 400 },
      { week: 4, theme: "Performance & Deployment", goal: "Optimization and CI/CD", xpReward: 500 }
    ],
    roadmap: Array.from({ length: 30 }).map((_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: Frontend Journey`,
      theme: "Frontend",
      tasks: [`Task ${i + 1}.1`, `Task ${i + 1}.2`],
      estimatedHours: 3,
      milestone: (i + 1) % 7 === 0,
      milestoneTitle: ""
    }))
  }
};
