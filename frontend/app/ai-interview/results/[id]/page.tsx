"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, AlertTriangle, Eye, UserCheck, Volume2, Activity, 
  ShieldCheck, Zap, Info, ArrowLeft, Download, Share2, Target,
  MessageSquare, User, Bot, TrendingUp, AlertCircle, Star, X
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function InterviewResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'rounds' | 'proctoring' | 'guide' | 'transcript'>('overview');
  const [expandedRound, setExpandedRound] = useState<number | null>(0);

  useEffect(() => {
    const data = localStorage.getItem(`interview_report_${params.id}`);
    if (data) {
      setReport(JSON.parse(data));
    } else {
      router.push("/ai-interview");
    }
  }, [params.id]);

  if (!report) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { performance, proctoring, transcript } = report;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const ScoreGauge = ({ score, label, icon }: { score: number, label: string, icon: any }) => (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 flex flex-col items-center text-center">
      <div className="relative w-24 h-24 mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
          <motion.circle 
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2"
            className={getScoreColor(score)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black">{score}</span>
          <span className="text-[8px] font-black uppercase text-gray-500">/ 100</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
        {icon} {label}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/ai-interview")} className="w-10 h-10 rounded-full border-white/10 p-0">
               <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
               <h1 className="text-3xl font-black tracking-tight">{report.type} Analysis</h1>
               <p className="text-gray-500">Session ID: #{params.id} • {new Date(report.date).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="border-white/10 rounded-2xl gap-2 font-bold h-12"><Download className="w-4 h-4" /> Export PDF</Button>
             <Button className="bg-white text-black hover:bg-gray-200 rounded-2xl gap-2 font-bold h-12 px-6"><Share2 className="w-4 h-4" /> Share Results</Button>
          </div>
        </div>

        {/* Overview Scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           <ScoreGauge score={performance.overallScore} label="Performance" icon={<TrendingUp className="w-3 h-3" />} />
           <ScoreGauge score={proctoring?.bodyLanguageScore || 0} label="Body Language" icon={<UserCheck className="w-3 h-3" />} />
           <ScoreGauge score={proctoring?.voiceScore || 0} label="Voice Clarity" icon={<Volume2 className="w-3 h-3" />} />
           <ScoreGauge score={proctoring?.integrityScore || 0} label="Integrity" icon={<ShieldCheck className="w-3 h-3" />} />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-white/10 shrink-0 overflow-x-auto scrollbar-hide">
           {['overview', 'rounds', 'proctoring', 'guide', 'transcript'].map((tab: any) => (
             <button 
               key={tab} 
               onClick={() => setActiveTab(tab)} 
               className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-indigo-400' : 'text-gray-500 hover:text-white'}`}
             >
                {tab}
                {activeTab === tab && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-full" />}
             </button>
           ))}
        </div>

        <AnimatePresence mode="wait">
           {activeTab === 'overview' && (
             <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Performance Metrics */}
                <div className="md:col-span-2 space-y-8">
                   <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-8">
                      <h3 className="text-lg font-black flex items-center gap-3"><TrendingUp className="w-5 h-5 text-indigo-400" /> Key Skills</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {[
                           { label: "Confidence", val: performance.confidence },
                           { label: "Fluency", val: performance.fluency },
                           { label: "Communication", val: performance.communication },
                           { label: "Technical Accuracy", val: performance.technicalAccuracy }
                         ].map(m => (
                           <div key={m.label} className="space-y-2">
                              <div className="flex justify-between text-xs font-bold text-gray-400"><span>{m.label}</span> <span>{m.val}/10</span></div>
                              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${m.val * 10}%` }} className="h-full bg-indigo-500" />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[40px] p-8">
                         <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2"><Zap className="w-4 h-4" /> Top Strengths</h3>
                         <ul className="space-y-4">
                            {performance.topStrengths.map((s: string, i: number) => (
                              <li key={i} className="flex gap-3 text-sm text-gray-300"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> {s}</li>
                            ))}
                         </ul>
                      </div>
                      <div className="bg-amber-500/5 border border-amber-500/10 rounded-[40px] p-8">
                         <h3 className="text-sm font-black uppercase tracking-widest text-amber-500 mb-6 flex items-center gap-2"><Target className="w-4 h-4" /> Improvement Areas</h3>
                         <ul className="space-y-4">
                            {performance.improvementAreas.map((s: string, i: number) => (
                              <li key={i} className="flex gap-3 text-sm text-gray-300"><AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" /> {s}</li>
                            ))}
                         </ul>
                      </div>
                   </div>
                </div>

                {/* Sidebar suggestions */}
                <div className="space-y-6">
                   <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-700" />
                      <h3 className="text-xl font-black mb-4 relative z-10">Expert Verdict</h3>
                      <p className="text-sm leading-relaxed text-indigo-100 relative z-10">
                         "{performance.overallVerdict || `Overall, you show high ${performance.confidence > 7 ? 'confidence' : 'potential'}. Focusing on ${performance.improvementAreas[0]?.toLowerCase()} will significantly boost your interview conversion rate.`}"
                      </p>
                      <div className="mt-8 pt-8 border-t border-white/20 relative z-10 flex justify-between items-end">
                         <div>
                           <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Ready For</div>
                           <div className="font-bold">{performance.targetLpa || '₹8-15 LPA range'}</div>
                         </div>
                         <div className="text-4xl font-black opacity-40">{performance.overallGrade || 'B+'}</div>
                      </div>
                   </div>
                   
                   <div className="bg-white/5 border border-white/10 rounded-[40px] p-8">
                      <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-6">Presence Analysis</h3>
                      <div className="space-y-6">
                         <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Eye Contact</span>
                            <span className="text-xs font-bold text-emerald-400">{proctoring?.eyeContact?.rating}</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Posture</span>
                            <span className="text-xs font-bold text-amber-400">{proctoring?.posture?.rating}</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Speech Pace</span>
                            <span className="text-xs font-bold text-emerald-400">{proctoring?.speakingSpeed?.rating}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>
           )}

           {activeTab === 'rounds' && (
             <motion.div key="rounds" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6 max-w-4xl mx-auto">
                {report.answerEvaluations?.map((evalItem: any, idx: number) => (
                  <div key={idx} className="bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden">
                     <button 
                       onClick={() => setExpandedRound(expandedRound === idx ? null : idx)}
                       className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-all"
                     >
                        <div className="flex items-center gap-6">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                             evalItem.evaluation.score >= 7 ? 'bg-emerald-500/20 text-emerald-400' :
                             evalItem.evaluation.score >= 4 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                           }`}>
                              {evalItem.evaluation.score}
                           </div>
                           <div className="text-left">
                              <h4 className="font-bold">Round {evalItem.round} — {evalItem.evaluation.verdict}</h4>
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 truncate max-w-md">{evalItem.question}</p>
                           </div>
                        </div>
                        <div className={`transition-transform duration-300 ${expandedRound === idx ? 'rotate-180' : ''}`}>
                           <TrendingUp className="w-5 h-5 text-gray-600" />
                        </div>
                     </button>
                     
                     <AnimatePresence>
                        {expandedRound === idx && (
                          <motion.div 
                           initial={{ height: 0, opacity: 0 }} 
                           animate={{ height: 'auto', opacity: 1 }} 
                           exit={{ height: 0, opacity: 0 }}
                           className="px-8 pb-8 space-y-6 border-t border-white/5 pt-6"
                          >
                             <div className="space-y-2">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Question Asked</h5>
                                <p className="text-gray-300">{evalItem.question}</p>
                             </div>
                             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Your Answer</h5>
                                <p className="text-sm italic text-gray-400 leading-relaxed">"{evalItem.studentAnswer}"</p>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                   <div className="flex items-start gap-3">
                                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                      <div>
                                         <h6 className="text-xs font-bold text-white">What You Got Right</h6>
                                         <p className="text-xs text-gray-400 mt-1">{evalItem.evaluation.whatWasRight}</p>
                                      </div>
                                   </div>
                                   <div className="flex items-start gap-3">
                                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                      <div>
                                         <h6 className="text-xs font-bold text-white">What Was Missing</h6>
                                         <p className="text-xs text-gray-400 mt-1">{evalItem.evaluation.whatWasMissing}</p>
                                      </div>
                                   </div>
                                </div>
                                <div className="bg-indigo-500/5 p-6 rounded-2xl border border-indigo-500/10">
                                   <h6 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3">Ideal Points to Mention</h6>
                                   <ul className="space-y-2">
                                      {evalItem.evaluation.keyPoints?.map((p: string, i: number) => (
                                        <li key={i} className="text-[11px] text-gray-300 flex items-center gap-2">
                                           <div className="w-1 h-1 bg-indigo-500 rounded-full" /> {p}
                                        </li>
                                      ))}
                                   </ul>
                                </div>
                             </div>
                          </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
                ))}
             </motion.div>
           )}

           {activeTab === 'proctoring' && (
             <motion.div key="proctoring" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-4">
                      <div className="flex items-center gap-3 text-indigo-400"><Eye className="w-5 h-5" /><h3 className="font-black text-sm uppercase tracking-widest">Eye Contact</h3></div>
                      <div className="text-xs text-gray-400 leading-relaxed">{proctoring?.eyeContact?.feedback}</div>
                      <div className="pt-4 flex items-center justify-between border-t border-white/5">
                         <span className="text-[10px] font-bold text-gray-500 uppercase">Rating</span>
                         <span className={`text-[10px] font-black uppercase ${getScoreColor(proctoring?.bodyLanguageScore)}`}>{proctoring?.eyeContact?.rating}</span>
                      </div>
                   </div>
                   <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-4">
                      <div className="flex items-center gap-3 text-amber-400"><UserCheck className="w-5 h-5" /><h3 className="font-black text-sm uppercase tracking-widest">Posture</h3></div>
                      <div className="text-xs text-gray-400 leading-relaxed">{proctoring?.posture?.feedback}</div>
                      <div className="pt-4 flex items-center justify-between border-t border-white/5">
                         <span className="text-[10px] font-bold text-gray-500 uppercase">Rating</span>
                         <span className={`text-[10px] font-black uppercase ${getScoreColor(proctoring?.bodyLanguageScore)}`}>{proctoring?.posture?.rating}</span>
                      </div>
                   </div>
                   <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-4">
                      <div className="flex items-center gap-3 text-blue-400"><Volume2 className="w-5 h-5" /><h3 className="font-black text-sm uppercase tracking-widest">Voice Clarity</h3></div>
                      <div className="text-xs text-gray-400 leading-relaxed">{proctoring?.voiceClarity?.feedback}</div>
                      <div className="pt-4 flex items-center justify-between border-t border-white/5">
                         <span className="text-[10px] font-bold text-gray-500 uppercase">Rating</span>
                         <span className={`text-[10px] font-black uppercase ${getScoreColor(proctoring?.voiceScore)}`}>{proctoring?.voiceClarity?.rating}</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white/5 border border-white/10 rounded-[40px] p-8">
                      <h3 className="text-lg font-black mb-8 flex items-center gap-3"><AlertCircle className="w-5 h-5 text-indigo-400" /> Suggestions for Improvement</h3>
                      <div className="space-y-4">
                         {proctoring?.suggestions.map((s: any, i: number) => (
                           <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl group hover:bg-white/10 transition-all">
                              <div className="flex justify-between items-start mb-4">
                                 <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${s.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    {s.priority} Priority
                                 </span>
                                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{s.category}</span>
                              </div>
                              <h4 className="font-bold mb-2">{s.issue}</h4>
                              <p className="text-xs text-gray-400 leading-relaxed italic">"{s.howToFix}"</p>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 flex flex-col">
                      <h3 className="text-lg font-black mb-8 flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-indigo-400" /> Integrity Report</h3>
                      <div className="flex-1 flex flex-col justify-center text-center space-y-6">
                         <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg ${proctoring?.integrityScore >= 90 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {proctoring?.integrityScore >= 90 ? <CheckCircle2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                         </div>
                         <div>
                            <h4 className="text-2xl font-black mb-2">{proctoring?.integrityEvents?.rating} Session</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">{proctoring?.integrityEvents?.feedback}</p>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                               <div className="text-2xl font-black text-white">{proctoring?.integrityEvents?.tabSwitches || 0}</div>
                               <div className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Tab Switches</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                               <div className="text-2xl font-black text-white">{report.voiceStats?.totalFillers || 0}</div>
                               <div className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Filler Words</div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {report.voiceStats && (
                  <div className="bg-white/5 border border-white/10 rounded-[40px] p-8">
                     <h3 className="text-lg font-black mb-8 flex items-center gap-3"><Volume2 className="w-5 h-5 text-indigo-400" /> Speech Pattern Analysis</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-4 text-center">
                           <div className="text-4xl font-black text-indigo-400">{report.voiceStats.avgWpm}</div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Average WPM</div>
                        </div>
                        <div className="space-y-4 text-center">
                           <div className="text-4xl font-black text-indigo-400">{report.voiceStats.totalFillers}</div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Fillers</div>
                        </div>
                        <div className="space-y-4 text-center">
                           <div className="text-4xl font-black text-indigo-400">{report.voiceStats.longPauses}</div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Long Pauses</div>
                        </div>
                     </div>
                     
                     <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(report.voiceStats.fillerBreakdown || {}).map(([word, count]: [any, any]) => (
                          <div key={word} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center">
                             <span className="text-xs font-bold text-gray-400">"{word}"</span>
                             <span className="px-2 py-0.5 bg-indigo-500/20 rounded-md text-[10px] font-black text-indigo-400">{count}x</span>
                          </div>
                        ))}
                     </div>
                  </div>
                )}
             </motion.div>
           )}

           {activeTab === 'guide' && (
             <motion.div key="guide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                   <h2 className="text-3xl font-black mb-4 text-indigo-400 uppercase">Complete Answer Guide</h2>
                   <p className="text-gray-400">Review the ideal answers for all {report.answerGuide?.length || 0} questions asked in this session</p>
                </div>
                
                <div className="grid grid-cols-1 gap-12">
                   {report.answerGuide?.map((item: any, idx: number) => (
                     <div key={idx} className="bg-neutral-900 border border-white/10 rounded-[48px] p-8 md:p-12 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all duration-700" />
                        
                        <div className="flex items-start gap-8 flex-col md:flex-row">
                           <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center text-2xl font-black shrink-0 shadow-lg">
                              Q{item.questionNumber}
                           </div>
                           <div className="flex-1 space-y-8">
                              <div>
                                 <h4 className="text-xl font-bold text-indigo-400 mb-6 leading-tight">{item.question}</h4>
                                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2"><Zap className="w-4 h-4" /> Ideal Answer</h5>
                                    <p className="text-gray-300 leading-relaxed">{item.idealAnswer}</p>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div>
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Key Points to Cover</h5>
                                    <ul className="space-y-3">
                                       {item.keyPoints?.map((p: string, i: number) => (
                                         <li key={i} className="flex gap-3 text-sm text-gray-400"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {p}</li>
                                       ))}
                                    </ul>
                                 </div>
                                 <div>
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Common Mistakes</h5>
                                    <ul className="space-y-3">
                                       {item.commonMistakes?.map((p: string, i: number) => (
                                         <li key={i} className="flex gap-3 text-sm text-gray-400"><X className="w-4 h-4 text-red-500 shrink-0" /> {p}</li>
                                       ))}
                                    </ul>
                                 </div>
                              </div>

                              <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-3xl">
                                 <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2 flex items-center gap-2"><Star className="w-4 h-4" /> Pro Tip</h5>
                                 <p className="text-sm text-amber-200/80 italic leading-relaxed">
                                    {item.advancedPoints?.[0] || 'Focus on providing specific examples from your past projects to demonstrate these concepts.'}
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </motion.div>
           )}

           {activeTab === 'transcript' && (
             <motion.div key="transcript" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 max-w-4xl mx-auto space-y-8">
                   {transcript.map((msg: any, idx: number) => (
                     <div key={idx} className={`flex gap-6 ${msg.role === 'student' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'interviewer' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                          {msg.role === 'interviewer' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div className={`flex-1 p-6 rounded-3xl ${msg.role === 'interviewer' ? 'bg-black/40 border border-white/5' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-100'}`}>
                           <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">{msg.role === 'interviewer' ? 'PlaceIQ AI' : 'You'}</div>
                           <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>

      <footer className="mt-20 border-t border-white/5 py-10 text-center text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
         © 2026 PlaceIQ Interview Simulator • Proctoring Integrity Verified
      </footer>
    </div>
  );
}
