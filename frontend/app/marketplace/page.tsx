"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Star, 
  Briefcase, 
  IndianRupee, 
  Clock, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  Calendar, 
  Languages, 
  Award, 
  ArrowRight,
  TrendingUp,
  Users,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Info,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// --- Constants ---
const INTERVIEWERS = [
  {
    id: "int_001",
    name: "Arjun Mehta",
    avatar: "AM",
    avatarColor: "bg-blue-600",
    designation: "Senior ML Engineer",
    company: "Google",
    companyLogo: "🔵",
    yearsExperience: 6,
    domains: ["Machine Learning", "Data Science", "Python", "Deep Learning"],
    interviewTypes: ["Technical Round", "ML System Design", "Coding Round"],
    languages: ["English", "Hindi"],
    rating: 4.9,
    reviewCount: 127,
    pricePerSession: 799,
    sessionDuration: 60,
    totalSessions: 340,
    bio: "Ex-Flipkart ML engineer, now at Google Brain. I've been on both sides of 500+ interviews. Specialize in ML system design, ML coding rounds, and cracking FAANG ML roles.",
    specialties: ["LeetCode ML problems", "ML System Design", "Research paper discussion", "Kaggle competition strategy"],
    availability: ["Mon 6-9 PM", "Wed 7-10 PM", "Sat 10 AM-2 PM", "Sun 2-6 PM"],
    slots: [
      { date: "2026-05-05", time: "6:00 PM", available: true },
      { date: "2026-05-05", time: "7:00 PM", available: true },
      { date: "2026-05-07", time: "7:00 PM", available: false },
      { date: "2026-05-10", time: "10:00 AM", available: true },
      { date: "2026-05-10", time: "11:00 AM", available: true },
      { date: "2026-05-12", time: "6:00 PM", available: true }
    ],
    reviews: [
      { name: "Priya S.", rating: 5, text: "Arjun helped me crack my Google ML interview. His mock sessions were tougher than the actual interview!", date: "2 weeks ago" },
      { name: "Rahul K.", rating: 5, text: "Best ₹799 I've ever spent. Got the offer from Amazon.", date: "1 month ago" }
    ],
    badge: "Top Rated",
    badgeColor: "bg-amber-500"
  },
  {
    id: "int_002",
    name: "Sneha Krishnan",
    avatar: "SK",
    avatarColor: "bg-purple-600",
    designation: "HR Manager & TA Lead",
    company: "Infosys",
    companyLogo: "🟦",
    yearsExperience: 8,
    domains: ["HR Round", "Behavioral Interview", "Salary Negotiation", "Culture Fit"],
    interviewTypes: ["HR Round", "Behavioral Round", "Offer Negotiation"],
    languages: ["English", "Tamil", "Hindi"],
    rating: 4.8,
    reviewCount: 203,
    pricePerSession: 499,
    sessionDuration: 45,
    totalSessions: 520,
    bio: "I've interviewed 2000+ candidates at Infosys and TCS. I know exactly what HR managers look for and the mistakes that instantly disqualify candidates. Let me coach you.",
    specialties: ["Tell me about yourself", "STAR method coaching", "Salary negotiation", "Body language tips", "Offer comparison advice"],
    availability: ["Tue 5-8 PM", "Thu 5-8 PM", "Sat-Sun flexible"],
    slots: [
      { date: "2026-05-06", time: "5:00 PM", available: true },
      { date: "2026-05-06", time: "6:00 PM", available: true },
      { date: "2026-05-08", time: "5:30 PM", available: true },
      { date: "2026-05-11", time: "10:00 AM", available: true }
    ],
    reviews: [
      { name: "Ananya R.", rating: 5, text: "Sneha told me exactly what I was doing wrong in HR rounds. Got placed at TCS Digital in my next attempt.", date: "3 weeks ago" },
      { name: "Vikram T.", rating: 4, text: "Very detailed feedback. Helped a lot with salary discussion.", date: "1 month ago" }
    ],
    badge: "Most Booked",
    badgeColor: "bg-emerald-500"
  },
  {
    id: "int_003",
    name: "Rohan Joshi",
    avatar: "RJ",
    avatarColor: "bg-red-600",
    designation: "SDE-II",
    company: "Amazon",
    companyLogo: "🟠",
    yearsExperience: 4,
    domains: ["Data Structures", "Algorithms", "System Design", "Java", "Python"],
    interviewTypes: ["Technical Round", "Coding Round", "System Design", "Leadership Principles"],
    languages: ["English", "Hindi", "Marathi"],
    rating: 4.7,
    reviewCount: 89,
    pricePerSession: 699,
    sessionDuration: 60,
    totalSessions: 180,
    bio: "SDE-2 at Amazon with experience in Amazon's Leadership Principles interviews. Cracked Amazon, Microsoft, and Flipkart. Specialize in DSA and Amazon's unique interview style.",
    specialties: ["Amazon LP questions", "DSA problem solving live", "System design for e-commerce", "Java coding"],
    availability: ["Mon-Fri 8-10 PM", "Weekends flexible"],
    slots: [
      { date: "2026-05-05", time: "8:00 PM", available: true },
      { date: "2026-05-06", time: "8:30 PM", available: true },
      { date: "2026-05-07", time: "9:00 PM", available: true },
      { date: "2026-05-09", time: "8:00 PM", available: false },
      { date: "2026-05-10", time: "2:00 PM", available: true }
    ],
    reviews: [
      { name: "Karan M.", rating: 5, text: "Rohan's mock session was exactly like the real Amazon interview. Highly recommended!", date: "1 week ago" }
    ],
    badge: "Amazon Expert",
    badgeColor: "bg-orange-600"
  },
  {
    id: "int_004",
    name: "Divya Nair",
    avatar: "DN",
    avatarColor: "bg-cyan-600",
    designation: "Senior Data Analyst",
    company: "Microsoft",
    companyLogo: "🟩",
    yearsExperience: 5,
    domains: ["Data Analytics", "SQL", "Power BI", "Excel", "Python for Data", "Statistics"],
    interviewTypes: ["Analyst Round", "Case Study Round", "SQL Test", "Business Problem Solving"],
    languages: ["English", "Malayalam", "Hindi"],
    rating: 4.9,
    reviewCount: 156,
    pricePerSession: 599,
    sessionDuration: 60,
    totalSessions: 290,
    bio: "Transitioned from fresher to Senior DA at Microsoft in 3 years. I specialize in data analyst interview prep including case studies, SQL puzzles, and stakeholder communication rounds.",
    specialties: ["SQL case interviews", "Excel modeling", "Analytical thinking questions", "Data storytelling"],
    availability: ["Wed-Fri 6-9 PM", "Sat-Sun 11 AM-5 PM"],
    slots: [
      { date: "2026-05-07", time: "6:00 PM", available: true },
      { date: "2026-05-08", time: "7:00 PM", available: true },
      { date: "2026-05-09", time: "6:30 PM", available: true },
      { date: "2026-05-11", time: "11:00 AM", available: true }
    ],
    reviews: [
      { name: "Suhana P.", rating: 5, text: "Got placed as Data Analyst at a top MNC after 2 sessions with Divya. She knows exactly what they ask.", date: "5 days ago" }
    ],
    badge: "Rising Star",
    badgeColor: "bg-purple-600"
  },
  {
    id: "int_005",
    name: "Aditya Sharma",
    avatar: "AS",
    avatarColor: "bg-emerald-600",
    designation: "Full Stack Engineer",
    company: "Razorpay",
    companyLogo: "💳",
    yearsExperience: 3,
    domains: ["React", "Node.js", "System Design", "JavaScript", "Web Development"],
    interviewTypes: ["Frontend Round", "Backend Round", "Full Stack Technical", "Take-home Assignment Review"],
    languages: ["English", "Hindi", "Gujarati"],
    rating: 4.6,
    reviewCount: 67,
    pricePerSession: 549,
    sessionDuration: 60,
    totalSessions: 120,
    bio: "Full stack engineer at Razorpay. Cracked interviews at Razorpay, CRED, and Swiggy. Specialize in web dev interviews including take-home project reviews and live coding.",
    specialties: ["React optimization questions", "Node.js architecture", "JavaScript quirks", "Take-home project feedback"],
    availability: ["Mon-Wed 7-10 PM", "Sat 11 AM-2 PM"],
    slots: [
      { date: "2026-05-05", time: "7:00 PM", available: true },
      { date: "2026-05-06", time: "8:00 PM", available: true },
      { date: "2026-05-10", time: "11:00 AM", available: true }
    ],
    reviews: [
      { name: "Meera L.", rating: 5, text: "Aditya reviewed my take-home project and pointed out issues I never would have noticed.", date: "2 weeks ago" }
    ],
    badge: "Startup Expert",
    badgeColor: "bg-indigo-600"
  },
  {
    id: "int_006",
    name: "Priya Venkatesh",
    avatar: "PV",
    avatarColor: "bg-amber-600",
    designation: "Product Manager",
    company: "Flipkart",
    companyLogo: "🛒",
    yearsExperience: 7,
    domains: ["Product Management", "MBA Interviews", "Case Studies", "Product Sense", "Strategy"],
    interviewTypes: ["PM Interview", "Case Study Round", "Product Design", "Guesstimates"],
    languages: ["English", "Tamil", "Telugu"],
    rating: 4.8,
    reviewCount: 112,
    pricePerSession: 899,
    sessionDuration: 75,
    totalSessions: 200,
    bio: "PM at Flipkart with IIM background. Help students crack PM interviews, MBA interviews, and consulting case rounds. Have mentored 50+ students into top PM roles.",
    specialties: ["Product sense questions", "Guesstimates", "Root cause analysis", "MBA GD-PI prep"],
    availability: ["Tue-Thu 7-10 PM", "Weekend mornings"],
    slots: [
      { date: "2026-05-06", time: "7:00 PM", available: true },
      { date: "2026-05-08", time: "8:00 PM", available: true },
      { date: "2026-05-11", time: "9:00 AM", available: true }
    ],
    reviews: [
      { name: "Nikhil B.", rating: 5, text: "Priya's case study coaching is exceptional. Got into a top-3 consulting firm.", date: "3 weeks ago" }
    ],
    badge: "PM Specialist",
    badgeColor: "bg-amber-500"
  },
  {
    id: "int_007",
    name: "Rahul Gupta",
    avatar: "RG",
    avatarColor: "bg-pink-600",
    designation: "Cybersecurity Engineer",
    company: "Deloitte",
    companyLogo: "🔒",
    yearsExperience: 5,
    domains: ["Cybersecurity", "Networking", "Linux", "Ethical Hacking", "Cloud Security"],
    interviewTypes: ["Technical Round", "Security Concepts", "Scenario-based Questions"],
    languages: ["English", "Hindi"],
    rating: 4.7,
    reviewCount: 44,
    pricePerSession: 649,
    sessionDuration: 60,
    totalSessions: 90,
    bio: "Security engineer at Deloitte, CEH certified. Help students crack cybersecurity, networking, and cloud security interview rounds.",
    specialties: ["Network security concepts", "CEH prep", "Cloud security AWS/Azure", "Linux administration"],
    availability: ["Mon-Fri 9-11 PM", "Sat afternoon"],
    slots: [
      { date: "2026-05-05", time: "9:00 PM", available: true },
      { date: "2026-05-07", time: "9:30 PM", available: true },
      { date: "2026-05-10", time: "3:00 PM", available: true }
    ],
    reviews: [
      { name: "Suresh A.", rating: 5, text: "Very knowledgeable. Covered topics I had never even thought about.", date: "1 month ago" }
    ],
    badge: "Niche Expert",
    badgeColor: "bg-pink-500"
  },
  {
    id: "int_008",
    name: "Kavitha Reddy",
    avatar: "KR",
    avatarColor: "bg-teal-600",
    designation: "Finance Associate",
    company: "JP Morgan",
    companyLogo: "🏦",
    yearsExperience: 4,
    domains: ["Finance", "Investment Banking", "Financial Modeling", "Equity Research", "MBA Finance"],
    interviewTypes: ["Finance Technical Round", "Case Study", "Guesstimates", "Behavioral Finance"],
    languages: ["English", "Telugu", "Hindi"],
    rating: 4.9,
    reviewCount: 78,
    pricePerSession: 749,
    sessionDuration: 60,
    totalSessions: 140,
    bio: "Finance associate at JP Morgan. Help students crack finance interviews for IB, equity research, and corporate finance roles. CFA Level 2 cleared.",
    specialties: ["DCF modeling", "M&A concepts", "Finance case studies", "Walk me through a DCF"],
    availability: ["Sat-Sun 10 AM-6 PM", "Weekday evenings"],
    slots: [
      { date: "2026-05-10", time: "10:00 AM", available: true },
      { date: "2026-05-10", time: "11:00 AM", available: true },
      { date: "2026-05-11", time: "2:00 PM", available: true }
    ],
    reviews: [
      { name: "Aryan S.", rating: 5, text: "Kavitha's finance mock interview was incredibly detailed. Cracked JP Morgan intern role!", date: "2 weeks ago" }
    ],
    badge: "Finance Expert",
    badgeColor: "bg-teal-500"
  },
  {
    id: "int_009",
    name: "Siddharth Patel",
    avatar: "SP",
    avatarColor: "bg-indigo-600",
    designation: "DevOps Lead",
    company: "Atlassian",
    companyLogo: "🔧",
    yearsExperience: 6,
    domains: ["DevOps", "Cloud AWS", "Kubernetes", "CI/CD", "Linux", "Docker"],
    interviewTypes: ["DevOps Technical", "Cloud Architecture", "Infrastructure Design"],
    languages: ["English", "Hindi", "Gujarati"],
    rating: 4.6,
    reviewCount: 52,
    pricePerSession: 699,
    sessionDuration: 60,
    totalSessions: 110,
    bio: "DevOps lead at Atlassian. AWS certified architect. Help students break into DevOps and cloud roles which are highly in-demand but poorly covered in placements.",
    specialties: ["AWS architecture", "Kubernetes deep dive", "CI/CD pipeline design", "Infrastructure as code"],
    availability: ["Mon-Wed 7-10 PM", "Sat all day"],
    slots: [
      { date: "2026-05-05", time: "7:30 PM", available: true },
      { date: "2026-05-06", time: "8:00 PM", available: true },
      { date: "2026-05-10", time: "10:00 AM", available: true }
    ],
    reviews: [
      { name: "Deepak V.", rating: 5, text: "Best DevOps interview prep I found anywhere. Period.", date: "1 week ago" }
    ],
    badge: "DevOps Expert",
    badgeColor: "bg-indigo-500"
  },
  {
    id: "int_010",
    name: "Meena Subramanian",
    avatar: "MS",
    avatarColor: "bg-orange-600",
    designation: "Talent Partner",
    company: "Wipro",
    companyLogo: "🟣",
    yearsExperience: 9,
    domains: ["Campus Placement", "Mass Hiring", "Group Discussion", "Communication Skills", "Resume Review"],
    interviewTypes: ["Group Discussion", "HR Round", "Communication Assessment", "Resume Review Session"],
    languages: ["English", "Tamil", "Telugu", "Kannada"],
    rating: 4.8,
    reviewCount: 284,
    pricePerSession: 399,
    sessionDuration: 45,
    totalSessions: 650,
    bio: "Campus recruiter who has selected 1000+ students from engineering colleges. I know exactly what gets students rejected in mass hiring and how to stand out.",
    specialties: ["GD topic practice", "Mass hiring survival", "Resume shortlisting secrets", "First impression coaching"],
    availability: ["Daily 6-9 PM", "Weekend mornings"],
    slots: [
      { date: "2026-05-05", time: "6:00 PM", available: true },
      { date: "2026-05-05", time: "7:00 PM", available: true },
      { date: "2026-05-06", time: "6:00 PM", available: true },
      { date: "2026-05-07", time: "6:30 PM", available: true }
    ],
    reviews: [
      { name: "Riya M.", rating: 5, text: "Meena told me secrets about how HR actually shortlists resumes. Game changing!", date: "4 days ago" }
    ],
    badge: "Campus Expert",
    badgeColor: "bg-orange-500"
  },
  {
    id: "int_011",
    name: "Karthik Sundaram",
    avatar: "KS",
    avatarColor: "bg-lime-600",
    designation: "Tech Lead",
    company: "PhonePe",
    companyLogo: "📱",
    yearsExperience: 7,
    domains: ["iOS Development", "Swift", "Mobile Architecture", "App Performance", "React Native"],
    interviewTypes: ["Mobile Technical Round", "iOS Coding", "Architecture Design", "App Review"],
    languages: ["English", "Tamil", "Hindi"],
    rating: 4.7,
    reviewCount: 38,
    pricePerSession: 649,
    sessionDuration: 60,
    totalSessions: 75,
    bio: "iOS tech lead at PhonePe. Specialize in mobile dev interview preparation which is very niche and hard to find coaching for. Can review your app portfolio too.",
    specialties: ["Swift advanced concepts", "iOS architecture", "Memory management deep dive", "Portfolio review"],
    availability: ["Tue-Thu 8-11 PM", "Sun 2-6 PM"],
    slots: [
      { date: "2026-05-06", time: "8:00 PM", available: true },
      { date: "2026-05-08", time: "9:00 PM", available: true },
      { date: "2026-05-11", time: "2:00 PM", available: true }
    ],
    reviews: [
      { name: "Tarun K.", rating: 5, text: "Only coach I found for iOS interviews. Very thorough and practical.", date: "3 weeks ago" }
    ],
    badge: "Mobile Expert",
    badgeColor: "bg-lime-500"
  },
  {
    id: "int_012",
    name: "Fatima Sheikh",
    avatar: "FS",
    avatarColor: "bg-purple-600",
    designation: "Marketing Manager",
    company: "Unilever",
    companyLogo: "🛍️",
    yearsExperience: 6,
    domains: ["Marketing", "Brand Management", "Digital Marketing", "FMCG", "MBA Marketing"],
    interviewTypes: ["Marketing Case Study", "Brand Strategy Round", "GD Topics", "MBA Interview"],
    languages: ["English", "Hindi", "Urdu"],
    rating: 4.8,
    reviewCount: 91,
    pricePerSession: 649,
    sessionDuration: 60,
    totalSessions: 175,
    bio: "Marketing manager at Unilever with IIM-A background. Help students crack marketing, FMCG, and MBA interviews. Specialize in case studies and brand strategy rounds.",
    specialties: ["FMCG case studies", "Brand management concepts", "Marketing guesstimates", "MBA GD-PI coaching"],
    availability: ["Mon-Wed 6-9 PM", "Weekend afternoons"],
    slots: [
      { date: "2026-05-05", time: "6:30 PM", available: true },
      { date: "2026-05-07", time: "7:00 PM", available: true },
      { date: "2026-05-10", time: "3:00 PM", available: true }
    ],
    reviews: [
      { name: "Ishaan R.", rating: 5, text: "Fatima's marketing case prep is incredible. Got into HUL through campus!", date: "1 month ago" }
    ],
    badge: "Marketing Expert",
    badgeColor: "bg-purple-500"
  }
];

// --- Groq Helper ---
const groqCall = async (systemPrompt: string, userPrompt: string, maxTokens = 2000) => {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: maxTokens
      })
    }
  );
  const data = await response.json();
  if (!data.choices) throw new Error("Groq Error");
  return data.choices[0].message.content.replace(/```json|```/g, "").trim();
};

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("All");
  const [sortBy, setSortBy] = useState("Most Popular");
  const [selectedInterviewer, setSelectedInterviewer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("About");
  const [enhancedProfiles, setEnhancedProfiles] = useState<Record<string, any>>({});
  const [loadingEnhancement, setLoadingEnhancement] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingData, setBookingData] = useState<any>({
    sessionType: "Standard Mock Interview (60 min)",
    slot: null,
    name: "",
    email: "",
    targetRole: "",
    prepLevel: "Fresher",
    requests: ""
  });
  const [successModal, setSuccessModal] = useState<any>(null);
  const [prepBrief, setPrepBrief] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [appSubmitted, setAppSubmitted] = useState(false);

  useEffect(() => {
    const savedBookings = localStorage.getItem("placeiq_bookings");
    if (savedBookings) setBookings(JSON.parse(savedBookings));

    const savedEnhancements = sessionStorage.getItem("placeiq_enhanced_profiles");
    if (savedEnhancements) setEnhancedProfiles(JSON.parse(savedEnhancements));
  }, []);

  // --- Filtering & Sorting ---
  const filteredInterviewers = useMemo(() => {
    let result = [...INTERVIEWERS];

    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      result = result.filter(i => 
        i.name.toLowerCase().includes(lowSearch) || 
        i.company.toLowerCase().includes(lowSearch) || 
        i.domains.some(d => d.toLowerCase().includes(lowSearch))
      );
    }

    if (selectedDomain !== "All") {
      const domainMap: Record<string, string[]> = {
        "ML/AI": ["Machine Learning", "Data Science", "Deep Learning"],
        "SDE": ["Data Structures", "Algorithms", "System Design", "Java", "Python", "React", "Node.js"],
        "Data Analyst": ["Data Analytics", "SQL", "Power BI", "Excel"],
        "HR": ["HR Round", "Behavioral Interview", "Salary Negotiation"],
        "Finance": ["Finance", "Investment Banking", "Financial Modeling"],
        "DevOps": ["DevOps", "Cloud AWS", "Kubernetes"],
        "Mobile": ["iOS Development", "Swift", "React Native"],
        "Product": ["Product Management", "Strategy"],
        "Marketing": ["Marketing", "Brand Management"]
      };
      result = result.filter(i => i.domains.some(d => domainMap[selectedDomain]?.includes(d)));
    }

    if (selectedPriceRange !== "All") {
      if (selectedPriceRange === "Under ₹500") result = result.filter(i => i.pricePerSession < 500);
      else if (selectedPriceRange === "₹500-700") result = result.filter(i => i.pricePerSession >= 500 && i.pricePerSession <= 700);
      else if (selectedPriceRange === "₹700-900") result = result.filter(i => i.pricePerSession > 700 && i.pricePerSession <= 900);
      else if (selectedPriceRange === "₹900+") result = result.filter(i => i.pricePerSession > 900);
    }

    if (sortBy === "Highest Rated") result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "Price: Low to High") result.sort((a, b) => a.pricePerSession - b.pricePerSession);
    else if (sortBy === "Price: High to Low") result.sort((a, b) => b.pricePerSession - a.pricePerSession);
    else result.sort((a, b) => b.totalSessions - a.totalSessions); // Most Popular

    return result;
  }, [searchTerm, selectedDomain, selectedPriceRange, sortBy]);

  // --- Groq Enhancement ---
  const enhanceProfile = async (interviewer: any) => {
    if (enhancedProfiles[interviewer.id]) return;
    setLoadingEnhancement(true);
    try {
      const sys = "You are a marketplace assistant. Return ONLY JSON.";
      const user = `Generate additional profile content for this interviewer:
Name: ${interviewer.name}
Role: ${interviewer.designation} at ${interviewer.company}
Domains: ${interviewer.domains.join(', ')}
Specialties: ${interviewer.specialties.join(', ')}

Return ONLY JSON:
{
  "whatToExpect": ["bullet 1", "bullet 2", "bullet 3"],
  "sampleQuestions": ["q 1", "q 2", "q 3", "q 4", "q 5"],
  "prepTips": ["tip 1", "tip 2", "tip 3"],
  "idealFor": "one sentence"
}`;
      const raw = await groqCall(sys, user);
      const parsed = JSON.parse(raw);
      const updated = { ...enhancedProfiles, [interviewer.id]: parsed };
      setEnhancedProfiles(updated);
      sessionStorage.setItem("placeiq_enhanced_profiles", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEnhancement(false);
    }
  };

  const handleBookSession = async () => {
    const id = `PIQ-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newBooking = {
      id,
      interviewer: selectedInterviewer,
      ...bookingData,
      bookedAt: new Date().toISOString(),
      status: "Upcoming"
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);
    localStorage.setItem("placeiq_bookings", JSON.stringify(updated));

    setLoadingEnhancement(true);
    try {
      const sys = "You are an interview prep specialist. Return ONLY JSON.";
      const user = `Generate a personalized pre-session prep brief:
Target Role: ${bookingData.targetRole}
Interviewer: ${selectedInterviewer.name} (${selectedInterviewer.designation} @ ${selectedInterviewer.company})
Session: ${bookingData.sessionType}
Level: ${bookingData.prepLevel}
Requests: ${bookingData.requests}

Return ONLY JSON:
{
  "briefTitle": "string",
  "doBeforeSession": ["5 specific tasks"],
  "topicsToRevise": ["5 topics"],
  "questionsToExpect": ["5 questions"],
  "dosDonts": { "dos": ["3"], "donts": ["3"] },
  "mindsetTip": "string"
}`;
      const raw = await groqCall(sys, user);
      const parsed = JSON.parse(raw);
      setPrepBrief(parsed);
      setSuccessModal({ ...newBooking, brief: parsed });
    } catch (e) {
      setSuccessModal(newBooking);
    } finally {
      setLoadingEnhancement(false);
      setSelectedInterviewer(null);
      setBookingStep(1);
    }
  };

  const renderBookingStep = () => {
    const int = selectedInterviewer;
    switch(bookingStep) {
      case 1:
        return (
          <div className="space-y-4">
             <h3 className="text-lg font-bold">Select Session Type</h3>
             {[
               { name: `Standard Mock Interview (60 min)`, price: int.pricePerSession, desc: "Full mock interview + written feedback report" },
               { name: `Quick Feedback Session (30 min)`, price: Math.round(int.pricePerSession * 0.6), desc: "Resume or specific topic review only" },
               { name: `Intensive Prep (90 min)`, price: Math.round(int.pricePerSession * 1.4), desc: "Extended session with detailed scorecard" }
             ].map(opt => (
               <button 
                 key={opt.name}
                 onClick={() => setBookingData({...bookingData, sessionType: opt.name, price: opt.price})}
                 className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${bookingData.sessionType === opt.name ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5'}`}
               >
                  <div className="flex justify-between font-bold mb-1">
                     <span>{opt.name}</span>
                     <span>₹{opt.price}</span>
                  </div>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
               </button>
             ))}
             <Button onClick={() => setBookingStep(2)} className="w-full h-14 bg-emerald-600 rounded-2xl font-black">Next: Select Slot →</Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
             <h3 className="text-lg font-bold">Pick a Time Slot</h3>
             <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {["2026-05-05", "2026-05-06", "2026-05-07", "2026-05-08", "2026-05-10"].map(date => {
                   const slots = int.slots.filter((s:any) => s.date === date);
                   if (slots.length === 0) return null;
                   return (
                     <div key={date}>
                        <div className="text-xs font-black text-gray-500 uppercase mb-3">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                        <div className="grid grid-cols-3 gap-2">
                           {slots.map((s:any) => (
                             <button 
                                key={s.time}
                                disabled={!s.available}
                                onClick={() => setBookingData({...bookingData, slot: { date, time: s.time }})}
                                className={`p-2 rounded-xl border text-xs font-bold transition-all ${bookingData.slot?.date === date && bookingData.slot?.time === s.time ? 'border-emerald-500 bg-emerald-500 text-white' : s.available ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' : 'border-white/5 text-gray-600 line-through opacity-50'}`}
                             >
                                {s.time}
                             </button>
                           ))}
                        </div>
                     </div>
                   );
                })}
             </div>
             <div className="flex gap-4">
                <Button onClick={() => setBookingStep(1)} variant="outline" className="flex-1 rounded-2xl h-12">Back</Button>
                <Button disabled={!bookingData.slot} onClick={() => setBookingStep(3)} className="flex-[2] bg-emerald-600 rounded-2xl h-12">Next: Details →</Button>
             </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
             <h3 className="text-lg font-bold">Your Details</h3>
             <div className="space-y-3">
                <input placeholder="Full Name" value={bookingData.name} onChange={e => setBookingData({...bookingData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" />
                <input placeholder="Email Address" value={bookingData.email} onChange={e => setBookingData({...bookingData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" />
                <input placeholder="Target Role (e.g. SDE at Google)" value={bookingData.targetRole} onChange={e => setBookingData({...bookingData, targetRole: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" />
                <div className="flex gap-2">
                   {["Fresher", "1-2 years", "2+ years"].map(lvl => (
                     <button key={lvl} onClick={() => setBookingData({...bookingData, prepLevel: lvl})} className={`flex-1 py-2 rounded-xl border text-[10px] font-black transition-all ${bookingData.prepLevel === lvl ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 text-gray-500'}`}>{lvl}</button>
                   ))}
                </div>
                <textarea placeholder="Special requests (optional)..." rows={3} value={bookingData.requests} onChange={e => setBookingData({...bookingData, requests: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 resize-none" />
             </div>
             <div className="flex gap-4">
                <Button onClick={() => setBookingStep(2)} variant="outline" className="flex-1 rounded-2xl h-12">Back</Button>
                <Button disabled={!bookingData.name || !bookingData.email || !bookingData.targetRole} onClick={() => setBookingStep(4)} className="flex-[2] bg-emerald-600 rounded-2xl h-12">Next: Pay →</Button>
             </div>
          </div>
        );
      case 4:
        const total = (bookingData.price || int.pricePerSession) + 40;
        return (
          <div className="space-y-6">
             <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-center font-black uppercase text-xs tracking-widest text-gray-500 mb-6">Booking Summary</h3>
                <div className="space-y-4">
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Interviewer</span>
                      <span className="font-bold">{int.name}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Session</span>
                      <span className="font-bold">{bookingData.sessionType}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Time</span>
                      <span className="font-bold">{new Date(bookingData.slot.date).toLocaleDateString()} at {bookingData.slot.time}</span>
                   </div>
                   <div className="border-t border-white/5 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                         <span className="text-gray-400">Session Fee</span>
                         <span>₹{bookingData.price || int.pricePerSession}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span className="text-gray-400">Platform Fee</span>
                         <span>₹40</span>
                      </div>
                      <div className="flex justify-between text-lg font-black text-emerald-400 pt-2 border-t border-white/10">
                         <span>Total</span>
                         <span>₹{total}</span>
                      </div>
                   </div>
                </div>
             </div>
             <div className="flex gap-4">
                <Button onClick={() => setBookingStep(3)} variant="outline" className="flex-1 rounded-2xl h-12">Back</Button>
                <Button onClick={handleBookSession} className="flex-[2] bg-emerald-600 rounded-2xl h-12 font-black">Confirm & Simulate Payment ✓</Button>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col overflow-x-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-12 text-center max-w-4xl mx-auto">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">
               <TrendingUp className="w-3 h-3" /> Industry Leading Expert Network
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-tight">
               Mock Interview <span className="text-emerald-500">Marketplace</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed mb-10">
               Get interviewed by real professionals from Google, Amazon, Microsoft, and top Indian companies. 
               Real feedback. Real improvement. Real results.
            </p>
         </motion.div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { val: "340+", lab: "Sessions Completed", icon: <Users /> },
              { val: "12", lab: "Expert Mentors", icon: <Award /> },
              { val: "4.9★", lab: "Avg Rating", icon: <Star /> },
              { val: "₹399", lab: "Starts At", icon: <IndianRupee /> }
            ].map(s => (
              <div key={s.lab} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                 <div className="text-emerald-400 mb-1 flex justify-center">{s.icon}</div>
                 <div className="text-xl font-black">{s.val}</div>
                 <div className="text-[10px] font-bold text-gray-500 uppercase">{s.lab}</div>
              </div>
            ))}
         </div>
      </section>

      {/* Search & Filters */}
      <section className="relative z-10 px-6 py-12 max-w-7xl mx-auto w-full">
         <div className="bg-black/40 border border-white/5 p-6 rounded-[32px] backdrop-blur-xl space-y-6">
            <div className="flex flex-col lg:flex-row gap-4">
               <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    placeholder="Search by name, company, or domain..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                  />
               </div>
               <div className="flex gap-2 shrink-0">
                  <select 
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs font-bold focus:outline-none"
                  >
                     <option>Most Popular</option>
                     <option>Highest Rated</option>
                     <option>Price: Low to High</option>
                     <option>Price: High to Low</option>
                  </select>
               </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5 mt-6">
               {["All", "ML/AI", "SDE", "Data Analyst", "HR", "Finance", "DevOps", "Mobile", "Product", "Marketing"].map(d => (
                 <button 
                  key={d} 
                  onClick={() => setSelectedDomain(d)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedDomain === d ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                 >
                   {d}
                 </button>
               ))}
            </div>
         </div>
      </section>

      {/* Grid */}
      <section className="relative z-10 px-6 pb-20 max-w-7xl mx-auto w-full">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredInterviewers.map((i, idx) => (
              <motion.div 
                key={i.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-[40px] p-8 group hover:bg-white/[0.07] hover:border-emerald-500/30 transition-all flex flex-col relative overflow-hidden"
              >
                 <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white ${i.badgeColor}`}>
                    {i.badge}
                 </div>

                 <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-xl font-black text-white shadow-xl ${i.avatarColor}`}>
                       {i.avatar}
                    </div>
                    <div>
                       <h3 className="text-xl font-black group-hover:text-emerald-400 transition-colors">{i.name}</h3>
                       <p className="text-sm text-gray-400 font-bold">{i.designation} <span className="opacity-40">@</span> {i.companyLogo} {i.company}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-2 mb-6 text-sm font-black text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" /> {i.rating} <span className="text-gray-600 font-bold">({i.reviewCount} reviews)</span>
                 </div>

                 <div className="flex flex-wrap gap-2 mb-8">
                    {i.domains.slice(0, 3).map(d => (
                      <span key={d} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-400">{d}</span>
                    ))}
                    {i.domains.length > 3 && <span className="text-[10px] font-bold text-gray-600">+{i.domains.length - 3} more</span>}
                 </div>

                 <div className="space-y-2 mb-8 text-xs font-bold text-gray-500">
                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {i.yearsExperience} years exp • {i.totalSessions} sessions</div>
                    <div className="flex items-center gap-2"><Languages className="w-3.5 h-3.5" /> {i.languages.join(", ")}</div>
                 </div>

                 <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <div>
                       <div className="text-[10px] font-black text-gray-600 uppercase">Starting at</div>
                       <div className="text-2xl font-black text-emerald-400">₹{i.pricePerSession}</div>
                    </div>
                    <Button 
                      onClick={() => { setSelectedInterviewer(i); enhanceProfile(i); }}
                      className="bg-emerald-600 hover:bg-emerald-500 rounded-2xl h-12 px-6 font-black text-xs group"
                    >
                       Book Now <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                 </div>
              </motion.div>
            ))}
         </div>
      </section>

      {/* My Bookings */}
      {bookings.length > 0 && (
        <section className="relative z-10 px-6 py-20 bg-black/40 border-y border-white/5">
           <div className="max-w-7xl mx-auto w-full">
              <h2 className="text-2xl font-black mb-10 flex items-center gap-3">
                 <Calendar className="text-emerald-500" /> My Bookings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {bookings.map(b => (
                   <div key={b.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                         <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ID: #{b.id}</div>
                         <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${b.status === 'Upcoming' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {b.status}
                         </div>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${b.interviewer.avatarColor}`}>{b.interviewer.avatar}</div>
                         <div>
                            <div className="font-bold">{b.interviewer.name}</div>
                            <div className="text-xs text-gray-500">{b.interviewer.designation}</div>
                         </div>
                      </div>
                      <div className="text-xs font-bold text-gray-400 space-y-1 mb-6">
                         <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {new Date(b.slot.date).toLocaleDateString()} at {b.slot.time}</div>
                         <div className="flex items-center gap-2"><Clock className="w-3 h-3" /> {b.sessionType}</div>
                      </div>
                      <div className="flex gap-2 mt-auto">
                         <Button onClick={() => setSuccessModal(b)} variant="outline" className="flex-1 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest">Prep Brief</Button>
                         <Button variant="ghost" className="flex-1 text-red-400 hover:bg-red-500/10 rounded-xl h-10 text-[10px] font-black uppercase">Cancel</Button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>
      )}

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedInterviewer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedInterviewer(null)} 
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-[1100px] h-full max-h-[850px] bg-neutral-900 border border-white/10 rounded-[40px] shadow-[0_0_100px_rgba(16,185,129,0.3)] overflow-hidden flex flex-col md:flex-row z-[101]"
            >
               {/* Left (Info) */}
               <div className="w-full md:w-[400px] border-b md:border-b-0 md:border-r border-white/10 p-10 flex flex-col overflow-y-auto scrollbar-hide">
                  <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-4xl font-black text-white mb-6 shadow-2xl ${selectedInterviewer.avatarColor}`}>
                     {selectedInterviewer.avatar}
                  </div>
                  <h2 className="text-3xl font-black mb-2">{selectedInterviewer.name}</h2>
                  <p className="text-lg text-emerald-400 font-bold mb-6">{selectedInterviewer.designation} <span className="text-white/40">@</span> {selectedInterviewer.companyLogo} {selectedInterviewer.company}</p>
                  
                  <div className="space-y-6 flex-1">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                           <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Rating</div>
                           <div className="text-lg font-black text-amber-500 flex items-center gap-1"><Star className="w-4 h-4 fill-amber-500" /> {selectedInterviewer.rating}</div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                           <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Sessions</div>
                           <div className="text-lg font-black text-white">{selectedInterviewer.totalSessions}+</div>
                        </div>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Domains</div>
                        <div className="flex flex-wrap gap-2">
                           {selectedInterviewer.domains.map((d:any) => <span key={d} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-400">{d}</span>)}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Languages</div>
                        <div className="flex flex-wrap gap-2">
                           {selectedInterviewer.languages.map((l:any) => <span key={l} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-400">{l}</span>)}
                        </div>
                     </div>

                     <div className="pt-6 border-t border-white/5">
                        <div className="flex justify-between items-end">
                           <div>
                              <div className="text-[10px] font-black text-gray-600 uppercase">Per Session</div>
                              <div className="text-3xl font-black text-emerald-400">₹{selectedInterviewer.pricePerSession}</div>
                           </div>
                           <div className="text-xs text-gray-500 font-bold mb-1">{selectedInterviewer.sessionDuration} min</div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right (Tabs/Content) */}
               <div className="flex-1 flex flex-col overflow-hidden bg-black/40">
                  <div className="p-10 flex flex-col h-full overflow-y-auto scrollbar-hide">
                    <div className="flex gap-8 border-b border-white/10 mb-8 shrink-0">
                       {["About", "Specialties", "Reviews", "Book"].map(tab => (
                         <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-emerald-400' : 'text-gray-500 hover:text-white'}`}>
                            {tab}
                            {activeTab === tab && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />}
                         </button>
                       ))}
                    </div>

                    <div className="flex-1 space-y-8">
                       {activeTab === "About" && (
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                            <div>
                               <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-4">Biography</h3>
                               <p className="text-gray-400 leading-relaxed italic">"{selectedInterviewer.bio}"</p>
                            </div>
                            
                            {loadingEnhancement ? (
                              <div className="py-20 flex flex-col items-center gap-4 text-gray-600">
                                 <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Groq is enhancing profile...</span>
                              </div>
                            ) : (
                              <div className="space-y-8">
                                 <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-blue-500 mb-4 flex items-center gap-2"><Info className="w-4 h-4" /> What to expect</h3>
                                    <div className="space-y-3">
                                       {enhancedProfiles[selectedInterviewer.id]?.whatToExpect.map((b:string, i:number) => (
                                         <div key={i} className="flex gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-medium text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {b}
                                         </div>
                                       ))}
                                    </div>
                                 </div>
                                 <div className="bg-emerald-600/10 border border-emerald-500/20 p-6 rounded-[32px]">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Ideal For</h3>
                                    <p className="text-sm font-bold text-gray-200">"{enhancedProfiles[selectedInterviewer.id]?.idealFor}"</p>
                                 </div>
                              </div>
                            )}
                         </motion.div>
                       )}

                       {activeTab === "Specialties" && (
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {selectedInterviewer.specialties.map((s:any, i:number) => (
                                 <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400"><ShieldCheck className="w-4 h-4" /></div>
                                    <span className="text-xs font-bold text-gray-300">{s}</span>
                                 </div>
                               ))}
                            </div>
                            
                            {!loadingEnhancement && (
                              <div className="space-y-6">
                                 <h3 className="text-sm font-black uppercase tracking-widest text-amber-500 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Possible Interview Questions</h3>
                                 <div className="space-y-3">
                                    {enhancedProfiles[selectedInterviewer.id]?.sampleQuestions.map((q:string, i:number) => (
                                      <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-2xl text-xs font-medium text-gray-400 italic">"{q}"</div>
                                    ))}
                                 </div>
                              </div>
                            )}
                         </motion.div>
                       )}

                       {activeTab === "Reviews" && (
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="flex items-center gap-8 mb-10">
                               <div className="text-center">
                                  <div className="text-5xl font-black">{selectedInterviewer.rating}</div>
                                  <div className="flex justify-center text-amber-500 mt-2"><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /></div>
                                  <div className="text-[10px] font-bold text-gray-500 uppercase mt-2">Verified Reviews</div>
                               </div>
                               <div className="flex-1 space-y-2">
                                  {[5,4,3,2,1].map(s => (
                                    <div key={s} className="flex items-center gap-3">
                                       <span className="text-[10px] font-black w-3">{s}</span>
                                       <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{ width: s === 5 ? '85%' : s === 4 ? '10%' : '5%' }} /></div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-4">
                               {selectedInterviewer.reviews.map((r:any, i:number) => (
                                 <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                                    <div className="flex justify-between items-start mb-2">
                                       <div className="font-bold text-sm">{r.name}</div>
                                       <div className="text-[10px] text-gray-500">{r.date}</div>
                                    </div>
                                    <div className="flex text-amber-500 mb-3">{Array.from({length:r.rating}).map((_,i)=><Star key={i} className="w-3 h-3 fill-amber-500" />)}</div>
                                    <p className="text-xs text-gray-400 italic">"{r.text}"</p>
                                 </div>
                               ))}
                            </div>
                         </motion.div>
                       )}

                       {activeTab === "Book" && (
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {renderBookingStep()}
                         </motion.div>
                       )}
                    </div>
                  </div>
               </div>
               
               <button onClick={() => setSelectedInterviewer(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-all"><X /></button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {successModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSuccessModal(null)} className="absolute inset-0 bg-black/95 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto scrollbar-hide bg-neutral-900 border border-white/10 p-10 rounded-[40px] z-[121] text-center shadow-[0_0_100px_rgba(16,185,129,0.3)]"
            >
               <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10 text-white" />
               </div>
               <h2 className="text-3xl font-black mb-4">Booking Confirmed! 🎉</h2>
               <p className="text-gray-400 mb-8 leading-relaxed">
                  Your session with <span className="text-white font-bold">{successModal.interviewer.name}</span> is scheduled for 
                  <span className="text-emerald-400 font-black"> {new Date(successModal.slot.date).toLocaleDateString()} at {successModal.slot.time} IST</span>.
               </p>

               <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left mb-8 space-y-3">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-500"><span>Booking ID</span> <span className="text-white">#{successModal.id}</span></div>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-500"><span>Confirmation Sent</span> <span className="text-white">{successModal.email}</span></div>
               </div>

               {successModal.brief && (
                 <div className="text-left space-y-6 mb-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2"><Zap className="w-4 h-4" /> Personalized Prep Brief</h3>
                    <div className="bg-black/40 border border-emerald-500/20 p-6 rounded-3xl space-y-6">
                       <div>
                          <div className="text-[10px] font-black text-emerald-400 uppercase mb-3">Tasks to do before session</div>
                          <div className="space-y-2">
                             {successModal.brief.doBeforeSession.map((t:string, i:number) => <div key={i} className="flex gap-2 text-xs text-gray-300"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" /> {t}</div>)}
                          </div>
                       </div>
                       <div>
                          <div className="text-[10px] font-black text-blue-400 uppercase mb-3">Likely Questions</div>
                          <div className="space-y-2">
                             {successModal.brief.questionsToExpect.map((q:string, i:number) => <div key={i} className="text-xs text-gray-400 italic">"{q}"</div>)}
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               <div className="flex gap-4">
                  <Button onClick={() => setSuccessModal(null)} className="flex-1 bg-white text-black hover:bg-gray-200 rounded-2xl h-14 font-black">Close</Button>
                  <Button variant="outline" className="flex-1 border-white/10 rounded-2xl h-14 font-black">View My Bookings</Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Application Modal */}
      <AnimatePresence>
         {isApplying && (
           <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsApplying(false)} className="absolute inset-0 bg-black/95 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto bg-neutral-900 border border-white/10 p-10 rounded-[40px] z-[121] shadow-[0_0_100px_rgba(59,130,246,0.2)] scrollbar-hide"
            >
               {appSubmitted ? (
                 <div className="text-center py-10">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-8"><CheckCircle2 className="w-10 h-10 text-white" /></div>
                    <h2 className="text-3xl font-black mb-4">Application Sent!</h2>
                    <p className="text-gray-400 mb-8">We've received your application to become an interviewer. Our team will review your profile and contact you within 3 business days.</p>
                    <Button onClick={() => { setIsApplying(false); setAppSubmitted(false); }} className="w-full bg-white text-black h-12 rounded-xl font-black">Awesome</Button>
                 </div>
               ) : (
                 <div className="space-y-6">
                    <h2 className="text-3xl font-black mb-2">Join the Network</h2>
                    <p className="text-sm text-gray-400 mb-8">Mentoring is a great way to give back and earn. Fill in your details below.</p>
                    <div className="space-y-4">
                       <input placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500" />
                       <div className="flex gap-4">
                          <input placeholder="Current Role" className="flex-[2] bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500" />
                          <input placeholder="Exp (Years)" className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500" />
                       </div>
                       <input placeholder="Current Company" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500" />
                       <input placeholder="LinkedIn URL" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500" />
                       <textarea placeholder="Tell us why you want to mentor..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500 resize-none" />
                    </div>
                    <Button onClick={() => setAppSubmitted(true)} className="w-full bg-blue-600 h-14 rounded-2xl font-black">Submit Application →</Button>
                 </div>
               )}
            </motion.div>
          </div>
         )}
      </AnimatePresence>

      {/* Become an Interviewer CTA */}
      <section className="relative z-10 px-6 py-20 max-w-5xl mx-auto w-full">
         <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[48px] p-12 text-center relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -mr-40 -mt-40 group-hover:bg-white/20 transition-all duration-1000" />
            <h2 className="text-3xl md:text-5xl font-black mb-6 relative z-10 tracking-tight">Are you a working professional?</h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto relative z-10 leading-relaxed">
               Earn by interviewing students on PlaceIQ. Share your expertise, set your own rates, and help the next generation of engineers.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 relative z-10">
               {[
                 { lab: "Earn ₹400-700/hr", icon: <IndianRupee /> },
                 { lab: "Set Own Schedule", icon: <Clock /> },
                 { lab: "Build Mentoring Profile", icon: <Award /> },
                 { lab: "Remote Sessions", icon: <Users /> }
               ].map(b => (
                 <div key={b.lab} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">{b.icon}</div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-white/70">{b.lab}</div>
                 </div>
               ))}
            </div>
            <Button onClick={() => setIsApplying(true)} className="bg-white text-blue-600 hover:bg-blue-50 px-10 h-16 rounded-[24px] font-black text-lg relative z-10 shadow-xl">
               Apply to be an Interviewer →
            </Button>
         </div>
      </section>

      <footer className="relative z-10 px-6 py-10 border-t border-white/5 text-center text-[10px] font-black text-gray-600 uppercase tracking-widest">
         © 2026 PlaceIQ Expert Network • Mock Interview Marketplace
      </footer>
    </div>
  );
}
