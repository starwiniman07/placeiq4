"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  FileText, 
  Activity, 
  BarChart3, 
  Trophy, 
  ArrowRight, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronDown, 
  RotateCcw,
  LayoutDashboard,
  Calculator,
  BookOpen,
  PieChart,
  Target,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// --- Types ---
type Topic = "Quantitative" | "Logical" | "Verbal" | "DataInterpretation";
type Difficulty = "Easy" | "Medium" | "Hard";

interface Question {
  id: string;
  topic: Topic;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  explanation: string;
  shortcut: string;
  difficulty: Difficulty;
  avgTimeSeconds: number;
}

interface ScoreEntry {
  id: number;
  name: string;
  topic: string;
  score: number;
  total: number;
  accuracy: number;
  timeTaken: number;
  date: string;
  weakTopics: string[];
}

// --- Question Bank (60 Questions) ---
const QUESTION_BANK: Question[] = [
  // QUANTITATIVE (15)
  { id: "Q1", topic: "Quantitative", question: "A sum of ₹5000 is invested at 8% per annum SI for 3 years. Find interest.", options: { A: "1200", B: "1000", C: "800", D: "1500" }, correct: "A", explanation: "SI = P×R×T/100 = 5000×8×3/100 = 1200", shortcut: "Multiply principal × rate × time ÷ 100 directly", difficulty: "Easy", avgTimeSeconds: 30 },
  { id: "Q2", topic: "Quantitative", question: "A shirt costs ₹800. After 25% discount, find price.", options: { A: "600", B: "650", C: "700", D: "550" }, correct: "A", explanation: "Discount = 25% of 800 = 200. Price = 800-200 = 600", shortcut: "Multiply by (1 - discount%) = 800 × 0.75 = 600", difficulty: "Easy", avgTimeSeconds: 25 },
  { id: "Q3", topic: "Quantitative", question: "A:B = 3:5, B:C = 2:3. Find A:B:C.", options: { A: "6:10:15", B: "3:5:3", C: "2:5:3", D: "3:10:15" }, correct: "A", explanation: "A:B:C = 3×2 : 5×2 : 5×3 = 6:10:15", shortcut: "Multiply B values to equalize then scale", difficulty: "Medium", avgTimeSeconds: 45 },
  { id: "Q4", topic: "Quantitative", question: "Train 200m long passes pole in 10 sec. Speed?", options: { A: "72 km/h", B: "60 km/h", C: "54 km/h", D: "80 km/h" }, correct: "A", explanation: "Speed = 200/10 = 20 m/s = 20×18/5 = 72 km/h", shortcut: "m/s to km/h → multiply by 18/5", difficulty: "Medium", avgTimeSeconds: 40 },
  { id: "Q5", topic: "Quantitative", question: "Cost ₹200, sold ₹250. Profit %?", options: { A: "25%", B: "20%", C: "30%", D: "15%" }, correct: "A", explanation: "Profit% = (50/200)×100 = 25%", shortcut: "Profit% = (SP-CP)/CP × 100", difficulty: "Easy", avgTimeSeconds: 20 },
  { id: "Q6", topic: "Quantitative", question: "A does work in 10 days, B in 15 days. Together?", options: { A: "6 days", B: "8 days", C: "5 days", D: "7 days" }, correct: "A", explanation: "Combined = 1/10+1/15 = 5/30 = 1/6, so 6 days", shortcut: "AB/(A+B) = 10×15/25 = 6", difficulty: "Medium", avgTimeSeconds: 45 },
  { id: "Q7", topic: "Quantitative", question: "20L mixture 3:2 milk:water. Add 5L water. New ratio?", options: { A: "2:2", B: "12:13", C: "2:1", D: "12:11" }, correct: "B", explanation: "Milk=12L, Water=8L+5L=13L → 12:13", shortcut: "Find actual quantities then add", difficulty: "Hard", avgTimeSeconds: 60 },
  { id: "Q8", topic: "Quantitative", question: "₹1000 at 10% CI for 2 years?", options: { A: "1210", B: "1200", C: "1100", D: "1250" }, correct: "A", explanation: "1000×(1.1)² = 1000×1.21 = 1210", shortcut: "P×(1+r/100)^n", difficulty: "Medium", avgTimeSeconds: 40 },
  { id: "Q9", topic: "Quantitative", question: "Average of 5 numbers is 20. Sixth number makes avg 25?", options: { A: "50", B: "45", C: "55", D: "40" }, correct: "A", explanation: "Sum=100, New sum=150, Sixth = 50", shortcut: "New number = new_avg×(n+1) - old_avg×n", difficulty: "Easy", avgTimeSeconds: 30 },
  { id: "Q10", topic: "Quantitative", question: "Pipe A fills tank in 6h, B empties in 12h. Both open?", options: { A: "12h", B: "8h", C: "10h", D: "6h" }, correct: "A", explanation: "Net = 1/6-1/12 = 1/12, so 12 hours", shortcut: "Net rate = fill rate - drain rate", difficulty: "Medium", avgTimeSeconds: 50 },
  { id: "Q11", topic: "Quantitative", question: "How many 3-digit numbers from {1,2,3,4,5}?", options: { A: "60", B: "125", C: "120", D: "24" }, correct: "A", explanation: "5×4×3 = 60 (no repetition)", shortcut: "nPr = n!/(n-r)!", difficulty: "Medium", avgTimeSeconds: 40 },
  { id: "Q12", topic: "Quantitative", question: "Two dice rolled. P(sum=7)?", options: { A: "1/6", B: "1/4", C: "1/8", D: "1/3" }, correct: "A", explanation: "Favourable=(1,6)(2,5)(3,4)(4,3)(5,2)(6,1)=6, Total=36", shortcut: "Count favourable pairs manually", difficulty: "Medium", avgTimeSeconds: 45 },
  { id: "Q13", topic: "Quantitative", question: "Father is 4× son's age. After 5 years, 3×. Father's age?", options: { A: "40", B: "35", C: "45", D: "30" }, correct: "A", explanation: "4x+5=3(x+5) → x=10, Father=40", shortcut: "Set up equation with ratio change", difficulty: "Hard", avgTimeSeconds: 60 },
  { id: "Q14", topic: "Quantitative", question: "LCM of 12, 18, 24?", options: { A: "72", B: "36", C: "48", D: "96" }, correct: "A", explanation: "LCM = 72 by prime factorization", shortcut: "LCM = product/GCD for pairs then extend", difficulty: "Easy", avgTimeSeconds: 25 },
  { id: "Q15", topic: "Quantitative", question: "Rectangle 8×6. Diagonal length?", options: { A: "10", B: "12", C: "8", D: "14" }, correct: "A", explanation: "√(64+36) = √100 = 10", shortcut: "Pythagorean theorem on length and breadth", difficulty: "Easy", avgTimeSeconds: 20 },

  // LOGICAL REASONING (15)
  { id: "L1", topic: "Logical", question: "Number Series — 2, 6, 12, 20, 30, ?", options: { A: "42", B: "40", C: "44", D: "38" }, correct: "A", explanation: "Differences are 4,6,8,10,12 → next = 30+12=42", shortcut: "Find difference pattern first", difficulty: "Easy", avgTimeSeconds: 30 },
  { id: "L2", topic: "Logical", question: "If APPLE=BQQMF, then MANGO=?", options: { A: "NBOHP", B: "NANGO", C: "MBNGO", D: "NAOHP" }, correct: "A", explanation: "Each letter shifted +1, M→N, A→B, N→O, G→H, O→P", shortcut: "Check shift value from first example", difficulty: "Easy", avgTimeSeconds: 25 },
  { id: "L3", topic: "Logical", question: "A is B's father. C is A's sister. How is C to B?", options: { A: "Aunt", B: "Mother", C: "Sister", D: "Grandmother" }, correct: "A", explanation: "A's sister is B's paternal aunt", shortcut: "Draw family tree", difficulty: "Easy", avgTimeSeconds: 30 },
  { id: "L4", topic: "Logical", question: "All cats are animals. Some animals are wild. Conclusion?", options: { A: "Some cats may be wild", B: "All cats are wild", C: "No cats are wild", D: "All animals are cats" }, correct: "A", explanation: "Cannot definitively say all cats are wild", shortcut: "Use Venn diagrams for syllogisms", difficulty: "Medium", avgTimeSeconds: 45 },
  { id: "L5", topic: "Logical", question: "Walk 5km N, turn right 3km, turn right 5km. Distance from start?", options: { A: "3km", B: "5km", C: "8km", D: "4km" }, correct: "A", explanation: "Forms 3 sides of rectangle, horizontal distance = 3km", shortcut: "Draw the path on paper", difficulty: "Medium", avgTimeSeconds: 50 },
  { id: "L6", topic: "Logical", question: "In a row of 40, A is 15th from left. Position from right?", options: { A: "26", B: "25", C: "27", D: "24" }, correct: "A", explanation: "40-15+1 = 26", shortcut: "Position from right = Total - Left position + 1", difficulty: "Easy", avgTimeSeconds: 20 },
  { id: "L7", topic: "Logical", question: "Analogy — Book:Library :: Medicine:?", options: { A: "Hospital", B: "Doctor", C: "Pharmacy", D: "Patient" }, correct: "A", explanation: "Books are stored in library, medicine in hospital", shortcut: "Find the relationship category", difficulty: "Easy", avgTimeSeconds: 20 },
  { id: "L8", topic: "Logical", question: "Odd One Out — 12, 21, 33, 46, 55", options: { A: "46", B: "33", C: "21", D: "55" }, correct: "A", explanation: "All others are sum of two same digits, 46 is not", shortcut: "Check divisibility or digit patterns", difficulty: "Medium", avgTimeSeconds: 40 },
  { id: "L9", topic: "Logical", question: "Letter Series — AZ, BY, CX, DW, ?", options: { A: "EV", B: "EU", C: "FV", D: "EW" }, correct: "A", explanation: "First letter forward, second letter backward", shortcut: "Track each position separately", difficulty: "Medium", avgTimeSeconds: 35 },
  { id: "L10", topic: "Logical", question: "5 people in circle. A opposite B. C next to A. Where is D?", options: { A: "Next to B", B: "Opposite C", C: "Next to C", D: "Opposite A" }, correct: "A", explanation: "Circular arrangement shows D must be adjacent to B", shortcut: "Draw the circle", difficulty: "Hard", avgTimeSeconds: 70 },
  { id: "L11", topic: "Logical", question: "Jan 1 2023 was Sunday. What day is Jan 1 2024?", options: { A: "Monday", B: "Tuesday", C: "Sunday", D: "Wednesday" }, correct: "A", explanation: "Normal year shifts day by 1", shortcut: "+1 for normal, +2 for leap", difficulty: "Medium", avgTimeSeconds: 40 },
  { id: "L12", topic: "Logical", question: "Which is mirror image of 'PLACE'?", options: { A: "ECALP", B: "PLACE", C: "EPLAC", D: "PLECA" }, correct: "A", explanation: "Mirror reverses left-right", shortcut: "Reverse the string", difficulty: "Easy", avgTimeSeconds: 20 },
  { id: "L13", topic: "Logical", question: "A>B, C<D, B=C. Which is greatest?", options: { A: "D", B: "A", C: "B", D: "C" }, correct: "A", explanation: "A>B=C<D, so D or A could be, but D is a valid option", shortcut: "Chain inequalities", difficulty: "Medium", avgTimeSeconds: 40 },
  { id: "L14", topic: "Logical", question: "Input: 8 3 5 1 7. Step1: 1 3 5 8 7. Step2: 1 3 5 7 8. Steps to sort?", options: { A: "2", B: "3", C: "1", D: "4" }, correct: "A", explanation: "Identified sort pattern needs 2 steps", shortcut: "Find sort pattern", difficulty: "Hard", avgTimeSeconds: 60 },
  { id: "L15", topic: "Logical", question: "Angle between hands at 3:30?", options: { A: "75°", B: "90°", C: "80°", D: "70°" }, correct: "A", explanation: "|30(3) - 5.5(30)| = |90-165| = 75", shortcut: "|30H - 5.5M|", difficulty: "Medium", avgTimeSeconds: 45 },

  // VERBAL ABILITY (15)
  { id: "V1", topic: "Verbal", question: "Synonym — ELOQUENT", options: { A: "Fluent", B: "Silent", C: "Angry", D: "Tired" }, correct: "A", explanation: "Eloquent means fluent/persuasive in speaking", shortcut: "Root 'elocu' = speech", difficulty: "Medium", avgTimeSeconds: 25 },
  { id: "V2", topic: "Verbal", question: "Antonym — BENEVOLENT", options: { A: "Malicious", B: "Kind", C: "Generous", D: "Helpful" }, correct: "A", explanation: "Benevolent=kind, opposite=malicious", shortcut: "Identify meaning first", difficulty: "Easy", avgTimeSeconds: 20 },
  { id: "V3", topic: "Verbal", question: "She was __ by the sudden news.", options: { A: "Astonished", B: "Astonish", C: "Astonishing", D: "Astonishes" }, correct: "A", explanation: "Requires past participle", shortcut: "Tense check", difficulty: "Easy", avgTimeSeconds: 20 },
  { id: "V4", topic: "Verbal", question: "Neither the students nor the teacher __ present.", options: { A: "was", B: "were", C: "are", D: "is" }, correct: "A", explanation: "Agrees with nearest subject (teacher)", shortcut: "Verb agrees with closest subject", difficulty: "Hard", avgTimeSeconds: 40 },
  { id: "V5", topic: "Verbal", question: "AI is transforming healthcare for diagnostics. Finance uses it for fraud. Which industry uses AI for diagnostics?", options: { A: "Healthcare", B: "Finance", C: "Education", D: "Retail" }, correct: "A", explanation: "Stated in text", shortcut: "Scan keywords", difficulty: "Easy", avgTimeSeconds: 30 },
  { id: "V6", topic: "Verbal", question: "Bite the bullet means?", options: { A: "Endure pain", B: "Shoot someone", C: "Eat metal", D: "Run fast" }, correct: "A", explanation: "Historical origin from surgery", shortcut: "Memorize idioms", difficulty: "Medium", avgTimeSeconds: 25 },
  { id: "V7", topic: "Verbal", question: "Which is correctly spelled?", options: { A: "Accommodate", B: "Accomodate", C: "Acomodate", D: "Accomdate" }, correct: "A", explanation: "2 c's and 2 m's", shortcut: "Double c, double m", difficulty: "Easy", avgTimeSeconds: 15 },
  { id: "V8", topic: "Verbal", question: "One who studies the stars?", options: { A: "Astronomer", B: "Astrologer", C: "Geologist", D: "Physicist" }, correct: "A", explanation: "Astronomer = scientific study", shortcut: "Astro=stars", difficulty: "Easy", avgTimeSeconds: 15 },
  { id: "V9", topic: "Verbal", question: "Sentence Correction: He don't know the answer.", options: { A: "doesn't", B: "didn't not", C: "don't", D: "hadn't" }, correct: "A", explanation: "Third person singular", shortcut: "He/She/It takes doesn't", difficulty: "Easy", avgTimeSeconds: 20 },
  { id: "V10", topic: "Verbal", question: "Analogy — Pen:Write :: Knife:?", options: { A: "Cut", B: "Sharp", C: "Metal", D: "Cook" }, correct: "A", explanation: "Function relationship", shortcut: "Tool and use", difficulty: "Easy", avgTimeSeconds: 15 },
  { id: "V11", topic: "Verbal", question: "The manager signed the letter. Passive?", options: { A: "Letter was signed by manager", B: "Manager had signed", C: "Letter is signed", D: "Manager signs" }, correct: "A", explanation: "Object becomes subject", shortcut: "Obj + was/were + V3", difficulty: "Medium", avgTimeSeconds: 30 },
  { id: "V12", topic: "Verbal", question: "She is good __ mathematics.", options: { A: "at", B: "in", C: "on", D: "for" }, correct: "A", explanation: "Good at is the standard phrase", shortcut: "Fixed phrase", difficulty: "Easy", avgTimeSeconds: 15 },
  { id: "V13", topic: "Verbal", question: "By next year, she __ her degree.", options: { A: "will have completed", B: "completes", C: "completed", D: "has completed" }, correct: "A", explanation: "Future perfect tense", shortcut: "By + future time = Future Perfect", difficulty: "Medium", avgTimeSeconds: 30 },
  { id: "V14", topic: "Verbal", question: "Glaciers melt. Sea levels rise threatening cities. What threatens coastal cities?", options: { A: "Rising sea levels", B: "Glaciers", C: "Climate change", D: "Temperature" }, correct: "A", explanation: "Stated in text", shortcut: "Direct search", difficulty: "Easy", avgTimeSeconds: 25 },
  { id: "V15", topic: "Verbal", question: "EPHEMERAL means?", options: { A: "Short-lived", B: "Eternal", C: "Strong", D: "Beautiful" }, correct: "A", explanation: "Lasting a very short time", shortcut: "Root: Ephemera", difficulty: "Hard", avgTimeSeconds: 30 },

  // DATA INTERPRETATION (15)
  { id: "D1", topic: "DataInterpretation", question: "Table: Jan=200, Feb=250, Mar=300, Apr=280. Which month highest sales?", options: { A: "March", B: "April", C: "February", D: "January" }, correct: "A", explanation: "March has 300, max value", shortcut: "Scan max directly", difficulty: "Easy", avgTimeSeconds: 25 },
  { id: "D2", topic: "DataInterpretation", question: "Total 500. Pass 375. Fail %?", options: { A: "25%", B: "30%", C: "20%", D: "35%" }, correct: "A", explanation: "Fail=125, 125/500=25%", shortcut: "100 - Pass%", difficulty: "Easy", avgTimeSeconds: 20 },
  { id: "D3", topic: "DataInterpretation", question: "Bar: A=40, B=60, C=50, D=30, E=70. Which two equal E?", options: { A: "A+D", B: "B+C", C: "A+C", D: "B+D" }, correct: "A", explanation: "40+30=70", shortcut: "Sum check", difficulty: "Medium", avgTimeSeconds: 40 },
  { id: "D4", topic: "DataInterpretation", question: "Exports: 2021=400cr, 2022=600cr. Growth ratio?", options: { A: "2:3", B: "3:4", C: "1:2", D: "4:5" }, correct: "A", explanation: "400:600 = 2:3", shortcut: "Divide by HCF", difficulty: "Easy", avgTimeSeconds: 20 },
  { id: "D5", topic: "DataInterpretation", question: "Scores: 80, 90, 70, 85, 75. Average?", options: { A: "80", B: "75", C: "85", D: "78" }, correct: "A", explanation: "Sum=400, Avg=80", shortcut: "Sum / Count", difficulty: "Easy", avgTimeSeconds: 25 },
  { id: "D6", topic: "DataInterpretation", question: "Budget: Food 30%, Rent 25%, Total ₹50000. How much for both?", options: { A: "27500", B: "25000", C: "30000", D: "22500" }, correct: "A", explanation: "55% of 50000", shortcut: "Sum % then calc", difficulty: "Medium", avgTimeSeconds: 45 },
  { id: "D7", topic: "DataInterpretation", question: "Sales: 2021=80L, 2022=100L. Growth %?", options: { A: "25%", B: "20%", C: "30%", D: "15%" }, correct: "A", explanation: "20/80 = 25%", shortcut: "Diff / Old", difficulty: "Easy", avgTimeSeconds: 25 },
  { id: "D8", topic: "DataInterpretation", question: "A: Cost 100, Rev 150. B: Cost 200, Rev 280. Higher profit %?", options: { A: "Product A", B: "Product B", C: "Equal", D: "N/A" }, correct: "A", explanation: "A=50%, B=40%", shortcut: "Calc for each", difficulty: "Medium", avgTimeSeconds: 40 },
  { id: "D9", topic: "DataInterpretation", question: "Avg of 4 is 25. Known: 20, 30, 25. Fourth?", options: { A: "25", B: "20", C: "30", D: "35" }, correct: "A", explanation: "100-75=25", shortcut: "Total - Sum", difficulty: "Easy", avgTimeSeconds: 25 },
  { id: "D10", topic: "DataInterpretation", question: "Store A: 300 items @ ₹50. Store B: 200 @ ₹80. Higher revenue?", options: { A: "Store B", B: "Store A", C: "Equal", D: "N/A" }, correct: "A", explanation: "A=15k, B=16k", shortcut: "P × Q", difficulty: "Easy", avgTimeSeconds: 30 },
  { id: "D11", topic: "DataInterpretation", question: "Rainfall: 2019=100, 2020=120, 2021=110, 2022=140. Biggest increase?", options: { A: "2020", B: "2022", C: "2019", D: "2021" }, correct: "B", explanation: "140-110=30", shortcut: "Yearly diff", difficulty: "Medium", avgTimeSeconds: 50 },
  { id: "D12", topic: "DataInterpretation", question: "Class 3:2 Boys:Girls. Total 40. How many girls?", options: { A: "16", B: "24", C: "20", D: "18" }, correct: "A", explanation: "2/5 of 40", shortcut: "Ratio proportion", difficulty: "Easy", avgTimeSeconds: 25 },
  { id: "D13", topic: "DataInterpretation", question: "Budget 2L. Tech 50%, HR 25%. How much for Sales?", options: { A: "₹50000", B: "₹25000", C: "₹75000", D: "₹1L" }, correct: "A", explanation: "Remaining 25% = 50k", shortcut: "100 - Sum of others", difficulty: "Medium", avgTimeSeconds: 45 },
  { id: "D14", topic: "DataInterpretation", question: "Price index 100 to 125. Old price ₹400. New price?", options: { A: "₹500", B: "₹450", C: "₹525", D: "₹480" }, correct: "A", explanation: "400 * 1.25", shortcut: "Apply % increase", difficulty: "Medium", avgTimeSeconds: 40 },
  { id: "D15", topic: "DataInterpretation", question: "Ram: 30k+5k, Sita: 25k+8k, John: 35k+3k. Highest total?", options: { A: "John", B: "Ram", C: "Sita", D: "Equal" }, correct: "A", explanation: "John=38k", shortcut: "Add all", difficulty: "Easy", avgTimeSeconds: 30 },
];

const COMPANY_TESTS = {
  TCS: {
    name: "TCS NQT Pattern",
    duration: 50 * 60,
    description: "8 Quant + 6 Logical + 6 Verbal • Easy-Medium",
    color: "#0066CC",
    questions: ["Q1","Q2","Q3","Q4","Q5","Q6","Q9","Q14", "L1","L2","L3","L6","L7","L12", "V1","V2","V3","V7","V8","V10"]
  },
  Infosys: {
    name: "Infosys InfyTQ Pattern", 
    duration: 60 * 60,
    description: "6 Quant + 6 Logical + 4 Verbal + 4 DI • Medium",
    color: "#007CC2",
    questions: ["Q3","Q4","Q6","Q8","Q10","Q11", "L4","L5","L9","L11","L13","L14", "V4","V6","V11","V13", "D3","D6","D8","D11"]
  },
  Wipro: {
    name: "Wipro NLTH Pattern",
    duration: 55 * 60,
    description: "7 Quant + 5 Logical + 5 Verbal + 3 DI • Easy-Medium",
    color: "#8B0000",
    questions: ["Q1","Q2","Q5","Q7","Q9","Q12","Q14", "L1","L3","L6","L8","L12", "V2","V3","V7","V9","V12", "D1","D2","D4"]
  },
  Accenture: {
    name: "Accenture Cognitive Pattern",
    duration: 50 * 60,
    description: "5 Quant + 5 Logical + 5 Verbal + 5 DI • Medium",
    color: "#A100FF",
    questions: ["Q4","Q6","Q8","Q10","Q13", "L5","L9","L10","L14","L15", "V4","V6","V11","V14","V15", "D6","D8","D11","D13","D14"]
  }
};

const TOPIC_CARDS = [
  { id: "Quantitative", name: "Quantitative Aptitude", icon: <Calculator className="w-8 h-8" />, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "Logical", name: "Logical Reasoning", icon: <Brain className="w-8 h-8" />, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { id: "Verbal", name: "Verbal Ability", icon: <BookOpen className="w-8 h-8" />, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "DataInterpretation", name: "Data Interpretation", icon: <PieChart className="w-8 h-8" />, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
];

// --- Components ---

const QuizModal = ({ 
  isOpen, 
  onClose, 
  title, 
  questions: quizQuestions, 
  onFinish 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  questions: Question[]; 
  onFinish: (results: any) => void;
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { choice: string; time: number }>>({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = quizQuestions[currentIdx];
  const progress = ((currentIdx + 1) / quizQuestions.length) * 100;

  useEffect(() => {
    if (!isOpen || quizFinished || showExplanation) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer("SKIP");
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, quizFinished, showExplanation, currentIdx]);

  const handleAnswer = (choice: string) => {
    if (showExplanation) return;
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    setAnswers({ ...answers, [currentQ.id]: { choice, time: timeSpent } });
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < quizQuestions.length) {
      setCurrentIdx(currentIdx + 1);
      setShowExplanation(false);
      setTimeLeft(60);
      setStartTime(Date.now());
    } else {
      setQuizFinished(true);
      const totalTime = Object.values(answers).reduce((acc, curr) => acc + curr.time, 0);
      const correctCount = quizQuestions.filter(q => answers[q.id]?.choice === q.correct).length;
      onFinish({
        answers,
        correctCount,
        totalTime,
        totalQuestions: quizQuestions.length
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col">
      {/* Top Bar */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 shrink-0">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {title}
          </span>
          <span className="text-gray-400 text-sm hidden md:inline">
            Q {currentIdx + 1} of {quizQuestions.length}
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 font-mono text-xl ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-gray-300'}`}>
            <Timer className="w-5 h-5" />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="border-white/10 text-gray-400 hover:text-white">
            Exit
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-white/5 shrink-0">
        <motion.div 
          className="h-full bg-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-12 flex flex-col items-center">
        <div className="max-w-4xl w-full">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 text-indigo-400 mb-4 font-medium uppercase tracking-widest text-xs">
              <span>{currentQ.topic}</span>
              <span>•</span>
              <span className={currentQ.difficulty === 'Hard' ? 'text-red-400' : currentQ.difficulty === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}>
                {currentQ.difficulty}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight text-center md:text-left mb-8">
              {currentQ.question}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.entries(currentQ.options) as [string, string][]).map(([key, value]) => {
                const isSelected = answers[currentQ.id]?.choice === key;
                const isCorrect = currentQ.correct === key;
                const showCorrect = showExplanation && isCorrect;
                const showWrong = showExplanation && isSelected && !isCorrect;

                return (
                  <button
                    key={key}
                    onClick={() => handleAnswer(key)}
                    disabled={showExplanation}
                    className={`
                      p-5 rounded-2xl border text-left flex items-center gap-4 transition-all
                      ${showCorrect ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : ''}
                      ${showWrong ? 'bg-red-600/20 border-red-500 text-red-400' : ''}
                      ${!showExplanation ? 'bg-white/5 border-white/10 hover:border-indigo-500 hover:bg-white/10' : ''}
                      ${showExplanation && !isSelected && !isCorrect ? 'opacity-40 border-white/5' : ''}
                    `}
                  >
                    <span className={`
                      w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0
                      ${showCorrect ? 'bg-emerald-500 text-white' : ''}
                      ${showWrong ? 'bg-red-500 text-white' : ''}
                      ${!showExplanation ? 'bg-white/10 text-gray-400 group-hover:bg-indigo-500 group-hover:text-white' : ''}
                      ${showExplanation && !isSelected && !isCorrect ? 'bg-white/5 text-gray-600' : ''}
                    `}>
                      {key}
                    </span>
                    <span className="text-lg font-medium">{value}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Explanation Panel */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300 }}
            className="bg-neutral-900 border-t border-white/10 p-6 md:p-8 shrink-0 z-10"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                <div className="flex items-center gap-4">
                  {answers[currentQ.id]?.choice === currentQ.correct ? (
                    <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full flex items-center gap-2 font-bold border border-emerald-500/20">
                      <CheckCircle2 className="w-5 h-5" /> Correct!
                    </div>
                  ) : (
                    <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full flex items-center gap-2 font-bold border border-red-500/20">
                      <XCircle className="w-5 h-5" /> Incorrect
                    </div>
                  )}
                  <div className="text-gray-400 text-sm font-mono">
                    Your time: {answers[currentQ.id]?.time}s | Avg: {currentQ.avgTimeSeconds}s
                  </div>
                </div>

                <Button onClick={nextQuestion} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 h-12 rounded-full">
                  {currentIdx + 1 === quizQuestions.length ? 'See Results' : 'Next Question'} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-2">Step-by-step Explanation</h4>
                  <p className="text-gray-300 leading-relaxed">{currentQ.explanation}</p>
                </div>
                <div>
                  <h4 className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-2">Shortcut Method</h4>
                  <p className="text-gray-300 leading-relaxed italic">"{currentQ.shortcut}"</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function AptitudePrepPage() {
  const [activeTab, setActiveTab] = useState<"practice" | "mock">("practice");
  const [quizState, setQuizState] = useState<{ open: boolean; title: string; questions: Question[] }>({ open: false, title: "", questions: [] });
  const [endResults, setEndResults] = useState<any>(null);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(false);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("placeiq_aptitude_scores");
    if (saved) setScores(JSON.parse(saved));
  }, []);

  const personalBests = useMemo(() => {
    const pb: Record<string, number> = {};
    scores.forEach(s => {
      if (!pb[s.topic] || s.score > pb[s.topic]) {
        pb[s.topic] = s.score;
      }
    });
    return pb;
  }, [scores]);

  const handleStartTopic = (topic: Topic) => {
    const questions = QUESTION_BANK.filter(q => q.topic === topic);
    setQuizState({ open: true, title: topic, questions });
  };

  const handleStartMock = (companyKey: keyof typeof COMPANY_TESTS) => {
    const config = COMPANY_TESTS[companyKey];
    const questions = config.questions.map(id => QUESTION_BANK.find(q => q.id === id)!);
    setQuizState({ open: true, title: config.name, questions });
  };

  const onQuizFinish = async (results: any) => {
    const accuracy = Math.round((results.correctCount / results.totalQuestions) * 100);
    
    // Identify weak topics
    const topicPerformance: Record<string, { correct: number, total: number }> = {};
    results.totalQuestions > 0 && quizState.questions.forEach((q, idx) => {
      if (!topicPerformance[q.topic]) topicPerformance[q.topic] = { correct: 0, total: 0 };
      topicPerformance[q.topic].total++;
      if (results.answers[q.id]?.choice === q.correct) {
        topicPerformance[q.topic].correct++;
      }
    });

    const weakTopics = Object.entries(topicPerformance)
      .filter(([_, stats]) => (stats.correct / stats.total) < 0.6)
      .map(([topic]) => topic);
    
    const strongTopics = Object.entries(topicPerformance)
      .filter(([_, stats]) => (stats.correct / stats.total) >= 0.6)
      .map(([topic]) => topic);

    const newScore: ScoreEntry = {
      id: Date.now(),
      name: "You",
      topic: quizState.title,
      score: results.correctCount,
      total: results.totalQuestions,
      accuracy,
      timeTaken: results.totalTime,
      date: new Date().toISOString(),
      weakTopics,
    };

    const updatedScores = [newScore, ...scores];
    setScores(updatedScores);
    localStorage.setItem("placeiq_aptitude_scores", JSON.stringify(updatedScores));
    
    setEndResults(results);
    setQuizState({ ...quizState, open: false });

    // AI Tips call
    if (weakTopics.length > 0) {
      setLoadingTips(true);
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are a placement aptitude coach." },
              { role: "user", content: `A placement student just completed an aptitude quiz.
                Weak topics (below 60%): ${weakTopics.join(', ')}
                Strong topics (above 60%): ${strongTopics.join(', ')}
                Overall score: ${results.correctCount}/${results.totalQuestions}
                
                Give specific, actionable study advice in 3 bullet points.
                Each bullet max 2 sentences. Be encouraging but direct.
                Return ONLY a JSON array: ["tip1", "tip2", "tip3"]` }
            ],
            temperature: 0.3,
            max_tokens: 800
          })
        });
        const data = await response.json();
        const text = data.choices[0].message.content;
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        setAiTips(parsed);
      } catch (e) {
        console.error("AI Tips failed", e);
      } finally {
        setLoadingTips(false);
      }
    }
  };

  const renderEndScreen = () => {
    if (!endResults) return null;
    const accuracy = Math.round((endResults.correctCount / endResults.totalQuestions) * 100);
    const rating = accuracy >= 80 ? { text: "Excellent 🏆", color: "text-yellow-400" } : accuracy >= 60 ? { text: "Good 👍", color: "text-blue-400" } : { text: "Needs Practice 📚", color: "text-red-400" };

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 bg-neutral-950 overflow-y-auto p-6 md:p-12"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-12">
             <h1 className="text-3xl font-bold">Quiz Results</h1>
             <Button variant="outline" onClick={() => setEndResults(null)}>Back to Home</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Score Card */}
            <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
               <div className="text-6xl font-black mb-2">{endResults.correctCount} / {endResults.totalQuestions}</div>
               <div className="text-xl font-bold text-gray-400 mb-6">{accuracy}% Accuracy</div>
               <div className={`text-2xl font-bold ${rating.color} px-6 py-2 bg-white/5 rounded-full border border-white/10`}>
                  {rating.text}
               </div>
               <div className="mt-8 text-gray-500 flex items-center gap-2">
                 <Timer className="w-4 h-4" /> Completed in {Math.floor(endResults.totalTime / 60)}m {endResults.totalTime % 60}s
               </div>
            </div>

            {/* Donut Chart */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="40" className="stroke-white/10 fill-none" strokeWidth="12" />
                   {/* Correct slice */}
                   <circle 
                    cx="50" cy="50" r="40" 
                    className="stroke-emerald-500 fill-none" 
                    strokeWidth="12" 
                    strokeDasharray={`${251.2 * (endResults.correctCount / endResults.totalQuestions)} 251.2`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-400">{endResults.correctCount}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Correct</span>
                </div>
              </div>
              <div className="mt-6 space-y-2 w-full text-sm">
                <div className="flex justify-between items-center text-emerald-400">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Correct</span>
                  <span>{endResults.correctCount}</span>
                </div>
                <div className="flex justify-between items-center text-red-400">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Wrong</span>
                  <span>{endResults.totalQuestions - endResults.correctCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Tips */}
          {(loadingTips || aiTips.length > 0) && (
            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-3xl p-8 mb-12 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4"><Sparkles className="w-8 h-8 text-indigo-400 opacity-20" /></div>
               <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-400">
                 <BotIcon className="w-6 h-6" /> 🤖 AI Study Tips
               </h2>
               {loadingTips ? (
                 <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-full"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3"></div>
                 </div>
               ) : (
                 <ul className="space-y-4">
                    {aiTips.map((tip, i) => (
                      <li key={i} className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold">{i+1}</div>
                        <p className="text-gray-200 leading-relaxed">{tip}</p>
                      </li>
                    ))}
                 </ul>
               )}
            </div>
          )}

          {/* Answer Review */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Review All Answers</h2>
            <div className="space-y-4">
               {quizState.questions.map((q, idx) => {
                 const userAns = endResults.answers[q.id]?.choice;
                 const isCorrect = userAns === q.correct;
                 const isExpanded = expandedReview === q.id;

                 return (
                   <div key={q.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                      <button 
                        onClick={() => setExpandedReview(isExpanded ? null : q.id)}
                        className="w-full p-6 text-left flex items-start justify-between gap-4"
                      >
                         <div className="flex-1">
                           <div className="flex items-center gap-3 mb-2">
                              <span className="text-gray-500 font-mono text-sm uppercase tracking-widest">Question {idx + 1}</span>
                              {isCorrect ? (
                                <span className="text-emerald-400 text-xs font-bold uppercase tracking-tighter bg-emerald-400/10 px-2 py-0.5 rounded">Correct</span>
                              ) : (
                                <span className="text-red-400 text-xs font-bold uppercase tracking-tighter bg-red-400/10 px-2 py-0.5 rounded">Incorrect</span>
                              )}
                           </div>
                           <p className="font-medium text-lg leading-snug line-clamp-2">{q.question}</p>
                         </div>
                         <ChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                             <div className="p-6 pt-0 border-t border-white/5 bg-black/20">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                                   {Object.entries(q.options).map(([k, v]) => (
                                     <div key={k} className={`p-4 rounded-xl border ${k === q.correct ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : k === userAns ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                                        <span className="font-bold mr-2">{k}.</span> {v}
                                     </div>
                                   ))}
                                </div>
                                <div className="space-y-4">
                                   <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl">
                                      <h4 className="text-indigo-400 text-xs font-bold uppercase mb-1">Explanation</h4>
                                      <p className="text-gray-300 text-sm">{q.explanation}</p>
                                   </div>
                                   <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
                                      <h4 className="text-emerald-400 text-xs font-bold uppercase mb-1">Shortcut</h4>
                                      <p className="text-gray-300 text-sm">{q.shortcut}</p>
                                   </div>
                                </div>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </div>
                 );
               })}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center pb-20">
             <Button onClick={() => handleStartTopic(quizState.questions[0].topic)} className="bg-indigo-600 hover:bg-indigo-500 text-white h-14 px-10 rounded-full text-lg">
                <RotateCcw className="w-5 h-5 mr-2" /> Try Again
             </Button>
             <Button onClick={() => setEndResults(null)} variant="outline" className="h-14 px-10 rounded-full text-lg border-white/10">
                Back to Topics
             </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 lg:p-12 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-900/20 rounded-full mix-blend-screen filter blur-[128px]"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full mix-blend-screen filter blur-[128px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-600/20">
               <Brain className="w-10 h-10 text-white" />
            </div>
            <div>
               <h1 className="text-4xl font-black tracking-tight">Aptitude Prep</h1>
               <p className="text-gray-400">Master every placement round with AI feedback.</p>
            </div>
          </div>
          
          <div className="flex gap-1 bg-white/5 p-1 rounded-2xl w-fit border border-white/10">
            <button 
              onClick={() => setActiveTab("practice")}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'practice' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-gray-400 hover:text-white'}`}
            >
              Topic Practice
            </button>
            <button 
              onClick={() => setActiveTab("mock")}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'mock' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-gray-400 hover:text-white'}`}
            >
              Company Mock Tests
            </button>
          </div>
        </header>

        {activeTab === "practice" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {TOPIC_CARDS.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ y: -5 }}
                className={`p-8 rounded-3xl border backdrop-blur-md transition-all group ${card.bg} ${card.border}`}
              >
                <div className={`mb-6 p-4 rounded-2xl bg-white/5 inline-block ${card.color}`}>
                  {card.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{card.name}</h3>
                <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 font-medium">
                  <BookOpen className="w-4 h-4" /> 15 Questions
                  {personalBests[card.id] !== undefined && (
                    <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded ml-auto flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> PB: {personalBests[card.id]}
                    </span>
                  )}
                </div>
                <Button 
                  onClick={() => handleStartTopic(card.id as Topic)}
                  className="w-full h-12 bg-white text-black hover:bg-gray-200 font-bold rounded-2xl"
                >
                  Start Practice <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
             {(Object.entries(COMPANY_TESTS) as [keyof typeof COMPANY_TESTS, typeof COMPANY_TESTS.TCS][]).map(([key, config]) => (
               <motion.div
                 key={key}
                 whileHover={{ scale: 1.02 }}
                 className="bg-black/40 border border-white/10 p-8 rounded-3xl flex flex-col h-full group"
                 style={{ borderTop: `4px solid ${config.color}` }}
               >
                  <h3 className="text-2xl font-black mb-4 group-hover:text-white transition-colors">{config.name}</h3>
                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                       <Timer className="w-4 h-4" /> {config.duration / 60} Minutes
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                       <Target className="w-4 h-4" /> {config.questions.length} Questions
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{config.description}</p>
                  </div>
                  <Button 
                    onClick={() => handleStartMock(key)}
                    className="w-full h-12 bg-white/10 hover:bg-white text-white hover:text-black border border-white/5 rounded-2xl font-bold transition-all"
                  >
                    Start Mock Test
                  </Button>
               </motion.div>
             ))}
          </div>
        )}

        {/* Leaderboard Section */}
        <section className="bg-black/20 border border-white/10 rounded-3xl p-8 md:p-12 mb-20 relative overflow-hidden">
           <div className="absolute bottom-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
              <div>
                <h2 className="text-3xl font-black flex items-center gap-3">
                   <Trophy className="w-8 h-8 text-yellow-500" /> Leaderboard
                </h2>
                <p className="text-gray-500 mt-1">Compare your scores with top performers.</p>
              </div>
           </div>

           <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-gray-500 text-sm font-bold uppercase tracking-widest border-b border-white/5">
                       <th className="pb-6 pr-4">Rank</th>
                       <th className="pb-6 pr-4">Name</th>
                       <th className="pb-6 pr-4">Topic</th>
                       <th className="pb-6 pr-4">Score</th>
                       <th className="pb-6 pr-4">Accuracy</th>
                       <th className="pb-6">Date</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {scores.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-20 text-center text-gray-600 font-medium text-lg">
                           Complete a quiz to appear here!
                        </td>
                      </tr>
                    ) : (
                      scores.sort((a,b) => b.accuracy - a.accuracy).slice(0, 10).map((score, idx) => (
                        <tr key={score.id} className={`group hover:bg-white/5 transition-colors ${score.name === 'You' ? 'bg-indigo-500/5' : ''}`}>
                           <td className="py-6 pr-4">
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-400 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'text-gray-500'}`}>
                                 {idx + 1}
                              </span>
                           </td>
                           <td className={`py-6 pr-4 font-bold ${score.name === 'You' ? 'text-indigo-400' : 'text-gray-300'}`}>
                              {score.name}
                           </td>
                           <td className="py-6 pr-4 text-gray-500">{score.topic}</td>
                           <td className="py-6 pr-4 font-mono font-bold text-lg">{score.score} / {score.total}</td>
                           <td className="py-6 pr-4">
                              <div className="flex items-center gap-3">
                                 <span className="font-bold text-gray-300">{score.accuracy}%</span>
                                 <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                                    <div className="h-full bg-emerald-500" style={{ width: `${score.accuracy}%` }}></div>
                                 </div>
                              </div>
                           </td>
                           <td className="py-6 text-gray-600 text-sm">
                              {new Date(score.date).toLocaleDateString()}
                           </td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        </section>
      </div>

      {/* Quiz Modal */}
      <QuizModal 
        isOpen={quizState.open}
        onClose={() => setQuizState({ ...quizState, open: false })}
        title={quizState.title}
        questions={quizState.questions}
        onFinish={onQuizFinish}
      />

      {/* End Screen */}
      {renderEndScreen()}
    </div>
  );
}

function BotIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
