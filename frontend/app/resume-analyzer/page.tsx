"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Upload, 
  Zap, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Target, 
  Trophy, 
  Search, 
  Download, 
  RotateCcw, 
  ChevronRight, 
  ArrowRight, 
  Clock, 
  BookOpen, 
  Award, 
  Layout, 
  Sparkles,
  ClipboardCheck,
  History,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { saveResumeScore, ResumeScore } from "@/lib/userStore";
import { useRouter } from "next/navigation";

// --- Types ---
interface AnalysisResult {
  atsScore: number;
  atsSummary: string;
  overallAdvice: string;
  currentStrengths: { strength: string; impact: string }[];
  grammarErrors: { error: string; correction: string; context: string }[];
  formattingIssues: { issue: string; fix: string }[];
  missingKeywords: { keyword: string; importance: "Critical" | "High" | "Medium"; reason: string; whereToAdd: string }[];
  projectRewrites: { original: string; improved: string; whyBetter: string }[];
  sectionScores: Record<string, number>;
  companyCultureFit: string;
}

interface GapAnalysis {
  gapSummary: string;
  criticalMissing: { category: string; item: string; priority: "Must Have" | "Should Have" | "Nice to Have"; howToGet: string; timeToAcquire: string; freeResources: string[] }[];
  skillsToAdd: { skill: string; currentLevel: string; requiredLevel: string; learningPath: string; projectIdea: string }[];
  projectsToAdd: { projectTitle: string; description: string; techStack: string[]; whyItMatters: string; estimatedTime: string; githubTips: string }[];
  certificationsToAdd: { certification: string; provider: string; cost: string; duration: string; impact: string }[];
  experienceToAdd: { type: string; description: string; howToFind: string; timeCommitment: string }[];
  resumeSectionsToAdd: { section: string; reason: string; template: string }[];
  "30DayActionPlan": { week: number; focus: string; tasks: string[]; milestone: string }[];
  bulletPointsToAdd: { section: string; bulletPoint: string; placementTip: string }[];
}

// --- Groq Helper ---
const groqCall = async (systemPrompt: string, userPrompt: string, maxTokens = 3000) => {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY_MISSING");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
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
  });
  
  if (!response.ok) {
    if (response.status === 429) throw new Error("RATE_LIMIT");
    throw new Error("GROQ_FETCH_FAILED");
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  
  // Extract JSON from response
  let jsonStr = text;
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  
  if (match) {
    jsonStr = match[1];
  } else {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = text.substring(firstBrace, lastBrace + 1);
    }
  }
  
  try {
    // Test parsing to ensure we extracted correctly before returning
    JSON.parse(jsonStr);
  } catch (e) {
    console.error("Groq JSON Parse Failed:", e.message);
    console.error("Extracted String:", jsonStr);
    console.error("Raw Text:", text);
    throw new Error("INVALID_JSON_RESPONSE");
  }
  
  return jsonStr;
};

export default function ResumeAnalyzerPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState("add");
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});
  const [actionPlanProgress, setActionPlanProgress] = useState<Record<string, boolean>>({});
  const [prevAnalysis, setPrevAnalysis] = useState<any>(null);

  // --- PDF.js Loading ---
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      // @ts-ignore
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    };
    document.head.appendChild(script);

    // Load prev analysis
    const saved = localStorage.getItem("placeiq_resume_result");
    if (saved) setPrevAnalysis(JSON.parse(saved));

    // Load action plan progress
    const savedPlan = localStorage.getItem("placeiq_resume_actionplan_progress");
    if (savedPlan) setActionPlanProgress(JSON.parse(savedPlan));
  }, []);

  const extractTextFromPDF = async (file: File) => {
    // @ts-ignore
    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) throw new Error("PDFJS_NOT_LOADED");

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    let totalChars = 0;
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
      totalChars += pageText.length;
    }
    
    if (totalChars < 100) throw new Error('SCANNED_PDF');
    return fullText.trim();
  };

  const runAudit = async (retryCount = 0) => {
    if (!file || !targetRole) return;
    setLoading(true);
    setError("");
    setProgress(0);
    
    try {
      // Step 1: Read PDF
      setLoadingStep("📄 Reading your PDF...");
      setProgress(15);
      const text = await extractTextFromPDF(file);
      
      // Step 2: Extracting content
      setLoadingStep("🔍 Extracting resume content...");
      setProgress(35);
      
      // Step 3: Call Groq 1
      setLoadingStep("🤖 Groq is analyzing your resume...");
      setProgress(55);
      
      const sys1 = "You are a senior ATS expert, technical recruiter, and resume coach specializing in Indian tech placements. Return ONLY valid JSON. No markdown.";
      const user1 = `Analyze this resume for the target role: "${targetRole}"\n\nRESUME TEXT:\n${text}\n\nReturn EXACTLY this JSON structure: { "atsScore": 0-100, "atsSummary": "...", "overallAdvice": "...", "currentStrengths": [{ "strength": "...", "impact": "..." }], "grammarErrors": [{ "error": "...", "correction": "...", "context": "..." }], "formattingIssues": [{ "issue": "...", "fix": "..." }], "missingKeywords": [{ "keyword": "...", "importance": "Critical"|"High"|"Medium", "reason": "...", "whereToAdd": "..." }], "projectRewrites": [{ "original": "...", "improved": "...", "whyBetter": "..." }], "sectionScores": { "contact": 0-10, "summary": 0-10, "skills": 0-10, "experience": 0-10, "projects": 0-10, "education": 0-10, "certifications": 0-10 }, "companyCultureFit": "..." }`;
      
      const raw1 = await groqCall(sys1, user1);
      const res1 = JSON.parse(raw1) as AnalysisResult;
      
      // Sanitize res1 to prevent undefined array crashes
      res1.currentStrengths = res1.currentStrengths || [];
      res1.grammarErrors = res1.grammarErrors || [];
      res1.formattingIssues = res1.formattingIssues || [];
      res1.missingKeywords = res1.missingKeywords || [];
      res1.projectRewrites = res1.projectRewrites || [];
      res1.sectionScores = res1.sectionScores || {};
      
      setResults(res1);
      
      // Step 4: Call Groq 2
      setLoadingStep("📊 Generating gap analysis...");
      setProgress(80);
      
      const sys2 = "You are a hiring manager at a top tech company. Be specific, honest, and actionable. Return ONLY valid JSON.";
      const user2 = `A student wants to get this job: "${targetRole}". Current ATS: ${res1.atsScore}/100. Missing Keywords: ${res1.missingKeywords?.map(k => k.keyword).join(', ') || 'None'}. Resume Content: ${text}. Give them a COMPLETE gap analysis of everything they need to ADD. Return EXACTLY this JSON: { "gapSummary": "...", "criticalMissing": [{ "category": "...", "item": "...", "priority": "Must Have"|"Should Have"|"Nice to Have", "howToGet": "...", "timeToAcquire": "...", "freeResources": ["..."] }], "skillsToAdd": [{ "skill": "...", "currentLevel": "...", "requiredLevel": "...", "learningPath": "...", "projectIdea": "..." }], "projectsToAdd": [{ "projectTitle": "...", "description": "...", "techStack": ["..."], "whyItMatters": "...", "estimatedTime": "...", "githubTips": "..." }], "certificationsToAdd": [{ "certification": "...", "provider": "...", "cost": "...", "duration": "...", "impact": "..." }], "experienceToAdd": [{ "type": "...", "description": "...", "howToFind": "...", "timeCommitment": "..." }], "resumeSectionsToAdd": [{ "section": "...", "reason": "...", "template": "..." }], "30DayActionPlan": [{ "week": 1, "focus": "...", "tasks": ["..."], "milestone": "..." }], "bulletPointsToAdd": [{ "section": "...", "bulletPoint": "...", "placementTip": "..." }] }`;
      
      const raw2 = await groqCall(sys2, user2);
      const res2 = JSON.parse(raw2) as GapAnalysis;
      
      // Sanitize res2 to prevent undefined array crashes
      res2.criticalMissing = res2.criticalMissing || [];
      res2.skillsToAdd = res2.skillsToAdd || [];
      res2.projectsToAdd = res2.projectsToAdd || [];
      res2.certificationsToAdd = res2.certificationsToAdd || [];
      res2.experienceToAdd = res2.experienceToAdd || [];
      res2.resumeSectionsToAdd = res2.resumeSectionsToAdd || [];
      res2["30DayActionPlan"] = res2["30DayActionPlan"] || [];
      res2.bulletPointsToAdd = res2.bulletPointsToAdd || [];
      
      setGapAnalysis(res2);
      
      setLoadingStep("✅ Building your personalized report...");
      setProgress(100);
      
      // Map to ResumeScore format for dashboard
      const mappedResumeScore: ResumeScore = {
        overallScore: res1.atsScore,
        relevance: res1.sectionScores.experience ? res1.sectionScores.experience * 10 : 80,
        skills: res1.sectionScores.skills ? res1.sectionScores.skills * 10 : 80,
        experience: res1.sectionScores.experience ? res1.sectionScores.experience * 10 : 80,
        presentation: 80, // Default since formatting is not scored 1-10
        keywords: res1.atsScore,
        matchedSkills: [],
        missingSkills: res1.missingKeywords.map(k => k.keyword),
        strengths: res1.currentStrengths.map(s => s.strength),
        gaps: res2.criticalMissing.map(m => m.item),
        recommendations: [res1.overallAdvice],
        summary: res1.atsSummary,
        resumeText: text.substring(0, 500),
        analyzedAt: Date.now()
      };
      
      saveResumeScore(mappedResumeScore);

      // Save to localStorage
      localStorage.setItem("placeiq_resume_result", JSON.stringify({
        targetRole,
        date: new Date().toISOString(),
        atsScore: res1.atsScore,
        results: res1,
        gapAnalysis: res2,
        resumeTextPreview: text.substring(0, 200)
      }));
      
      setLoading(false);
    } catch (err: any) {
      console.error("Resume Analysis Error:", err);
      
      const isRetryableError = 
        err.message === "RATE_LIMIT" || 
        err.message === "INVALID_JSON_RESPONSE" || 
        err.name === "SyntaxError";

      if (isRetryableError && retryCount < 3) {
        const reason = err.message === "RATE_LIMIT" ? "Rate limited" : "AI generated invalid format";
        setLoadingStep(`⏱ ${reason}. Retrying... (Attempt ${retryCount + 1})`);
        setTimeout(() => runAudit(retryCount + 1), 3000);
      } else {
        setError(err.message === 'SCANNED_PDF' ? "This PDF appears to be image-based (scanned). Please upload a text-based PDF." : "Analysis failed. The AI returned an invalid format. Please try again.");
        setLoading(false);
      }
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStates({ ...copyStates, [id]: true });
    setTimeout(() => setCopyStates({ ...copyStates, [id]: false }), 2000);
  };

  const toggleTask = (taskId: string) => {
    const newState = { ...actionPlanProgress, [taskId]: !actionPlanProgress[taskId] };
    setActionPlanProgress(newState);
    localStorage.setItem("placeiq_resume_actionplan_progress", JSON.stringify(newState));
  };

  const downloadReport = () => {
    if (!results || !gapAnalysis) return;
    const content = `PLACIIQ RESUME ANALYSIS REPORT\n================================\nTarget Role: ${targetRole}\nDate: ${new Date().toLocaleDateString()}\nATS Score: ${results.atsScore}/100\n\nWHAT YOU NEED TO ADD\n--------------------\n${gapAnalysis.gapSummary}\n\nCritical Missing Items:\n${gapAnalysis.criticalMissing.map(m => `- [${m.priority}] ${m.item} (${m.category}): ${m.howToGet}`).join('\n')}\n\nReady-to-Paste Bullet Points:\n${gapAnalysis.bulletPointsToAdd.map(b => `[${b.section}] ${b.bulletPoint}`).join('\n')}\n\n30-DAY ACTION PLAN\n------------------\n${gapAnalysis["30DayActionPlan"].map(w => `Week ${w.week}: ${w.focus}\n${w.tasks.map(t => `  - ${t}`).join('\n')}\nMilestone: ${w.milestone}`).join('\n\n')}\n\n================================\nGenerated by PlaceIQ AI Resume Analyzer`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PlaceIQ_Resume_Report_${targetRole.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  const loadPrevious = () => {
    setResults(prevAnalysis.results);
    setGapAnalysis(prevAnalysis.gapAnalysis);
    setTargetRole(prevAnalysis.targetRole);
    setActiveTab("add");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-full max-w-md">
           <div className="flex flex-col items-center mb-12">
              <div className="w-24 h-24 relative mb-6">
                 <div className="absolute inset-0 border-4 border-purple-600/20 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-t-purple-600 rounded-full animate-spin"></div>
                 <Loader2 className="absolute inset-0 m-auto w-10 h-10 text-purple-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black mb-2">{loadingStep}</h2>
              <p className="text-gray-500 text-sm">Powered by Groq + Llama 3.3 • ATS Audit in progress</p>
           </div>
           
           <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4 border border-white/5">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
           </div>
           <div className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{progress}% Complete</div>
        </div>
      </div>
    );
  }

  if (results && gapAnalysis) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-12 relative overflow-hidden">
        {/* Top Summary Bar */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 mb-12 bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-xl relative z-10">
           <div className="flex items-center gap-8">
              <div className="relative w-32 h-32">
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" className="stroke-white/5 fill-none" strokeWidth="8" />
                    <motion.circle 
                      cx="50" cy="50" r="45" 
                      className={`fill-none ${results.atsScore >= 75 ? 'stroke-emerald-500' : results.atsScore >= 50 ? 'stroke-amber-500' : 'stroke-red-500'}`} 
                      strokeWidth="8" 
                      initial={{ strokeDasharray: "0 283" }}
                      animate={{ strokeDasharray: `${(results.atsScore / 100) * 283} 283` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black">{results.atsScore}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">ATS Score</span>
                 </div>
              </div>
              <div>
                 <div className={`text-2xl font-black mb-1 ${results.atsScore >= 75 ? 'text-emerald-400' : results.atsScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {results.atsScore >= 75 ? 'Excellent' : results.atsScore >= 50 ? 'Good' : 'Needs Work'}
                 </div>
                 <div className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold inline-block mb-2">
                    Analyzing for: {targetRole}
                 </div>
                 <p className="text-gray-400 text-sm max-w-lg leading-relaxed">{results.atsSummary}</p>
              </div>
           </div>
           <div className="flex gap-3">
              <Button onClick={downloadReport} className="bg-white text-black hover:bg-gray-200 rounded-2xl h-12 px-6 font-bold">
                 <Download className="w-4 h-4 mr-2" /> Download Report
              </Button>
               <Button onClick={() => { setResults(null); setGapAnalysis(null); }} variant="outline" className="border-white/10 text-gray-400 rounded-2xl h-12">
                 <RotateCcw className="w-4 h-4 mr-2" /> Re-analyze
               </Button>
               <Button onClick={goToDashboard} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl h-12 px-6 font-bold shadow-lg shadow-indigo-600/20">
                 Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
            </div>
        </div>

        {/* Tabs Bar */}
        <div className="max-w-7xl mx-auto mb-8 overflow-x-auto scrollbar-hide">
           <div className="flex border-b border-white/10 min-w-max">
              {[
                { id: "add", label: "🎯 What To Add", icon: <Sparkles className="w-4 h-4" /> },
                { id: "ats", label: "📊 ATS Score", icon: <Target className="w-4 h-4" /> },
                { id: "strengths", label: "💪 Strengths", icon: <Award className="w-4 h-4" /> },
                { id: "keywords", label: "🔑 Keywords", icon: <Search className="w-4 h-4" /> },
                { id: "grammar", label: "✏️ Grammar", icon: <FileText className="w-4 h-4" />, count: results.grammarErrors.length },
                { id: "format", label: "📐 Formatting", icon: <Layout className="w-4 h-4" />, count: results.formattingIssues.length },
                { id: "rewrites", label: "🔄 Rewrites", icon: <RotateCcw className="w-4 h-4" /> },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2
                    ${activeTab === tab.id ? 'border-purple-600 text-purple-400 bg-purple-600/5' : 'border-transparent text-gray-500 hover:text-white'}
                  `}
                >
                  {tab.icon} {tab.label}
                  {tab.count ? <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{tab.count}</span> : null}
                </button>
              ))}
           </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto mb-20">
           {activeTab === "add" && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-8 rounded-[32px] border border-white/10">
                   <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400">
                      <Target className="w-6 h-6" /> Honest Assessment
                   </h3>
                   <p className="text-gray-200 text-lg leading-relaxed">{gapAnalysis.gapSummary}</p>
                </div>

                <section>
                   <h2 className="text-2xl font-black mb-6">You MUST add these to get this role</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {gapAnalysis.criticalMissing.map((m, i) => (
                        <div key={i} className="bg-black/40 border border-white/10 p-6 rounded-3xl group hover:border-purple-500/50 transition-all">
                           <div className="flex justify-between items-start mb-6">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${m.priority === 'Must Have' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : m.priority === 'Should Have' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'}`}>
                                 {m.priority}
                              </span>
                              <span className="text-[10px] font-bold text-gray-500 uppercase">{m.category}</span>
                           </div>
                           <h4 className="text-2xl font-black mb-4 leading-tight">{m.item}</h4>
                           <div className="space-y-4">
                              <p className="text-sm text-gray-400 leading-relaxed"><span className="text-indigo-400 font-bold block mb-1">How to get it:</span> {m.howToGet}</p>
                              <div className="flex items-center justify-between text-xs font-bold">
                                 <span className="flex items-center gap-1 text-emerald-400"><Clock className="w-3 h-3" /> {m.timeToAcquire}</span>
                                 <details className="cursor-pointer group/det">
                                    <summary className="text-gray-500 hover:text-white">Free Resources</summary>
                                    <div className="mt-2 text-[10px] text-indigo-400 space-y-1">
                                       {m.freeResources.map((r, ri) => <div key={ri}>{r}</div>)}
                                    </div>
                                 </details>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </section>

                <section>
                   <h2 className="text-2xl font-black mb-6">Build these projects to stand out</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {gapAnalysis.projectsToAdd.map((p, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex flex-col h-full">
                           <h4 className="text-xl font-bold mb-4">{p.projectTitle}</h4>
                           <p className="text-sm text-gray-400 mb-6 flex-1">{p.description}</p>
                           <div className="flex flex-wrap gap-2 mb-6">
                              {p.techStack.map(s => <span key={s} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-indigo-400">{s}</span>)}
                           </div>
                           <div className="bg-black/40 p-4 rounded-xl mb-6">
                              <div className="text-[10px] font-black text-emerald-400 uppercase mb-1">Why it matters</div>
                              <p className="text-xs text-gray-500">{p.whyItMatters}</p>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500"><Clock className="w-3 h-3 inline mr-1" /> {p.estimatedTime}</span>
                              <Button variant="outline" size="sm" className="h-8 text-[10px] font-black border-white/10 rounded-full">Add to Roadmap</Button>
                           </div>
                        </div>
                      ))}
                   </div>
                </section>

                <section>
                   <h2 className="text-2xl font-black mb-6">Copy these bullet points directly</h2>
                   <div className="space-y-4">
                      {gapAnalysis.bulletPointsToAdd.map((b, i) => {
                        const id = `bp-${i}`;
                        return (
                          <div key={i} className="bg-black/40 border border-white/10 p-6 rounded-2xl flex items-center justify-between gap-6 group">
                             <div className="flex-1">
                                <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">Target Section: {b.section}</div>
                                <div className="font-mono text-sm text-emerald-400 bg-emerald-400/5 p-4 rounded-xl border border-emerald-400/10">
                                   "{b.bulletPoint}"
                                </div>
                                <div className="text-[10px] text-gray-600 mt-2 italic">{b.placementTip}</div>
                             </div>
                             <Button 
                              onClick={() => handleCopy(b.bulletPoint, id)}
                              className={`shrink-0 h-12 w-32 rounded-xl font-bold transition-all ${copyStates[id] ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                             >
                                {copyStates[id] ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Copied!</> : <><Copy className="w-4 h-4 mr-2" /> Copy</>}
                             </Button>
                          </div>
                        );
                      })}
                   </div>
                </section>
             </motion.div>
           )}

           {activeTab === "ats" && (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-white/5 border border-white/10 p-12 rounded-[40px] flex flex-col items-center justify-center text-center">
                   <div className="relative w-64 h-64 mb-8">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                         <circle cx="50" cy="50" r="45" className="stroke-white/5 fill-none" strokeWidth="6" />
                         <circle cx="50" cy="50" r="45" className="stroke-purple-600 fill-none" strokeWidth="6" strokeDasharray={`${(results.atsScore / 100) * 283} 283`} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-7xl font-black">{results.atsScore}</span>
                         <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">ATS Compatibility</span>
                      </div>
                   </div>
                   <p className="text-xl font-bold text-indigo-400 mb-4">{results.atsSummary}</p>
                   <p className="text-gray-500 leading-relaxed">{results.overallAdvice}</p>
                </div>
                <div className="space-y-6">
                   <h3 className="text-2xl font-black mb-6">Section Scores</h3>
                   {Object.entries(results.sectionScores).map(([name, score]) => (
                     <div key={name} className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest">
                           <span className="text-gray-500">{name}</span>
                           <span className="text-white">{score} / 10</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-600" style={{ width: `${score * 10}%` }}></div>
                        </div>
                     </div>
                   ))}
                   <div className="mt-12 bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-3xl">
                      <h4 className="text-emerald-400 text-xs font-bold uppercase mb-2">Company Culture Fit</h4>
                      <p className="text-sm text-gray-400">{results.companyCultureFit}</p>
                   </div>
                </div>
             </motion.div>
           )}

           {activeTab === "strengths" && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.currentStrengths.map((s, i) => (
                  <div key={i} className="bg-emerald-900/5 border border-emerald-500/20 p-8 rounded-[32px] group hover:bg-emerald-900/10 transition-all">
                     <h4 className="text-xl font-black text-emerald-400 mb-4 flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6" /> {s.strength}
                     </h4>
                     <p className="text-gray-400 leading-relaxed">{s.impact}</p>
                  </div>
                ))}
             </div>
           )}

           {activeTab === "keywords" && (
             <div className="space-y-12">
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-black">Target Keywords for {targetRole}</h2>
                   <div className="flex gap-2">
                      <Button onClick={() => handleCopy(results.missingKeywords.map(k => k.keyword).join(', '), 'all-keys')} variant="outline" className="border-white/10 rounded-full h-10 text-xs">
                         Copy All Keywords
                      </Button>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {['Critical', 'High', 'Medium'].map(level => (
                     <div key={level} className="space-y-4">
                        <h4 className={`text-xs font-black uppercase tracking-tighter flex items-center gap-2 ${level === 'Critical' ? 'text-red-400' : level === 'High' ? 'text-amber-400' : 'text-blue-400'}`}>
                           <div className={`w-2 h-2 rounded-full ${level === 'Critical' ? 'bg-red-500' : level === 'High' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                           {level} Priority
                        </h4>
                        <div className="flex flex-wrap gap-2">
                           {results.missingKeywords.filter(k => k.importance === level).map((k, i) => (
                             <div key={i} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-help relative group/kw ${level === 'Critical' ? 'bg-red-500/5 border-red-500/20 text-red-400' : level === 'High' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' : 'bg-blue-500/5 border-blue-500/20 text-blue-400'}`}>
                                {k.keyword}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-neutral-900 border border-white/10 p-4 rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover/kw:opacity-100 transition-all z-20">
                                   <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Reason</div>
                                   <div className="text-xs text-white mb-3">{k.reason}</div>
                                   <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Where to add</div>
                                   <div className="text-xs text-indigo-400 font-bold">{k.whereToAdd}</div>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === "grammar" && (
             <div className="bg-black/40 border border-white/10 rounded-[32px] overflow-hidden">
                {results.grammarErrors.length === 0 ? (
                  <div className="p-20 text-center">
                     <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                     </div>
                     <h3 className="text-2xl font-black mb-2">No grammar issues found!</h3>
                     <p className="text-gray-500">Your resume is grammatically clean and professional.</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                     <thead>
                        <tr className="text-gray-500 text-xs font-black uppercase tracking-widest bg-white/5 border-b border-white/10">
                           <th className="px-8 py-4">Error Detected</th>
                           <th className="px-8 py-4">Correction</th>
                           <th className="px-8 py-4">Context</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {results.grammarErrors.map((err, i) => (
                          <tr key={i} className="hover:bg-white/5">
                             <td className="px-8 py-6 text-red-400 font-bold">{err.error}</td>
                             <td className="px-8 py-6 text-emerald-400 font-bold">{err.correction}</td>
                             <td className="px-8 py-6 text-gray-500 text-sm italic">"...{err.context}..."</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
                )}
             </div>
           )}

           {activeTab === "format" && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.formattingIssues.length === 0 ? (
                  <div className="col-span-2 p-20 text-center bg-black/40 rounded-[32px] border border-white/10">
                     <Layout className="w-16 h-16 text-emerald-500 mx-auto mb-6 opacity-20" />
                     <h3 className="text-2xl font-black mb-2">Formatting looks great!</h3>
                     <p className="text-gray-500">No major formatting issues detected.</p>
                  </div>
                ) : (
                  results.formattingIssues.map((f, i) => (
                    <div key={i} className="bg-amber-900/5 border border-amber-500/20 p-8 rounded-[32px] flex items-start gap-6">
                       <AlertTriangle className="w-10 h-10 text-amber-500 shrink-0" />
                       <div>
                          <h4 className="text-lg font-black text-amber-500 mb-2">{f.issue}</h4>
                          <p className="text-gray-400 text-sm leading-relaxed"><span className="text-white font-bold">How to fix:</span> {f.fix}</p>
                       </div>
                    </div>
                  ))
                )}
             </div>
           )}

           {activeTab === "rewrites" && (
             <div className="space-y-8">
                {results.projectRewrites.length === 0 ? (
                  <div className="p-20 text-center bg-red-900/5 border border-red-500/10 rounded-[32px]">
                     <AlertCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-6 opacity-20" />
                     <h3 className="text-2xl font-black mb-2">No projects detected!</h3>
                     <p className="text-gray-500 mb-8">This is a critical issue for a technical role. Add a Projects section immediately.</p>
                     <div className="max-w-md mx-auto p-6 bg-black/40 border border-white/5 rounded-2xl text-left text-xs font-mono text-indigo-400">
                        PROJECT NAME | Tech: A, B, C<br/>
                        - Implemented X using Y resulting in Z% improvement...
                     </div>
                  </div>
                ) : (
                  results.projectRewrites.map((p, i) => {
                    const id = `rw-${i}`;
                    return (
                      <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-6 group">
                         <div className="bg-black/40 border border-white/10 p-6 rounded-3xl">
                            <div className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest">Original Resume Text</div>
                            <p className="text-gray-500 text-sm leading-relaxed italic">"{p.original}"</p>
                         </div>
                         <div className="bg-emerald-900/5 border border-emerald-500/20 p-6 rounded-3xl relative">
                            <div className="text-[10px] font-black uppercase text-emerald-500 mb-4 tracking-widest flex items-center gap-2">
                               <Sparkles className="w-3 h-3" /> AI Improved Version
                            </div>
                            <p className="text-gray-200 text-sm font-bold leading-relaxed mb-6">"{p.improved}"</p>
                            <div className="bg-black/40 p-4 rounded-xl mb-6">
                               <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Why this is better</div>
                               <p className="text-xs text-gray-500">{p.whyBetter}</p>
                            </div>
                            <Button 
                              onClick={() => handleCopy(p.improved, id)}
                              className={`w-full h-10 rounded-xl font-bold transition-all ${copyStates[id] ? 'bg-emerald-600 text-white' : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'}`}
                            >
                               {copyStates[id] ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Copied!</> : <><Copy className="w-4 h-4 mr-2" /> Copy Improved</>}
                            </Button>
                         </div>
                      </div>
                    );
                  })
                )}
             </div>
           )}
        </div>

        {/* 30-Day Action Plan */}
        <section className="max-w-7xl mx-auto pb-20">
           <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-purple-600 rounded-3xl shadow-lg shadow-purple-600/20">
                 <History className="w-8 h-8 text-white" />
              </div>
              <div>
                 <h2 className="text-3xl font-black">Your 30-Day Resume Action Plan</h2>
                 <p className="text-gray-500">Specific steps to get hired in 4 weeks.</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {gapAnalysis["30DayActionPlan"].map((week, wi) => {
                const completedCount = week.tasks.filter((_, ti) => actionPlanProgress[`w${wi}-t${ti}`]).length;
                return (
                  <div key={wi} className="bg-white/5 border border-white/10 rounded-[40px] p-8 flex flex-col min-w-[300px]">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="text-2xl font-black text-purple-400">Week {week.week}</h3>
                           <p className="text-xs font-bold text-gray-500 uppercase mt-1">{week.focus}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center font-black text-xs text-purple-400 border border-white/5">
                           {completedCount}/{week.tasks.length}
                        </div>
                     </div>

                     <div className="space-y-3 flex-1">
                        {week.tasks.map((task, ti) => {
                          const taskId = `w${wi}-t${ti}`;
                          return (
                            <button 
                              key={ti} 
                              onClick={() => toggleTask(taskId)}
                              className="flex gap-3 text-left group w-full"
                            >
                               <div className={`w-5 h-5 rounded-md border-2 shrink-0 transition-all flex items-center justify-center ${actionPlanProgress[taskId] ? 'bg-purple-600 border-purple-600' : 'border-white/20 group-hover:border-purple-600/50'}`}>
                                  {actionPlanProgress[taskId] && <CheckCircle2 className="w-3 h-3 text-white" />}
                               </div>
                               <span className={`text-sm leading-snug transition-all ${actionPlanProgress[taskId] ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                                  {task}
                               </span>
                            </button>
                          );
                        })}
                     </div>

                     <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="text-[10px] font-black uppercase text-gray-500 mb-2">Milestone</div>
                        <div className="bg-emerald-900/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full inline-block">
                           {week.milestone}
                        </div>
                     </div>
                  </div>
                );
              })}
           </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 lg:p-12 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full mix-blend-screen filter blur-[128px]"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full mix-blend-screen filter blur-[128px]"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="mb-16 text-center">
           <div className="inline-flex items-center justify-center p-4 bg-purple-600 rounded-3xl shadow-2xl shadow-purple-600/20 mb-8">
              <FileText className="w-12 h-12 text-white" />
           </div>
           <h1 className="text-5xl font-black mb-4 tracking-tighter">AI Resume Updater</h1>
           <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Upload your resume and target role. Our AI tells you exactly what to add, fix, and improve to get hired.
           </p>
        </header>

        {prevAnalysis && !results && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-indigo-600/20 border border-indigo-500/30 p-6 rounded-[32px] flex items-center justify-between gap-6 backdrop-blur-xl">
             <div className="flex items-center gap-4 text-indigo-400">
                <History className="w-6 h-6" />
                <div>
                   <div className="font-bold text-sm">Previous analysis found for '{prevAnalysis.targetRole}'</div>
                   <div className="text-xs opacity-60">Analyzed on {new Date(prevAnalysis.date).toLocaleDateString()} • Score: {prevAnalysis.atsScore}/100</div>
                </div>
             </div>
             <div className="flex gap-2">
                <Button onClick={loadPrevious} className="bg-indigo-600 hover:bg-indigo-500 text-white h-10 px-6 rounded-xl font-bold text-xs">Load Previous Results</Button>
                <Button onClick={() => setPrevAnalysis(null)} variant="ghost" className="text-gray-500 hover:text-white text-xs">Start Fresh</Button>
             </div>
          </motion.div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl backdrop-blur-xl relative group">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div className="space-y-4">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Target Role</label>
              <input 
                type="text"
                placeholder="e.g. SDE at Microsoft" 
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-black/40 border border-white/10 h-16 rounded-2xl px-6 text-white font-bold outline-none focus:border-purple-600 transition-all placeholder:text-gray-700"
              />
              <p className="text-[10px] text-gray-600 font-bold ml-1 uppercase">Be specific — include company name for best results</p>
            </div>
            
            <div className="space-y-4">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Resume PDF</label>
              <div className="relative h-16 group/upload">
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      if (f.type !== 'application/pdf') return setError("Only PDF files accepted");
                      if (f.size > 5 * 1024 * 1024) return setError("PDF too large. Please compress to under 5MB.");
                      setFile(f);
                      setError("");
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className={`h-full w-full bg-black/40 border-2 border-dashed rounded-2xl flex items-center px-6 transition-all ${file ? 'border-emerald-500/50 text-emerald-400' : 'border-white/10 text-gray-400 group-hover/upload:border-purple-600/50'}`}>
                  <Upload className="w-5 h-5 mr-3" />
                  <span className="font-bold text-sm truncate flex-1">
                     {file ? file.name : "Drop your PDF here or click to browse"}
                  </span>
                  {file && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-2" />}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-8">
               <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-2 rounded-full flex items-center gap-2 text-sm font-bold">
                  <AlertTriangle className="w-4 h-4" /> {error}
               </div>
            </motion.div>
          )}

          <Button 
            onClick={() => runAudit()} 
            disabled={!file || !targetRole}
            className={`w-full h-16 text-xl font-black rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-3 ${!file || !targetRole ? 'bg-white/5 text-gray-600' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-purple-600/20'}`}
          >
            <Zap className="w-6 h-6" /> Run AI Audit
          </Button>
        </div>
      </div>
    </div>
  );
}

function AlertCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
  );
}
