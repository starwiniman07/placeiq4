"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Target, FileText, Sparkles,
  ChevronRight, ChevronLeft, Upload, CheckCircle2,
  Loader2, X, Clock, Briefcase, Building2
} from "lucide-react";
import {
  DEGREE_TYPES, DEPARTMENTS, YEARS, ROLE_MAP, TOP_COMPANIES, TIMELINES,
  UserProfile, ResumeScore,
  saveProfile, saveResumeScore, markOnboardingComplete, getProfile, getResumeScore
} from "@/lib/userStore";

// ── Groq helper — robust JSON extraction ────
async function groqCall(system: string, user: string, maxTokens = 3500): Promise<string> {
  const key = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!key) throw new Error("GROQ_KEY_MISSING");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: system },
        { role: "user",   content: user },
      ],
      temperature: 0.2,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("RATE_LIMIT");
    throw new Error(`GROQ_HTTP_${res.status}`);
  }

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";

  const mdMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (mdMatch) return mdMatch[1].trim();

  const first = text.indexOf("{");
  const last  = text.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) return text.substring(first, last + 1);

  throw new Error("INVALID_JSON_RESPONSE");
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 1: Academic Identity
  const [degree, setDegree] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");

  // Step 2: Target Goals
  const [targetRole, setTargetRole] = useState("");
  const [companies, setCompanies] = useState<string[]>([]);
  const [timeline, setTimeline] = useState("");

  // Step 3: Resume
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  // Step 4: Analysis
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisMsg, setAnalysisMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated") {
      const p = getProfile();
      const r = getResumeScore();
      // Only skip onboarding if the stored profile belongs to THIS email
      if (p && r && p.email === session?.user?.email) {
        router.replace("/dashboard");
      }
    }
  }, [status, router]);

  // Load PDF.js
  useEffect(() => {
    if (typeof window !== "undefined") {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      s.onload = () => {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      };
      document.head.appendChild(s);
    }
  }, []);

  const extractPDF = async (f: File): Promise<string> => {
    const lib = (window as any).pdfjsLib;
    if (!lib) throw new Error("PDF_NOT_READY");
    const buf = await f.arrayBuffer();
    const pdf = await lib.getDocument({ data: buf }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it: any) => it.str).join(" ") + "\n";
    }
    if (text.trim().length < 50) throw new Error("SCANNED_PDF");
    return text.trim();
  };

  const performAnalysis = async () => {
    setAnalyzing(true);
    setError("");
    setAnalysisMsg("📄 Reading resume content...");

    const profile: UserProfile = {
      name: session?.user?.name || "Student",
      email: session?.user?.email || "",
      degreeType: degree, department, year,
      targetRole, targetCompanies: companies, placementTimeline: timeline,
    };
    saveProfile(profile);

    try {
      if (!file) throw new Error("RESUME_MISSING");
      const text = await extractPDF(file);
      setAnalysisMsg("🤖 AI Personalization in progress...");

      // Heuristic analysis keywords
      const lower = text.toLowerCase();
      const techKeywords = ["react","node","python","java","sql","git","docker","aws","typescript","javascript","ml","ai","cybersecurity","cloud","devops"];
      const matched = techKeywords.filter(k => lower.includes(k));
      const missing = techKeywords.filter(k => !lower.includes(k)).slice(0, 5);

      const sys = `Evaluate resume for ${degree} ${department} student targeting ${targetRole} at ${companies.join(", ") || "top companies"}. Return JSON.`;
      const usr = `Resume Text:\n${text.substring(0, 3500)}\n\nFormat:\n{"overallScore":75,"relevance":80,"skills":70,"experience":65,"presentation":85,"keywords":70,"matchedSkills":[],"missingSkills":[],"strengths":[],"gaps":[],"recommendations":[],"summary":""}`;

      let result;
      try {
        const raw = await groqCall(sys, usr);
        result = JSON.parse(raw);
      } catch (e) {
        console.warn("Groq failed, using heuristic fallback", e);
        const skillScore = Math.min(95, 45 + (matched.length * 5));
        result = {
          overallScore: Math.round((skillScore + 60 + 80 + 70 + 75) / 5),
          relevance: 75,
          skills: skillScore,
          experience: lower.includes("intern") ? 80 : 55,
          presentation: 85,
          keywords: 50 + (matched.length * 5),
          matchedSkills: matched.map(m => m.toUpperCase()),
          missingSkills: missing.map(m => m.toUpperCase()),
          strengths: ["Profile is aligned with target role", "Technical foundations are present"],
          gaps: ["Can include more industry-specific projects", "Certain toolsets are missing"],
          recommendations: ["Focus on project quantification", `Add ${missing.slice(0,2).join(", ")} to resume`],
          summary: `Heuristic analysis complete for ${targetRole}. Your profile shows solid potential with room to optimize keyword density for ATS systems.`
        };
      }

      saveResumeScore({ ...result, resumeText: text, analyzedAt: Date.now() });
      markOnboardingComplete();
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError(err.message === "SCANNED_PDF" ? "PDF is an image. Use a text-based PDF." : "Something went wrong. Please try again.");
      setAnalyzing(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setFile(f);
  }, []);

  return (
    <div className="min-h-screen bg-[#020510] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" /> Step {step + 1} of 4
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            {step === 0 && "Academic Identity"}
            {step === 1 && "Target Goals"}
            {step === 2 && "Resume Upload"}
            {step === 3 && "Finalizing Analysis"}
          </h1>
          <p className="text-white/40 text-sm">
            {step === 0 && "Tell us about your current academic status."}
            {step === 1 && "What roles and companies are you aiming for?"}
            {step === 2 && "A mandatory step for personalized dashboard generation."}
            {step === 3 && "Building your personalized experience..."}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 1: Degree & Dept */}
            {step === 0 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3">Select Degree</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {DEGREE_TYPES.map(d => (
                      <button key={d.id} onClick={() => setDegree(d.id)} className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${degree === d.id ? "bg-blue-600/20 border-blue-500/50 text-white" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"}`}>
                        <span className="text-xl">{d.emoji}</span>
                        <span className="text-xs font-bold">{d.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-2">Department</label>
                  <select value={department} onChange={e => { setDepartment(e.target.value); setTargetRole(""); }} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 outline-none text-sm text-white appearance-none cursor-pointer">
                    <option value="" disabled className="bg-[#0f172a]">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#0f172a]">{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3">Year of Study</label>
                  <div className="flex gap-2 flex-wrap">
                    {YEARS.map(y => (
                      <button key={y} onClick={() => setYear(y)} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${year === y ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10"}`}>
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                <button disabled={!degree || !department || !year} onClick={() => setStep(1)} className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-600/20">
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Target Goals */}
            {step === 1 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3">Target Role (for {department})</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ROLE_MAP[department]?.map(r => (
                      <button key={r} onClick={() => setTargetRole(r)} className={`text-left px-4 py-3 rounded-2xl border transition-all text-xs font-semibold ${targetRole === r ? "bg-blue-600/20 border-blue-500/50 text-blue-300" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3">Dream Companies</label>
                  <div className="flex flex-wrap gap-2">
                    {TOP_COMPANIES.slice(0, 15).map(c => {
                      const isSel = companies.includes(c);
                      return (
                        <button key={c} onClick={() => {
                          if (isSel) setCompanies(companies.filter(x => x !== c));
                          else if (companies.length < 5) setCompanies([...companies, c]);
                        }} className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${isSel ? "bg-blue-600/30 border-blue-400 text-blue-300" : "bg-white/5 border-white/5 text-white/25 hover:bg-white/10"}`}>
                          {isSel && "✓ "}{c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3">Timeline</label>
                  <div className="grid grid-cols-2 gap-3">
                    {TIMELINES.map(t => (
                      <button key={t.id} onClick={() => setTimeline(t.id)} className={`flex flex-col items-start gap-0.5 px-4 py-3 rounded-2xl border transition-all ${timeline === t.id ? "bg-blue-600/20 border-blue-500/50" : "bg-white/5 border-white/5"}`}>
                        <span className={`text-xs font-bold ${timeline === t.id ? "text-blue-300" : "text-white/40"}`}>{t.label}</span>
                        <span className="text-[10px] text-white/20">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(0)} className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
                    <ChevronLeft className="w-5 h-5 text-white/40" />
                  </button>
                  <button disabled={!targetRole || !timeline} onClick={() => setStep(2)} className="flex-1 h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-600/20">
                    Next: Resume <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Resume Input (Mandatory) */}
            {step === 2 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-center">
                <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => document.getElementById("pdf-upload")?.click()}
                  className={`border-2 border-dashed rounded-[32px] py-16 px-6 transition-all cursor-pointer flex flex-col items-center gap-4 ${dragging ? "border-blue-500 bg-blue-500/10" : file ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                  <input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
                  
                  {file ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{file.name}</p>
                        <p className="text-white/30 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB · Ready to analyze</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20">
                        <Upload className="w-8 h-8 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">Drop Resume Here</p>
                        <p className="text-white/25 text-sm mt-1">Mandatory for personalized analysis · PDF only</p>
                      </div>
                    </>
                  )}
                </div>

                {error && <p className="text-red-400 text-sm font-bold bg-red-400/10 py-3 rounded-xl border border-red-400/20">{error}</p>}

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
                    <ChevronLeft className="w-5 h-5 text-white/40" />
                  </button>
                  <button disabled={!file} onClick={() => { setStep(3); performAnalysis(); }} className="flex-1 h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-600/20">
                    Finish & Analyze <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Analysis */}
            {step === 3 && (
              <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-10 gap-8">
                <div className="relative w-28 h-28">
                  <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                  <motion.div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black text-white">{analysisMsg}</h2>
                  <p className="text-sm text-white/30">Customizing for your {degree} in {department}</p>
                </div>

                {error && (
                  <div className="space-y-4 w-full">
                    <div className="text-red-400 text-sm font-bold bg-red-400/10 p-4 rounded-2xl border border-red-400/20 text-center">
                      {error}
                    </div>
                    <button onClick={() => setStep(2)} className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all">
                      Go Back & Retry
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
