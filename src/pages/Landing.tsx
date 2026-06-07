/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Target, Zap, TrendingUp, Calendar, ArrowRight, ShieldCheck, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface LandingProps {
  id?: string;
  onNavigate: (route: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ id, onNavigate }) => {
  return (
    <div id={id} className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-[#0F0F0F] dark:to-[#121212] flex flex-col justify-between overflow-x-hidden">
      
      {/* Header Bar */}
      <header className="h-16 px-6 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-gray-150/40 dark:border-neutral-900/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-base font-extrabold text-gray-900 dark:text-[#EFEFEF] tracking-tight">
            AccountaAI
          </span>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => onNavigate("login")}
            className="px-4 py-1.5 text-xs font-semibold text-gray-600 dark:text-neutral-400 hover:text-indigo-600 cursor-pointer min-h-[44px]"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate("register")}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer min-h-[44px]"
          >
            Get Started Free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 md:py-24 text-center space-y-8 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 p-1 px-3 bg-indigo-50 dark:bg-indigo-5050 text-indigo-700 dark:text-indigo-400 text-xs font-mono font-bold rounded-full border border-indigo-150/60 dark:border-indigo-550/30"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse" />
          MEET YOUR LIVE 24/7 ACCOUNTABILITY COACH
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-none tracking-tight font-sans"
        >
          Build Habits. Hit Goals.<br/>
          <span className="text-linear-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 bg-clip-text text-transparent">
            No Excuses Permitted.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base md:text-lg text-gray-500 dark:text-neutral-400 max-w-2xl mx-auto font-medium"
        >
          AccountaAI is a warm, firm personal coach that tracks your progress in real-time, extracts goals and habits dynamically from conversations, and detects excuse patterns to keep you laser-focused.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
        >
          <button
            onClick={() => onNavigate("register")}
            className="w-full sm:w-auto px-6 py-3 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-sm rounded-lg shadow-md transition-all cursor-pointer min-h-[48px] flex items-center justify-center gap-2 group hover:gap-3"
          >
            Launch Your Journey Free <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate("login")}
            className="w-full sm:w-auto px-6 py-3 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-250 dark:bg-neutral-850 dark:text-neutral-200 dark:hover:bg-neutral-800 text-sm rounded-lg transition-all cursor-pointer min-h-[48px]"
          >
            Demo / Standalone Login
          </button>
        </motion.div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-16 md:pt-24 border-t border-gray-150/40 dark:border-neutral-900/30">
          <div className="p-5 text-left border border-gray-100 dark:border-neutral-850 bg-white/50 dark:bg-neutral-[#1A1A1A]/30 rounded-xl space-y-2">
            <div className="p-2 w-max bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-[#EFEFEF]">Cognitive Chat Engine</h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400">Conversational check-ins that extract habits, tasks, and excuses from text.</p>
          </div>

          <div className="p-5 text-left border border-gray-100 dark:border-neutral-850 bg-white/50 dark:bg-neutral-[#1A1A1A]/30 rounded-xl space-y-2">
            <div className="p-2 w-max bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-[#EFEFEF]">90-Day Streaks</h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400">Visual GitHub-style calendars that provide micro-commitments feedback instantly.</p>
          </div>

          <div className="p-5 text-left border border-gray-100 dark:border-neutral-850 bg-white/50 dark:bg-neutral-[#1A1A1A]/30 rounded-xl space-y-2">
            <div className="p-2 w-max bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-[#EFEFEF]">Micro-Rescue Mode</h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400">Preserve streaks on stressful, tiering evenings using actionable 5-minute fallback routines.</p>
          </div>

          <div className="p-5 text-left border border-gray-100 dark:border-neutral-850 bg-white/50 dark:bg-neutral-[#1A1A1A]/30 rounded-xl space-y-2">
            <div className="p-2 w-max bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-[#EFEFEF]">Accountable Biometrics</h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400">AI-crafted reports highlighting failure triggers and excuses lists.</p>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-gray-150/40 dark:border-neutral-900/40 text-center text-xs font-mono text-gray-400">
        © 2026 AccountaAI Personal Coaching. Under strict sandbox authorization.
      </footer>
    </div>
  );
};

// Simple import helpers inside widgets
const MessageSquareCode = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7.9 20 12 16h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3.9Z"/><path d="m10 8-2 2 2 2"/><path d="m14 8 2 2-2 2"/></svg>
);
