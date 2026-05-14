"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Send, User, Bot, Loader2, Camera, Monitor, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Info, Star, MessageSquare, X, Play, Volume2, Activity, Eye, UserCheck, Layout, Timer } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export default function AIInterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  
  const [setup, setSetup] = useState<{type: string, targetRole: string} | null>(null);
  
  const [history, setHistory] = useState<Message[]>([]);
  const [displayHistory, setDisplayHistory] = useState<{role: 'interviewer' | 'student', text: string}[]>([]);
  const [round, setRound] = useState(0);
  const [loading, setLoading] = useState(true);
  const [manualInput, setManualInput] = useState("");
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState("");

  // --- VOICE INPUT (replaces useVoice) ---
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const voiceRecognitionRef = useRef<any>(null);
  const finalTranscriptAccumRef = useRef("");

  // --- DEBUG STATE ---
  const [dbgFaceFrames, setDbgFaceFrames] = useState(0);
  const [dbgPoseFrames, setDbgPoseFrames] = useState(0);
  const [dbgSkinRatio, setDbgSkinRatio] = useState('0.00');
  const [dbgNoseRatio, setDbgNoseRatio] = useState('0.00');
  const [dbgEarShoulder, setDbgEarShoulder] = useState('0.00');
  const [dbgShoulderY, setDbgShoulderY] = useState('0.00');
  const dbgFaceFramesRef = useRef(0);
  const dbgPoseFramesRef = useRef(0);

  // --- ENHANCED PROCTORING STATE ---
  const [liveVolume, setLiveVolume] = useState(0);
  const [liveWpm, setLiveWpm] = useState(0);
  const [totalFillers, setTotalFillers] = useState(0);
  const [stutterCount, setStutterCount] = useState(0);
  const [longPauses, setLongPauses] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastAnswerEval, setLastAnswerEval] = useState<any>(null);
  const [evaluatingAnswer, setEvaluatingAnswer] = useState(false);
  const [audioAnalysisError, setAudioAnalysisError] = useState(false);
  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] = useState(true);

  // --- PROCTORING STATE ---
  const [setupPhase, setSetupPhase] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [screenReady, setScreenReady] = useState(false);
  const [lightingStatus, setLightingStatus] = useState<'poor' | 'fair' | 'good'>('good');
  const [activeWarning, setActiveWarning] = useState<{type: string, message: string} | null>(null);
  const [tabSwitchWarningVisible, setTabSwitchWarningVisible] = useState(false);
  const [metrics, setMetrics] = useState({
    eyeContact: 'Good',
    posture: 'Good',
    volume: 50,
    wpm: 0,
    faceVisible: true
  });

  // --- PROCTORING REFS ---
  const webcamRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const faceMeshRef = useRef<any>(null);
  const poseRef = useRef<any>(null);
  const faceIntervalRef = useRef<any>(null);
  const poseIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);
  const lightingCheckRef = useRef<any>(null);
  const lastPoseRef = useRef<any>(null);
  
  const warningQueueRef = useRef<any[]>([]);
  const currentWarningRef = useRef<any>(null);
  const warningCooldowns = useRef<Record<string, number>>({});
  
  const proctorEvents = useRef<any[]>([]);
  const metricSnapshots = useRef<any[]>([]);
  const interviewStartTime = useRef<number>(0);
  
  const bodyLangData = useRef({
    faceAbsentSeconds: 0,
    multipleFacesDetected: 0,
    handOnFaceCount: 0,
    lookingDownCount: 0,
    slouchingSeconds: 0,
    fidgetCount: 0,
    poorEyeContactSeconds: 0,
    tooCloseCount: 0,
    poorLightingSeconds: 0
  });

  const voiceData = useRef({
    totalFillerWords: 0,
    fillerWordBreakdown: {} as Record<string, number>,
    stutterCount: 0,
    longPauseCount: 0,
    wpmSamples: [] as number[],
    volumeSamples: [] as number[],
    avgVolume: 0
  });

  const integrityData = useRef({
    tabSwitchCount: 0,
    windowBlurCount: 0,
    screenShareDropped: false,
    cameraDisconnected: false
  });

  const fillerCountRef = useRef<Record<string, number>>({});
  const totalFillerRef = useRef(0);
  const wpmHistoryRef = useRef<number[]>([]);
  const volumeHistoryRef = useRef<number[]>([]);
  const handOnFaceCountRef = useRef(0);
  const fidgetCountRef = useRef(0);
  const stutterCountRef = useRef(0);
  const longPauseCountRef = useRef(0);
  const tabSwitchCountRef = useRef(0);
  const mediaPipeIntervalRef = useRef<any>(null);
  const faceCheckIntervalRef = useRef<any>(null);
  const warningTimeoutRef = useRef<any>(null);
  const noFaceMediaPipeCountRef = useRef(0);
  const slouchingCountRef = useRef(0);
  const eyeContactHistoryRef = useRef<boolean[]>([]);
  const longPausesRef = useRef(0);
  const handNearFaceRef = useRef(false);

  // --- NEW ENHANCED REFS ---
  const isInterviewActiveRef = useRef(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const volumeSamplesRef = useRef<number[]>([]);
  const isSpeakingRef = useRef(false);
  const speakingStartRef = useRef<number | null>(null);
  const speechSegmentsRef = useRef<number[]>([]);
  const shakyVoiceCountRef = useRef(0);
  
  const handsRef = useRef<any>(null);
  const lastFaceBoxRef = useRef<any>(null);
  const lastPoseLandmarksRef = useRef<any>(null);
  const movementHistoryRef = useRef<number[]>([]);
  const handNearFaceCountRef = useRef(0);
  const handOnHeadCountRef = useRef(0);
  const faceAbsentFramesRef = useRef(0);
  const eyeContactFramesRef = useRef<boolean[]>([]);
  const noEyeContactCountRef = useRef(0);
  const slouchingFramesRef = useRef(0);
  
  const currentAnswerTranscriptRef = useRef("");
  const answerEvaluationsRef = useRef<any[]>([]);
  const totalFillersRef = useRef(0);
  const fillerWordsRef = useRef<Record<string, number>>({});
  const currentWpmRef = useRef(0);
  const bodyLangDataRef = useRef(bodyLangData.current);
  const voiceDataRef = useRef(voiceData.current);
  const integrityDataRef = useRef(integrityData.current);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayHistory, loading]);

  // --- FIX 2: Tab switch listeners with EMPTY deps (no stale closures) ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isInterviewActiveRef.current) {
        tabSwitchCountRef.current += 1;
        integrityData.current.tabSwitchCount = tabSwitchCountRef.current;
        addProctorEvent('tab_switch', Date.now());
        setTabSwitchWarningVisible(true);
      }
    };
    const handleWindowBlur = () => {
      if (isInterviewActiveRef.current) {
        integrityData.current.windowBlurCount += 1;
        addProctorEvent('window_blur', Date.now());
        setTabSwitchWarningVisible(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []); // empty deps — uses refs only

  useEffect(() => {
    const stored = localStorage.getItem("currentInterviewSetup");
    if (stored) {
      setSetup(JSON.parse(stored));
    } else {
      router.push("/ai-interview");
    }
  }, []);

  const updateMetric = (key: string, value: any) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
  };

  // --- FIX 6: RELIABLE WARNING SYSTEM ---
  const triggerWarning = (type: string, message: string, cooldownMs = 20000) => {
    const now = Date.now();
    if (now - (warningCooldowns.current[type] || 0) < cooldownMs) return;
    warningCooldowns.current[type] = now;
    addProctorEvent(type, now);
    setActiveWarning({ type, message });
    clearTimeout(warningTimeoutRef.current);
    warningTimeoutRef.current = setTimeout(() => setActiveWarning(null), 5000);
  };

  const triggerWarningForced = (type: string, message: string) => {
    const key = type + '_forced';
    const now = Date.now();
    if (now - (warningCooldowns.current[key] || 0) < 5000) return;
    warningCooldowns.current[key] = now;
    addProctorEvent(type, now);
    setActiveWarning({ type, message });
    clearTimeout(warningTimeoutRef.current);
    warningTimeoutRef.current = setTimeout(() => setActiveWarning(null), 5000);
  };
  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
      });
      if (webcamRef.current) webcamRef.current.srcObject = stream;
      mediaStreamRef.current = stream;
      setCameraReady(true);
      setMicReady(true);
      checkLighting();
    } catch (err) {
      setError('Camera/mic access denied. Please allow access and refresh.');
    }
  };

  const setupScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = screenStream;
      setScreenReady(true);
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        setScreenReady(false);
        triggerWarning('screen_share_stopped', '⚠️ Screen share stopped! Please reshare your screen.');
      });
    } catch (err) {
      setError('Screen share denied. Screen sharing is required for this interview.');
    }
  };

  const checkLighting = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 64; canvas.height = 64;
    const checkInterval = setInterval(() => {
      if (!webcamRef.current || !ctx) return;
      ctx.drawImage(webcamRef.current, 0, 0, 64, 64);
      const data = ctx.getImageData(0, 0, 64, 64).data;
      let brightness = 0;
      for (let i = 0; i < data.length; i += 4) { brightness += (data[i] + data[i+1] + data[i+2]) / 3; }
      brightness = brightness / (64 * 64);
      if (brightness < 50) {
        setLightingStatus('poor');
        bodyLangData.current.poorLightingSeconds += 3;
        triggerWarning('lighting', '⚠️ Poor lighting detected. Please improve your lighting.');
      } else if (brightness < 100) { setLightingStatus('fair'); } else { setLightingStatus('good'); }
    }, 3000);
    lightingCheckRef.current = checkInterval;
  };

  const addProctorEvent = (type: string, timestamp: number) => {
    proctorEvents.current.push({
      type, timestamp, timeInInterview: Math.floor((timestamp - interviewStartTime.current) / 1000)
    });
  };

  const loadAllScripts = async () => {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js'
    ];
    for (const src of scripts) {
      await new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const script = document.createElement('script');
        script.src = src; script.crossOrigin = 'anonymous';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }
  };

  // FIX 7: setInterval-based MediaPipe loop (rAF throttles in background)
  const startMediaPipeProcessing = () => {
    let frameCount = 0;
    const processingInterval = setInterval(async () => {
      if (!isInterviewActiveRef.current) { clearInterval(processingInterval); return; }
      const video = webcamRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;
      frameCount++;
      if (frameCount % 3 === 0 && faceMeshRef.current) {
        try {
          await faceMeshRef.current.send({ image: video });
          dbgFaceFramesRef.current++;
          if (dbgFaceFramesRef.current % 10 === 0) setDbgFaceFrames(dbgFaceFramesRef.current);
        } catch(e) {}
      }
      if (frameCount % 2 === 0 && handsRef.current) {
        try { await handsRef.current.send({ image: video }); } catch(e) {}
      }
      if (frameCount % 5 === 0 && poseRef.current) {
        try {
          await poseRef.current.send({ image: video });
          dbgPoseFramesRef.current++;
          if (dbgPoseFramesRef.current % 5 === 0) setDbgPoseFrames(dbgPoseFramesRef.current);
        } catch(e) {}
      }
      if (frameCount > 10000) frameCount = 0;
    }, 200);
    mediaPipeIntervalRef.current = processingInterval;
  };

  // FIX 3: Canvas skin-pixel face detection as primary fallback
  const startFaceMonitoring = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 160; canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let faceAbsentConsecutive = 0;
    let facePresent = true;
    const checkFace = setInterval(() => {
      if (!isInterviewActiveRef.current) { clearInterval(checkFace); return; }
      const video = webcamRef.current;
      if (!video || video.readyState < 2) return;
      try {
        ctx.drawImage(video, 0, 0, 160, 120);
        const imageData = ctx.getImageData(0, 0, 160, 120);
        const data = imageData.data;
        let skinPixels = 0, totalPixels = 0;
        for (let y = 30; y < 90; y++) {
          for (let x = 50; x < 110; x++) {
            const idx = (y * 160 + x) * 4;
            const r = data[idx], g = data[idx+1], b = data[idx+2];
            totalPixels++;
            if ((r > 60 && g > 40 && b > 20 && r > b && Math.abs(r-g) > 15) ||
                (r > 40 && g > 30 && b > 20 && r > g && r > b)) skinPixels++;
          }
        }
        const skinRatio = skinPixels / totalPixels;
        setDbgSkinRatio(skinRatio.toFixed(3));
        const faceNow = skinRatio > 0.05;
        if (!faceNow) {
          faceAbsentConsecutive++;
          if (faceAbsentConsecutive >= 3 && facePresent) {
            facePresent = false;
            updateMetric('faceVisible', false);
            bodyLangDataRef.current.faceAbsentSeconds += 1.5;
            triggerWarningForced('face_absent', '⚠️ Face not visible — please center yourself in camera');
          }
        } else {
          faceAbsentConsecutive = 0;
          if (!facePresent) { facePresent = true; updateMetric('faceVisible', true); }
        }
        // Camera blocked detection
        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) totalBrightness += (data[i] + data[i+1] + data[i+2]) / 3;
        if (totalBrightness / (data.length / 4) < 10) {
          triggerWarningForced('camera_blocked', '⚠️ Camera appears blocked or covered — please uncover');
        }
      } catch(e) {}
    }, 500);
    faceCheckIntervalRef.current = checkFace;
  };

  const initHandDetection = async () => {
    await loadAllScripts();
    // @ts-ignore
    const hands = new window.Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
    hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.6, minTrackingConfidence: 0.5 });
    hands.onResults(analyzeHandResults);
    handsRef.current = hands;
    // @ts-ignore
    const faceMesh = new window.FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
    faceMesh.setOptions({ maxNumFaces: 2, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    faceMesh.onResults(analyzeFaceResults);
    faceMeshRef.current = faceMesh;
    // @ts-ignore
    const pose = new window.Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
    pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    pose.onResults(analyzePoseResults);
    poseRef.current = pose;

    const video = webcamRef.current;
    if (video) {
      const startProcessing = () => { startMediaPipeProcessing(); startFaceMonitoring(); };
      if (video.readyState >= 2) { startProcessing(); }
      else { video.onloadeddata = startProcessing; }
    }
  };

  const analyzeHandResults = (results: any) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      handNearFaceRef.current = false; return;
    }
    results.multiHandLandmarks.forEach((handLandmarks: any) => {
      const wrist = handLandmarks[0]; const indexTip = handLandmarks[8]; const middleTip = handLandmarks[12];
      // Hand near mouth (y in face zone, x near center)
      const isNearMouth = indexTip.y > 0.35 && indexTip.y < 0.75 && indexTip.x > 0.2 && indexTip.x < 0.8;
      // Hand on head: wrist high up in frame (y < 0.35 in normalized coords)
      const isOnHead = wrist.y < 0.35 || (indexTip.y < 0.3 && middleTip.y < 0.3);
      // Covering face: hand spread across face area
      const isCoveringFace = wrist.y < 0.5 && wrist.y > 0.05 && Math.abs(wrist.x - 0.5) < 0.3 && indexTip.y < 0.55;

      if (isNearMouth) {
        handNearFaceCountRef.current += 1;
        bodyLangDataRef.current.handOnFaceCount += 1;
        if (handNearFaceCountRef.current >= 3) {
          triggerWarning('hand_mouth', '⚠️ Keep hands away from your mouth — it affects voice clarity');
          handNearFaceCountRef.current = 0;
        }
      } else if (!isNearMouth) { handNearFaceCountRef.current = Math.max(0, handNearFaceCountRef.current - 1); }
      if (isOnHead) {
        handOnHeadCountRef.current += 1;
        if (handOnHeadCountRef.current >= 3) {
          triggerWarning('hand_head', '⚠️ Hands on head detected — this signals stress to interviewers');
          handOnHeadCountRef.current = 0;
        }
      } else { handOnHeadCountRef.current = Math.max(0, handOnHeadCountRef.current - 1); }
      if (isCoveringFace && !isNearMouth) {
        triggerWarning('covering_face', '⚠️ Stop covering your face — maintain professional presence');
      }
      console.log('[Hands] wrist.y:', wrist.y.toFixed(2), 'indexTip.y:', indexTip.y.toFixed(2), 'isOnHead:', isOnHead, 'isNearMouth:', isNearMouth);
    });
  };

  // FIX 5: Head-pose based eye contact (nose-ratio method — works at any angle)
  const analyzeFaceResults = (results: any) => {
    if (!results.multiFaceLandmarks?.length) {
      noFaceMediaPipeCountRef.current += 1;
      if (noFaceMediaPipeCountRef.current >= 5) {
        bodyLangDataRef.current.faceAbsentSeconds += 0.5;
        triggerWarningForced('face_absent', '⚠️ Face not detected — please look at the camera');
        noFaceMediaPipeCountRef.current = 0;
      }
      updateMetric('faceVisible', false); return;
    }
    noFaceMediaPipeCountRef.current = 0;
    updateMetric('faceVisible', true);
    if (results.multiFaceLandmarks.length > 1) {
      bodyLangDataRef.current.multipleFacesDetected += 1;
      triggerWarning('multiple_faces', '⚠️ Multiple faces detected — ensure you are alone');
    }
    const lm = results.multiFaceLandmarks[0];
    const xs = lm.map((p: any) => p.x); const ys = lm.map((p: any) => p.y);
    lastFaceBoxRef.current = { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };

    // --- HEAD POSE (nose offset within face width) ---
    const noseTip = lm[1]; const leftEdge = lm[234]; const rightEdge = lm[454];
    const faceWidth = rightEdge.x - leftEdge.x;
    const noseRatio = faceWidth > 0.01 ? (noseTip.x - leftEdge.x) / faceWidth : 0.5;
    let lookingAtCamera = noseRatio > 0.33 && noseRatio < 0.67;
    setDbgNoseRatio(noseRatio.toFixed(3));

    // --- TRUE EYE TRACKING (Iris Landmarks) ---
    if (lm.length >= 478) {
      const rightIris = lm[468]; const leftIris = lm[473];
      const rightOuter = lm[33]; const rightInner = lm[133];
      const leftInner = lm[362]; const leftOuter = lm[263];
      
      const rightEyeWidth = rightInner.x - rightOuter.x;
      const leftEyeWidth = leftOuter.x - leftInner.x;
      
      const rightIrisRatio = rightEyeWidth > 0.001 ? (rightIris.x - rightOuter.x) / rightEyeWidth : 0.5;
      const leftIrisRatio = leftEyeWidth > 0.001 ? (leftIris.x - leftInner.x) / leftEyeWidth : 0.5;
      
      const avgIrisRatio = (rightIrisRatio + leftIrisRatio) / 2;
      
      // Pupil centered is usually 0.4 to 0.6
      lookingAtCamera = avgIrisRatio > 0.35 && avgIrisRatio < 0.65;
    }

    // --- VERTICAL TILT (looking down check) ---
    const forehead = lm[10]; const chin = lm[152];
    const verticalRatio = forehead && chin
      ? (noseTip.y - forehead.y) / Math.max(0.001, chin.y - forehead.y) : 0.5;
    const lookingDown = verticalRatio > 0.62;

    const goodEyeContact = lookingAtCamera && !lookingDown;
    eyeContactHistoryRef.current.push(goodEyeContact);
    if (eyeContactHistoryRef.current.length > 20) eyeContactHistoryRef.current.shift();

    const recentBad = eyeContactHistoryRef.current.slice(-8).filter(v => !v).length;
    if (recentBad >= 6) {
      updateMetric('eyeContact', 'Poor');
      bodyLangDataRef.current.poorEyeContactSeconds += 0.5;
      if (lookingDown) triggerWarning('looking_down', '⚠️ Look up at the camera — you are looking down');
      else triggerWarning('eye_contact', `⚠️ Look at the camera — you are facing ${noseRatio < 0.33 ? 'right' : 'left'}`);
    } else if (recentBad <= 2) { updateMetric('eyeContact', 'Good'); }

    console.log('[Face] noseRatio:', noseRatio.toFixed(3), 'lookingAtCamera:', lookingAtCamera, 'lookingDown:', lookingDown, 'verticalRatio:', verticalRatio.toFixed(3));

    const faceCenter = (leftEdge.x + rightEdge.x) / 2;
    if (faceCenter < 0.25 || faceCenter > 0.75) triggerWarning('not_centered', '⚠️ Center yourself in the camera frame');
    if (faceWidth > 0.55) triggerWarning('too_close', '⚠️ Move back from camera — you are too close');
  };

  // FIX 4: Recalibrated posture detection with correct thresholds
  const analyzePoseResults = (results: any) => {
    if (!results.poseLandmarks) return;
    const lm = results.poseLandmarks;
    const leftShoulder = lm[11]; const rightShoulder = lm[12];
    const leftEar = lm[7]; const rightEar = lm[8];
    const nose = lm[0];
    if (!leftShoulder || !rightShoulder) return;

    const shoulderVisibility = ((leftShoulder.visibility || 0) + (rightShoulder.visibility || 0)) / 2;
    if (shoulderVisibility < 0.4) return;

    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const avgEarY = ((leftEar?.y ?? leftShoulder.y) + (rightEar?.y ?? rightShoulder.y)) / 2;
    const earShoulderGap = avgShoulderY - avgEarY; // positive = ears above shoulders (good)
    const headDropped = nose ? nose.y > avgShoulderY - 0.05 : false;
    const earTooLow = earShoulderGap < 0.06;
    const shouldersTense = avgShoulderY < 0.35;
    const shoulderAsymmetry = Math.abs(leftShoulder.y - rightShoulder.y);
    const leaning = shoulderAsymmetry > 0.06;
    const isSlounching = headDropped || earTooLow || shouldersTense;

    setDbgEarShoulder(earShoulderGap.toFixed(3));
    setDbgShoulderY(avgShoulderY.toFixed(3));
    console.log('[Pose] earShoulderGap:', earShoulderGap.toFixed(3), 'shoulderY:', avgShoulderY.toFixed(3), 'headDropped:', headDropped, 'earTooLow:', earTooLow, 'slouching:', isSlounching);

    if (isSlounching) {
      slouchingCountRef.current += 1;
      if (slouchingCountRef.current >= 3) {
        updateMetric('posture', 'Poor');
        bodyLangDataRef.current.slouchingSeconds += 1;
        let msg = '⚠️ Sit up straight — poor posture detected';
        if (headDropped) msg = '⚠️ Raise your head — you are looking down';
        else if (shouldersTense) msg = '⚠️ Relax your shoulders — sit naturally upright';
        triggerWarning('slouching', msg);
      }
    } else {
      slouchingCountRef.current = 0;
      updateMetric('posture', 'Good');
    }
    if (leaning && !isSlounching) triggerWarning('leaning', '⚠️ You are leaning — sit balanced and upright');

    if (lastPoseLandmarksRef.current) {
      const prev = lastPoseLandmarksRef.current;
      const movement = Math.abs(leftShoulder.x - prev[11].x) + Math.abs(leftShoulder.y - prev[11].y) + Math.abs(rightShoulder.x - prev[12].x) + Math.abs(rightShoulder.y - prev[12].y);
      movementHistoryRef.current.push(movement);
      if (movementHistoryRef.current.length > 15) movementHistoryRef.current.shift();
      const avgMov = movementHistoryRef.current.reduce((a,b) => a+b, 0) / movementHistoryRef.current.length;
      if (avgMov > 0.015) {
        fidgetCountRef.current += 1; bodyLangDataRef.current.fidgetCount += 1;
        if (fidgetCountRef.current > 20) { triggerWarning('fidgeting', '⚠️ Too much movement — try to stay still and composed'); fidgetCountRef.current = 0; }
      } else { fidgetCountRef.current = Math.max(0, fidgetCountRef.current - 1); }
    }
    lastPoseLandmarksRef.current = lm;
  };

  const startRealAudioAnalysis = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, sampleRate: 44100, channelCount: 1 },
        video: false
      });

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      
      const source = audioCtx.createMediaStreamSource(audioStream);
      source.connect(analyser);
      
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      audioStreamRef.current = audioStream;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const timeDataArray = new Uint8Array(analyser.fftSize);
      
      const analyzeAudio = () => {
        if (!isInterviewActiveRef.current) return;
        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
        
        analyser.getByteTimeDomainData(timeDataArray);
        let sumSquares = 0;
        for (let i = 0; i < timeDataArray.length; i++) {
          const normalized = (timeDataArray[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / timeDataArray.length);
        const volumePercent = Math.min(100, Math.round(rms * 300));
        
        setLiveVolume(volumePercent);
        updateMetric('volume', volumePercent);
        volumeSamplesRef.current.push(volumePercent);
        
        if (isSpeakingRef.current) {
          if (volumePercent < 15) triggerWarning('volume_low', '⚠️ Speak louder — microphone is barely picking you up');
          else if (volumePercent > 90) triggerWarning('volume_high', '⚠️ You are too loud — move slightly away from mic');
        }
        
        analyser.getByteFrequencyData(dataArray);
        const voiceStartBin = Math.floor(85 / 21.5);
        const voiceEndBin = Math.floor(3000 / 21.5);
        let voiceEnergy = 0;
        for (let i = voiceStartBin; i < voiceEndBin; i++) voiceEnergy += dataArray[i];
        voiceEnergy = voiceEnergy / (voiceEndBin - voiceStartBin);
        
        const currentlySpeaking = voiceEnergy > 20;
        if (currentlySpeaking !== isSpeakingRef.current) {
          isSpeakingRef.current = currentlySpeaking;
          setIsSpeaking(currentlySpeaking);
          if (!currentlySpeaking && speakingStartRef.current) {
            const duration = Date.now() - speakingStartRef.current;
            speechSegmentsRef.current.push(duration);
            speakingStartRef.current = null;
          } else if (currentlySpeaking) {
            speakingStartRef.current = Date.now();
          }
        }
        
        if (volumeSamplesRef.current.length >= 20) {
          const recent = volumeSamplesRef.current.slice(-20);
          const avg = recent.reduce((a,b) => a+b) / 20;
          const variance = recent.reduce((a,b) => a + Math.pow(b - avg, 2), 0) / 20;
          if (variance > 200 && avg > 20) {
            shakyVoiceCountRef.current += 1;
            if (shakyVoiceCountRef.current > 30) {
              triggerWarning('shaky_voice', '⚠️ Your voice sounds shaky — take a breath and speak steadily');
              shakyVoiceCountRef.current = 0;
            }
          }
        }
      };
      analyzeAudio();
    } catch (err) {
      console.error('Audio analysis failed:', err);
      setAudioAnalysisError(true);
    }
  };

  // UNIFIED SpeechRecognition — one instance serves both voice-input AND analytics.
  // The browser only allows one active recognition session at a time.
  const FILLERS = ['um', 'uh', 'ah', 'like', 'you know', 'basically', 'literally', 'actually', 'so yeah', 'right', 'okay so', 'hmm', 'err', 'sort of'];

  const startSpeechRecognition = (force = false) => {
    // @ts-ignore
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { 
      setSpeechRecognitionAvailable(false); 
      return; 
    }

    // If already running and not forcing, don't start a new one
    if (speechRecognitionRef.current && !force) {
      try {
        speechRecognitionRef.current.start();
        return;
      } catch (e) {
        // If it was already started, this is fine
        return;
      }
    }

    // If forcing, stop the old one first
    if (force && speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch(e) {}
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = 'en-US'; // Use standard English for better stability

    let wordTimestamps: any[] = [];
    let pauseTimer: any = null;
    let analyticsTranscript = '';

    recognition.onstart = () => {
      console.log('Speech Recognition Started');
      if (isRecordingRef.current) {
        setIsRecording(true);
      }
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript;
          const lower = text.toLowerCase().trim();

          // --- Voice Input ---
          if (isRecordingRef.current) {
            // Check if this final result is already in the transcript to avoid duplicates
            const currentText = finalTranscriptAccumRef.current.trim();
            if (!currentText.endsWith(text.trim())) {
              finalTranscriptAccumRef.current += text + ' ';
              setManualInput(finalTranscriptAccumRef.current.trim());
            }
          }

          // --- Analytics ---
          if (isRecordingRef.current) {
            analyticsTranscript += ' ' + lower;
            currentAnswerTranscriptRef.current += ' ' + lower;
            const words = lower.split(/\s+/).filter((w: string) => w.length > 0);
            words.forEach((word: string) => wordTimestamps.push({ word, time: Date.now() }));

            // WPM Logic
            const tenSecondsAgo = Date.now() - 10000;
            const recentWords = wordTimestamps.filter((w: any) => w.time > tenSecondsAgo);
            const wpm = recentWords.length * 6;
            currentWpmRef.current = wpm;
            setLiveWpm(wpm);
            updateMetric('wpm', wpm);

            // Filler Logic
            FILLERS.forEach(filler => {
              const regex = new RegExp(`\\b${filler}\\b`, 'gi');
              const matches = lower.match(regex);
              if (matches) {
                matches.forEach(() => {
                  fillerWordsRef.current[filler] = (fillerWordsRef.current[filler] || 0) + 1;
                  totalFillersRef.current += 1;
                  setTotalFillers(prev => prev + 1);
                  triggerWarning('filler', `⚠️ Filler word detected: "${filler}"`);
                });
              }
            });

            // Stutter Logic
            const wordArr = lower.split(' ');
            for (let j = 0; j < wordArr.length - 1; j++) {
              if (wordArr[j] === wordArr[j + 1] && wordArr[j].length > 2) {
                stutterCountRef.current += 1;
                setStutterCount(prev => prev + 1);
              }
            }
            setLiveTranscript(analyticsTranscript.trim());
          }
        } else {
          interim = result[0].transcript;
          setInterimTranscript(interim);
          if (isRecordingRef.current) {
            setManualInput((finalTranscriptAccumRef.current + interim).trim());
          }
        }
      }

      clearTimeout(pauseTimer);
      pauseTimer = setTimeout(() => {
        if (isSpeakingRef.current && isInterviewActiveRef.current) {
          longPausesRef.current += 1;
          setLongPauses(prev => prev + 1);
          triggerWarning('long_pause', '⚠️ Long pause detected — try to keep speaking');
        }
      }, 5000);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      if (event.error === 'not-allowed') {
        setSpeechRecognitionAvailable(false);
        return;
      }
      
      // Auto-restart on fatal-ish errors if interview is still active
      if (isInterviewActiveRef.current) {
        setTimeout(() => {
          try { recognition.start(); } catch (e) {}
        }, 1000);
      }
    };

    recognition.onend = () => {
      console.log('Speech Recognition Ended');
      // Always restart if the interview is active to keep proctoring and voice-input ready
      if (isInterviewActiveRef.current) {
        setTimeout(() => {
          try { 
            recognition.start(); 
          } catch (e) {
            // If starting failed, create a fresh instance
            startSpeechRecognition(false);
          }
        }, 300);
      } else {
        setIsRecording(false);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed (likely already running)');
    }
    
    speechRecognitionRef.current = recognition;
    voiceRecognitionRef.current = recognition;
  };

  // Toggle voice input mode (fills textarea)
  const startVoiceInput = () => {
    finalTranscriptAccumRef.current = '';
    isRecordingRef.current = true;
    setIsRecording(true);
    setManualInput('');
    
    // Always call startSpeechRecognition to ensure it's actually running
    // The internal logic will handle it if it's already running or needs a fresh start
    startSpeechRecognition(false);
    
    // Optional: add a small UI toast or feedback
    triggerWarning('voice_active', '🎙️ Listening... speak your answer');
  };

  const stopVoiceInput = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    finalTranscriptAccumRef.current = manualInput;
    
    setTimeout(() => {
      handleManualSubmit(finalTranscriptAccumRef.current);
    }, 500);
  };

  // Alias for legacy call in handleManualSubmit
  const stopRecording = stopVoiceInput;

  const handleStartInterview = async () => {
    setSetupPhase(false);
    isInterviewActiveRef.current = true; // enables tab switch listeners
    interviewStartTime.current = Date.now();
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      await audioCtx.resume();
    } catch (e) {}
    startInterview(setup!);
    initHandDetection();
    startRealAudioAnalysis();
    startSpeechRecognition(); // unified recognition: analytics + voice input
  };

  const cleanupProctoring = () => {
    isInterviewActiveRef.current = false;
    isRecordingRef.current = false;
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    audioContextRef.current?.close();
    speechRecognitionRef.current?.stop();
    voiceRecognitionRef.current?.stop();
    clearInterval(mediaPipeIntervalRef.current);
    clearInterval(faceCheckIntervalRef.current);
    clearInterval(faceIntervalRef.current);
    clearInterval(poseIntervalRef.current);
    clearInterval(audioIntervalRef.current);
    clearInterval(lightingCheckRef.current);
    clearTimeout(warningTimeoutRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  useEffect(() => {
    return () => cleanupProctoring();
  }, []);

  const callGroq = async (messages: Message[]) => {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      console.error("NEXT_PUBLIC_GROQ_API_KEY is missing from environment variables.");
      throw new Error("API Key Missing");
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Groq API Error:", errorData);
        throw new Error(errorData.error?.message || "Groq API error");
      }
      
      const data = await response.json();
      if (!data.choices || data.choices.length === 0) {
        console.error("Groq API returned no choices:", data);
        throw new Error("No response from AI");
      }
      return data.choices[0].message.content;
    } catch (err: any) {
      console.error("Fetch Error:", err);
      throw err;
    }
  };

  const startInterview = async (config: { type: string; targetRole: string }) => {
    setLoading(true);
    try {
      const roleText = config.type === "Custom Domain" && config.targetRole ? config.targetRole : config.type;
      const systemPrompt = `You are a strict but fair ${roleText} interviewer at a top-tier tech company. 
Your job is to conduct a professional mock interview with exactly 8 rounds.
Rules:
- Ask ONE question per message. Never ask two questions at once.
- After the candidate answers, give a SINGLE sentence of acknowledgment (do not reveal scores), then immediately ask the next question.
- Questions should progressively get harder after round 3. or if the ai recognises that the candidate is struggling, make the questions easier. But do deduct points if the candidate is struggling.
- At round 8 after the candidate answers, say exactly: "Thank you. That concludes our interview. I will now prepare your evaluation."
- Never break character. Never say you are an AI.
- AUTOMATICALLY TERMINATE AT THE COMPLETION OF THE 8TH ROUND AND GIVE FEEDBACK.
- Keep acknowledgments under 20 words.
Interview type: ${roleText}`;
      
      const initialMessages: Message[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "I am ready to start the interview." }
      ];
      
      const aiResponseText = await callGroq(initialMessages);
      
      const newHistory = [...initialMessages, { role: "assistant" as const, content: aiResponseText }];
      setHistory(newHistory);
      setDisplayHistory([{ role: 'interviewer', text: aiResponseText.replace("INTERVIEW_COMPLETE", "").trim() }]);
      setRound(1);
    } catch (err: any) {
      setError(err.message === "API Key Missing" 
        ? "NEXT_PUBLIC_GROQ_API_KEY is missing. Please restart your dev server after adding it to .env.local" 
        : `Error: ${err.message}. Please check your console.`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (overrideText?: string | any) => {
    const textStr = typeof overrideText === 'string' ? overrideText : manualInput;
    const textToSubmit = textStr.trim();
    if (!textToSubmit) return;

    if (isRecording) stopRecording();

    const newDisplayHistory = [...displayHistory, { role: 'student' as const, text: textToSubmit }];
    setDisplayHistory(newDisplayHistory);
    setManualInput("");
    setLoading(true);
    setError("");

    const newHistory = [...history, { role: 'user' as const, content: textToSubmit }];
    
    try {
      const aiResponseText = await callGroq(newHistory);
      
      // Evaluate last answer in background
      const lastQuestion = history[history.length - 1]?.content || "Please introduce yourself.";
      evaluateAnswer(lastQuestion, textToSubmit, round);

      if (aiResponseText.toLowerCase().includes("prepare your evaluation")) {
        const finalHistory = [...newHistory, { role: "assistant" as const, content: aiResponseText }];
        setHistory(finalHistory);
        setDisplayHistory([...newDisplayHistory, { role: 'interviewer', text: aiResponseText.replace(/thank you.*evaluation\.?/gi, "").trim() || aiResponseText }]);
        await generateScorecard(finalHistory);
      } else {
        const finalHistory = [...newHistory, { role: "assistant" as const, content: aiResponseText }];
        setHistory(finalHistory);
        setDisplayHistory([...newDisplayHistory, { role: 'interviewer', text: aiResponseText }]);
        setRound(r => r + 1);
        setLoading(false);
      }
    } catch (err) {
      setError("Failed to get response. Please try sending again.");
      setHistory(newHistory);
      setLoading(false);
    }
  };

  const evaluateAnswer = async (question: string, studentAnswer: string, roundNum: number) => {
    setEvaluatingAnswer(true);
    try {
      const result = await callGroq([
        { role: "system", content: "You are a strict technical interviewer. Return ONLY JSON." },
        { role: "user", content: `Question: "${question}"\nAnswer: "${studentAnswer}"\n\nEvaluate. Return JSON: { "score": 0-10, "verdict": "Excellent"|"Good"|"Acceptable"|"Weak"|"Wrong", "isCorrect": boolean, "whatWasRight": "string", "whatWasMissing": "string", "idealAnswerSummary": "string", "keyPoints": ["string"], "followUpHint": "string" }` }
      ]);
      const evaluation = JSON.parse(result.replace(/```json|```/g, "").trim());
      answerEvaluationsRef.current.push({
        round: roundNum,
        question: question,
        studentAnswer: studentAnswer,
        evaluation: evaluation,
        transcript: currentAnswerTranscriptRef.current
      });
      setLastAnswerEval(evaluation);
      currentAnswerTranscriptRef.current = '';
    } catch (err) {
      console.error('Answer evaluation failed:', err);
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  const generateProctoringReport = async () => {
    const avgWpm = voiceData.current.wpmSamples.length > 0 ? voiceData.current.wpmSamples.reduce((a,b) => a+b) / voiceData.current.wpmSamples.length : 0;
    const goodEyeContactPercent = metricSnapshots.current.length > 0 ? (metricSnapshots.current.filter(s => s.eyeContact === 'Good').length / metricSnapshots.current.length) * 100 : 0;
    const goodPosturePercent = metricSnapshots.current.length > 0 ? (metricSnapshots.current.filter(s => s.posture === 'Good').length / metricSnapshots.current.length) * 100 : 0;

    const prompt = `Analyze this mock interview proctoring data:
BODY LANGUAGE: Face absent: ${bodyLangData.current.faceAbsentSeconds}s, Multi-face: ${bodyLangData.current.multipleFacesDetected}, Hand on face: ${bodyLangData.current.handOnFaceCount}, Looking down: ${bodyLangData.current.lookingDownCount}, Slouching: ${bodyLangData.current.slouchingSeconds}s, Fidgeting: ${bodyLangData.current.fidgetCount}, Poor eye contact: ${Math.round(100-goodEyeContactPercent)}%, Too close: ${bodyLangData.current.tooCloseCount}, Good eye contact: ${Math.round(goodEyeContactPercent)}%, Good posture: ${Math.round(goodPosturePercent)}%.
VOICE: Filler words: ${totalFillerRef.current}, Breakdown: ${JSON.stringify(fillerCountRef.current)}, Stutter: ${stutterCountRef.current}, Long pauses: ${longPauseCountRef.current}, Avg WPM: ${Math.round(avgWpm)}, Avg Vol: ${voiceData.current.avgVolume}/100.
INTEGRITY: Tab switches: ${integrityData.current.tabSwitchCount}, Window blur: ${integrityData.current.windowBlurCount}.
Return ONLY JSON: { "bodyLanguageScore": 0-100, "voiceScore": 0-100, "integrityScore": 0-100, "overallPresenceScore": 0-100, "eyeContact": { "rating": "string", "feedback": "string" }, "posture": { "rating": "string", "feedback": "string" }, "voiceClarity": { "rating": "string", "feedback": "string" }, "speakingSpeed": { "rating": "string", "feedback": "string" }, "fillerWords": { "rating": "string", "feedback": "string" }, "integrityEvents": { "rating": "string", "feedback": "string" }, "suggestions": [{"category": "string", "issue": "string", "howToFix": "string", "priority": "High"|"Medium"|"Low"}] }`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "system", content: "You are an interview coach. Return ONLY JSON." }, { role: "user", content: prompt }],
          temperature: 0.3
        })
      });
      const data = await response.json();
      const content = data.choices[0].message.content.replace(/```json|```/g, "").trim();
      return JSON.parse(content);
    } catch (err) {
      console.error("Proctor Report Error:", err);
      return null;
    }
  };

  const generateAnswerGuide = async () => {
    const questions = answerEvaluationsRef.current.map(e => e.question);
    try {
      const result = await callGroq([
        { role: "system", content: "Senior interviewer. Provide complete model answers. Return ONLY JSON array." },
        { role: "user", content: `Questions asked:\n${questions.map((q, i) => `${i+1}. ${q}`).join('\n')}\n\nProvide ideal answers. Return JSON array: [{ "questionNumber": 1, "question": "string", "idealAnswer": "string", "keyPoints": ["string"], "commonMistakes": ["string"], "advancedPoints": ["string"], "relatedTopics": ["string"] }]` }
      ]);
      return JSON.parse(result.replace(/```json|```/g, "").trim());
    } catch (err) { return []; }
  };

  const generateScorecard = async (finalHistory: Message[]) => {
    setScoring(true);
    setLoading(true);
    isInterviewActiveRef.current = false;
    try {
      let transcriptText = "";
      for (let i = 1; i < finalHistory.length; i++) {
        const msg = finalHistory[i];
        if (msg.role === "system") continue;
        transcriptText += `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${msg.content}\n\n`;
      }

      const [performanceScore, proctoringReport, answerGuide] = await Promise.all([
        callGroq([
          { role: "system", content: "Expert evaluator. Return ONLY JSON." },
          { role: "user", content: `Analyze this interview transcript:\n${transcriptText}\n\nReturn JSON: { "confidence": 0-10, "fluency": 0-10, "communication": 0-10, "technicalAccuracy": 0-10, "relevance": 0-10, "overallScore": 0-100, "topStrengths": [3], "improvementAreas": [3], "overallVerdict": "string", "targetLpa": "string", "overallGrade": "A"|"B"|"C"|"D" }` }
        ]),
        generateProctoringReport(),
        generateAnswerGuide()
      ]);
      
      const scoreData = JSON.parse(performanceScore.replace(/```json|```/g, "").trim());
      
      const fullReport = {
        id: params.id,
        date: new Date().toISOString(),
        type: setup?.type,
        performance: scoreData,
        proctoring: proctoringReport,
        answerEvaluations: answerEvaluationsRef.current,
        answerGuide: answerGuide,
        transcript: displayHistory,
        voiceStats: {
          wordCount: transcriptText.split(' ').length,
          avgWpm: currentWpmRef.current,
          totalFillers: totalFillersRef.current,
          fillerBreakdown: fillerWordsRef.current,
          stutterCount: stutterCountRef.current,
          longPauses: longPauses
        }
      };

      const historyArr = JSON.parse(localStorage.getItem("placeiq_interview_history") || "[]");
      historyArr.push(fullReport);
      localStorage.setItem("placeiq_interview_history", JSON.stringify(historyArr));
      
      const proctorHistory = JSON.parse(localStorage.getItem("placeiq_proctor_reports") || "[]");
      proctorHistory.push({ id: params.id, date: new Date().toISOString(), report: proctoringReport });
      localStorage.setItem("placeiq_proctor_reports", JSON.stringify(proctorHistory));

      localStorage.setItem(`interview_report_${params.id}`, JSON.stringify(fullReport));
      
      cleanupProctoring();
      router.push(`/ai-interview/results/${params.id}`);
    } catch (err) {
      setError("Failed to generate scorecard. Please try again.");
      setScoring(false);
      setLoading(false);
    }
  };

  const handleEndInterview = async () => {
    if (history.length > 2) { // 2 because we have system + first user prompt at start
      await generateScorecard(history);
    } else {
      router.push("/ai-interview");
    }
  };

  const retryLastRequest = async () => {
    if (scoring) {
      await generateScorecard(history);
    } else if (history.length > 1 && history[history.length - 1].role === "user") {
      setLoading(true);
      setError("");
      try {
        const aiResponseText = await callGroq(history);
        if (aiResponseText.toLowerCase().includes("prepare your evaluation")) {
          const finalHistory = [...history, { role: "assistant" as const, content: aiResponseText }];
          setHistory(finalHistory);
          setDisplayHistory([...displayHistory, { role: 'interviewer', text: aiResponseText.replace(/thank you.*evaluation\.?/gi, "").trim() || aiResponseText }]);
          await generateScorecard(finalHistory);
        } else {
          const finalHistory = [...history, { role: "assistant" as const, content: aiResponseText }];
          setHistory(finalHistory);
          setDisplayHistory([...displayHistory, { role: 'interviewer', text: aiResponseText }]);
          setRound(r => r + 1);
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to get response. Please try again.");
        setLoading(false);
      }
    }
  };

  // --- RENDER HELPERS ---
  const renderSetupChecklist = () => (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl w-full bg-neutral-900 border border-white/10 rounded-[48px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-500/20 rounded-2xl"><Timer className="w-8 h-8 text-indigo-400" /></div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Interview Setup</h1>
              <p className="text-gray-400">Complete these steps to begin your session</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                { id: 'cam', title: 'Camera Access', ready: cameraReady, action: setupMedia, icon: <Camera className="w-5 h-5" />, label: 'Enable Camera' },
                { id: 'mic', title: 'Microphone Access', ready: micReady, action: setupMedia, icon: <Mic className="w-5 h-5" />, label: 'Enable Microphone' },
                { id: 'screen', title: 'Screen Share', ready: screenReady, action: setupScreenShare, icon: <Monitor className="w-5 h-5" />, label: 'Share Screen' }
              ].map((step) => (
                <div key={step.id} className={`p-6 rounded-[32px] border transition-all ${step.ready ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${step.ready ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-gray-400'}`}>{step.icon}</div>
                      <div>
                        <h3 className="font-bold">{step.title}</h3>
                        <p className="text-xs text-gray-500">{step.ready ? '✓ Ready' : '○ Pending'}</p>
                      </div>
                    </div>
                    {!step.ready && <Button onClick={step.action} size="sm" className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-4">{step.label}</Button>}
                    {step.ready && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                  </div>
                </div>
              ))}

              <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-[32px] space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2"><Info className="w-4 h-4" /> Interview Rules</h4>
                <ul className="text-xs text-gray-400 space-y-2">
                  <li className="flex gap-2"><span>•</span> Do not switch tabs during the interview</li>
                  <li className="flex gap-2"><span>•</span> Keep your face visible and centered</li>
                  <li className="flex gap-2"><span>•</span> Maintain eye contact with the camera</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
               <div className="aspect-video bg-black rounded-[32px] border border-white/10 overflow-hidden relative shadow-inner">
                  <video ref={webcamRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {!cameraReady && <div className="absolute inset-0 flex items-center justify-center text-gray-600"><Camera className="w-12 h-12 opacity-20" /></div>}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${lightingStatus === 'good' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Lighting: {lightingStatus}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Centered: {metrics.faceVisible ? 'Yes' : 'No'}</span>
                  </div>
               </div>
               <Button 
                onClick={handleStartInterview} 
                disabled={!cameraReady || !micReady || !screenReady}
                className="w-full h-16 bg-white text-black hover:bg-gray-200 rounded-[24px] font-black text-lg shadow-xl disabled:opacity-50"
               >
                 Start Interview Session <Play className="ml-2 w-5 h-5 fill-current" />
               </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (setupPhase) return renderSetupChecklist();

  if (loading && displayHistory.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p>Initializing Proctoring & Interview Engine...</p>
      </div>
    );
  }

  if (scoring) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white gap-4 p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
           <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500" />
              <Activity className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
           </div>
           <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Analyzing Session Performance</h2>
              <p className="text-gray-400">Processing proctoring data, voice metrics, and transcript accuracy...</p>
           </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Warning Overlay — fixed z-index:9999 */}
      {activeWarning && (
        <div
          key={(activeWarning as any).id}
          style={{
            position: 'fixed', top: '80px', left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: ['face_absent','multiple_faces','screen_share_stopped','camera_blocked'].includes(activeWarning.type) ? '#EF4444' : '#F59E0B',
            color: ['face_absent','multiple_faces','screen_share_stopped','camera_blocked'].includes(activeWarning.type) ? '#fff' : '#000',
            padding: '12px 24px', borderRadius: '12px',
            fontWeight: 700, fontSize: '14px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', gap: '12px',
            maxWidth: '520px', pointerEvents: 'none'
          }}
        >
          <AlertTriangle style={{width:20,height:20,flexShrink:0}} />
          {activeWarning.message}
        </div>
      )}

      {/* Tab Switch Modal — z-index:99999 so it's always on top */}
      {tabSwitchWarningVisible && (
        <div style={{ position:'fixed', inset:0, zIndex:99999, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.92)', backdropFilter:'blur(12px)' }}>
           <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ maxWidth:480, width:'90%', background:'#111', border:'2px solid #EF4444', borderRadius:24, padding:40, textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🚨</div>
              <h2 style={{ color:'#EF4444', fontSize:28, fontWeight:900, marginBottom:12 }}>Tab Switch Detected!</h2>
              <p style={{ color:'#9CA3AF', marginBottom:16, lineHeight:1.6 }}>
                You switched away from the interview. This violation has been recorded in your integrity report.
              </p>
              <div style={{ background:'rgba(239,68,68,0.1)', borderRadius:12, padding:12, marginBottom:16 }}>
                <span style={{ color:'#F59E0B', fontSize:18, fontWeight:700 }}>⚠️ Tab switches: {tabSwitchCountRef.current}</span>
              </div>
              <p style={{ color:'#6B7280', fontSize:13, marginBottom:24 }}>
                {tabSwitchCountRef.current === 1 ? 'First warning. Stay on this page.' : tabSwitchCountRef.current === 2 ? 'Second warning. This affects your integrity score.' : 'Multiple violations. Severely impacts your score.'}
              </p>
              <button onClick={() => setTabSwitchWarningVisible(false)} style={{ width:'100%', background:'#3B82F6', color:'#fff', border:'none', borderRadius:12, padding:'14px 0', fontSize:16, fontWeight:700, cursor:'pointer' }}>
                I Understand — Return to Interview
              </button>
           </motion.div>
        </div>
      )}

      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h1 className="font-bold text-sm uppercase tracking-widest text-gray-400">{setup?.type} Session</h1>
        </div>
        <div className="text-xs font-black uppercase tracking-widest text-indigo-400">Round {round} of 8</div>
        <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 text-[10px] font-black uppercase px-4" onClick={handleEndInterview}>
          Terminate Interview
        </Button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Webcam + Metrics */}
        <aside className="w-[300px] border-r border-white/10 bg-black/20 flex flex-col shrink-0 hidden md:flex">
          <div className="p-4 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
             {/* Live Feed */}
             <div className="aspect-video rounded-3xl border border-white/10 overflow-hidden relative bg-black shadow-2xl">
                <video ref={webcamRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                <div className="absolute top-2 left-2 flex gap-1">
                   <div className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[8px] font-black text-emerald-400 uppercase tracking-tighter">Live</div>
                   {metrics.faceVisible ? <div className="px-2 py-0.5 bg-emerald-500/20 backdrop-blur-md rounded-md text-[8px] font-black text-emerald-400 uppercase tracking-tighter">Face Detected</div> : <div className="px-2 py-0.5 bg-red-500/20 backdrop-blur-md rounded-md text-[8px] font-black text-red-400 uppercase tracking-tighter">No Face</div>}
                </div>
             </div>

             {/* Live Metrics */}
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Live Analysis</h3>
                   <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase transition-all ${isSpeaking ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-white/5 text-gray-500'}`}>
                      <Mic className={`w-2.5 h-2.5 ${isSpeaking ? 'fill-current' : ''}`} /> {isSpeaking ? 'Speaking' : 'Silent'}
                   </div>
                </div>
                
                {[
                  { label: 'Eye Contact', value: metrics.eyeContact, score: metrics.eyeContact === 'Good' ? 100 : 30, icon: <Eye className="w-3 h-3" /> },
                  { label: 'Posture', value: metrics.posture, score: metrics.posture === 'Good' ? 100 : 40, icon: <UserCheck className="w-3 h-3" /> },
                  { label: 'Volume', value: `${liveVolume}%`, score: liveVolume, icon: <Volume2 className="w-3 h-3" />, isVolume: true },
                  { label: 'Speed', value: `${liveWpm} WPM`, score: liveWpm > 100 && liveWpm < 160 ? 100 : 50, icon: <Activity className="w-3 h-3" /> }
                ].map(m => (
                  <div key={m.label} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                     <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                           {m.icon} {m.label}
                        </div>
                        <span className={`text-[10px] font-black ${(m.isVolume ? (liveVolume > 15 && liveVolume < 85) : m.score > 70) ? 'text-emerald-400' : 'text-amber-400'}`}>{m.value}</span>
                     </div>
                     <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ width: `${m.score}%` }} 
                          transition={m.isVolume ? { duration: 0.1 } : {}}
                          className={`h-full ${(m.isVolume ? (liveVolume > 15 && liveVolume < 85) : m.score > 70) ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                        />
                     </div>
                  </div>
                ))}
             </div>

             <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-3xl">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-2"><MessageSquare className="w-3 h-3" /> Filler Word Count</h4>
                <div className="text-2xl font-black">{totalFillerRef.current}</div>
                <div className="text-[10px] text-indigo-300/60 mt-1 italic">Total "um", "uh", "like" detected</div>
             </div>
          </div>

          <div className="p-4 border-t border-white/10 flex flex-wrap gap-2">
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[8px] font-black uppercase text-emerald-400">Camera Active</span>
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                <span className="text-[8px] font-black uppercase text-blue-400">Mic Optimized</span>
             </div>
          </div>
        </aside>

        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col relative bg-black/40">
          <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scroll-smooth scrollbar-hide">
            {displayHistory.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-2xl gap-4 ${msg.role === 'student' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'interviewer' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    {msg.role === 'interviewer' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={`p-6 rounded-[32px] text-sm md:text-base leading-relaxed shadow-xl ${
                    msg.role === 'interviewer' 
                      ? 'bg-neutral-900 border border-white/10 rounded-tl-none' 
                      : 'bg-emerald-500 text-white rounded-tr-none'
                  }`}>
                    {msg.text}
                    
                    {msg.role === 'student' && idx === displayHistory.length - 2 && lastAnswerEval && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 p-3 rounded-2xl border flex items-center gap-3 ${
                          lastAnswerEval.score >= 7 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                          lastAnswerEval.score >= 4 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                          'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}
                      >
                        <Zap className="w-4 h-4 shrink-0" />
                        <div className="text-[10px] font-bold">
                          <span className="uppercase tracking-widest mr-2">{lastAnswerEval.verdict} ({lastAnswerEval.score}/10)</span>
                          <p className="text-white/60 font-medium mt-1 leading-tight">{lastAnswerEval.whatWasMissing}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {loading && displayHistory.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                 <div className="bg-neutral-900 p-4 rounded-3xl rounded-tl-none flex items-center gap-2 border border-white/5">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                 </div>
              </motion.div>
            )}
            
            {!loading && displayHistory.length === 0 && error && (
              <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-3xl text-center flex flex-col items-center">
                <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-red-400 mb-2">Failed to start interview</h3>
                <p className="text-sm text-red-300/70 mb-6 max-w-md">{error}</p>
                <Button onClick={() => startInterview(setup!)} className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8">
                  Retry Connection
                </Button>
              </div>
            )}
            
            {error && displayHistory.length > 0 && (
               <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                   <span className="text-sm text-red-400">{error}</span>
                 </div>
                 <Button size="sm" onClick={retryLastRequest} className="bg-red-600 hover:bg-red-700 text-white shrink-0">
                   Retry
                 </Button>
               </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          <div className="px-6 py-2 bg-black/40 border-t border-white/5 flex items-center gap-4 shrink-0">
            <div className="flex-1 h-10 bg-white/5 rounded-xl flex items-center px-4 gap-3 overflow-hidden border border-white/5">
              <span className="text-[8px] font-black uppercase text-gray-500 shrink-0">Live Transcript:</span>
              <div className="flex-1 text-[10px] truncate whitespace-nowrap">
                <span className="text-white font-medium">{liveTranscript}</span>
                <span className="text-gray-500 ml-1">{interimTranscript}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="px-2 py-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-[8px] font-black text-indigo-400 uppercase tracking-tighter">
                {totalFillers} Fillers
              </div>
              <div className="px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[8px] font-black text-amber-400 uppercase tracking-tighter">
                {stutterCount} Stutters
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/5 bg-black/20 flex flex-col items-center gap-3 shrink-0">
            {isRecording && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                <div style={{ width:8,height:8,background:'#EF4444',borderRadius:'50%',animation:'pulse 1s infinite' }} />
                Recording... speak now, click ⏹ to stop
              </div>
            )}
            <div className="flex items-center gap-3 md:gap-4 w-full max-w-3xl">
              <Button 
                onClick={isRecording ? stopVoiceInput : startVoiceInput}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 transition-all shadow-2xl ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-500/20' 
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                {isRecording ? <Square className="w-5 h-5 text-white fill-current" /> : <Mic className="w-6 h-6" />}
              </Button>
              
              <textarea 
                className="flex-1 bg-neutral-900/50 border border-white/10 rounded-[28px] px-6 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none min-h-[64px] max-h-[150px] shadow-inner"
                placeholder={isRecording ? "🎙 Listening — speak your answer..." : "Type your answer or click 🎤 to speak..."}
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleManualSubmit();
                  }
                }}
                disabled={loading}
                rows={1}
              />

              <Button 
                onClick={handleManualSubmit}
                disabled={loading || !manualInput.trim()}
                className="w-14 h-14 md:w-16 md:h-16 rounded-[24px] bg-indigo-600 hover:bg-indigo-500 shrink-0 flex items-center justify-center shadow-lg shadow-indigo-600/20"
              >
                <Send className="w-6 h-6 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ position:'fixed', bottom:10, right:10, background:'rgba(0,0,0,0.85)', color:'#00FF00', padding:'10px 14px', fontSize:10, fontFamily:'monospace', zIndex:99999, borderRadius:8, lineHeight:1.8, minWidth:200 }}>
          <div>Face frames: {dbgFaceFrames}</div>
          <div>Pose frames: {dbgPoseFrames}</div>
          <div>Skin ratio: {dbgSkinRatio}</div>
          <div>Nose ratio: {dbgNoseRatio}</div>
          <div>Ear-shoulder gap: {dbgEarShoulder}</div>
          <div>Shoulder Y: {dbgShoulderY}</div>
          <div>Tab switches: {tabSwitchCountRef.current}</div>
          <div>Interview active: {isInterviewActiveRef.current ? 'YES' : 'NO'}</div>
          <div>Recording: {isRecording ? 'YES' : 'NO'}</div>
          <div>Eye contact: {metrics.eyeContact}</div>
          <div>Posture: {metrics.posture}</div>
        </div>
      )}

      {/* Mobile Feed Overlay */}
      <div className="md:hidden fixed top-20 right-4 w-32 aspect-video bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
          <video ref={webcamRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
             <div className="h-full bg-indigo-500" style={{ width: `${round * 12.5}%` }} />
          </div>
      </div>
    </div>
  );
}
