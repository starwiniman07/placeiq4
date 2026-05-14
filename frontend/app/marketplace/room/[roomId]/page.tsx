"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function WebRTCRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [participants, setParticipants] = useState(1);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    // Initialize WebRTC and Socket
    const init = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (localVideoRef.current) localVideoRef.current.srcObject = mediaStream;

        socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000");
        
        socketRef.current.on("connect", () => {
          socketRef.current?.emit("join-room", roomId);
        });

        // Simplified WebRTC for demo (actual robust implementation requires STUN/TURN handling)
        socketRef.current.on("user-connected", (userId) => {
          setParticipants(prev => prev + 1);
          createOffer(userId, mediaStream);
        });

        socketRef.current.on("user-disconnected", () => {
          setParticipants(prev => Math.max(1, prev - 1));
          setRemoteStream(null);
        });

        socketRef.current.on("offer", async (payload) => {
          await createAnswer(payload.caller, payload.sdp, mediaStream);
        });

        socketRef.current.on("answer", async (payload) => {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          }
        });

        socketRef.current.on("ice-candidate", async (incoming) => {
          if (peerConnectionRef.current) {
            try {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(incoming.candidate));
            } catch (e) {
              console.error(e);
            }
          }
        });

      } catch (err) {
        console.error("Media access denied", err);
      }
    };

    init();

    return () => {
      stream?.getTracks().forEach(t => t.stop());
      socketRef.current?.disconnect();
      peerConnectionRef.current?.close();
    };
  }, [roomId]);

  const createPeerConnection = (targetId: string, mediaStream: MediaStream) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    mediaStream.getTracks().forEach(track => pc.addTrack(track, mediaStream));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", {
          target: targetId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const createOffer = async (targetId: string, mediaStream: MediaStream) => {
    const pc = createPeerConnection(targetId, mediaStream);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current?.emit("offer", {
      target: targetId,
      caller: socketRef.current.id,
      sdp: offer
    });
  };

  const createAnswer = async (callerId: string, sdp: any, mediaStream: MediaStream) => {
    const pc = createPeerConnection(callerId, mediaStream);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socketRef.current?.emit("answer", {
      target: callerId,
      sdp: answer
    });
  };

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = isAudioMuted;
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const leaveRoom = () => {
    window.location.href = "/marketplace";
  };

  return (
    <div className="h-screen bg-neutral-950 flex flex-col">
      <header className="h-16 px-6 bg-black/50 border-b border-white/10 flex items-center justify-between">
        <h1 className="text-white font-semibold flex items-center gap-2">
          Mock Interview Session <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-400 ml-2">{roomId}</span>
        </h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-sm text-gray-300 border border-white/10">
          <Users className="w-4 h-4 text-emerald-400" /> {participants} in room
        </div>
      </header>

      <div className="flex-1 p-4 flex flex-col lg:flex-row gap-4 overflow-hidden relative">
        
        {/* Remote Video (Main) */}
        <div className="flex-1 bg-black/60 rounded-2xl border border-white/10 overflow-hidden relative flex items-center justify-center">
          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-500 flex flex-col items-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 opacity-50" />
              </div>
              <p>Waiting for the other participant to join...</p>
            </div>
          )}
        </div>

        {/* Local Video (PIP) */}
        <div className="absolute bottom-24 right-8 w-48 h-64 lg:w-64 lg:h-48 lg:relative lg:bottom-auto lg:right-auto bg-black border border-white/20 rounded-xl overflow-hidden shadow-2xl z-10">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
        </div>
      </div>

      {/* Controls */}
      <div className="h-24 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-center gap-4">
        <Button 
          onClick={toggleAudio}
          variant={isAudioMuted ? "default" : "outline"}
          className={`w-14 h-14 rounded-full flex items-center justify-center ${isAudioMuted ? 'bg-red-500 hover:bg-red-600 border-transparent text-white' : 'border-white/20 text-white hover:bg-white/10'}`}
        >
          {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>

        <Button 
          onClick={toggleVideo}
          variant={isVideoMuted ? "default" : "outline"}
          className={`w-14 h-14 rounded-full flex items-center justify-center ${isVideoMuted ? 'bg-red-500 hover:bg-red-600 border-transparent text-white' : 'border-white/20 text-white hover:bg-white/10'}`}
        >
          {isVideoMuted ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </Button>

        <Button 
          onClick={leaveRoom}
          className="w-14 h-14 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-500 border-transparent text-white ml-8"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
