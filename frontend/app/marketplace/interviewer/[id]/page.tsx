"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, Briefcase, IndianRupee, Globe, Calendar, Clock, ShieldCheck, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";

export default function InterviewerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [interviewer, setInterviewer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchInterviewer = async () => {
      try {
        const res = await api.get(`/api/marketplace/interviewer/${params.id}`);
        setInterviewer(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchInterviewer();
  }, [params.id]);

  const handleBooking = async () => {
    if (!selectedSlot) return alert("Please select a time slot");
    setBooking(true);
    try {
      // Mock payment confirm
      const res = await api.post("/api/marketplace/confirm-payment", {
        interviewerId: interviewer._id,
        date: selectedSlot.day,
        timeSlot: selectedSlot.time,
        amount: interviewer.pricePerSession
      });
      if (res.data.success) {
        alert("Booking confirmed! Redirecting to dashboard.");
        router.push("/dashboard");
      }
    } catch (err) { alert("Booking failed"); }
    finally { setBooking(false); }
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading Profile...</div>;
  if (!interviewer) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Not found</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 lg:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-emerald-900/10 to-transparent"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <Button variant="ghost" onClick={() => router.push("/marketplace")} className="mb-8 text-gray-400 hover:text-white">
          <ChevronLeft className="w-4 h-4 mr-2" /> Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Profile Info */}
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-start gap-8">
              <img src={interviewer.photoUrl} alt={interviewer.user.name} className="w-32 h-32 rounded-3xl object-cover border-4 border-white/5 shadow-2xl" />
              <div>
                <h1 className="text-4xl font-bold mb-2">{interviewer.user.name}</h1>
                <p className="text-xl text-emerald-400 font-medium mb-4">{interviewer.designation} @ {interviewer.company}</p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold">{interviewer.rating}</span>
                    <span className="text-gray-500 text-sm">({interviewer.reviewCount} Reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Briefcase className="w-5 h-5" />
                    <span>{interviewer.yearsOfExperience}y Experience</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">About {interviewer.user.name.split(' ')[0]}</h2>
              <p className="text-gray-400 leading-relaxed text-lg">{interviewer.bio}</p>
              <div className="flex flex-wrap gap-3">
                {interviewer.domains.map((d: string) => (
                  <span key={d} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-sm border border-emerald-500/20">{d}</span>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-400" /> Professional Background</h3>
              <p className="text-gray-400">Successfully conducted {interviewer.reviewCount}+ mock interviews. Specialized in FAANG level preparation and architectural deep-dives.</p>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-4">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl sticky top-12">
              <div className="flex items-center justify-between mb-8">
                <div className="text-3xl font-black flex items-center">
                  <IndianRupee className="w-6 h-6" /> {interviewer.pricePerSession}
                  <span className="text-sm font-normal text-gray-500 ml-2">/ session</span>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Available Slots
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {interviewer.availableTimeSlots[0].slots.map((slot: string) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot({ day: interviewer.availableTimeSlots[0].date, time: slot })}
                      className={`p-4 rounded-xl border text-sm font-medium transition-all text-center ${
                        selectedSlot?.time === slot 
                          ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20" 
                          : "bg-black/20 border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleBooking}
                disabled={booking || !selectedSlot}
                className="w-full bg-white text-black hover:bg-gray-200 h-14 rounded-2xl font-bold shadow-xl transition-all active:scale-[0.98]"
              >
                {booking ? "Confirming..." : "Book Session Now"}
              </Button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" /> Secure Payment Protected
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
