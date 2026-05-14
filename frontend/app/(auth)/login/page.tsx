"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ArrowRight, Eye, EyeOff, Sparkles, Brain, Mic, FileText, BarChart3 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/");
    }
  };

  const features = [
    { icon: <Brain className="w-4 h-4" />, label: "AI Mock Interviews" },
    { icon: <FileText className="w-4 h-4" />, label: "Resume Analysis" },
    { icon: <Mic className="w-4 h-4" />, label: "Voice Intelligence" },
    { icon: <BarChart3 className="w-4 h-4" />, label: "Performance Tracking" },
  ];

  return (
    <div className="min-h-screen bg-[#020510] flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Deep space background ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(29,78,216,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(67,56,202,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(15,23,42,0.8),transparent_70%)]" />

      {/* ── Animated liquid orbs ── */}
      <motion.div
        className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(29,78,216,0.15) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-20%] right-[-15%] w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(79,70,229,0.1) 40%, transparent 70%)",
          filter: "blur(70px)",
        }}
        animate={{ x: [0, -25, 0], y: [0, 20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={{ x: [0, 15, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />

      {/* ── Subtle grid overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.8) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Floating particles ── */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-blue-400/40"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{ y: [-10, 10, -10], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
        />
      ))}

      {/* ── Main card ── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glass card */}
        <div
          className="relative rounded-[28px] p-8 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 50%, rgba(59,130,246,0.05) 100%)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(59,130,246,0.1)",
          }}
        >
          {/* Inner glow top */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(147,197,253,0.4), transparent)" }}
          />
          {/* Inner blue glow bottom-right */}
          <div
            className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          {/* ── Logo / brand ── */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 relative"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(99,102,241,0.2))",
                border: "1px solid rgba(147,197,253,0.25)",
                boxShadow: "0 8px 32px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-300 to-indigo-400">P</span>
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{ background: "linear-gradient(135deg, transparent, rgba(147,197,253,0.06), transparent)" }}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-2xl font-black text-white tracking-tight">PlaceIQ</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest"
                  style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}>
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              </div>
              <p className="text-[13px] text-blue-200/50 font-medium">Your AI Interview Intelligence Platform</p>
            </motion.div>
          </div>

          {/* ── Feature pills ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold text-blue-200/60"
                style={{
                  background: "rgba(59,130,246,0.06)",
                  border: "1px solid rgba(59,130,246,0.15)",
                }}
              >
                <span className="text-blue-400/70">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </motion.div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08))" }} />
            <span className="text-[11px] text-white/25 font-semibold uppercase tracking-widest">Sign in</span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)" }} />
          </div>

          {/* ── Error message ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-4 px-4 py-3 rounded-2xl text-sm text-red-300 text-center"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-blue-200/40 mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div
                  className="absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none"
                  style={{
                    background: focusedField === "email"
                      ? "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))"
                      : "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                    border: focusedField === "email"
                      ? "1px solid rgba(147,197,253,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: focusedField === "email" ? "0 0 20px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05)" : "none",
                  }}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10 transition-colors duration-200"
                  style={{ color: focusedField === "email" ? "rgba(147,197,253,0.8)" : "rgba(255,255,255,0.2)" }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="student@example.com"
                  className="relative z-10 w-full bg-transparent pl-11 pr-4 py-3.5 text-white text-sm placeholder:text-white/15 outline-none rounded-2xl"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-blue-200/40 ml-1">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-[11px] font-semibold transition-colors"
                  style={{ color: "rgba(147,197,253,0.6)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(147,197,253,1)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(147,197,253,0.6)")}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div
                  className="absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none"
                  style={{
                    background: focusedField === "password"
                      ? "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))"
                      : "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                    border: focusedField === "password"
                      ? "1px solid rgba(147,197,253,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: focusedField === "password" ? "0 0 20px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05)" : "none",
                  }}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10 transition-colors duration-200"
                  style={{ color: focusedField === "password" ? "rgba(147,197,253,0.8)" : "rgba(255,255,255,0.2)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="relative z-10 w-full bg-transparent pl-11 pr-12 py-3.5 text-white text-sm placeholder:text-white/15 outline-none rounded-2xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(147,197,253,0.7)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="pt-2"
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full h-12 rounded-2xl font-bold text-sm relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                  boxShadow: "0 8px 32px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                  }}
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                  {loading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>
          </form>

          {/* ── Sign up link ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mt-6 text-center text-[13px]"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold transition-all"
              style={{ color: "rgba(147,197,253,0.7)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(147,197,253,1)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(147,197,253,0.7)")}
            >
              Create one free →
            </Link>
          </motion.div>
        </div>

        {/* ── Bottom tagline ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-[11px] mt-6 font-medium"
          style={{ color: "rgba(255,255,255,0.12)" }}
        >
          Trusted by 10,000+ engineering students across India
        </motion.p>
      </motion.div>
    </div>
  );
}
