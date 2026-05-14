"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, UserCheck, AlertTriangle, Eye, Video } from "lucide-react";
import axios from "axios";

interface ProctorOverlayProps {
  onWarning: (msg: string) => void;
  onTrustScoreChange: (score: number) => void;
}

export function ProctorOverlay({ onWarning, onTrustScoreChange }: ProctorOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [trustScore, setTrustScore] = useState(100);
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    // 1. Setup Camera
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsSetup(true);
      } catch (err) {
        onWarning("Camera access denied! Proctoring failed.");
      }
    };
    setupCamera();

    // 2. Tab Switch Detection
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        addWarning("Tab Switch Detected!");
        setTrustScore(prev => Math.max(0, prev - 15));
      }
    };

    const handleBlur = () => {
      addWarning("Window Focus Lost!");
      setTrustScore(prev => Math.max(0, prev - 10));
    };

    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);

    // 3. AI Monitoring Loop (Every 3 seconds)
    const interval = setInterval(captureAndAnalyze, 3000);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      clearInterval(interval);
    };
  }, []);

  const addWarning = (msg: string) => {
    setWarnings(prev => {
      if (prev.includes(msg)) return prev;
      onWarning(msg);
      return [...prev, msg].slice(-3); // Keep last 3
    });
    setTimeout(() => {
        setWarnings(prev => prev.filter(w => w !== msg));
    }, 4000);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || !isSetup) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 0.5);

    try {
      const res = await axios.post("http://localhost:8001/analyze-frame", { image: imageData });
      const data = res.data;

      if (data.warnings && data.warnings.length > 0) {
        data.warnings.forEach((w: string) => addWarning(w));
        setTrustScore(prev => Math.max(0, prev - (data.warnings.length * 2)));
      }
    } catch (err) {
      console.error("Proctoring service unreachable");
    }
  };

  useEffect(() => {
    onTrustScoreChange(trustScore);
  }, [trustScore]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative group">
        <div className="w-48 h-36 bg-black rounded-2xl border-2 border-white/10 overflow-hidden shadow-2xl relative">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
          <canvas ref={canvasRef} width="320" height="240" className="hidden" />
          
          <div className="absolute top-2 right-2 flex gap-1">
             <div className={`w-2 h-2 rounded-full animate-pulse ${trustScore > 70 ? 'bg-emerald-500' : trustScore > 40 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-[10px] flex justify-between items-center backdrop-blur-md">
             <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-blue-400" /> AI Monitoring</span>
             <span className="font-bold text-white">Trust: {trustScore}%</span>
          </div>
        </div>

        {/* Floating Warnings */}
        <div className="absolute bottom-full right-0 mb-4 flex flex-col gap-2 items-end">
          <AnimatePresence>
            {warnings.map((w, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg"
              >
                <AlertTriangle className="w-4 h-4" /> {w}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
