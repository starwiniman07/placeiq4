"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getProfile, getResumeScore } from "@/lib/userStore";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function RootPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    // Authenticated — check onboarding state
    const profile = getProfile();
    const resume  = getResumeScore();

    // Ensure profile matches the current logged-in user
    const isProfileMatch = profile && profile.email === session?.user?.email;

    if (!isProfileMatch || !resume) {
      router.replace("/onboarding");
    } else {
      router.replace("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-[#020510] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-2xl"
            style={{ background: "linear-gradient(135deg,rgba(59,130,246,0.3),rgba(99,102,241,0.2))", border: "1px solid rgba(147,197,253,0.25)" }} />
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-300 to-indigo-400">P</span>
        </div>
        <div className="flex items-center gap-3 text-white/40 text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          Loading your workspace…
        </div>
      </motion.div>
    </div>
  );
}
