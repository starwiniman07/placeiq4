"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Zap, BookOpen, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface QuestionFeedbackProps {
  result: {
    isCorrect: boolean;
    correctOptionIndex: number;
    explanation: string;
    averageTimeSeconds: number;
    timeDifference: number; // positive means slower, negative means faster
  };
  onNext: () => void;
  isLast: boolean;
}

export function QuestionFeedback({ result, onNext, isLast }: QuestionFeedbackProps) {
  // Parse markdown-ish explanation provided by Gemini
  // For simplicity, we just render it. In a real app, use react-markdown.

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-2xl p-6 md:p-8 mt-6 backdrop-blur-sm ${
        result.isCorrect 
          ? "bg-emerald-900/10 border-emerald-500/20" 
          : "bg-red-900/10 border-red-500/20"
      }`}
    >
      <div className="flex items-start gap-4 mb-6">
        {result.isCorrect ? (
          <div className="bg-emerald-500/20 p-2 rounded-full mt-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
        ) : (
          <div className="bg-red-500/20 p-2 rounded-full mt-1">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        )}
        <div>
          <h3 className={`text-2xl font-bold ${result.isCorrect ? "text-emerald-400" : "text-red-400"}`}>
            {result.isCorrect ? "Correct!" : "Incorrect"}
          </h3>
          <p className="text-gray-400 mt-1">
            {result.timeDifference < 0 
              ? `You answered ${Math.abs(result.timeDifference)}s faster than average ⚡` 
              : `You took ${result.timeDifference}s longer than average ⏱️`}
          </p>
        </div>
      </div>

      <div className="bg-black/40 border border-white/5 rounded-xl p-6 mb-6">
        <h4 className="flex items-center gap-2 text-indigo-400 font-semibold mb-3">
          <Zap className="w-5 h-5" /> AI Explanation
        </h4>
        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
          {result.explanation}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} className="bg-white text-black hover:bg-gray-200 group px-6">
          {isLast ? "Finish Quiz" : "Next Question"}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
}
