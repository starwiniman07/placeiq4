"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function FeedbackReport({ bookingId, onComplete }: any) {
  const [formData, setFormData] = useState({
    communicationRating: 0,
    technicalRating: 0,
    strengths: ["", "", ""],
    weaknesses: ["", "", ""],
    suggestions: "",
    recommendation: "Hire"
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call to save feedback
    await new Promise(r => setTimeout(r, 1500));
    setSuccess(true);
    setLoading(false);
    if (onComplete) onComplete();
  };

  if (success) {
    return (
      <div className="p-8 text-center bg-emerald-900/10 border border-emerald-500/20 rounded-2xl">
        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Feedback Submitted</h3>
        <p className="text-gray-400">The student will be notified and can view the report.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-emerald-400" /> Session Feedback Report
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Communication Rating (1-10)</label>
          <Input 
            type="number" min="1" max="10" required 
            value={formData.communicationRating}
            onChange={e => setFormData({...formData, communicationRating: parseInt(e.target.value)})}
            className="bg-black/50 border-white/10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Technical Rating (1-10)</label>
          <Input 
            type="number" min="1" max="10" required 
            value={formData.technicalRating}
            onChange={e => setFormData({...formData, technicalRating: parseInt(e.target.value)})}
            className="bg-black/50 border-white/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-400">Strengths (3 Bullets)</label>
          {formData.strengths.map((s, i) => (
            <Input 
              key={i} 
              placeholder={`Strength ${i+1}`}
              value={s}
              onChange={e => {
                const newS = [...formData.strengths];
                newS[i] = e.target.value;
                setFormData({...formData, strengths: newS});
              }}
              className="bg-black/50 border-white/10"
            />
          ))}
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-400">Weaknesses (3 Bullets)</label>
          {formData.weaknesses.map((s, i) => (
            <Input 
              key={i} 
              placeholder={`Weakness ${i+1}`}
              value={s}
              onChange={e => {
                const newW = [...formData.weaknesses];
                newW[i] = e.target.value;
                setFormData({...formData, weaknesses: newW});
              }}
              className="bg-black/50 border-white/10"
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Improvement Suggestions</label>
        <textarea 
          className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-white focus:border-emerald-500 outline-none h-32"
          placeholder="Detailed suggestions for the student..."
          value={formData.suggestions}
          onChange={e => setFormData({...formData, suggestions: e.target.value})}
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Final Recommendation</label>
        <select 
          className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
          value={formData.recommendation}
          onChange={e => setFormData({...formData, recommendation: e.target.value})}
        >
          <option value="Hire">Strong Hire</option>
          <option value="Hire">Hire</option>
          <option value="No Hire">No Hire</option>
          <option value="Strong No Hire">Strong No Hire</option>
        </select>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-12 text-lg">
        {loading ? "Submitting..." : "Submit Feedback & Complete Session"}
      </Button>
    </form>
  );
}
