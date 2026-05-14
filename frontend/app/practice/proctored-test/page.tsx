"use client";

import { useState } from "react";
import { ProctorOverlay } from "@/components/proctoring/ProctorOverlay";
import { Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ProctoredExamPage() {
  const [trustScore, setTrustScore] = useState(100);
  const [logs, setLogs] = useState<string[]>([]);
  const [examFinished, setExamFinished] = useState(false);

  const handleWarning = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  if (examFinished) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-6" />
        <h1 className="text-3xl font-bold mb-2">Exam Submitted</h1>
        <p className="text-gray-400 mb-8">Your session was monitored by PlaceIQ AI.</p>
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center max-w-sm w-full">
           <p className="text-sm text-gray-500 mb-1">Integrity Trust Score</p>
           <p className={`text-5xl font-black ${trustScore > 80 ? 'text-emerald-500' : trustScore > 50 ? 'text-amber-500' : 'text-red-500'}`}>{trustScore}%</p>
        </div>
        <Button onClick={() => window.location.href = "/dashboard"} className="mt-8 bg-blue-600">Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12 bg-black/40 p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
             <Shield className="w-6 h-6 text-blue-400" />
             <h1 className="text-xl font-bold uppercase tracking-widest">Final Mock Assessment</h1>
          </div>
          <div className="text-red-400 font-mono text-xl">28:45</div>
        </header>

        <main className="bg-white/5 border border-white/10 p-10 rounded-3xl min-h-[400px] mb-8 relative">
           <div className="space-y-8">
              <h2 className="text-2xl font-bold">Question 1: Explain the difference between Deep Learning and Machine Learning.</h2>
              <textarea 
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 h-64 outline-none focus:border-blue-500"
                placeholder="Write your answer here..."
              ></textarea>
           </div>
           
           <div className="mt-12 flex justify-end">
              <Button onClick={() => setExamFinished(true)} className="bg-emerald-600 hover:bg-emerald-500 px-12 h-12 text-lg">Finish Exam</Button>
           </div>
        </main>

        <aside className="bg-black/40 border border-white/10 p-6 rounded-2xl">
           <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Proctoring Log</h3>
           <div className="space-y-2">
              {logs.length === 0 ? (
                <p className="text-xs text-gray-600 italic">No violations detected yet. AI is monitoring...</p>
              ) : (
                logs.map((log, i) => (
                  <p key={i} className="text-xs text-red-400/80 font-mono">{log}</p>
                ))
              )}
           </div>
        </aside>
      </div>

      <ProctorOverlay onWarning={handleWarning} onTrustScoreChange={setTrustScore} />
    </div>
  );
}
