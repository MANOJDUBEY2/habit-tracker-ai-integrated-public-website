/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, 
  Key, 
  Target, 
  Clock, 
  Flame, 
  MessageSquare, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  ArrowRight 
} from "lucide-react";
import { UserProfile } from "../types";
import { dbService } from "../supabaseClient";
import { motion, AnimatePresence } from "motion/react";

interface OnboardingProps {
  id?: string;
  user: UserProfile;
  onFinished: (updated: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ id, user, onFinished }) => {
  const [step, setStep] = useState(1);
  
  // States matching user choices
  const [apiKey, setApiKey] = useState(user.openrouter_api_key || "");
  const [mainGoal, setMainGoal] = useState("");
  const [goalCategory, setGoalCategory] = useState("Personal");
  const [productivity, setProductivity] = useState<"morning" | "afternoon" | "evening">("morning");
  const [reminderTime, setReminderTime] = useState("08:00");
  const [coachStyle, setCoachStyle] = useState<"encouraging" | "direct" | "strict">("encouraging");

  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleCompleteOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    try {
      // 1. Sync updated profile to DB
      const updatedProfile: UserProfile = {
        ...user,
        openrouter_api_key: apiKey.trim() || null,
        productivity_peak: productivity,
        preferred_reminder_time: reminderTime,
        communication_style: coachStyle,
        onboarding_done: true,
      };
      
      const savedProfile = await dbService.updateProfile(updatedProfile);

      // 2. Create the first goal if provided
      if (mainGoal.trim()) {
        await dbService.createGoal({
          title: mainGoal.trim(),
          description: "My primary onboarding focus goal.",
          category: goalCategory,
          priority: 2, // default Medium
          target_date: new Date(Date.now() + 30 * 24 * 65 * 60 * 1000).toISOString().split("T")[0], // 30 days default
        });
      }

      onFinished(savedProfile);
    } catch (err) {
      console.error("Onboarding saving trigger failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    handleCompleteOnboarding();
  };

  return (
    <div id={id} className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-[#0F0F0F] dark:to-[#121212] flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white dark:bg-[#1A1A1A] border border-gray-150 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Onboarding Header status progress */}
        <div className="p-6 border-b border-gray-100 dark:border-neutral-850 bg-slate-50/50 dark:bg-neutral-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
              <span className="text-sm font-extrabold text-gray-900 dark:text-neutral-200">AccountaAI Setup</span>
            </div>
            <span className="text-[11px] font-mono text-gray-400 font-bold uppercase tracking-wider">
              Step {step} of 5
            </span>
          </div>

          {/* Core progress line bar */}
          <div className="w-full h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 rounded-full transition-all duration-300" 
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Content switch slides wrapper */}
        <div className="p-8 min-h-[300px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              
              {/* STEP 1: KEY CONNECTOR */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="p-1 px-2.5 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold uppercase tracking-wider">
                      AI BRAIN
                    </span>
                    <h3 className="text-xl font-black text-gray-950 dark:text-white tracking-tight">
                      Connect Your AI Brain
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      To power translations, accountability coaching dialogues, and plan generation, AccountaAI interacts using your <strong className="text-gray-900 dark:text-white">OpenRouter API Key</strong>. Keep your key confidential; it stays saved securely in the cloud database.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-gray-400 uppercase flex items-center gap-1.5 pt-2">
                      <Key className="w-3.5 h-3.5" /> OpenRouter API Key
                    </label>
                    <input
                      type="password"
                      placeholder="sk-or-v1-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono min-h-[44px]"
                    />
                    <div className="text-[10px] text-gray-400 mt-2 flex justify-between items-center bg-slate-50 dark:bg-neutral-800/40 p-2 rounded-md">
                      <span>Don't have a key?</span>
                      <a 
                        href="https://openrouter.ai/keys"
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-500 font-bold hover:underline"
                      >
                        Create Key at OpenRouter ↗
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PRIMARY GOALS */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="p-1 px-2.5 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold uppercase tracking-wider">
                      PRIMARY FOCUS
                    </span>
                    <h3 className="text-xl font-black text-gray-950 dark:text-white tracking-tight">
                      What is your main goal right now?
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      Give me your primary objective. This is where your accountability coach will focus first during our daily check-ins.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Learn Python for web development and build 3 apps"
                      value={mainGoal}
                      onChange={(e) => setMainGoal(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 min-h-[44px]"
                    />

                    <div>
                      <label className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Goal Category</label>
                      <div className="flex flex-wrap gap-2">
                        {["Personal", "Health", "Education", "Work", "Finances", "Skills"].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setGoalCategory(cat)}
                            className={`p-1.5 px-3 rounded-full text-xs font-mono font-medium transition-colors cursor-pointer border ${
                              goalCategory === cat
                                ? "bg-indigo-600 border-indigo-600 text-white font-bold"
                                : "bg-slate-50 border-gray-200 text-gray-600 hover:bg-slate-100 dark:bg-neutral-800 dark:border-neutral-750 dark:text-neutral-300"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PRODUCTIVITY WINDOW */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="p-1 px-2.5 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold uppercase tracking-wider">
                      CHRONO BIOLOGY
                    </span>
                    <h3 className="text-xl font-black text-gray-950 dark:text-white tracking-tight">
                      When are you most productive?
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      I will structure your highest priority tasks around your natural peak efficiency hours.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {[
                      { id: "morning", label: "Morning Elite", desc: "Energy peak: 6 AM — Noon" },
                      { id: "afternoon", label: "Afternoon Shield", desc: "Energy peak: Noon — 6 PM" },
                      { id: "evening", label: "Night Owl", desc: "Energy peak: 6 PM — Midnight" },
                    ].map((time) => (
                      <button
                        key={time.id}
                        type="button"
                        onClick={() => setProductivity(time.id as any)}
                        className={`p-4 text-left border rounded-xl cursor-pointer transition-all ${
                          productivity === time.id
                            ? "border-indigo-600 bg-indigo-500/5 ring-1 ring-indigo-550 dark:border-indigo-500 dark:bg-indigo-500/5 text-gray-900"
                            : "border-gray-200 hover:bg-slate-50 dark:border-neutral-800 dark:hover:bg-neutral-850"
                        }`}
                      >
                        <h4 className="text-xs font-bold font-mono uppercase text-indigo-600 dark:text-indigo-400">{time.label}</h4>
                        <p className="text-xs font-semibold text-gray-800 dark:text-neutral-200 mt-1">{time.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: DAILY ALERTS CHECK-IN */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="p-1 px-2.5 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold uppercase tracking-wider">
                      DAILY DISCIPLINE
                    </span>
                    <h3 className="text-xl font-black text-gray-950 dark:text-white tracking-tight">
                      When should I check in with you daily?
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      I will send an automated smart reminder prompt directly to your device. This review is tailored around your past commitments.
                    </p>
                  </div>

                  <div className="p-5 border border-gray-100 dark:border-neutral-800 rounded-xl max-w-sm mx-auto bg-slate-50/50 dark:bg-neutral-900/10 space-y-4 text-center">
                    <Clock className="w-8 h-8 text-indigo-500 mx-auto animate-pulse" />
                    <div>
                      <label className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Check-in time</label>
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="p-3 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-lg font-bold font-mono text-gray-900 dark:text-white text-center focus:outline-hidden min-h-[44px] w-36 mx-auto block"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: STYLE OF ENGAGEMENT */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="p-1 px-2.5 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold uppercase tracking-wider">
                      COACH PERSONALITY
                    </span>
                    <h3 className="text-xl font-black text-gray-950 dark:text-white tracking-tight">
                      How do you like your coach to talk to you?
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      Choose the feedback style that motivates you best.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {[
                      {
                        id: "encouraging",
                        label: "Encouraging",
                        desc: "Warm and friendly. Highlights wins, suggests adjustments positively, and boosts spirit.",
                      },
                      {
                        id: "direct",
                        label: "Direct & Clear",
                        desc: "Values speed and data. Points out missed targets clearly and gives sharp feedback.",
                      },
                      {
                        id: "strict",
                        label: "Strict Coach",
                        desc: "High accountability. Calls out excuses immediately and demands solid execution.",
                      },
                    ].map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setCoachStyle(style.id as any)}
                        className={`p-4 text-left border rounded-xl cursor-pointer transition-all flex flex-col gap-1.5 ${
                          coachStyle === style.id
                            ? "border-indigo-600 bg-indigo-500/5 ring-1 ring-indigo-550 dark:border-indigo-500 dark:bg-indigo-505/10"
                            : "border-gray-200 hover:bg-slate-50 dark:border-neutral-800 dark:hover:bg-neutral-850"
                        }`}
                      >
                        <h4 className="text-xs font-bold font-mono uppercase text-indigo-500 dark:text-indigo-400">
                          {style.label}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-neutral-400 leading-relaxed">
                          {style.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Wizard Navigation controller footer */}
        <div className="p-6 border-t border-gray-100 dark:border-neutral-850 bg-slate-50/50 dark:bg-neutral-900/10 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-1.5 text-xs font-bold font-mono text-gray-500 hover:text-gray-700 disabled:opacity-30 cursor-pointer min-h-[44px]"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="text-xs font-mono text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300 px-3 cursor-pointer min-h-[44px]"
            >
              Skip Step
            </button>
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-colors cursor-pointer min-h-[44px] flex items-center gap-1.5"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {step === 5 ? "Finish Onboarding" : "Continue"} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
