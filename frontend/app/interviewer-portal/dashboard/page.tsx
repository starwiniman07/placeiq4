"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, DollarSign, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";

export default function InterviewerDashboardPage() {
  const [stats, setStats] = useState({
    totalEarnings: 12500,
    upcomingInterviews: 3,
    completedSessions: 42,
    rating: 4.9
  });

  const [upcoming, setUpcoming] = useState([
    { id: "1", student: "Rahul Sharma", topic: "Technical Round", date: "Today", time: "02:00 PM", roomId: "abc-123" },
    { id: "2", student: "Priya Singh", topic: "HR Round", date: "Tomorrow", time: "11:00 AM", roomId: "def-456" }
  ]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 lg:p-12 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full mix-blend-screen filter blur-[128px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Interviewer Portal</h1>
            <p className="text-gray-400 mt-1">Manage your sessions, students, and earnings.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="border-gray-700">Schedule Management</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-500">Edit Profile</Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={<DollarSign className="text-emerald-400" />} label="Total Earnings" value={`₹${stats.totalEarnings}`} />
          <StatCard icon={<Calendar className="text-blue-400" />} label="Upcoming" value={stats.upcomingInterviews} />
          <StatCard icon={<CheckCircle className="text-purple-400" />} label="Completed" value={stats.completedSessions} />
          <StatCard icon={<Users className="text-amber-400" />} label="Avg Rating" value={stats.rating} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-gray-400" /> Upcoming Sessions</h2>
            <div className="space-y-4">
              {upcoming.map(session => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 font-bold">
                      {session.student[0]}
                    </div>
                    <div>
                      <h3 className="font-bold">{session.student}</h3>
                      <p className="text-sm text-gray-400">{session.topic} • {session.date}, {session.time}</p>
                    </div>
                  </div>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-500 h-9"
                    onClick={() => window.location.href = `/marketplace/room/${session.roomId}`}
                  >
                    Join Room
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Feedback Given */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group">
                <div>
                  <p className="font-medium">Update Availability</p>
                  <p className="text-xs text-gray-500">Set your weekly time slots</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </button>
              <button className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group">
                <div>
                  <p className="font-medium">Withdraw Earnings</p>
                  <p className="text-xs text-gray-500">Current balance: ₹4,200</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm"
    >
      <div className="flex items-center gap-4 mb-2">
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
        <h3 className="text-sm text-gray-400 font-medium">{label}</h3>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}
