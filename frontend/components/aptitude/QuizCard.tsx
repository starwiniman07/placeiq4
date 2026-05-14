"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface QuizCardProps {
  question: {
    _id: string;
    text: string;
    options: string[];
    difficulty: string;
  };
  currentIndex: number;
  total: number;
  onAnswer: (questionId: string, selectedOption: number, timeTakenSeconds: number) => void;
  disabled?: boolean;
}

export function QuizCard({ question, currentIndex, total, onAnswer, disabled }: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timer, setTimer] = useState<number>(0);

  // Timer logic for the current question
  useEffect(() => {
    setStartTime(Date.now());
    setTimer(0);
    const interval = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [question._id]); // Reset when question changes

  const handleSelect = (index: number) => {
    if (disabled) return;
    setSelected(index);
  };

  const handleSubmit = () => {
    if (selected === null || disabled) return;
    onAnswer(question._id, selected, timer);
  };

  // Reset selected state when question changes
  useEffect(() => {
    setSelected(null);
  }, [question._id]);

  return (
    <motion.div
      key={question._id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
    >
      <div className="flex justify-between items-center mb-6 text-sm text-gray-400">
        <span className="bg-white/10 px-3 py-1 rounded-full">
          Question {currentIndex + 1} of {total}
        </span>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="font-mono">{Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      <h3 className="text-xl font-medium text-white mb-8 leading-relaxed">
        {question.text}
      </h3>

      <div className="space-y-3 mb-8">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={disabled}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              selected === idx
                ? "bg-blue-600/20 border-blue-500 text-white"
                : "bg-black/20 border-white/10 text-gray-300 hover:bg-white/5"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="inline-block w-6 font-medium text-gray-500 mr-2">
              {String.fromCharCode(65 + idx)}.
            </span>
            {option}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={selected === null || disabled}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8"
        >
          Submit Answer
        </Button>
      </div>
    </motion.div>
  );
}
