"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Code2, 
  Mic2, 
  ShoppingBag, 
  Users2, 
  Map, 
  FileUser, 
  MessageSquareMore, 
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { clearUserData } from "@/lib/userStore";
import { useAuthStore } from "@/lib/store/authStore";

const menuItems = [
  { name: "Dashboard", icon: <LayoutDashboard />, href: "/dashboard" },
  { name: "Aptitude Prep", icon: <BrainCircuit />, href: "/aptitude-prep" },
  { name: "Technical Prep", icon: <Code2 />, href: "/technical-prep" },
  { name: "Interview Advisor", icon: <MessageSquareMore />, href: "/hr-prep" },
  { name: "AI Interview", icon: <Mic2 />, href: "/ai-interview" },
  { name: "Marketplace", icon: <ShoppingBag />, href: "/marketplace" },

  { name: "Resume Updater", icon: <ShieldCheck />, href: "/resume-analyzer" },
  { name: "Community", icon: <Users2 />, href: "/community" },
  { name: "Roadmaps", icon: <Map />, href: "/roadmaps" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Hide sidebar on auth + onboarding pages and active interview sessions/results
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname.startsWith("/(auth)") || pathname === "/onboarding";
  if (isAuthPage || pathname.includes("/ai-interview/session") || pathname.includes("/ai-interview/results")) {
    return null;
  }


  return (
    <motion.aside 
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="h-screen bg-neutral-950 border-r border-white/10 flex flex-col sticky top-0 z-40 transition-all duration-300"
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">P</div>
            <span className="font-black text-xl tracking-tighter">PlaceIQ</span>
          </motion.div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/5 rounded-lg text-gray-500"
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href}>
              <div className={`
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all group
                ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
              `}>
                <div className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-400'} transition-colors`}>
                  {item.icon}
                </div>
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={() => {
            clearUserData();
            useAuthStore.getState().logout();
            signOut({ callbackUrl: '/login' });
          }}
          className="flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 w-full rounded-xl transition-all">
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
