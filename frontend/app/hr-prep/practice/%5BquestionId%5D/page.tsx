"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mic, Square, Send, Zap, BookOpen, Target, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useVoice } from "@/lib/hooks/useVoice";
import api from "@/lib/api";

export default function HRPracticePage() {
  const params = useParams();
  const router = useRouter();
  const { isRecording, transcript, startRecording, stopRecording, clearTranscript } = useVoice();
  
  const [question, setQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await api.get("/api/hr/questions");
        const found = res.data.find((q: any) => q._id === params.questionId) || res.data[0];
        setQuestion(found);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuestion();
  }, [params.questionId]);

  const handleSubmit = async () => {
    const textToSubmit = transcript || answer;
    if (!textToSubmit) return;

    setEvaluating(true);
    try {
      const res = await api.post("/api/hr/evaluate", {
        questionText: question.questionText,
        studentAnswer: textToSubmit
      });
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  if (!question) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 lg:p-12 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full mix-blend-screen filter blur-[128px]"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-10">
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-white mb-4">← Back to questions</button>
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
            <h1 className="text-2xl font-bold text-white leading-relaxed">{question.questionText}</h1>
          </div>
        </header>

        {!report ? (
          <div className="space-y-6">
            <div className="relative">
              <textarea 
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-lg h-64 outline-none focus:border-blue-500 placeholder:text-gray-700"
                placeholder={isRecording ? "Listening..." : "Speak your answer or type here..."}
                value={isRecording ? transcript : answer}
                onChange={e => setAnswer(e.target.value)}
              ></textarea>
              
              <div className="absolute bottom-6 right-6 flex items-center gap-3">
                <Button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-14 h-14 rounded-full ${isRecording ? 'bg-red-500' : 'bg-blue-600'}`}
                >
                  {isRecording ? <Square className="w-5 h-5 fill-white" /> : <Mic className="w-6 h-6" />}
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={evaluating || (!transcript && !answer)}
                  className="bg-white text-black hover:bg-gray-200 h-14 px-8 rounded-full font-bold"
                >
                  {evaluating ? "AI Evaluating..." : "Analyze Answer"}
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">Tip: Try to use the STAR method (Situation, Task, Action, Result) for behavioral questions.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ScoreBadge label="Clarity" score={report.scores.clarity} />
              <ScoreBadge label="Relevance" score={report.scores.relevance} />
              <ScoreBadge label="Confidence" score={report.scores.confidence} />
              <ScoreBadge label="Structure" score={report.scores.structure} />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400"><Zap className="w-5 h-5" /> AI Feedback</h2>
              <p className="text-gray-300 leading-relaxed">{report.feedback}</p>
            </div>

            <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-400"><BookOpen className="w-5 h-5" /> Ideal AI-Generated Answer</h2>
              <p className="text-gray-300 leading-relaxed italic">{report.idealAnswer}</p>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setReport(null)} className="border-gray-700">Try Again</Button>
              <Button onClick={() => router.push('/hr-prep')} className="bg-blue-600">Complete & Next</Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ScoreBadge({ label, score }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
      <p className="text-xs text-gray-500 uppercase font-bold mb-1">{label}</p>
      <p className="text-2xl font-bold text-blue-400">{score}/10</p>
    </div>
  );
}
