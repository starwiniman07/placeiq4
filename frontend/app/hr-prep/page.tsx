"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Mic, 
  Trash2, 
  Save, 
  Plus, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  DollarSign, 
  Briefcase, 
  AlertTriangle, 
  Lightbulb,
  GraduationCap,
  History,
  Menu,
  X,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// --- Types ---
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  suggestions?: string[];
}

interface SavedChat {
  id: number;
  title: string;
  mode: string;
  savedAt: string;
  messageCount: number;
  messages: Message[];
}

// --- Groq Helper ---
const groqCall = async (messages: Message[], maxTokens = 1500) => {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.6,
        max_tokens: maxTokens
      })
    }
  );
  const data = await response.json();
  if (!data.choices) throw new Error("Groq API Error");
  return data.choices[0].message.content;
};

// --- Topics Data ---
const TOPICS = [
  { 
    id: "salary", 
    label: "Salary & Negotiation", 
    icon: <DollarSign className="w-4 h-4" />, 
    question: "How do I negotiate my salary for a fresher role at a product company?",
    color: "text-emerald-400"
  },
  { 
    id: "hr", 
    label: "HR Round Prep", 
    icon: <MessageSquare className="w-4 h-4" />, 
    question: "How should I answer 'Tell me about yourself' for a software engineering role?",
    color: "text-blue-400"
  },
  { 
    id: "offer", 
    label: "Offer Handling", 
    icon: <ShieldCheck className="w-4 h-4" />, 
    question: "I have two offers — one high salary startup vs lower salary FAANG. How do I decide?",
    color: "text-purple-400"
  },
  { 
    id: "difficult", 
    label: "Difficult Questions", 
    icon: <AlertTriangle className="w-4 h-4" />, 
    question: "How do I answer 'What is your biggest weakness?' without hurting my chances?",
    color: "text-amber-400"
  },
  { 
    id: "goals", 
    label: "Career Goals", 
    icon: <Zap className="w-4 h-4" />, 
    question: "How do I answer where do you see yourself in 5 years as a fresher?",
    color: "text-pink-400"
  },
  { 
    id: "conflict", 
    label: "Conflict & Pressure", 
    icon: <History className="w-4 h-4" />, 
    question: "How do I handle 'Tell me about a time you failed' in an interview?",
    color: "text-orange-400"
  },
  { 
    id: "research", 
    label: "Company Research", 
    icon: <Briefcase className="w-4 h-4" />, 
    question: "How do I research a company before an interview and impress the interviewer with my knowledge?",
    color: "text-cyan-400"
  },
  { 
    id: "followup", 
    label: "Follow-up & Offers", 
    icon: <Send className="w-4 h-4" />, 
    question: "How do I follow up after an interview without being annoying?",
    color: "text-indigo-400"
  }
];

export default function InterviewAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Hi! I'm your Interview Advisor powered by Groq AI. Ask me anything about:\n- How to answer tough interview questions\n- Salary negotiation tactics\n- Handling multiple offers\n- HR round strategies\n- Career decisions\n\nI'll give you real, honest advice — not generic tips." 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("General");
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem("placeiq_advisor_chats");
    if (saved) setSavedChats(JSON.parse(saved));

    const current = sessionStorage.getItem("placeiq_advisor_current");
    if (current) setMessages(JSON.parse(current));
  }, []);

  useEffect(() => {
    sessionStorage.setItem("placeiq_advisor_current", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const saveCurrentChat = () => {
    if (messages.length <= 1) return;
    const firstUserMsg = messages.find(m => m.role === "user")?.content || "New Chat";
    const newChat: SavedChat = {
      id: Date.now(),
      title: firstUserMsg.slice(0, 50) + (firstUserMsg.length > 50 ? "..." : ""),
      mode: mode,
      savedAt: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages
    };

    let updated = [newChat, ...savedChats];
    if (updated.length > 10) {
      alert("You have 10 saved chats (maximum). Delete one to save this conversation.");
      return;
    }
    setSavedChats(updated);
    localStorage.setItem("placeiq_advisor_chats", JSON.stringify(updated));
    alert("Chat saved successfully!");
  };

  const loadChat = (chat: SavedChat) => {
    setMessages(chat.messages);
    setMode(chat.mode);
    setIsMobileMenuOpen(false);
  };

  const deleteChat = (id: number) => {
    const updated = savedChats.filter(c => c.id !== id);
    setSavedChats(updated);
    localStorage.setItem("placeiq_advisor_chats", JSON.stringify(updated));
  };

  const clearChat = () => {
    setMessages([{ 
      role: "assistant", 
      content: "Hi! I'm your Interview Advisor powered by Groq AI. Ask me anything about:\n- How to answer tough interview questions\n- Salary negotiation tactics\n- Handling multiple offers\n- HR round strategies\n- Career decisions\n\nI'll give you real, honest advice — not generic tips." 
    }]);
  };

  // --- Speech API ---
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + " " + transcript);
    };
    recognition.start();
  };

  // --- Core Logic ---
  const handleSend = async (overrideInput?: string) => {
    const text = overrideInput || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const systemPrompt = `You are an elite interview coach and career advisor with 15 years of experience coaching thousands of Indian engineering students into top tech companies like Google, Microsoft, Amazon, TCS, Infosys, and startups.

You specialize in:
- HR interview question coaching with specific STAR-method answers
- Salary negotiation tactics for Indian fresher and experienced roles
- Handling competing offers and career decisions
- Behavioral question frameworks
- Communication and confidence coaching

Your response style:
1. ACKNOWLEDGE the question briefly (1 sentence)
2. GIVE THE DIRECT ANSWER first (what to actually say/do)
3. EXPLAIN WHY this approach works
4. GIVE AN EXAMPLE — either a sample script they can use word-for-word, or a real scenario walkthrough
5. ADD A WARNING — common mistakes to avoid
6. END WITH A FOLLOW-UP TIP

Format rules:
- Use clear sections with bold headings
- Give ACTUAL SCRIPTS they can copy and adapt (e.g. "You could say exactly: 'Based on my research...'")
- Be specific to Indian placement context (LPA, tier-1/2 colleges, service vs product companies, bond agreements, etc.)
- Never give vague advice like "be confident" without explaining HOW
- Keep responses under 400 words unless the topic needs more
- Use a warm, mentor tone

Current mode: ${mode}
(adjust focus: General = balanced, HR Round = behavioral/STAR, Salary = negotiation/numbers, Offer Handling = decisions/counter-offers)`;

      const groqMsgs = [
        { role: "system", content: systemPrompt },
        ...newMessages.slice(-10)
      ] as Message[];

      const response = await groqCall(groqMsgs);
      
      // Generate Suggestions
      const suggestionPrompt = [
        { role: "system", content: "Generate follow-up questions. Return ONLY a JSON array of 3 strings. No markdown." },
        { role: "user", content: `The user asked: "${text}"\nThe advisor responded about: "${response.split('.')[0]}"\nGenerate 3 short follow-up questions the user might want to ask. Return ONLY: ["question 1", "question 2", "question 3"]` }
      ] as Message[];
      
      let suggestions: string[] = [];
      try {
        const suggRaw = await groqCall(suggestionPrompt, 200);
        suggestions = JSON.parse(suggRaw.replace(/```json|```/g, "").trim());
      } catch (e) {
        suggestions = ["How do I handle counter offers?", "What if they don't budge?", "Script for saying no politely?"];
      }

      setMessages(prev => [...prev, { role: "assistant", content: response, suggestions }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**')) {
        return <h4 key={i} className="font-black text-blue-400 mt-4 mb-2 uppercase tracking-widest text-xs">{line.replace(/\*\*/g, '')}</h4>;
      }
      if (line.startsWith('Script:') || line.startsWith('You could say:')) {
        return (
          <div key={i} className="bg-blue-600/10 border-l-4 border-blue-500 p-4 my-4 rounded-r-xl italic font-medium text-blue-100">
            {line}
          </div>
        );
      }
      if (line.startsWith('⚠️ Warning:')) {
        return (
          <div key={i} className="bg-amber-500/10 border border-amber-500/30 p-4 my-4 rounded-xl flex gap-3 text-amber-200">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
            <span className="text-sm">{line}</span>
          </div>
        );
      }
      if (line.startsWith('💡 Tip:')) {
        return (
          <div key={i} className="bg-emerald-500/10 border border-emerald-500/30 p-4 my-4 rounded-xl flex gap-3 text-emerald-200">
            <Lightbulb className="w-5 h-5 shrink-0 text-emerald-500" />
            <span className="text-sm">{line}</span>
          </div>
        );
      }
      if (line.startsWith('•')) {
        return <li key={i} className="ml-4 mb-1 list-disc text-gray-300">{line.substring(1).trim()}</li>;
      }
      return <p key={i} className="mb-2 text-gray-200 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col lg:flex-row overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* --- Left Panel (Desktop) --- */}
      <aside className="hidden lg:flex w-[320px] shrink-0 flex-col border-r border-white/10 p-6 z-20 bg-neutral-950/50 backdrop-blur-xl">
        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
          <GraduationCap className="text-blue-500" /> Quick Topics
        </h2>
        
        <div className="space-y-2 flex-1 overflow-y-auto scrollbar-hide">
          {TOPICS.map(t => (
            <button 
              key={t.id}
              onClick={() => handleSend(t.question)}
              className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all group flex items-start gap-3 border border-transparent hover:border-white/10"
            >
              <div className={`mt-1 p-2 rounded-lg bg-white/5 ${t.color}`}>{t.icon}</div>
              <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{t.label}</span>
            </button>
          ))}

          <div className="pt-6 mt-6 border-t border-white/5">
             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <History className="w-3 h-3" /> Saved Conversations
             </h3>
             {savedChats.length === 0 ? (
               <p className="text-[10px] text-gray-600 italic">No saved chats yet.</p>
             ) : (
               <div className="space-y-3">
                 {savedChats.map(c => (
                   <div key={c.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
                      <div className="text-[11px] font-bold text-gray-300 truncate">{c.title}</div>
                      <div className="flex justify-between items-center text-[9px] text-gray-600">
                         <span>{new Date(c.savedAt).toLocaleDateString()} • {c.messageCount} msgs</span>
                         <div className="flex gap-2">
                            <button onClick={() => loadChat(c)} className="text-blue-400 hover:text-blue-300 font-black uppercase">Load</button>
                            <button onClick={() => deleteChat(c.id)} className="text-red-400 hover:text-red-300 font-black uppercase">Del</button>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
           <Button onClick={clearChat} variant="outline" className="w-full border-white/10 rounded-xl h-12 font-black text-xs">
              <Plus className="w-4 h-4 mr-2" /> New Chat
           </Button>
        </div>
      </aside>

      {/* --- Main Chat Area --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
        {/* Top Bar */}
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-6 backdrop-blur-md bg-black/20 shrink-0">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-400"><Menu /></button>
              <div>
                <h1 className="text-xl font-black">Interview Advisor</h1>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Powered by Groq AI</p>
              </div>
           </div>

           <div className="flex items-center gap-3">
              <div className="hidden md:flex bg-black/40 p-1 rounded-xl border border-white/5">
                 {["General", "HR Round", "Salary", "Offer Handling"].map(m => (
                    <button 
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${mode === m ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white'}`}
                    >
                      {m}
                    </button>
                 ))}
              </div>
              <Button onClick={saveCurrentChat} className="bg-blue-600 text-white hover:bg-blue-500 rounded-xl px-4 h-10 font-black text-xs">
                 <Save className="w-4 h-4 mr-2" /> Save
              </Button>
           </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-hide">
           {messages.map((m, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
             >
                <div className={`flex gap-4 max-w-[85%] md:max-w-[70%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                   <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${m.role === 'assistant' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                      {m.role === 'assistant' ? <GraduationCap className="w-6 h-6" /> : <div className="font-bold text-xs">ME</div>}
                   </div>
                   <div className="space-y-4">
                      <div className={`p-5 rounded-3xl shadow-xl leading-relaxed ${m.role === 'user' ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white' : 'bg-white/5 border border-white/10 text-gray-200'}`}>
                         {m.role === 'assistant' ? renderMessageContent(m.content) : <p>{m.content}</p>}
                      </div>
                      
                      {m.suggestions && m.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                           {m.suggestions.map((s, i) => (
                             <button 
                               key={i}
                               onClick={() => handleSend(s)}
                               className="px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/30 text-[11px] font-bold text-blue-400 hover:bg-blue-600/20 transition-all flex items-center gap-2 group"
                             >
                               {s} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                             </button>
                           ))}
                        </div>
                      )}
                   </div>
                </div>
             </motion.div>
           ))}
           {loading && (
             <div className="flex justify-start">
                <div className="flex gap-4 items-center">
                   <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center animate-pulse"><GraduationCap className="w-6 h-6" /></div>
                   <div className="flex gap-1.5 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                   </div>
                </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 md:p-8 shrink-0 relative bg-neutral-950/80 backdrop-blur-xl border-t border-white/10">
           <div className="max-w-4xl mx-auto relative group">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 500))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about salary negotiation, HR questions, offer decisions..."
                className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 pl-6 pr-32 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none min-h-[60px] text-sm scrollbar-hide"
                rows={1}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                 <span className="text-[10px] font-bold text-gray-600 mr-2">{input.length}/500</span>
                 <button 
                  onClick={startVoiceInput}
                  className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
                 >
                   <Mic className="w-5 h-5" />
                 </button>
                 <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white shadow-lg shadow-blue-600/30 transition-all"
                 >
                   <Send className="w-5 h-5" />
                 </button>
              </div>
           </div>
           <p className="text-center text-[10px] text-gray-600 mt-4 font-bold uppercase tracking-widest">
              Press Enter to send, Shift+Enter for new line
           </p>
        </div>
      </main>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-80 bg-neutral-950 border-r border-white/10 p-6 z-[101] flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-black flex items-center gap-2"><GraduationCap className="text-blue-500" /> Topics</h2>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400"><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
                {TOPICS.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => { handleSend(t.question); setIsMobileMenuOpen(false); }}
                    className="w-full text-left p-3 rounded-xl hover:bg-white/5 flex items-start gap-3"
                  >
                    <div className={`mt-1 p-2 rounded-lg bg-white/5 ${t.color}`}>{t.icon}</div>
                    <span className="text-xs font-bold text-gray-400">{t.label}</span>
                  </button>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
