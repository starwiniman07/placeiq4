"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Briefcase, Mail, Globe, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function InterviewerProfilePage() {
  const [formData, setFormData] = useState({
    name: "Sarah Drasner",
    designation: "Senior Frontend Engineer",
    company: "Google",
    bio: "Passionate about web performance and helping junior devs grow.",
    price: 800,
    languages: "English, Hindi"
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Interviewer Profile</h1>
          <Button className="bg-emerald-600 hover:bg-emerald-500">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <img src="https://i.pravatar.cc/150?u=sarah" className="w-full h-full rounded-full border-4 border-emerald-500/30 object-cover" />
                <button className="absolute bottom-0 right-0 p-2 bg-emerald-600 rounded-full border-2 border-black">
                  <User className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-bold">{formData.name}</h2>
              <p className="text-sm text-gray-500">{formData.designation}</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Globe className="w-4 h-4" /> Languages</h3>
              <p className="text-sm text-gray-400">{formData.languages}</p>
            </div>
          </div>

          <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Full Name</label>
                <Input value={formData.name} className="bg-black/50 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Current Designation</label>
                <Input value={formData.designation} className="bg-black/50 border-white/10" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Company</label>
              <Input value={formData.company} className="bg-black/50 border-white/10" />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Professional Bio</label>
              <textarea 
                className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm h-32 outline-none focus:border-emerald-500"
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Price per Session (₹)</label>
                <Input type="number" value={formData.price} className="bg-black/50 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Contact Email</label>
                <Input value="sarah.d@example.com" disabled className="bg-black/20 border-white/10 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
