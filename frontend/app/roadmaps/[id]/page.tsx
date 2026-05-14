"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Circle, Map, BookOpen, Target, ChevronLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await api.get(`/api/roadmap`);
        const found = res.data.find((r: any) => r._id === params.id);
        setRoadmap(found);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchRoadmap();
  }, [params.id]);

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading Roadmap...</div>;
  if (!roadmap) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white text-center">Roadmap not found.<br/><Button onClick={() => router.push("/roadmaps")} className="mt-4">Back</Button></div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/roadmaps")}
          className="mb-8 text-gray-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Back to Counselor
        </Button>

        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{roadmap.targetRole}</h1>
              <p className="text-indigo-400 text-sm font-medium">Personalized 8-Week Path</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
            <span className="text-sm text-gray-400">Total Progress</span>
            <span className="text-sm font-bold text-indigo-400">{roadmap.totalProgress}%</span>
          </div>
        </header>

        <div className="space-y-12">
          {roadmap.weeks.map((week: any, idx: number) => (
            <motion.div 
              key={week.week}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-12"
            >
              {/* Timeline Line */}
              {idx < roadmap.weeks.length - 1 && (
                <div className="absolute left-[19px] top-10 bottom-[-48px] w-0.5 bg-white/10"></div>
              )}
              
              {/* Week Node */}
              <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-indigo-600/20 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 font-bold z-10">
                {week.week}
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
                <h3 className="text-xl font-bold mb-6 text-white">{week.title}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Zap className="w-3 h-3 text-amber-400" /> Key Tasks
                    </h4>
                    <ul className="space-y-3">
                      {week.tasks.map((task: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-gray-400 text-sm">
                          <Circle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" /> {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <BookOpen className="w-3 h-3 text-blue-400" /> Resources
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {week.resources.map((res: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] rounded-lg border border-blue-500/20">{res}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-tighter">Milestone: {week.milestone}</span>
                  </div>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 h-8 text-[10px] rounded-full">
                    Mark as Done
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
