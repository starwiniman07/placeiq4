"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Puzzle, 
  Database, 
  Package, 
  Settings, 
  Globe, 
  Coffee, 
  Terminal, 
  Cpu, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  RotateCcw, 
  Lightbulb, 
  Copy, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info,
  History,
  Timer,
  Search,
  Building2,
  Trophy,
  Code2,
  Sparkles,
  Loader2,
  ArrowRight,
  Menu,
  ChevronDown,
  ChevronUp,
  Zap,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { STATIC_MCQS, STATIC_PROBLEMS, STATIC_VIVA } from "@/lib/technicalData";
import { getProfile } from "@/lib/userStore";

// --- Constants & Types ---
const CORE_SUBJECTS = [
  { id: "DSA", name: "Data Structures & Algorithms", icon: <Puzzle className="w-5 h-5" />, color: "text-blue-400" },
  { id: "DBMS", name: "Database Management", icon: <Database className="w-5 h-5" />, color: "text-emerald-400" },
  { id: "OOPS", name: "Object Oriented Programming", icon: <Package className="w-5 h-5" />, color: "text-purple-400" },
  { id: "OS", name: "Operating Systems", icon: <Settings className="w-5 h-5" />, color: "text-amber-400" },
  { id: "CN", name: "Computer Networks", icon: <Globe className="w-5 h-5" />, color: "text-cyan-400" },
  { id: "Java", name: "Java", icon: <Coffee className="w-5 h-5" />, color: "text-red-400" },
  { id: "Python", name: "Python", icon: <Terminal className="w-5 h-5" />, color: "text-yellow-400" },
  { id: "WebDev", name: "Web Development", icon: <Cpu className="w-5 h-5" />, color: "text-pink-400" },
];

const DEPARTMENT_SUBJECTS: Record<string, any[]> = {
  "Civil Engineering": [
    { id: "Structural", name: "Structural Engineering", icon: <Building2 className="w-5 h-5" />, color: "text-blue-400" },
    { id: "Geotechnical", name: "Geotechnical Engineering", icon: <Globe className="w-5 h-5" />, color: "text-amber-400" },
    { id: "Transportation", name: "Transportation", icon: <ArrowRight className="w-5 h-5" />, color: "text-emerald-400" },
    { id: "Environmental", name: "Environmental Engineering", icon: <Coffee className="w-5 h-5" />, color: "text-green-400" },
  ],
  "Mechanical Engineering": [
    { id: "Thermodynamics", name: "Thermodynamics", icon: <Zap className="w-5 h-5" />, color: "text-red-400" },
    { id: "FluidMech", name: "Fluid Mechanics", icon: <Globe className="w-5 h-5" />, color: "text-blue-400" },
    { id: "TheoryMachines", name: "Theory of Machines", icon: <Settings className="w-5 h-5" />, color: "text-gray-400" },
    { id: "CAD", name: "CAD/CAM", icon: <Monitor className="w-5 h-5" />, color: "text-indigo-400" },
  ],
  "Chemical Engineering": [
    { id: "FluidFlow", name: "Fluid Flow", icon: <Globe className="w-5 h-5" />, color: "text-blue-400" },
    { id: "HeatTransfer", name: "Heat Transfer", icon: <Zap className="w-5 h-5" />, color: "text-red-400" },
    { id: "MassTransfer", name: "Mass Transfer", icon: <ArrowRight className="w-5 h-5" />, color: "text-purple-400" },
    { id: "ReactionEng", name: "Reaction Engineering", icon: <Cpu className="w-5 h-5" />, color: "text-amber-400" },
  ],
  "Biotechnology": [
    { id: "MolBio", name: "Molecular Biology", icon: <Search className="w-5 h-5" />, color: "text-emerald-400" },
    { id: "Biochem", name: "Biochemistry", icon: <Package className="w-5 h-5" />, color: "text-blue-400" },
    { id: "Bioprocess", name: "Bioprocess Eng.", icon: <Settings className="w-5 h-5" />, color: "text-amber-400" },
    { id: "Genetics", name: "Genetics", icon: <Database className="w-5 h-5" />, color: "text-purple-400" },
  ],
  "Electronics and Communication Engineering": [
    { id: "Analog", name: "Analog Electronics", icon: <Zap className="w-5 h-5" />, color: "text-red-400" },
    { id: "Digital", name: "Digital Electronics", icon: <Cpu className="w-5 h-5" />, color: "text-blue-400" },
    { id: "Microproc", name: "Microprocessors", icon: <Settings className="w-5 h-5" />, color: "text-amber-400" },
    { id: "Signals", name: "Signals & Systems", icon: <Globe className="w-5 h-5" />, color: "text-indigo-400" },
  ],
  "Electrical and Electronics Engineering": [
    { id: "PowerSys", name: "Power Systems", icon: <Zap className="w-5 h-5" />, color: "text-amber-400" },
    { id: "ControlSys", name: "Control Systems", icon: <Settings className="w-5 h-5" />, color: "text-blue-400" },
    { id: "Machines", name: "Electrical Machines", icon: <Cpu className="w-5 h-5" />, color: "text-gray-400" },
    { id: "PowerElec", name: "Power Electronics", icon: <Zap className="w-5 h-5" />, color: "text-red-400" },
  ],
};

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];
const COMPANIES = ["All", "Google", "Amazon", "Microsoft", "TCS", "Infosys", "Wipro", "Accenture"];

type Mode = "mcq" | "code" | "viva";

// --- Groq Helper ---
const groqCall = async (systemPrompt: string, userPrompt: string, maxTokens = 2000) => {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY_MISSING");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: maxTokens
    })
  });
  
  if (!response.ok) {
    if (response.status === 429) throw new Error("RATE_LIMIT");
    const errText = await response.text();
    console.error("Groq Error:", errText);
    throw new Error("GROQ_FETCH_FAILED");
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  return text.replace(/```json|```/g, "").trim();
};

// --- Components ---

const CodeEditor = ({ value, onChange, language }: { value: string; onChange: (v: string) => void; language: string }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleTab = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
    if (e.key === 'Enter') {
      const lines = value.substring(0, e.currentTarget.selectionStart).split('\n');
      const lastLine = lines[lines.length - 1];
      const match = lastLine.match(/^\s*/);
      const indent = match ? match[0] : '';
      if (indent) {
        setTimeout(() => {
          const start = textareaRef.current?.selectionStart || 0;
          const newValue = value.substring(0, start) + indent + value.substring(start);
          onChange(newValue);
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + indent.length;
            }
          }, 0);
        }, 0);
      }
    }
  };

  const lineCount = value.split('\n').length;

  return (
    <div className="flex-1 flex overflow-hidden bg-[#1a1a2e] rounded-xl border border-white/10 h-full">
      <div 
        ref={lineNumbersRef}
        className="w-12 bg-black/20 text-gray-500 font-mono text-xs py-4 flex flex-col items-center select-none border-r border-white/5 overflow-hidden"
      >
        {Array.from({ length: Math.max(30, lineCount + 10) }).map((_, i) => (
          <div key={i} className="h-6 leading-6 shrink-0">{i + 1}</div>
        ))}
      </div>
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleTab}
          onScroll={handleScroll}
          spellCheck={false}
          className="absolute inset-0 w-full h-full bg-transparent text-[#e0e0e0] font-mono text-sm p-4 outline-none resize-none leading-6 z-10 scrollbar-hide"
        />
      </div>
    </div>
  );
};

export default function TechnicalPrepPage() {
  // --- State ---
  const [userDept, setUserDept] = useState("");
  const subjects = useMemo(() => {
    if (!userDept) return CORE_SUBJECTS;
    if (DEPARTMENT_SUBJECTS[userDept]) return DEPARTMENT_SUBJECTS[userDept];
    return CORE_SUBJECTS;
  }, [userDept]);

  const [activeMode, setActiveMode] = useState<Mode>("mcq");
  const [activeSubject, setActiveSubject] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [company, setCompany] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // MCQ State
  const [mcqs, setMcqs] = useState<any[]>([]);
  const [answeredMcqs, setAnsweredMcqs] = useState<Record<string, any>>({});
  const [mcqPage, setMcqPage] = useState(1);
  const [mcqSummary, setMcqSummary] = useState<any>(null);

  // Code State
  const [problem, setProblem] = useState<any>(null);
  const [userCode, setUserCode] = useState("");
  const [selectedLang, setSelectedLang] = useState("python");
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [activeResultTab, setActiveResultTab] = useState("testcases");

  // Viva State
  const [vivaQuestions, setVivaQuestions] = useState<any[]>([]);
  const [selectedViva, setSelectedViva] = useState<any>(null);
  const [userVivaAnswer, setUserVivaAnswer] = useState("");
  const [vivaEvaluation, setVivaEvaluation] = useState<any>(null);
  const [showVivaAnswer, setShowVivaAnswer] = useState(false);

  const [hasSavedCode, setHasSavedCode] = useState(false);

  // --- Effects ---
  useEffect(() => {
    const profile = getProfile();
    if (profile && profile.department) {
      setUserDept(profile.department);
    }
  }, []);

  useEffect(() => {
    if (subjects.length > 0 && !activeSubject) {
      setActiveSubject(subjects[0].id);
    }
  }, [subjects, activeSubject]);

  useEffect(() => {
    if (activeSubject) fetchContent();
  }, [activeSubject, difficulty, company, activeMode]);

  useEffect(() => {
    // Load saved code
    const key = `placeiq_code_${activeSubject}_${selectedLang}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setUserCode(saved);
      setHasSavedCode(true);
      setTimeout(() => setHasSavedCode(false), 5000);
    } else if (problem) {
      setUserCode(problem.starterCode[selectedLang] || "");
      setHasSavedCode(false);
    }
  }, [selectedLang, problem, activeSubject]);

  useEffect(() => {
    // Auto-save code
    const interval = setInterval(() => {
      if (userCode) {
        localStorage.setItem(`placeiq_code_${activeSubject}_${selectedLang}`, userCode);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [userCode, activeSubject, selectedLang]);

  // --- Logic ---

  const fetchContent = async (loadMore = false) => {
    setLoading(true);
    setError("");

    // --- Static Fallback Logic (Instant Load) ---
    if (!loadMore) {
      if (activeMode === "mcq" && STATIC_MCQS[activeSubject]) {
        setMcqs(STATIC_MCQS[activeSubject]);
        setLoading(false);
        return;
      }
      if (activeMode === "code" && STATIC_PROBLEMS[activeSubject]) {
        setProblem(STATIC_PROBLEMS[activeSubject]);
        setReviewResult(null);
        setHintsRevealed(0);
        setLoading(false);
        return;
      }
      if (activeMode === "viva" && STATIC_VIVA[activeSubject]) {
        setVivaQuestions(STATIC_VIVA[activeSubject]);
        setSelectedViva(null);
        setVivaEvaluation(null);
        setLoading(false);
        return;
      }
    }

    try {
      const cacheKey = `groq_${activeMode}_${activeSubject}_${difficulty}_${company}_${loadMore ? mcqPage + 1 : 1}`;
      const cached = sessionStorage.getItem(cacheKey);
      
      if (cached && !loadMore) {
        const parsed = JSON.parse(cached);
        if (activeMode === "mcq") setMcqs(parsed);
        if (activeMode === "code") {
           setProblem(parsed);
           setReviewResult(null);
           setHintsRevealed(0);
        }
        if (activeMode === "viva") setVivaQuestions(parsed);
        setLoading(false);
        return;
      }

      if (activeMode === "mcq") {
        const sys = "You are a technical interview expert. Return ONLY JSON array.";
        const user = `Generate 5 unique ${activeSubject} MCQs. Difficulty: ${difficulty}. Format: [ { "id": "...", "question": "...", "options": { "A": "...", "B": "...", "C": "...", "D": "..." }, "correct": "A", "explanation": "...", "topic": "...", "difficulty": "..." } ]`;
        
        const raw = await groqCall(sys, user);
        const parsed = JSON.parse(raw);
        const newList = loadMore ? [...mcqs, ...parsed] : parsed;
        setMcqs(newList);
        sessionStorage.setItem(cacheKey, JSON.stringify(newList));
        if (loadMore) setMcqPage(p => p + 1);
      }

      if (activeMode === "code") {
        const sys = "Senior SDE problem creator. Return ONLY JSON.";
        const user = `Create coding challenge for ${activeSubject}. Format: { "title": "...", "problemStatement": "...", "starterCode": { "python": "...", "javascript": "...", "java": "...", "cpp": "..." }, "testCases": [ { "input": "...", "expectedOutput": "..." } ], "hints": ["..."], "topic": "...", "difficulty": "..." }`;
        
        const raw = await groqCall(sys, user);
        const parsed = JSON.parse(raw);
        setProblem(parsed);
        setReviewResult(null);
        setHintsRevealed(0);
        sessionStorage.setItem(cacheKey, JSON.stringify(parsed));
      }

      if (activeMode === "viva") {
        const sys = "Technical interviewer. Return ONLY JSON array.";
        const user = `Generate 8 viva questions for ${activeSubject}. Format: [ { "id": "...", "question": "...", "expectedAnswer": "...", "topic": "...", "companies": ["..."], "keyPoints": ["..."] } ]`;
        
        const raw = await groqCall(sys, user);
        const parsed = JSON.parse(raw);
        setVivaQuestions(parsed);
        setSelectedViva(null);
        setVivaEvaluation(null);
        sessionStorage.setItem(cacheKey, JSON.stringify(parsed));
      }
    } catch (err: any) {
      if (err.message === "RATE_LIMIT") {
        setError("AI Rate limit reached. Using static questions...");
        // If AI fails and we don't have static data yet, use a generic fallback
        if (mcqs.length === 0 && vivaQuestions.length === 0 && !problem) {
           setError("AI Busy. Please try a standard topic (DSA, DBMS) for instant access.");
        }
      } else {
        setError("Connection issue. Showing available practice material.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMcqAnswer = async (qId: string, choice: string) => {
    if (answeredMcqs[qId]) return;
    const newAnswered = { ...answeredMcqs, [qId]: { choice, time: 0 } };
    setAnsweredMcqs(newAnswered);

    // If 5 answers done, show summary
    const count = Object.keys(newAnswered).length;
    if (count % 5 === 0) {
      setLoading(true);
      try {
        const batch = mcqs.slice(count - 5, count);
        const results = batch.map(m => ({ 
          q: m.question, 
          correct: m.correct, 
          user: newAnswered[m.id].choice, 
          passed: m.correct === newAnswered[m.id].choice 
        }));
        
        const sys = "You are a placement coach.";
        const user = `Student answered 5 ${activeSubject} MCQs. Results: ${JSON.stringify(results)}. Return ONLY JSON: { "score": number, "accuracy": "...", "strongTopics": ["..."], "weakTopics": ["..."], "tip": "..." }`;
        const raw = await groqCall(sys, user, 500);
        setMcqSummary(JSON.parse(raw));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRunCode = async () => {
    if (!userCode || !problem) return;
    setLoading(true);
    setReviewResult(null);
    try {
      const sys = "You are an expert code reviewer and algorithm specialist. Analyze code thoroughly. Return ONLY valid JSON, no markdown.";
      const user = `Review this ${selectedLang} solution for: ${problem.title}. 
        Problem: ${problem.problemStatement}. 
        Expected O: ${problem.timeComplexityExpected}. 
        Test Cases: ${JSON.stringify(problem.testCases)}.
        Student's Code: ${userCode}
        Return ONLY JSON: { "verdict": "Correct"|"Wrong Answer"|..., "overallScore": 0-100, "testResults": [...], "timeComplexity": {...}, "spaceComplexity": {...}, "codeQuality": {...}, "lineFeedback": [...], "improvedCode": "...", "explanation": "...", "alternativeApproach": "...", "nextSteps": "..." }`;
      
      const raw = await groqCall(sys, user, 3000);
      setReviewResult(JSON.parse(raw));
      setActiveResultTab("testcases");
    } catch (err) {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateViva = async () => {
    if (!userVivaAnswer || !selectedViva) return;
    setLoading(true);
    try {
      const sys = "You are a technical interviewer evaluating a viva answer.";
      const user = `Question: ${selectedViva.question}
        Expected: ${selectedViva.expectedAnswer}
        Student's: ${userVivaAnswer}
        Return ONLY JSON: { "score": 0-10, "verdict": "...", "pointsCovered": ["..."], "pointsMissed": ["..."], "feedback": "...", "improvedAnswer": "..." }`;
      
      const raw = await groqCall(sys, user, 1000);
      setVivaEvaluation(JSON.parse(raw));
    } catch (err) {
      setError("Evaluation failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- Sub-renders ---

  const renderMCQs = () => (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {mcqs.map((q, idx) => {
          const ans = answeredMcqs[q.id];
          return (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (idx % 5) * 0.1 }}
              className="bg-black/40 border border-white/10 p-6 rounded-3xl relative overflow-hidden group"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {q.topic}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${q.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {q.difficulty}
                </span>
              </div>
              
              <p className="text-lg font-bold mb-6 leading-snug">{q.question}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(q.options).map(([k, v]: [any, any]) => {
                  const isCorrect = k === q.correct;
                  const isSelected = ans?.choice === k;
                  return (
                    <button
                      key={k}
                      disabled={!!ans}
                      onClick={() => handleMcqAnswer(q.id, k)}
                      className={`
                        p-4 rounded-xl border text-left flex items-center gap-3 transition-all
                        ${!ans ? 'bg-white/5 border-white/5 hover:border-indigo-500/50 hover:bg-white/10' : ''}
                        ${ans && isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : ''}
                        ${ans && isSelected && !isCorrect ? 'bg-red-500/20 border-red-500 text-red-400' : ''}
                        ${ans && !isSelected && !isCorrect ? 'opacity-40 grayscale-[0.5]' : ''}
                      `}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${ans && isCorrect ? 'bg-emerald-500 text-white' : ans && isSelected ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-500'}`}>
                        {k}
                      </span>
                      <span className="text-sm">{v}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {ans && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mt-6 pt-6 border-t border-white/5 overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                       {ans.choice === q.correct ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                       <span className={`text-sm font-bold ${ans.choice === q.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                         {ans.choice === q.correct ? 'Correct!' : 'Incorrect'}
                       </span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed italic">{q.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {mcqSummary && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-indigo-600/20 border border-indigo-500/30 p-8 rounded-3xl text-center max-w-2xl mx-auto">
           <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
           <h3 className="text-2xl font-black mb-2">Quiz Summary</h3>
           <div className="text-4xl font-black text-indigo-400 mb-6">{mcqSummary.score} / 5</div>
           <p className="text-gray-300 mb-6">{mcqSummary.tip}</p>
           <div className="flex justify-center gap-4">
              <Button onClick={() => setMcqSummary(null)} className="bg-indigo-600 hover:bg-indigo-500">Continue Practice</Button>
           </div>
        </motion.div>
      )}

      {loading && mcqs.length > 0 && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      )}

      {!loading && !mcqSummary && (
        <div className="flex justify-center py-12">
          <Button onClick={() => fetchContent(true)} variant="outline" className="border-white/10 hover:bg-white/5">
            Load 5 More Questions
          </Button>
        </div>
      )}
    </div>
  );

  const renderCode = () => {
    if (!problem) return null;
    return (
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)] min-h-[600px]">
        {/* Left: Problem */}
        <div className="flex-1 bg-black/40 border border-white/10 rounded-3xl p-6 overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full">{problem.topic}</span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${problem.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{problem.difficulty}</span>
          </div>
          <h2 className="text-3xl font-black mb-6 leading-tight">{problem.title}</h2>
          
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>{problem.problemStatement}</p>
            
            <div>
               <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-indigo-400" /> Input Format</h4>
               <p className="text-sm bg-white/5 p-3 rounded-lg border border-white/5">{problem.inputFormat}</p>
            </div>
            
            <div>
               <h4 className="text-white font-bold mb-2 flex items-center gap-2"><ArrowRight className="w-4 h-4 text-indigo-400" /> Output Format</h4>
               <p className="text-sm bg-white/5 p-3 rounded-lg border border-white/5">{problem.outputFormat}</p>
            </div>

            <div>
               <h4 className="text-white font-bold mb-2">Constraints</h4>
               <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                  {problem.constraints.map((c: any, i: number) => <li key={i}>{c}</li>)}
               </ul>
            </div>

            <div className="space-y-4">
               {problem.examples.map((ex: any, i: number) => (
                 <div key={i} className="bg-black/20 border border-white/5 p-4 rounded-xl">
                    <div className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-widest">Example {i+1}</div>
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                       <div><div className="text-gray-500 mb-1">Input:</div> <div className="bg-white/5 p-2 rounded">{ex.input}</div></div>
                       <div><div className="text-gray-500 mb-1">Output:</div> <div className="bg-white/5 p-2 rounded">{ex.output}</div></div>
                    </div>
                    {ex.explanation && <p className="mt-3 text-xs text-gray-500 italic">{ex.explanation}</p>}
                 </div>
               ))}
            </div>

            <div className="pt-6">
               <div className="flex gap-2">
                  {problem.hints.slice(0, hintsRevealed + 1).map((h: any, i: number) => (
                    <div key={i} className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-sm mb-2 w-full">
                       <span className="text-yellow-500 font-bold block mb-1">Hint {i+1}</span>
                       {h}
                    </div>
                  ))}
               </div>
               {hintsRevealed < problem.hints.length - 1 && (
                 <Button onClick={() => setHintsRevealed(h => h + 1)} variant="outline" className="mt-2 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 text-xs h-8">
                   <Lightbulb className="w-3 h-3 mr-2" /> Show Next Hint
                 </Button>
               )}
            </div>
          </div>
        </div>

        {/* Right: Editor */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-2 flex items-center justify-between">
            <div className="flex gap-1">
              {['python', 'javascript', 'java', 'cpp'].map(lang => (
                <button 
                  key={lang}
                  onClick={() => setSelectedLang(lang)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${selectedLang === lang ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-white/5'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <Button onClick={() => setUserCode(problem.starterCode[selectedLang] || "")} variant="ghost" className="h-8 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
               <RotateCcw className="w-3 h-3 mr-2" /> Reset
            </Button>
          </div>

          <div className="flex-1 relative group">
             <CodeEditor value={userCode} onChange={setUserCode} language={selectedLang} />
             <AnimatePresence>
                {hasSavedCode && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 z-20">
                     <History className="w-3 h-3" /> Auto-saved code loaded
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          <div className="flex gap-4">
             <Button 
                onClick={handleRunCode} 
                disabled={loading || !userCode}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 h-12 rounded-xl text-lg font-bold"
             >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                Run & Review Solution
             </Button>
             <Button onClick={() => fetchContent()} variant="outline" className="border-white/10 h-12 px-6 rounded-xl">
                <ArrowRight className="w-5 h-5" />
             </Button>
          </div>
        </div>
        
        {/* Results Panel */}
        <AnimatePresence>
          {reviewResult && (
            <motion.div 
              initial={{ y: 500 }} animate={{ y: 0 }} exit={{ y: 500 }}
              className="fixed bottom-0 left-0 lg:left-[240px] right-0 bg-neutral-900 border-t border-white/10 z-30 max-h-[70vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
                 <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border ${
                    reviewResult.verdict === 'Correct' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 
                    reviewResult.verdict === 'Inefficient' ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-red-500/10 border-red-500 text-red-400'
                 }`}>
                    {reviewResult.verdict === 'Correct' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span className="font-black text-lg">{reviewResult.verdict}</span>
                    <span className="opacity-50 mx-1">|</span>
                    <span className="font-bold">Score: {reviewResult.overallScore}</span>
                 </div>
                 <Button variant="ghost" onClick={() => setReviewResult(null)} className="text-gray-500"><XCircle /></Button>
              </div>

              <div className="flex bg-black/20 shrink-0">
                 {['testcases', 'complexity', 'quality', 'improvement', 'next'].map(tab => (
                   <button 
                    key={tab} 
                    onClick={() => setActiveResultTab(tab)}
                    className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeResultTab === tab ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500'}`}
                   >
                     {tab}
                   </button>
                 ))}
              </div>

              <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                {activeResultTab === 'testcases' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold mb-4">Test Results</h3>
                    <div className="space-y-2">
                       {reviewResult.testResults.map((tr: any, i: number) => (
                         <div key={i} className={`p-4 rounded-xl border flex items-center justify-between ${tr.passed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                            <div className="flex gap-8">
                               <div><div className="text-[10px] text-gray-500 uppercase font-bold">Input</div><div className="font-mono text-xs">{tr.input}</div></div>
                               <div><div className="text-[10px] text-gray-500 uppercase font-bold">Expected</div><div className="font-mono text-xs">{tr.expectedOutput}</div></div>
                               <div><div className="text-[10px] text-gray-500 uppercase font-bold">Yours</div><div className="font-mono text-xs text-indigo-400">{tr.yourOutput}</div></div>
                            </div>
                            {tr.passed ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />}
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {activeResultTab === 'complexity' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                        <h4 className="text-gray-500 text-xs font-bold uppercase mb-4">Time Complexity</h4>
                        <div className="text-3xl font-black mb-2 text-indigo-400">{reviewResult.timeComplexity.actual}</div>
                        <div className="text-sm text-gray-400 mb-4">Expected: {reviewResult.timeComplexity.expected}</div>
                        <p className="text-sm text-gray-300 leading-relaxed">{reviewResult.timeComplexity.explanation}</p>
                     </div>
                     <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                        <h4 className="text-gray-500 text-xs font-bold uppercase mb-4">Space Complexity</h4>
                        <div className="text-3xl font-black mb-2 text-emerald-400">{reviewResult.spaceComplexity.actual}</div>
                        <div className="text-sm text-gray-400 mb-4">Expected: {reviewResult.spaceComplexity.expected}</div>
                        <p className="text-sm text-gray-300 leading-relaxed">{reviewResult.spaceComplexity.explanation}</p>
                     </div>
                  </div>
                )}

                {activeResultTab === 'quality' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <div className="flex items-center justify-between mb-4">
                           <h4 className="text-gray-500 text-xs font-bold uppercase">Code Quality Score</h4>
                           <span className="text-2xl font-black text-indigo-400">{reviewResult.codeQuality.score}/10</span>
                        </div>
                        <div className="space-y-3">
                           {reviewResult.codeQuality.issues.map((issue: string, i: number) => (
                             <div key={i} className="flex gap-2 text-sm text-red-400"><XCircle className="w-4 h-4 shrink-0 mt-0.5" /> {issue}</div>
                           ))}
                           {reviewResult.codeQuality.positives.map((pos: string, i: number) => (
                             <div key={i} className="flex gap-2 text-sm text-emerald-400"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> {pos}</div>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-gray-500 text-xs font-bold uppercase">Line-by-line Feedback</h4>
                        {reviewResult.lineFeedback.map((lf: any, i: number) => (
                          <div key={i} className="bg-white/5 p-3 rounded-lg border-l-4 border-amber-500">
                             <div className="text-[10px] font-bold text-amber-500 mb-1">Line {lf.lineNumber}</div>
                             <div className="text-xs text-gray-200 mb-1">{lf.issue}</div>
                             <div className="text-[10px] text-gray-500 italic">{lf.suggestion}</div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}

                {activeResultTab === 'improvement' && (
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">Optimized Solution</h3>
                        <Button onClick={() => { setUserCode(reviewResult.improvedCode); setReviewResult(null); }} className="bg-indigo-600 h-8 text-xs">Apply to Editor</Button>
                     </div>
                     <div className="bg-[#1a1a2e] p-6 rounded-2xl border border-white/10 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre">
                        {reviewResult.improvedCode}
                     </div>
                     <div className="bg-white/5 p-6 rounded-2xl">
                        <h4 className="text-indigo-400 text-xs font-bold uppercase mb-2">Alternative Approach</h4>
                        <p className="text-sm text-gray-300 leading-relaxed">{reviewResult.alternativeApproach}</p>
                     </div>
                  </div>
                )}

                {activeResultTab === 'next' && (
                  <div className="text-center max-w-2xl mx-auto py-8">
                     <History className="w-16 h-16 text-indigo-400 mx-auto mb-6 opacity-20" />
                     <h3 className="text-2xl font-black mb-4">Road to Improvement</h3>
                     <p className="text-gray-400 mb-8 leading-relaxed">{reviewResult.nextSteps}</p>
                     <div className="flex flex-wrap justify-center gap-3">
                        {['Recursion', 'Backtracking', 'Time Complexity Analysis'].map(topic => (
                          <button key={topic} className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-all">
                             {topic}
                          </button>
                        ))}
                     </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderViva = () => (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-250px)]">
      {/* Left: Question List */}
      <div className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide">
        {vivaQuestions.map((v, idx) => (
          <button
            key={v.id}
            onClick={() => { setSelectedViva(v); setUserVivaAnswer(""); setVivaEvaluation(null); setShowVivaAnswer(false); }}
            className={`
              p-6 rounded-3xl border text-left transition-all
              ${selectedViva?.id === v.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20' : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'}
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${v.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {v.difficulty}
              </span>
            </div>
            <p className="font-bold leading-snug line-clamp-2">{v.question}</p>
          </button>
        ))}
        <Button onClick={() => fetchContent(true)} variant="ghost" className="text-gray-500 h-16 rounded-3xl border-2 border-dashed border-white/5">
           Load More Questions
        </Button>
      </div>

      {/* Right: Workspace */}
      <div className="flex-1 bg-black/40 border border-white/10 rounded-[40px] p-8 md:p-12 overflow-y-auto scrollbar-hide">
        {selectedViva ? (
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            <motion.div key={selectedViva.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
               <div className="flex items-center gap-3 text-indigo-400 mb-6 font-bold uppercase tracking-widest text-xs">
                  <span>{selectedViva.topic}</span>
                  <span>•</span>
                  <span>{selectedViva.companies.join(', ')}</span>
               </div>
               <h2 className="text-3xl md:text-4xl font-black mb-12 leading-tight">
                 {selectedViva.question}
               </h2>
               
               <div className="space-y-8 flex-1">
                 <div>
                    <h4 className="text-white font-bold mb-4">Your Answer</h4>
                    <textarea 
                      value={userVivaAnswer}
                      onChange={(e) => setUserVivaAnswer(e.target.value)}
                      placeholder="Type how you would explain this to an interviewer..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 h-40 text-gray-200 outline-none focus:border-indigo-500 transition-all resize-none"
                    />
                 </div>

                 <div className="flex gap-4">
                    <Button 
                      onClick={handleEvaluateViva} 
                      disabled={loading || !userVivaAnswer}
                      className="bg-indigo-600 hover:bg-indigo-500 h-14 px-8 rounded-2xl font-bold flex-1"
                    >
                      {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                      Evaluate My Answer
                    </Button>
                    <Button 
                      onClick={() => setShowVivaAnswer(!showVivaAnswer)} 
                      variant="outline" 
                      className="h-14 px-8 rounded-2xl border-white/10 font-bold"
                    >
                      {showVivaAnswer ? 'Hide Solution' : 'Show Solution'}
                    </Button>
                 </div>

                 <AnimatePresence>
                   {showVivaAnswer && (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-8 border-t border-white/10">
                        <div>
                           <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Expected Explanation</h4>
                           <p className="text-gray-300 leading-relaxed">{selectedViva.expectedAnswer}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div>
                              <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">Key Points to Cover</h4>
                              <div className="space-y-2">
                                 {selectedViva.keyPoints.map((p: string, i: number) => (
                                   <div key={i} className="flex gap-3 text-sm text-gray-400"><CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" /> {p}</div>
                                 ))}
                              </div>
                           </div>
                           <div>
                              <h4 className="text-red-400 text-xs font-bold uppercase tracking-widest mb-3">Common Mistakes</h4>
                              <div className="space-y-2">
                                 {selectedViva.commonMistakes.map((m: string, i: number) => (
                                   <div key={i} className="flex gap-3 text-sm text-gray-400"><XCircle className="w-4 h-4 text-red-500 shrink-0" /> {m}</div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>

                 {vivaEvaluation && (
                   <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-indigo-600/10 border border-indigo-500/30 p-8 rounded-[32px] mt-8">
                      <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-4">
                            <div className="text-4xl font-black text-indigo-400">{vivaEvaluation.score}/10</div>
                            <div>
                               <div className="font-black text-xl">{vivaEvaluation.verdict}</div>
                               <div className="text-gray-500 text-sm">Groq AI Evaluation</div>
                            </div>
                         </div>
                         <History className="w-10 h-10 text-indigo-500 opacity-20" />
                      </div>
                      <p className="text-gray-300 mb-6 italic">"{vivaEvaluation.feedback}"</p>
                      <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                               <h4 className="text-emerald-400 text-[10px] font-bold uppercase mb-2">Points Covered</h4>
                               {vivaEvaluation.pointsCovered.map((p: string, i: number) => <div key={i} className="text-xs text-gray-400 flex gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full mt-1.5 shrink-0" /> {p}</div>)}
                            </div>
                            <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20">
                               <h4 className="text-red-400 text-[10px] font-bold uppercase mb-2">Points Missed</h4>
                               {vivaEvaluation.pointsMissed.map((p: string, i: number) => <div key={i} className="text-xs text-gray-400 flex gap-2"><div className="w-1 h-1 bg-red-500 rounded-full mt-1.5 shrink-0" /> {p}</div>)}
                            </div>
                         </div>
                         <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                            <h4 className="text-indigo-400 text-xs font-bold uppercase mb-3">Model Answer</h4>
                            <p className="text-sm text-gray-200 leading-relaxed">{vivaEvaluation.improvedAnswer}</p>
                         </div>
                      </div>
                   </motion.div>
                 )}
               </div>
            </motion.div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
             <MessageSquareMoreIcon className="w-20 h-20 mb-6" />
             <h3 className="text-2xl font-black mb-2">Select a Question</h3>
             <p className="text-gray-500">Pick a topic from the left to start practicing viva answers.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'w-full lg:w-[280px]' : 'w-0 overflow-hidden'}
        bg-neutral-950 border-r border-white/10 flex flex-col transition-all duration-300 relative z-40
      `}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">T</div>
             <span className="font-black text-lg tracking-tight">Tech Prep</span>
           </div>
           <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
              <XCircle />
           </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
           {subjects.map((s) => (
             <button
               key={s.id}
               onClick={() => setActiveSubject(s.id)}
               className={`
                 w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group
                 ${activeSubject === s.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
               `}
             >
                <div className={`p-2 rounded-lg transition-colors ${activeSubject === s.id ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500 group-hover:text-indigo-400'}`}>
                   {s.icon}
                </div>
                <div className="flex-1 text-left">
                   <div className="text-sm font-bold truncate">{s.name}</div>
                   <div className="text-[10px] opacity-50 flex items-center gap-2">
                      <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-white/50" style={{ width: '30%' }}></div>
                      </div>
                   </div>
                </div>
             </button>
           ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Toggle Button */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-6 left-6 z-50 p-2 bg-indigo-600 text-white rounded-xl shadow-lg"
          >
            <Menu />
          </button>
        )}

        {/* Top Header */}
        <header className="p-6 lg:px-12 pt-12 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex gap-1 bg-white/5 p-1 rounded-2xl w-fit border border-white/10">
               {(["mcq", "code", "viva"] as Mode[]).map(mode => (
                 <button 
                  key={mode} 
                  onClick={() => setActiveMode(mode)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeMode === mode ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                 >
                   {mode === 'mcq' ? 'MCQ Practice' : mode === 'code' ? 'Code Challenges' : 'Interview Bank'}
                 </button>
               ))}
            </div>

            <div className="flex flex-wrap gap-4">
               <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Difficulty</span>
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="bg-transparent text-sm font-bold outline-none text-indigo-400 cursor-pointer"
                  >
                    {DIFFICULTIES.map(d => <option key={d} value={d} className="bg-neutral-900">{d}</option>)}
                  </select>
               </div>
               <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <select 
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)}
                    className="bg-transparent text-sm font-bold outline-none text-indigo-400 cursor-pointer"
                  >
                    {COMPANIES.map(c => <option key={c} value={c} className="bg-neutral-900">{c}</option>)}
                  </select>
               </div>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center justify-between gap-4">
               <div className="flex items-center gap-3 text-red-400">
                  <AlertTriangle />
                  <span className="font-bold">{error}</span>
               </div>
               <Button onClick={() => fetchContent()} variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">Retry</Button>
            </motion.div>
          )}
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-12 scrollbar-hide">
           {loading && !mcqs.length && !problem && !vivaQuestions.length ? (
             <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="relative">
                   <div className="w-20 h-20 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                   <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-500 animate-pulse" />
                </div>
                <div className="text-center">
                   <p className="text-2xl font-black mb-2 animate-pulse">Generating Live Content...</p>
                   <p className="text-gray-500 text-sm">Powered by Groq + Llama 3.3 • Tailoring to your difficulty</p>
                </div>
             </div>
           ) : (
             <>
               {activeMode === "mcq" && renderMCQs()}
               {activeMode === "code" && renderCode()}
               {activeMode === "viva" && renderViva()}
             </>
           )}
        </div>
      </main>
    </div>
  );
}

function MessageSquareMoreIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 9h8"/><path d="M8 13h6"/><path d="M18 4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z"/></svg>
  )
}
