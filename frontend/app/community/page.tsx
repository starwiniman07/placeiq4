"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users2, MessageSquare, Heart, Share2, Plus, TrendingUp, Download, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import api from "@/lib/api";

export default function CommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mocking for now, will seed later
        setGroups([
          { name: "General Discussion", online: 120 },
          { name: "TCS NQT Prep", online: 85 },
          { name: "FAANG Aspirants", online: 340 },
          { name: "Off-Campus Alerts", online: 210 }
        ]);
        
        setPosts([
          { _id: '1', author: 'Srikanth', content: 'Just cracked my TCS interview! Thanks to PlaceIQ for the aptitude practice.', likes: 12, time: '2h ago' },
          { _id: '2', author: 'Ananya', content: 'Does anyone have a good resource for System Design?', likes: 5, time: '4h ago' }
        ]);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;
    const post = { _id: Date.now().toString(), author: 'Me', content: newPost, likes: 0, time: 'Just now' };
    setPosts([post, ...posts]);
    setNewPost("");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Groups */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Users2 className="w-5 h-5 text-blue-400" /> Active Groups</h2>
            <div className="space-y-4">
              {groups.map(g => (
                <div key={g.name} className="flex items-center justify-between group cursor-pointer">
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{g.name}</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">{g.online} online</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Feed */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Community Feed</h2>
            <div className="flex gap-4">
              <Input 
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind?" 
                className="bg-black/40 border-white/10"
              />
              <Button onClick={handlePostSubmit} className="bg-blue-600 hover:bg-blue-500 rounded-full">Post</Button>
            </div>
          </div>

          <div className="space-y-4">
            {posts.map(post => (
              <motion.div 
                key={post._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold uppercase">{post.author[0]}</div>
                  <div>
                    <h3 className="font-bold text-sm">{post.author}</h3>
                    <p className="text-[10px] text-gray-500">{post.time}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">{post.content}</p>
                <div className="flex items-center gap-6 border-t border-white/5 pt-4">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors">
                    <Heart className="w-4 h-4" /> <span className="text-xs">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors">
                    <MessageSquare className="w-4 h-4" /> <span className="text-xs">Reply</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors ml-auto">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Resources */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-amber-400" /> Trending Resources</h2>
            <div className="space-y-4">
              {[
                { name: "System Design Primer", type: "PDF" },
                { name: "Top 50 DBMS Queries", type: "Docs" },
                { name: "TCS NQT PYQ 2023", type: "ZIP" }
              ].map(r => (
                <div key={r.name} className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between group hover:border-amber-500/30 transition-all cursor-pointer">
                  <div>
                    <p className="text-xs font-medium text-gray-300">{r.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{r.type}</p>
                  </div>
                  <Download className="w-4 h-4 text-gray-600 group-hover:text-amber-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
