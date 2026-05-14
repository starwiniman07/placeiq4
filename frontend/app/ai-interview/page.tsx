"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mic, User, Code2, Presentation, Search, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getProfile } from "@/lib/userStore";
import { useEffect } from "react";

const interviewTypes = [
  { id: "HR Round", icon: <User className="w-8 h-8 text-blue-400" />, desc: "Focuses on behavior, STAR method, and cultural fit." },
  { id: "Technical Round", icon: <Code2 className="w-8 h-8 text-emerald-400" />, desc: "General technical concepts, DBMS, OOPs, OS." },
  { id: "Software Developer Round", icon: <TerminalIcon className="w-8 h-8 text-purple-400" />, desc: "Deep dive into algorithms, system design, and coding." },
  { id: "Analyst Round", icon: <Search className="w-8 h-8 text-amber-400" />, desc: "Data interpretation, SQL, puzzles, and logic." },
  { id: "Custom Domain", icon: <Briefcase className="w-8 h-8 text-cyan-400" />, desc: "Specify your exact target role and company." },
];

export default function AIInterviewHome() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState("");
  const [filteredTypes, setFilteredTypes] = useState(interviewTypes);

  useEffect(() => {
    const profile = getProfile();
    if (profile) {
      const dept = profile.department || "";
      const isCS = dept === "Computer Science and Engineering" || dept === "Information Technology" || dept === "Data Science";
      if (!isCS) {
        setFilteredTypes(interviewTypes.filter(t => t.id !== "Software Developer Round"));
      }
    }
  }, []);

  const handleStart = () => {
    if (!selectedType) return;
    
    let target = selectedType;
    if (selectedType === "Custom Domain" && customRole) {
      target = customRole;
    }
    
    // Store in localStorage for the session page to pick up
    localStorage.setItem("currentInterviewSetup", JSON.stringify({
      type: selectedType,
      targetRole: target
    }));
    
    // Generate a random ID for the session
    const sessionId = Math.random().toString(36).substring(2, 15);
    router.push(`/ai-interview/session/${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 lg:p-12 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full mix-blend-screen filter blur-[128px]"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-full mb-6">
            <Mic className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">AI Interview Simulator</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience a hyper-realistic, voice-enabled interview conducted by Llama 3.3. Select your target round to begin.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredTypes.map((type, idx) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedType(type.id)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                selectedType === type.id 
                  ? "bg-blue-600/20 border-blue-500" 
                  : "bg-black/40 border-white/10 hover:bg-white/5"
              }`}
            >
              <div className="mb-4">{type.icon}</div>
              <h3 className="text-xl font-bold mb-2">{type.id}</h3>
              <p className="text-sm text-gray-400">{type.desc}</p>
            </motion.div>
          ))}
        </div>

        {selectedType === "Custom Domain" && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-12 max-w-md mx-auto"
          >
            <label className="block text-sm font-medium text-gray-400 mb-2">Specify your target role</label>
            <input 
              type="text" 
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
              placeholder="e.g., Frontend Engineer at Google"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
            />
          </motion.div>
        )}

        <div className="flex justify-center">
          <Button 
            size="lg"
            onClick={handleStart}
            disabled={!selectedType || (selectedType === "Custom Domain" && !customRole)}
            className="bg-white text-black hover:bg-gray-200 px-12 h-14 text-lg font-semibold rounded-full"
          >
            Start Interview Session
          </Button>
        </div>
      </div>
    </div>
  );
}

function TerminalIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
  )
}
