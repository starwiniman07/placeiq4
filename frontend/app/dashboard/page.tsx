"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, FileText, Mic, BarChart3, AlertTriangle,
  CheckCircle2, TrendingUp, BookOpen, ChevronRight,
  Sparkles, Award, Zap, ArrowRight, Star, Clock, Activity
} from "lucide-react";
import {
  getProfile, getResumeScore, getSessions,
  UserProfile, ResumeScore, SessionRecord
} from "@/lib/userStore";

// ── Liquid Background Blobs ─────────────────────────────────────
function AmbientLiquid() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div 
        animate={{ 
          transform: ['translate(0%, 0%) scale(1)', 'translate(5%, 10%) scale(1.1)', 'translate(-5%, -5%) scale(0.9)', 'translate(0%, 0%) scale(1)'] 
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] rounded-full blur-[120px] opacity-40 mix-blend-screen"
        style={{ background: "radial-gradient(circle, rgba(14,165,233,0.3) 0%, rgba(30,58,138,0.1) 50%, transparent 80%)" }}
      />
      <motion.div 
        animate={{ 
          transform: ['translate(0%, 0%) scale(1)', 'translate(-10%, -10%) scale(1.2)', 'translate(10%, 5%) scale(0.8)', 'translate(0%, 0%) scale(1)'] 
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] -left-[10%] w-[900px] h-[900px] rounded-full blur-[140px] opacity-30 mix-blend-screen"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(56,189,248,0.1) 50%, transparent 80%)" }}
      />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
    </div>
  );
}

// ── Animated neon score ring ────────────────────────────────────
function ScoreRing({ score, size = 140 }: { score: number; size?: number }) {
  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  // Deep blue to cyan liquid gradient colors
  const colorId = `liquidGradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 drop-shadow-[0_0_15px_rgba(14,165,233,0.4)]">
        <defs>
          <linearGradient id={colorId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={12} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={`url(#${colorId})`} strokeWidth={12} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-sky-300 to-indigo-400 drop-shadow-sm">
          {score}
        </span>
        <span className="text-[10px] font-bold text-sky-200/50 uppercase tracking-widest mt-0.5">
          / 100
        </span>
      </div>
    </div>
  );
}

// ── Liquid Skill bar ──────────────────────────────────────────
function SkillBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  return (
    <div className="group">
      <div className="flex justify-between text-xs font-bold mb-2">
        <span className="text-sky-100/70 group-hover:text-sky-100 transition-colors">{label}</span>
        <span className="text-sky-300">{score}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-sky-950/40 border border-sky-400/10 shadow-inner">
        <motion.div 
          className="h-full rounded-full relative overflow-hidden" 
          style={{ background: "linear-gradient(90deg, #0ea5e9, #818cf8, #c084fc)" }}
          initial={{ width: 0 }} 
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, delay, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div 
            className="absolute inset-0 w-full h-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: delay + 1 }}
          />
        </motion.div>
      </div>
    </div>
  );
}

// ── Liquid Glass Card Wrapper ─────────────────────────────────
function GlassCard({ children, className = "", glow = false, delay = 0 }: { children: React.ReactNode; className?: string; glow?: boolean; delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-[32px] p-7 relative overflow-hidden group ${className}`} 
      style={{
        background: "linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(30,58,138,0.03) 100%)",
        border: "1px solid rgba(56,189,248,0.15)",
        backdropFilter: "blur(24px)",
        boxShadow: glow ? "inset 0 0 30px rgba(56,189,248,0.05), 0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(14,165,233,0.2)" : "inset 0 0 20px rgba(56,189,248,0.02), 0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {/* Top reflection highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
      {children}
    </motion.div>
  );
}

// ── Liquid Stat chip ──────────────────────────────────────────
function StatChip({ icon, label, value, delay }: { icon: React.ReactNode; label: string; value: string | number; delay: number }) {
  return (
    <GlassCard delay={delay} className="hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-400/20 to-indigo-500/10 border border-sky-400/20 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
          {icon}
        </div>
        <div className="p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
        </div>
      </div>
      <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-sky-100 mb-1">{value}</div>
      <div className="text-xs text-sky-200/60 font-bold uppercase tracking-wider">{label}</div>
    </GlassCard>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resume,  setResume]  = useState<ResumeScore | null>(null);
  const [sessions,setSessions]= useState<SessionRecord[]>([]);
  const [tab, setTab] = useState<"overview" | "resume" | "keywords">("overview");

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status === "authenticated") {
      const p = getProfile(); const r = getResumeScore(); const s = getSessions();
      if (!p || !r) { router.replace("/onboarding"); return; }
      setProfile(p); setResume(r); setSessions(s);
    }
  }, [status, router]);

  if (status === "loading" || !profile || !resume) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center relative overflow-hidden">
        <AmbientLiquid />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-20 h-20 border-4 border-sky-500/20 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-transparent border-t-sky-400 border-r-indigo-400 rounded-full animate-spin"></div>
            <Activity className="absolute w-6 h-6 text-sky-300 animate-pulse" />
          </div>
          <p className="text-sky-300/70 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Dashboard</p>
        </div>
      </div>
    );
  }

  const avgSessionScore = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + s.overallScore, 0) / sessions.length)
    : null;

  const getScore = (val: any, defaultVal = 0) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseInt(val, 10) || defaultVal;
    return defaultVal;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 lg:p-12 relative overflow-hidden">
      <AmbientLiquid />

      <div className="max-w-[1400px] mx-auto relative z-10 space-y-8">

        {/* ── Liquid Hero ── */}
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.98 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[40px] p-8 lg:p-12 relative overflow-hidden shadow-2xl"
          style={{ 
            background: "linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(30,58,138,0.1) 100%)", 
            border: "1px solid rgba(56,189,248,0.25)",
            backdropFilter: "blur(40px)"
          }}
        >
          {/* Animated corner glow */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-sky-400/30 rounded-full blur-[80px]" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
            <div className="flex-1 space-y-4">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-400/20 to-blue-500/10 border border-sky-400/30 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                  <Target className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                  {profile.targetRole}
                </span>
                <span className="text-xs font-bold text-indigo-200/50 flex items-center gap-1.5 px-3 py-1.5 bg-black/20 rounded-full border border-white/5">
                  <Clock className="w-3.5 h-3.5" /> {profile.placementTimeline}
                </span>
              </motion.div>
              
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Welcome back, <br className="hidden md:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-300 via-indigo-300 to-purple-300">
                  {profile.name.split(" ")[0]}
                </span> ✨
              </motion.h1>
              
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sky-200/60 text-sm md:text-base font-medium flex items-center gap-2">
                {profile.degreeType} <span className="w-1.5 h-1.5 rounded-full bg-sky-500/50" /> {profile.department} <span className="w-1.5 h-1.5 rounded-full bg-sky-500/50" /> {profile.year}
              </motion.p>
              
              {profile.targetCompanies.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-2 pt-2">
                  {profile.targetCompanies.map(c => (
                    <span key={c} className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sky-100/70 backdrop-blur-sm hover:bg-white/10 hover:text-sky-100 transition-all cursor-default">
                      🏢 {c}
                    </span>
                  ))}
                </motion.div>
              )}
            </div>
            
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: "spring" }} className="flex items-center justify-center shrink-0 bg-black/20 p-6 rounded-[32px] border border-white/5 backdrop-blur-xl">
              <ScoreRing score={getScore(resume?.overallScore, 0)} size={160} />
            </motion.div>
          </div>
        </motion.div>

        {/* ── Stat chips ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatChip delay={0.2} icon={<Award className="w-6 h-6 text-sky-400" />} label="ATS Score" value={`${getScore(resume?.overallScore, 0)}`} />
          <StatChip delay={0.3} icon={<Mic className="w-6 h-6 text-indigo-400" />} label="Interviews Done" value={sessions.length} />
          <StatChip delay={0.4} icon={<BarChart3 className="w-6 h-6 text-purple-400" />} label="Avg Score" value={avgSessionScore || "—"} />
          <StatChip delay={0.5} icon={<Target className="w-6 h-6 text-fuchsia-400" />} label="Action Items" value={(resume?.missingSkills || []).length + (resume?.gaps || []).length} />
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Resume deep-dive (2/3 width) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Liquid Tabs */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex p-1.5 rounded-[24px] bg-sky-950/20 border border-sky-400/10 backdrop-blur-md relative z-20">
              {(["overview", "resume", "keywords"] as const).map(t => {
                const isActive = tab === t;
                return (
                  <button 
                    key={t} 
                    onClick={() => setTab(t)}
                    className={`flex-1 py-3.5 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all relative z-10 ${isActive ? 'text-white' : 'text-sky-200/50 hover:text-sky-200/80'}`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabBackground"
                        className="absolute inset-0 bg-gradient-to-r from-sky-500/40 to-indigo-500/40 border border-sky-400/40 rounded-[20px] shadow-[0_0_20px_rgba(14,165,233,0.3)] -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                    {t}
                  </button>
                );
              })}
            </motion.div>

            {/* Tab Content Area */}
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Overview tab */}
                {tab === "overview" && (
                  <GlassCard glow>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h2 className="text-lg font-black tracking-wide text-white">Score Breakdown</h2>
                    </div>
                    
                    <div className="grid gap-6 mb-8">
                      <SkillBar label="Relevance to Role"    score={getScore(resume?.relevance, 0)}    delay={0.1} />
                      <SkillBar label="Technical Skills"     score={getScore(resume?.skills, 0)}       delay={0.2} />
                      <SkillBar label="Experience Quality"   score={getScore(resume?.experience, 0)}   delay={0.3} />
                      <SkillBar label="Presentation"         score={getScore(resume?.presentation, 0)} delay={0.4} />
                      <SkillBar label="Keyword Coverage"     score={getScore(resume?.keywords, 0)}     delay={0.5} />
                    </div>

                    {/* AI Summary Liquid Card */}
                    <div className="p-6 rounded-[24px] relative overflow-hidden bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-400/20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[40px] rounded-full" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-3 flex items-center gap-2 relative z-10">
                        <Sparkles className="w-4 h-4 text-indigo-400" /> Executive Summary
                      </h4>
                      <p className="text-sm md:text-base text-indigo-100/70 leading-relaxed relative z-10 font-medium">
                        {resume?.summary || "No summary available."}
                      </p>
                    </div>
                  </GlassCard>
                )}

                {/* Resume text analysis tab */}
                {tab === "resume" && (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <GlassCard className="border-emerald-500/20 bg-emerald-500/5">
                        <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/20"><CheckCircle2 className="w-4 h-4" /></div>
                          Core Strengths
                        </h3>
                        <ul className="space-y-4">
                          {(resume?.strengths || []).map((s, i) => (
                            <li key={i} className="flex gap-4 text-sm text-emerald-100/70 leading-relaxed font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </GlassCard>

                      <GlassCard className="border-amber-500/20 bg-amber-500/5">
                        <h3 className="text-sm font-black uppercase tracking-widest text-amber-400 mb-6 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-amber-500/20"><AlertTriangle className="w-4 h-4" /></div>
                          Critical Gaps
                        </h3>
                        <ul className="space-y-4">
                          {(resume?.gaps || []).map((g, i) => (
                            <li key={i} className="flex gap-4 text-sm text-amber-100/70 leading-relaxed font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-2 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                              {g}
                            </li>
                          ))}
                        </ul>
                      </GlassCard>
                    </div>

                    <GlassCard glow className="border-sky-500/20">
                      <h3 className="text-sm font-black uppercase tracking-widest text-sky-400 mb-6 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-sky-500/20"><Zap className="w-4 h-4" /></div>
                        Strategic Recommendations
                      </h3>
                      <ol className="space-y-4">
                        {(resume?.recommendations || []).map((r, i) => (
                          <li key={i} className="flex gap-4 text-sm md:text-base text-sky-100/70 leading-relaxed font-medium">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                              {i + 1}
                            </span>
                            {r}
                          </li>
                        ))}
                      </ol>
                    </GlassCard>
                  </>
                )}

                {/* Keywords tab */}
                {tab === "keywords" && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <GlassCard className="border-emerald-500/20 bg-emerald-950/20">
                      <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20"><CheckCircle2 className="w-4 h-4" /></div>
                        Matched Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {(resume?.matchedSkills || []).map((k, i) => (
                          <span key={i} className="px-4 py-2 rounded-[14px] text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                            <CheckCircle2 className="w-3 h-3 inline mr-1.5 -mt-0.5" /> {k}
                          </span>
                        ))}
                      </div>
                    </GlassCard>

                    <GlassCard className="border-pink-500/20 bg-pink-950/20">
                      <h3 className="text-sm font-black uppercase tracking-widest text-pink-400 mb-2 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-pink-500/20"><Target className="w-4 h-4" /></div>
                        Missing Keywords
                      </h3>
                      <p className="text-xs text-pink-200/50 mb-6 font-medium">Critical for passing ATS filters for <strong className="text-pink-300/80">{profile.targetRole}</strong></p>
                      <div className="flex flex-wrap gap-2.5">
                        {(resume?.missingSkills || []).map((k, i) => (
                          <span key={i} className="px-4 py-2 rounded-[14px] text-xs font-bold bg-pink-500/10 border border-pink-500/30 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.1)]">
                            <Zap className="w-3 h-3 inline mr-1.5 -mt-0.5" /> {k}
                          </span>
                        ))}
                      </div>
                    </GlassCard>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-6">

            {/* AI Advisor Liquid Tip */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
              <GlassCard glow className="bg-gradient-to-b from-sky-500/10 to-indigo-500/5 border-sky-400/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/20 blur-[50px] rounded-full pointer-events-none" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="p-2 rounded-xl bg-sky-500/20"><Sparkles className="w-5 h-5 text-sky-400" /></div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-sky-300">PLaCEIQ Advisor</h3>
                </div>
                <p className="text-sm text-sky-100/70 leading-relaxed font-medium relative z-10 mb-6">
                  {getScore(resume?.overallScore, 0) < 60
                    ? `Your ATS score of ${getScore(resume?.overallScore, 0)} needs work. Prioritize adding the missing keywords from the Keywords tab to pass initial screening.`
                    : (resume?.missingSkills || []).length > 3
                    ? `You're very close. Try integrating skills like "${(resume?.missingSkills || []).slice(0, 2).join('", "')}" naturally into your experience bullet points.`
                    : `Your resume is highly optimized for ${profile.targetRole}. Shift your focus to mock interviews to perfect your delivery.`}
                </p>
                <a href="/resume-analyzer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 hover:bg-sky-500/30 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                  Refine Resume <ChevronRight className="w-3 h-3" />
                </a>
              </GlassCard>
            </motion.div>

            {/* Quick actions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
              <GlassCard>
                <h3 className="text-xs font-black uppercase tracking-widest text-sky-200/40 mb-5">Command Center</h3>
                <div className="space-y-3">
                  {[
                    { label: "AI Interview Simulator", desc: "Practice with Llama 3.3", icon: <Mic className="w-5 h-5" />, href: "/ai-interview", color: "from-sky-400 to-blue-500", textCol: "text-sky-400" },
                    { label: "Resume Architect", desc: "Optimize your CV", icon: <FileText className="w-5 h-5" />, href: "/resume-analyzer", color: "from-indigo-400 to-purple-500", textCol: "text-indigo-400" },
                    { label: "Technical Prep", desc: "DSA & System Design", icon: <BookOpen className="w-5 h-5" />, href: "/technical-prep", color: "from-emerald-400 to-teal-500", textCol: "text-emerald-400" },
                    { label: "Career Roadmap", desc: "Your 30-day plan", icon: <Target className="w-5 h-5" />, href: "/roadmaps", color: "from-fuchsia-400 to-pink-500", textCol: "text-fuchsia-400" },
                  ].map(a => (
                    <a key={a.label} href={a.href}
                      className="flex items-center gap-4 p-4 rounded-[20px] group transition-all bg-black/20 border border-white/5 hover:border-white/20 hover:bg-white/5 backdrop-blur-sm">
                      <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${a.color} bg-opacity-20 shadow-lg`}>
                        <div className="text-white">{a.icon}</div>
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-bold ${a.textCol} group-hover:text-white transition-colors`}>{a.label}</div>
                        <div className="text-[10px] text-white/30 font-medium mt-0.5">{a.desc}</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                      </div>
                    </a>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Session history */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
              <GlassCard>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-sky-200/40 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Activity Log
                  </h3>
                  <span className="text-[10px] px-2 py-1 bg-white/5 rounded-md text-white/30 font-bold">{sessions.length} total</span>
                </div>
                
                {sessions.length === 0 ? (
                  <div className="text-center py-10 bg-black/20 rounded-[20px] border border-white/5 border-dashed">
                    <Mic className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-xs text-white/40 font-medium mb-3">No interview data yet</p>
                    <a href="/ai-interview" className="inline-block px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors">
                      Start Interview
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.slice(0, 4).map(s => {
                      const sColor = s.overallScore >= 70 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : s.overallScore >= 50 ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-red-400 bg-red-500/10 border-red-500/20";
                      return (
                        <div key={s.id} className="flex items-center gap-4 p-3 rounded-[16px] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => router.push(`/ai-interview/results/${s.id}`)}>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black border shadow-inner ${sColor}`}>
                            {s.overallScore}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white/80 truncate mb-0.5">{s.type || s.role}</p>
                            <p className="text-[10px] text-white/40 font-medium">{new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/20" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
