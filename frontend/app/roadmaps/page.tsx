"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Map as MapIcon, Sparkles, Trophy, Flame, Calendar, Clock, 
  CheckCircle2, XCircle, AlertTriangle, BookOpen, Target, 
  Award, Zap, Lock, Trash2, ChevronDown, ChevronRight, X 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { STATIC_ROADMAPS } from "@/lib/roadmapData";

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

// --- Base Achievements ---
const BASE_ACHIEVEMENTS = [
  { id: "first_task", title: "First Step", description: "Complete your very first task", icon: "👣", trigger: { type: "tasks_complete", value: 1 }, xpReward: 50, rarity: "Common" },
  { id: "first_day", title: "Day One Done", description: "Complete all tasks on Day 1", icon: "⭐", trigger: { type: "day_complete", value: 1 }, xpReward: 100, rarity: "Common" },
  { id: "streak_3", title: "On a Roll", description: "Maintain a 3-day streak", icon: "🔥", trigger: { type: "streak", value: 3 }, xpReward: 150, rarity: "Common" },
  { id: "week_1", title: "Week Warrior", description: "Complete Week 1 of your roadmap", icon: "🗡️", trigger: { type: "week_complete", value: 1 }, xpReward: 300, rarity: "Rare" },
  { id: "streak_7", title: "Consistent", description: "Maintain a 7-day streak", icon: "💪", trigger: { type: "streak", value: 7 }, xpReward: 350, rarity: "Rare" },
  { id: "halfway", title: "Halfway Hero", description: "Complete Day 15 of your roadmap", icon: "🎯", trigger: { type: "day_complete", value: 15 }, xpReward: 500, rarity: "Rare" },
  { id: "week_2", title: "Two Week Titan", description: "Complete Week 2 of your roadmap", icon: "⚔️", trigger: { type: "week_complete", value: 2 }, xpReward: 400, rarity: "Rare" },
  { id: "streak_14", title: "Dedicated", description: "Maintain a 14-day streak", icon: "🏅", trigger: { type: "streak", value: 14 }, xpReward: 700, rarity: "Epic" },
  { id: "week_3", title: "Three Week Thunder", description: "Complete Week 3 of your roadmap", icon: "⚡", trigger: { type: "week_complete", value: 3 }, xpReward: 500, rarity: "Epic" },
  { id: "tasks_50", title: "Task Crusher", description: "Complete 50 tasks total", icon: "💥", trigger: { type: "tasks_complete", value: 50 }, xpReward: 400, rarity: "Rare" },
  { id: "tasks_100", title: "Century Club", description: "Complete 100 tasks total", icon: "💯", trigger: { type: "tasks_complete", value: 100 }, xpReward: 800, rarity: "Epic" },
  { id: "streak_21", title: "Habit Formed", description: "Maintain a 21-day streak", icon: "🧠", trigger: { type: "streak", value: 21 }, xpReward: 1000, rarity: "Epic" },
  { id: "week_4", title: "Month Master", description: "Complete Week 4 — finish the roadmap!", icon: "👑", trigger: { type: "week_complete", value: 4 }, xpReward: 1000, rarity: "Legendary" },
  { id: "streak_30", title: "Unstoppable", description: "Maintain a 30-day streak", icon: "🌟", trigger: { type: "streak", value: 30 }, xpReward: 2000, rarity: "Legendary" },
  { id: "roadmap_complete", title: "Placement Ready", description: "Complete all 30 days of a roadmap", icon: "🎓", trigger: { type: "day_complete", value: 30 }, xpReward: 2500, rarity: "Legendary" },
  { id: "perfect_week", title: "Perfect Week", description: "Complete all 7 days in a single week", icon: "✨", trigger: { type: "week_complete", value: 1 }, xpReward: 500, rarity: "Epic" },
  { id: "multi_roadmap", title: "Overachiever", description: "Generate and start 3 different roadmaps", icon: "🗺️", trigger: { type: "tasks_complete", value: 0 }, xpReward: 300, rarity: "Rare" },
  { id: "speed_day", title: "Speed Runner", description: "Complete a full day's tasks in under 1 hour", icon: "⚡", trigger: { type: "tasks_complete", value: 0 }, xpReward: 200, rarity: "Rare" }
];

const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 5000, 8000, 12000, 20000];
const LEVEL_NAMES = ["Beginner", "Learner", "Practitioner", "Achiever", "Expert", "Master", "Elite", "Legend"];

const getLevel = (xp: number) => {
  let lvl = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) lvl = i + 1;
  }
  return lvl;
};

// --- Main Component ---
export default function RoadmapsPage() {
  const [dreamRole, setDreamRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  
  const [savedRoadmaps, setSavedRoadmaps] = useState<any[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [activeProgress, setActiveProgress] = useState<any>(null);
  
  const [streak, setStreak] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastCheckInDate: "",
    totalDaysActive: 0,
    checkInHistory: [] as string[],
    freezesAvailable: 2,
    freezesUsed: [] as string[]
  });
  
  const [achievementsData, setAchievementsData] = useState({
    unlocked: [] as any[],
    totalXP: 0,
    level: 1,
    taskCount: 0,
    roadmapCount: 0
  });

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState("");
  
  const [toasts, setToasts] = useState<any[]>([]);
  const [celebration, setCelebration] = useState<any>(null);
  const [streakBanner, setStreakBanner] = useState<any>(null);
  
  const [activeAchievementTab, setActiveAchievementTab] = useState("unlocked");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({
     '1': true, '2': true, '3': true, '4': true
  });

  // Load Initial Data
  useEffect(() => {
    // Check mobile
    if (window.innerWidth < 768) {
      setExpandedWeeks({ '1': false, '2': false, '3': false, '4': false });
    }

    const loadData = () => {
      const roadmaps = JSON.parse(localStorage.getItem("placeiq_roadmaps") || "[]");
      setSavedRoadmaps(roadmaps);
      
      const st = JSON.parse(localStorage.getItem("placeiq_streak") || "null");
      if (st) setStreak(st);
      
      const ach = JSON.parse(localStorage.getItem("placeiq_achievements") || "null");
      if (ach) setAchievementsData(ach);
      else setAchievementsData({ unlocked: [], totalXP: 0, level: 1, taskCount: 0, roadmapCount: 0 });

      // Run daily streak check
      checkStreakOnLoad(st || streak);
    };
    loadData();
  }, []);

  const saveStreak = (newStreak: any) => {
    setStreak(newStreak);
    localStorage.setItem("placeiq_streak", JSON.stringify(newStreak));
  };

  const saveAchievements = (newAch: any) => {
    newAch.level = getLevel(newAch.totalXP);
    setAchievementsData(newAch);
    localStorage.setItem("placeiq_achievements", JSON.stringify(newAch));
  };

  const saveProgress = (id: string, newProg: any) => {
    setActiveProgress(newProg);
    localStorage.setItem(`placeiq_roadmap_progress_${id}`, JSON.stringify(newProg));
  };

  const addToast = (msg: string, type: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // --- Streak Logic ---
  const checkStreakOnLoad = (currentSt: typeof streak) => {
    const today = new Date().toDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toDateString();
    
    if (currentSt.lastCheckInDate === today) {
       setStreakBanner({ type: "success", msg: `✅ You've checked in today! Streak: ${currentSt.currentStreak} days 🔥` });
       setTimeout(() => setStreakBanner(null), 3000);
       return;
    }
    
    if (currentSt.lastCheckInDate === yesterday) {
       setStreakBanner({ type: "warning", msg: `⚠️ Your ${currentSt.currentStreak} day streak is at risk! Complete a task today.` });
       return;
    }
    
    if (!currentSt.lastCheckInDate) return; // New user

    // Missed a day
    const lastCheckIn = new Date(currentSt.lastCheckInDate);
    const daysMissed = Math.floor((new Date().getTime() - lastCheckIn.getTime()) / 86400000);
    
    if (daysMissed === 2 && currentSt.freezesAvailable > 0 && currentSt.currentStreak > 0) {
       setStreakBanner({ type: "freeze", msg: `❄️ You missed yesterday. Use a streak freeze to save your ${currentSt.currentStreak} day streak?`, st: currentSt });
    } else if (daysMissed >= 1 && currentSt.currentStreak > 0) {
       addToast(`💔 Your ${currentSt.currentStreak} day streak ended. Start a new one today!`, "error");
       saveStreak({ ...currentSt, currentStreak: 0 });
    }
  };

  const useStreakFreeze = () => {
    if (!streakBanner || streakBanner.type !== "freeze") return;
    const todayDate = new Date();
    todayDate.setDate(todayDate.getDate() - 1); // Pretend we checked in yesterday
    const pseudoYesterday = todayDate.toDateString();
    
    const newStreak = {
       ...streak,
       freezesAvailable: streak.freezesAvailable - 1,
       freezesUsed: [...streak.freezesUsed, pseudoYesterday],
       lastCheckInDate: pseudoYesterday 
    };
    saveStreak(newStreak);
    setStreakBanner({ type: "warning", msg: `❄️ Freeze used! Complete a task today to keep your ${streak.currentStreak} day streak alive.` });
  };

  const processDailyCheckIn = () => {
    const today = new Date().toDateString();
    if (streak.lastCheckInDate === today) return; // Already checked in

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toDateString();

    let newCurrent = streak.currentStreak;
    
    if (streak.lastCheckInDate === yesterday || streak.currentStreak === 0) {
       newCurrent += 1;
    } else {
       // Should have been handled by onLoad, but just in case
       newCurrent = 1;
    }

    const newLongest = Math.max(streak.longestStreak, newCurrent);
    
    // Earn freeze every 7 days
    let newFreezes = streak.freezesAvailable;
    if (newCurrent > 0 && newCurrent % 7 === 0) newFreezes += 1;

    saveStreak({
      ...streak,
      currentStreak: newCurrent,
      longestStreak: newLongest,
      lastCheckInDate: today,
      totalDaysActive: streak.totalDaysActive + 1,
      checkInHistory: [...streak.checkInHistory, today],
      freezesAvailable: newFreezes
    });

    addToast(`🔥 ${newCurrent} day streak! Keep it up!`, "success");
    setStreakBanner(null);

    // Check streak achievements
    checkAchievements({ type: "streak", value: newCurrent });
  };

  // --- Achievements Logic ---
  // Removed unlockAchievement helper to handle queuing in checkAchievements

  const checkAchievements = (event: any) => {
    let newAch = { ...achievementsData, unlocked: [...achievementsData.unlocked] };
    const allAchs = [...BASE_ACHIEVEMENTS, ...(activeRoadmap?.roadmapData?.achievements || [])].reduce((acc, curr) => {
      if (!acc.find((a: any) => a.id === curr.id)) acc.push(curr);
      return acc;
    }, [] as any[]);
    
    let newlyUnlocked: any[] = [];
    allAchs.forEach(ach => {
       if (newAch.unlocked.find(u => u.id === ach.id)) return;
       if (ach.trigger.type === event.type && event.value >= ach.trigger.value) {
          newlyUnlocked.push(ach);
          newAch.unlocked.push({ id: ach.id, unlockedAt: new Date().toISOString() });
          newAch.totalXP += ach.xpReward;
       }
    });
    
    if (newlyUnlocked.length > 0) {
       saveAchievements(newAch);
       newlyUnlocked.forEach((ach, index) => {
          setTimeout(() => {
             addToast(`🏆 Achievement Unlocked: ${ach.title} (+${ach.xpReward} XP)`, "achievement");
          }, index * 1000);
       });
    }
  };

  const addXP = (amount: number, reason: string) => {
    let newAch = { ...achievementsData };
    newAch.totalXP += amount;
    saveAchievements(newAch);
    addToast(`+${amount} XP (${reason})`, "xp");
  };

  // --- Generation ---
  const parseGroqResponse = (text: string) => {
    // Strip everything before first { and after last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No JSON object found in response');
    }
    const jsonStr = text.slice(firstBrace, lastBrace + 1);
    return JSON.parse(jsonStr);
  };

  const generateRoadmap = async () => {
    if (!dreamRole || !currentSkills) return;
    setLoading(true);
    setError("");

    // --- Static Fallback (Instant) ---
    const roleKey = dreamRole.toUpperCase();
    if (STATIC_ROADMAPS[roleKey]) {
      const parsed = STATIC_ROADMAPS[roleKey];
      const newRoadmap = {
        id: Date.now().toString(),
        dreamRole,
        currentSkills,
        generatedAt: new Date().toISOString(),
        readinessLevel: parsed.readinessLevel,
        fitPercentage: parsed.fitPercentage,
        roadmapData: parsed,
        totalTasks: parsed.roadmap.reduce((acc: number, r: any) => acc + r.tasks.length, 0),
        totalXPAvailable: 0
      };
      const updatedRoadmaps = [newRoadmap, ...savedRoadmaps];
      setSavedRoadmaps(updatedRoadmaps);
      localStorage.setItem("placeiq_roadmaps", JSON.stringify(updatedRoadmaps));
      setActiveRoadmap(newRoadmap);
      saveProgress(newRoadmap.id, { completedTasks: {}, completedDays: [], completedWeeks: [], xpEarned: 0, startedAt: new Date().toISOString(), lastActiveAt: new Date().toISOString(), dayStartTimes: {} });
      setLoading(false);
      addToast("Roadmap generated instantly from library!", "success");
      return;
    }
    
    const sys = "You are a career coach. You must respond with ONLY a valid JSON object. No text before or after. No markdown. No backticks. No explanation. Just the raw JSON.";
    const user = `Dream Role: ${dreamRole}
Current Skills: ${currentSkills}

Return this EXACT JSON (no extra fields, no comments):
{
  "readinessLevel": "Beginner",
  "fitPercentage": 65,
  "honestyNote": "string",
  "topJobRoles": [
    {"role": "string", "fitPercent": 70, "reason": "string", "avgSalary": "string"}
  ],
  "skillGaps": [
    {"skill": "string", "priority": "High", "currentLevel": "Beginner", 
     "targetLevel": "Intermediate", "resource": "string", "estimatedDays": 14}
  ],
  "weekThemes": [
    {"week": 1, "theme": "string", "goal": "string", "xpReward": 200},
    {"week": 2, "theme": "string", "goal": "string", "xpReward": 300},
    {"week": 3, "theme": "string", "goal": "string", "xpReward": 400},
    {"week": 4, "theme": "string", "goal": "string", "xpReward": 500}
  ],
  "roadmap": [
    {"day": 1, "title": "string", "theme": "string", 
     "tasks": ["task 1", "task 2", "task 3"], 
     "estimatedHours": 2, "milestone": false, "milestoneTitle": ""}
  ]
}

Generate ALL 30 days in the roadmap array.
readinessLevel must be exactly one of: Beginner, Intermediate, Ready
priority must be exactly one of: High, Medium, Low
milestone must be true only for days 7, 14, 21, 30`;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        setLoadingStep(`🤖 Generating your roadmap... (Attempt ${attempt} of 3)`);
        
        const raw = await groqCall(sys, user);
        const parsed = parseGroqResponse(raw);
        
        // Validate required fields
        if (!parsed.roadmap || !Array.isArray(parsed.roadmap)) {
          throw new Error('Missing roadmap array');
        }
        if (parsed.roadmap.length < 28) {
          throw new Error(`Only ${parsed.roadmap.length} days generated`);
        }

        const newRoadmap = {
          id: Date.now().toString(),
          dreamRole,
          currentSkills,
          generatedAt: new Date().toISOString(),
          readinessLevel: parsed.readinessLevel,
          fitPercentage: parsed.fitPercentage,
          roadmapData: parsed,
          totalTasks: parsed.roadmap.reduce((acc: number, r: any) => acc + r.tasks.length, 0),
          totalXPAvailable: 0
        };

        const newProgress = {
          completedTasks: {},
          completedDays: [],
          completedWeeks: [],
          xpEarned: 0,
          startedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          dayStartTimes: {}
        };

        const updatedRoadmaps = [newRoadmap, ...savedRoadmaps];
        setSavedRoadmaps(updatedRoadmaps);
        localStorage.setItem("placeiq_roadmaps", JSON.stringify(updatedRoadmaps));
        
        setActiveRoadmap(newRoadmap);
        saveProgress(newRoadmap.id, newProgress);

        let newAch = { ...achievementsData, roadmapCount: achievementsData.roadmapCount + 1 };
        saveAchievements(newAch);
        if (newAch.roadmapCount === 3) checkAchievements({ type: "tasks_complete", value: 0 });
        
        setDreamRole("");
        setCurrentSkills("");
        setLoading(false);
        return; // Success!

      } catch (err: any) {
        console.error(`Attempt ${attempt} failed:`, err.message);
        if (attempt === 3) {
          setError(
            `Generation failed: ${err.message}. ` +
            `This usually means Groq returned malformed JSON. ` +
            `Please try again — it usually works on the second attempt.`
          );
          setLoading(false);
        } else {
          // Wait 2 seconds before retry
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
  };

  const loadRoadmap = (rm: any) => {
    setActiveRoadmap(rm);
    const prog = JSON.parse(localStorage.getItem(`placeiq_roadmap_progress_${rm.id}`) || "null");
    if (prog) {
      setActiveProgress(prog);
    } else {
      saveProgress(rm.id, { completedTasks: {}, completedDays: [], completedWeeks: [], xpEarned: 0, startedAt: new Date().toISOString(), lastActiveAt: new Date().toISOString(), dayStartTimes: {} });
    }
  };

  const deleteRoadmap = (id: string) => {
    if (!confirm("Delete this roadmap? Your progress will be lost.")) return;
    const updated = savedRoadmaps.filter(r => r.id !== id);
    setSavedRoadmaps(updated);
    localStorage.setItem("placeiq_roadmaps", JSON.stringify(updated));
    localStorage.removeItem(`placeiq_roadmap_progress_${id}`);
    if (activeRoadmap?.id === id) {
       setActiveRoadmap(null);
       setActiveProgress(null);
    }
  };

  // --- Task Interaction ---
  const toggleTask = (dayNum: number, taskIdx: number) => {
    if (!activeProgress || !activeRoadmap) return;
    
    const taskKey = `day${dayNum}_task${taskIdx}`;
    const isCompleted = !activeProgress.completedTasks[taskKey];
    
    let newProg = { 
      ...activeProgress, 
      completedTasks: { ...activeProgress.completedTasks, [taskKey]: isCompleted },
      lastActiveAt: new Date().toISOString()
    };
    
    // Day start time tracking
    if (isCompleted && !newProg.dayStartTimes[`day${dayNum}`]) {
       newProg.dayStartTimes[`day${dayNum}`] = new Date().toISOString();
    }

    // Process XP & Daily Check-in if checking
    if (isCompleted) {
       addXP(10, "Task Complete");
       processDailyCheckIn();
       
       let newAch = { ...achievementsData, taskCount: achievementsData.taskCount + 1 };
       saveAchievements(newAch);
       checkAchievements({ type: "tasks_complete", value: newAch.taskCount });
    }

    // Check if day is complete
    const dayData = activeRoadmap.roadmapData.roadmap.find((d: any) => d.day === dayNum);
    if (dayData) {
       const allTasksDone = dayData.tasks.every((_: any, i: number) => newProg.completedTasks[`day${dayNum}_task${i}`]);
       const alreadyCompletedDay = newProg.completedDays.includes(dayNum);
       
       if (allTasksDone && !alreadyCompletedDay) {
          newProg.completedDays.push(dayNum);
          addXP(50, "Day Complete");
          
          if (dayData.milestone) {
             setCelebration({ title: dayData.milestoneTitle, msg: `You've completed ${newProg.completedDays.length} days of your roadmap!` });
          }

          // Speed run check
          const startTime = new Date(newProg.dayStartTimes[`day${dayNum}`]).getTime();
          const timeTaken = new Date().getTime() - startTime;
          if (timeTaken < 3600000) checkAchievements({ type: "tasks_complete", value: 0 }); // trigger speed check
          
          checkAchievements({ type: "day_complete", value: newProg.completedDays.length });
          
          // Check if week is complete
          const weekNum = Math.ceil(dayNum / 7);
          const daysInWeek = [1,2,3,4,5,6,7].map(d => (weekNum - 1) * 7 + d);
          const weekDone = daysInWeek.every(d => newProg.completedDays.includes(d));
          
          if (weekDone && !newProg.completedWeeks.includes(weekNum)) {
             newProg.completedWeeks.push(weekNum);
             const weekTheme = activeRoadmap.roadmapData.weekThemes.find((w: any) => w.week === weekNum);
             addXP(weekTheme?.xpReward || 200, `Week ${weekNum} Complete!`);
             checkAchievements({ type: "week_complete", value: weekNum });
          }
       } else if (!allTasksDone && alreadyCompletedDay) {
          newProg.completedDays = newProg.completedDays.filter((d: number) => d !== dayNum);
       }
    }

    saveProgress(activeRoadmap.id, newProg);
  };

  // --- Sub Renders ---
  const renderLeftPanel = () => (
    <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
         <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Sparkles className="text-purple-400" /> New Roadmap</h2>
         <div className="space-y-4">
            <div>
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Dream Role</label>
               <input 
                 type="text" 
                 value={dreamRole} onChange={e => setDreamRole(e.target.value)}
                 placeholder="e.g. SDE at Microsoft"
                 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none"
               />
            </div>
            <div>
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Current Skills</label>
               <textarea 
                 value={currentSkills} onChange={e => setCurrentSkills(e.target.value)}
                 placeholder="e.g. C++, Basic React, HTML"
                 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none resize-y min-h-[100px]"
               />
            </div>
            {error && <div className="text-red-400 text-xs font-bold bg-red-500/10 p-2 rounded">{error}</div>}
            
            <Button 
               onClick={() => generateRoadmap()} 
               disabled={!dreamRole || !currentSkills || loading}
               className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 font-black h-12 rounded-xl"
            >
               {loading ? <span className="animate-pulse">{loadingStep}</span> : "Generate Roadmap"}
            </Button>
         </div>
      </div>

      {savedRoadmaps.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex-1 overflow-y-auto scrollbar-hide">
           <h2 className="text-sm font-black mb-4 flex items-center gap-2 uppercase tracking-widest text-gray-400"><MapIcon className="w-4 h-4" /> Your Path-ways</h2>
           <div className="space-y-4">
              {savedRoadmaps.map(rm => (
                <div key={rm.id} className={`p-4 rounded-2xl border transition-all ${activeRoadmap?.id === rm.id ? 'bg-purple-900/20 border-purple-500/50' : 'bg-black/40 border-white/5 hover:border-white/20'}`}>
                   <div className="flex justify-between items-start mb-2">
                      <div className="font-bold line-clamp-1">{rm.dreamRole}</div>
                      <button onClick={() => deleteRoadmap(rm.id)} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                   </div>
                   <div className="text-xs text-gray-400 mb-3">{rm.readinessLevel} • {rm.fitPercentage}% Fit</div>
                   <Button onClick={() => loadRoadmap(rm)} variant="outline" className="w-full h-8 text-xs border-white/10">Load Roadmap</Button>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );

  const renderStreak = (isMobile = false) => (
    <div className={`bg-white/5 border border-white/10 rounded-3xl p-6 ${isMobile ? 'mb-6' : ''}`}>
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-xl font-black flex items-center gap-2"><Flame className="text-orange-500" /> Current Streak</h2>
           <div className="flex gap-1">{Array.from({length: streak.freezesAvailable}).map((_, i) => <span key={i} title="Freeze Available">❄️</span>)}</div>
        </div>
        
        <div className="flex items-end gap-2 mb-6">
           <span className="text-6xl font-black text-orange-500">{streak.currentStreak}</span>
           <span className="text-gray-400 font-bold mb-2">days</span>
        </div>
        
        <div className="space-y-2 text-sm text-gray-400 font-bold bg-black/40 p-4 rounded-xl mb-4">
           <div className="flex justify-between"><span>Longest Streak</span><span className="text-white">{streak.longestStreak} days 🏆</span></div>
           <div className="flex justify-between"><span>Total Active</span><span className="text-white">{streak.totalDaysActive} days</span></div>
        </div>

        <div className="flex justify-between mb-6">
           {[3, 7, 14, 21, 30].map(m => (
             <div key={m} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 ${streak.longestStreak >= m ? 'border-orange-500 bg-orange-500/20 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'border-white/10 text-gray-600 bg-black/40'}`}>
                🔥{m}
             </div>
           ))}
        </div>

        {/* Streak Calendar */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Last 4 Weeks Activity</h3>
           <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }).map((_, i) => {
                 const date = new Date();
                 date.setDate(date.getDate() - (27 - i));
                 const dateStr = date.toDateString();
                 const isToday = dateStr === new Date().toDateString();
                 const isCheckedIn = streak.checkInHistory.includes(dateStr);
                 const isFrozen = streak.freezesUsed.includes(dateStr);
                 
                 return (
                   <div 
                     key={i} 
                     title={dateStr}
                     className={`
                       aspect-square rounded-full border flex items-center justify-center
                       ${isToday ? 'border-white ring-1 ring-white/50' : 'border-transparent'}
                       ${isCheckedIn ? 'bg-emerald-500 border-emerald-400' : isFrozen ? 'bg-blue-500 border-blue-400' : 'bg-white/5'}
                     `}
                   />
                 );
              })}
           </div>
        </div>
    </div>
  );

  const renderAchievements = () => {
    const allAchievements = [...BASE_ACHIEVEMENTS, ...(activeRoadmap?.roadmapData?.achievements || [])].reduce((acc, current) => {
       const x = acc.find((item: any) => item.id === current.id);
       if (!x) return acc.concat([current]); else return acc;
    }, []);

    const unlockedSet = new Set(achievementsData.unlocked.map(u => u.id));
    const dispAchs = activeAchievementTab === "unlocked" ? allAchievements.filter((a: any) => unlockedSet.has(a.id)) : allAchievements.filter((a: any) => !unlockedSet.has(a.id));

    return (
      <div className="flex flex-col gap-6 h-full">
        {/* Level / XP */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
           <div className="flex justify-between items-end mb-2">
              <div className="font-black text-lg text-purple-400">⭐ Lv.{achievementsData.level} {LEVEL_NAMES[achievementsData.level - 1]}</div>
              <div className="text-xs font-bold text-gray-500">{achievementsData.totalXP} / {LEVEL_THRESHOLDS[achievementsData.level] || 'MAX'} XP</div>
           </div>
           <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-purple-500" style={{ width: `${LEVEL_THRESHOLDS[achievementsData.level] ? (achievementsData.totalXP - LEVEL_THRESHOLDS[achievementsData.level-1]) / (LEVEL_THRESHOLDS[achievementsData.level] - LEVEL_THRESHOLDS[achievementsData.level-1]) * 100 : 100}%` }}></div>
           </div>
        </div>

        {/* Achievements List */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex-1 overflow-hidden flex flex-col">
           <h2 className="text-lg font-black mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2"><Trophy className="text-yellow-500 w-5 h-5" /> Achievements</span>
              <span className="text-xs text-gray-500">{achievementsData.unlocked.length}/{allAchievements.length}</span>
           </h2>
           
           <div className="flex bg-black/40 rounded-xl p-1 mb-4 shrink-0">
              <button onClick={() => setActiveAchievementTab("unlocked")} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeAchievementTab === 'unlocked' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>Unlocked</button>
              <button onClick={() => setActiveAchievementTab("locked")} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeAchievementTab === 'locked' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>Locked</button>
           </div>

           <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide shrink-0">
              {['All', 'Streaks', 'Progress', 'Milestones', 'Special'].map(cat => (
                 <button key={cat} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                    {cat}
                 </button>
              ))}
           </div>

           <div className="overflow-y-auto pr-2 space-y-3 scrollbar-hide flex-1">
              {dispAchs.map((a: any) => {
                 const isUn = activeAchievementTab === "unlocked";
                 const rarityColors: Record<string, string> = { Common: 'border-gray-500/30', Rare: 'border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]', Epic: 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]', Legendary: 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.4)]' };
                 return (
                   <div key={a.id} className={`p-3 rounded-xl border flex gap-3 relative overflow-hidden ${isUn ? `bg-white/5 ${rarityColors[a.rarity || 'Common']}` : 'bg-black/40 border-white/5 opacity-60'}`}>
                      {!isUn && <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center backdrop-blur-[1px]"><Lock className="w-6 h-6 text-gray-500" /></div>}
                      <div className="text-3xl shrink-0 grayscale={!isUn ? 1 : 0}">{a.icon}</div>
                      <div>
                         <div className="font-bold text-sm leading-tight">{a.title}</div>
                         <div className="text-[10px] text-gray-400 mt-1 line-clamp-2">{isUn ? a.description : '???'}</div>
                         <div className="text-[10px] font-black text-purple-400 mt-2">+{a.xpReward} XP</div>
                      </div>
                   </div>
                 );
              })}
           </div>
        </div>
      </div>
    );
  };

  const renderRightPanel = () => (
    <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6 h-full">
       {renderStreak()}
       {renderAchievements()}
    </div>
  );

  const renderCenter = () => {
    if (!activeRoadmap || !activeProgress) return (
      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
         <MapIcon className="w-24 h-24 mb-6" />
         <h2 className="text-3xl font-black mb-2">No Active Roadmap</h2>
         <p>Generate a new roadmap or load a saved one from the left panel.</p>
      </div>
    );

    const rd = activeRoadmap.roadmapData;
    const completedDays = activeProgress.completedDays.length;

    return (
      <div className="flex-1 space-y-8 pb-10">
         {/* Header */}
         <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
               <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight max-w-xl">
                  {activeRoadmap.dreamRole}
               </h1>
               <Button variant="outline" className="border-white/10 rounded-xl h-10 px-4 text-xs font-black shrink-0 hover:bg-white/5">
                  Save Roadmap
               </Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-xs font-black">
               <div className="flex items-center gap-1.5 bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-full border border-purple-500/20">
                  <Target className="w-3.5 h-3.5" />
                  {rd.readinessLevel}
               </div>
               <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <Zap className="w-3.5 h-3.5" />
                  {rd.fitPercentage}% Match
               </div>
               <div className="text-gray-500 ml-auto">
                  {completedDays} <span className="opacity-50">/ 30 Days</span>
               </div>
            </div>

            <div className="h-2.5 bg-white/5 rounded-full mt-4 overflow-hidden border border-white/10">
               <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedDays/30)*100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
               />
            </div>
         </div>

         {/* Summary Row */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center group hover:bg-white/[0.07] transition-all">
               <div className="relative w-16 h-16 mb-3">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" r="45" className="stroke-white/5 fill-none" strokeWidth="10" />
                     <circle cx="50" cy="50" r="45" className="stroke-emerald-500 fill-none" strokeWidth="10" strokeDasharray={`${(rd.fitPercentage / 100) * 283} 283`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-sm">{rd.fitPercentage}%</div>
               </div>
               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{rd.readinessLevel} Readiness</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between group hover:bg-white/[0.07] transition-all">
               <div>
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                     <Target className="w-3 h-3" /> Recommended Role
                  </div>
                  <div className="font-bold text-sm leading-tight line-clamp-2">{rd.topJobRoles[0]?.role}</div>
               </div>
               <div className="text-xs text-emerald-400 font-black mt-2">{rd.topJobRoles[0]?.avgSalary}</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between group hover:bg-white/[0.07] transition-all">
               <div>
                  <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                     <AlertTriangle className="w-3 h-3" /> Biggest Gap
                  </div>
                  <div className="font-bold text-sm leading-tight line-clamp-2">{rd.skillGaps[0]?.skill}</div>
               </div>
               <div className="text-xs text-gray-500 font-bold mt-2">Fix in ~{rd.skillGaps[0]?.estimatedDays} days</div>
            </div>
         </div>

         {/* Assessment Box */}
         <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex gap-4 text-gray-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
            <AlertTriangle className="shrink-0 w-6 h-6 text-amber-500" />
            <div>
               <div className="font-black text-xs uppercase tracking-widest mb-1.5 text-white flex items-center gap-2">
                  Honest Assessment <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
               </div>
               <p className="text-sm leading-relaxed italic text-gray-400 font-medium">"{rd.honestyNote}"</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
               <h3 className="font-black text-gray-500 uppercase tracking-widest text-xs mb-4">Top Recommended Roles</h3>
               <div className="space-y-3">
                  {rd.topJobRoles.map((r: any, i: number) => (
                    <div key={i} className="bg-black/40 p-3 rounded-xl flex justify-between items-center">
                       <div><div className="font-bold text-sm">{r.role}</div><div className="text-xs text-gray-500">{r.reason}</div></div>
                       <div className="text-right shrink-0"><div className="text-emerald-400 font-black text-sm">{r.fitPercent}% Fit</div><div className="text-[10px] text-gray-500">{r.avgSalary}</div></div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
               <h3 className="font-black text-gray-500 uppercase tracking-widest text-xs mb-4">Critical Skill Gaps</h3>
               <div className="space-y-3">
                  {rd.skillGaps.slice(0,3).map((g: any, i: number) => (
                    <div key={i} className="bg-black/40 p-3 rounded-xl">
                       <div className="flex justify-between mb-1">
                          <span className="font-bold text-sm">{g.skill}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${g.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>{g.priority}</span>
                       </div>
                       <div className="text-xs text-gray-500 mb-2">{g.currentLevel} → <span className="text-white">{g.targetLevel}</span></div>
                       <div className="text-[10px] text-indigo-400 font-bold truncate">📚 {g.resource}</div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* 30 Day Timeline */}
         <div className="space-y-6 pt-6">
            <h2 className="text-2xl font-black mb-4">Your 30-Day Blueprint</h2>
            {rd.weekThemes.map((week: any) => {
              const days = rd.roadmap.filter((d: any) => Math.ceil(d.day / 7) === week.week);
              const isExpanded = expandedWeeks[week.week.toString()];
              
              return (
                <div key={week.week} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                   <button 
                     onClick={() => setExpandedWeeks({ ...expandedWeeks, [week.week]: !isExpanded })}
                     className="w-full p-6 flex items-center justify-between bg-black/20 hover:bg-black/40 transition-all text-left"
                   >
                      <div>
                         <div className="text-xs font-black text-purple-400 uppercase tracking-widest mb-1">Week {week.week} • +{week.xpReward} XP</div>
                         <h3 className="text-xl font-bold">{week.theme}</h3>
                         <div className="text-sm text-gray-500 mt-1">{week.goal}</div>
                      </div>
                      {isExpanded ? <ChevronDown className="w-6 h-6 text-gray-500" /> : <ChevronRight className="w-6 h-6 text-gray-500" />}
                   </button>
                   
                   <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                           <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
                              {days.map((day: any) => {
                                 const dayCompleted = activeProgress.completedDays.includes(day.day);
                                 const allTasksCount = day.tasks.length;
                                 const completedTasksCount = day.tasks.filter((_:any, i:number) => activeProgress.completedTasks[`day${day.day}_task${i}`]).length;
                                 
                                 return (
                                   <div key={day.day} className={`p-5 rounded-2xl border-2 transition-all ${dayCompleted ? 'bg-emerald-900/10 border-emerald-500/50' : day.milestone ? 'bg-yellow-900/10 border-yellow-500/50' : 'bg-black/40 border-white/5'}`}>
                                      <div className="flex justify-between items-start mb-4">
                                         <div>
                                            <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                               Day {day.day}
                                               {day.milestone && <span className="text-yellow-500 bg-yellow-500/20 px-2 py-0.5 rounded flex items-center gap-1"><Trophy className="w-3 h-3"/> Milestone</span>}
                                               {dayCompleted && <span className="text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Done</span>}
                                            </div>
                                            <div className={`font-bold leading-tight ${dayCompleted ? 'text-gray-400' : 'text-white'}`}>{day.title}</div>
                                         </div>
                                      </div>
                                      
                                      <div className="space-y-2 mb-4">
                                         {day.tasks.map((task: string, i: number) => {
                                            const isChecked = activeProgress.completedTasks[`day${day.day}_task${i}`];
                                            return (
                                              <button key={i} onClick={() => toggleTask(day.day, i)} className="flex items-start gap-3 w-full text-left group">
                                                 <div className={`w-5 h-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 group-hover:border-purple-500'}`}>
                                                    {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                 </div>
                                                 <span className={`text-sm leading-snug transition-all ${isChecked ? 'text-gray-600 line-through' : 'text-gray-300'}`}>{task}</span>
                                              </button>
                                            );
                                         })}
                                      </div>
                                      
                                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                         <span className="text-gray-500"><Clock className="w-3 h-3 inline mr-1" /> {day.estimatedHours} hrs</span>
                                         <span className="text-purple-400">{completedTasksCount}/{allTasksCount} Tasks</span>
                                      </div>
                                   </div>
                                 );
                              })}
                           </div>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>
              );
            })}
         </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col overflow-hidden relative">
      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
         <AnimatePresence>
            {toasts.map(t => (
               <motion.div key={t.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`px-4 py-3 rounded-xl text-sm font-bold shadow-2xl flex items-center gap-2 ${t.type === 'achievement' ? 'bg-yellow-500 text-black' : t.type === 'success' ? 'bg-emerald-500 text-white' : t.type === 'error' ? 'bg-red-500 text-white' : 'bg-purple-600 text-white'}`}>
                  {t.type === 'achievement' ? <Trophy className="w-4 h-4" /> : t.type === 'success' ? <Flame className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {t.msg}
               </motion.div>
            ))}
         </AnimatePresence>
      </div>

      {/* Streak Banner */}
      <AnimatePresence>
         {streakBanner && (
            <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className={`fixed top-0 left-0 right-0 z-[60] p-4 flex items-center justify-center gap-4 text-sm font-bold ${streakBanner.type === 'warning' ? 'bg-yellow-500 text-black' : streakBanner.type === 'freeze' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
               <span>{streakBanner.msg}</span>
               {streakBanner.type === 'freeze' && (
                  <div className="flex gap-2">
                     <Button onClick={useStreakFreeze} size="sm" className="bg-white text-blue-600 hover:bg-gray-200">Use Freeze ❄️</Button>
                     <Button onClick={() => setStreakBanner(null)} size="sm" variant="ghost" className="hover:bg-blue-700">Dismiss</Button>
                  </div>
               )}
               {streakBanner.type !== 'freeze' && <button onClick={() => setStreakBanner(null)}><X className="w-4 h-4" /></button>}
            </motion.div>
         )}
      </AnimatePresence>

      {/* Celebration Modal */}
      <AnimatePresence>
         {celebration && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
               <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-neutral-900 border border-white/10 p-12 rounded-[40px] text-center max-w-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                  <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
                  <h2 className="text-3xl font-black mb-2">{celebration.title}</h2>
                  <p className="text-gray-400 mb-8">{celebration.msg}</p>
                  <Button onClick={() => setCelebration(null)} className="w-full bg-yellow-500 text-black hover:bg-yellow-400 h-14 text-lg font-black rounded-2xl">Keep Going →</Button>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-6 gap-6 overflow-y-auto lg:overflow-hidden mt-12 scrollbar-hide">
         
         {/* MOBILE ONLY: Streak Bar at top */}
         <div className="lg:hidden w-full">
            {renderStreak(true)}
         </div>

         {/* LEFT COLUMN: Form & Saved Roadmaps */}
         <div className="w-full lg:w-[320px] shrink-0">
            {renderLeftPanel()}
         </div>
         
         {/* CENTER COLUMN: Active Roadmap (Flexible) */}
         <div className="flex-1 bg-black/20 border border-white/5 rounded-3xl p-4 md:p-6 flex flex-col overflow-visible lg:overflow-y-auto scrollbar-hide relative min-w-0">
            {renderCenter()}
         </div>

         {/* RIGHT COLUMN: Streak & Achievements (Desktop) / Achievements only (Mobile - bottom) */}
         <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
            <div className="lg:hidden">
               {renderAchievements()}
            </div>
            <div className="hidden lg:flex flex-col gap-6 h-full">
               {renderStreak()}
               {renderAchievements()}
            </div>
         </div>

      </div>
    </div>
  );
}
