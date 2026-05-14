"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Hash, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";

export default function GroupChatPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const { data: session } = useSession();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000");

    socketRef.current.emit("join-community", roomId);

    socketRef.current.on("new-message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;
    
    const payload = {
      room: roomId,
      sender: session?.user?.name || "Anonymous",
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    socketRef.current.emit("send-message", payload);
    setInput("");
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-white overflow-hidden">
      <header className="h-16 border-b border-white/10 bg-black/40 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-gray-500" />
            <h1 className="font-bold text-lg capitalize">{roomId.replace('-', ' ')}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" /> Group Discussion
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-col ${msg.sender === session?.user?.name ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-500">{msg.sender}</span>
                <span className="text-[10px] text-gray-700">{msg.timestamp}</span>
              </div>
              <div className={`px-4 py-2 rounded-2xl max-w-md ${
                msg.sender === session?.user?.name 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white/5 border border-white/10 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      <div className="p-6 bg-black/40 border-t border-white/10">
        <div className="max-w-4xl mx-auto flex gap-4">
          <input 
            type="text" 
            className="flex-1 bg-black/50 border border-white/10 rounded-full px-6 py-3 outline-none focus:border-blue-500 transition-all"
            placeholder={`Message #${roomId}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage} className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 p-0 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
