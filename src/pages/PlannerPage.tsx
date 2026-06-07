/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserProfile, Goal, Task, Habit } from "../types";
import { LoadingSpinner } from "../components/SharedItems";
import { Calendar, RefreshCw, Sparkles, CheckSquare, Clock } from "lucide-react";
import { motion } from "motion/react";

interface PlannerProps {
  id?: string;
  user: UserProfile;
  goals: Goal[];
  tasks: Task[];
  habits: Habit[];
}

export const PlannerPage: React.FC<PlannerProps> = ({
  id,
  user,
  goals,
  tasks,
  habits,
}) => {
  const [plannerQuote, setPlannerQuote] = useState("Uncontrolled habits build accidental paths. Be deliberate.");
  const [plannerItems, setPlannerItems] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleGenerateAIPlannerPlan = async () => {
    setIsGenerating(true);
    try {
      if (user.openrouter_api_key) {
        const response = await fetch("/api/planner/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userProfile: user, goals, tasks, habits }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.plan) {
            setPlannerItems(data.plan);
            if (data.quote) setPlannerQuote(data.quote);
            return;
          }
        }
      }

      // Offline mock fallback planner items
      setTimeout(() => {
        setPlannerItems([
          { title: "Review priority milestones for 20 minutes", due_time: "09:00", finished: false },
          { title: "Perform micro-exercise habit loop (15 mins)", due_time: "12:15", finished: false },
          { title: "Code active forms blocks related to Core skills goal", due_time: "16:30", finished: false },
          { title: "Read and clear checklist tasks", due_time: "20:00", finished: false },
        ]);
        setPlannerQuote("A year from now you will wish you had started today. Fuel your drive.");
      }, 700);
    } catch {
      // safe fallback skipping
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    handleGenerateAIPlannerPlan();
  }, [user, goals]);

  const toggleLocalCheck = (idx: number) => {
    const copy = [...plannerItems];
    copy[idx].finished = !copy[idx].finished;
    setPlannerItems(copy);
  };

  return (
    <div id={id} className="space-y-6 pb-24 md:pb-6 animate-in fade-in duration-150">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-900 rounded-xl">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-500" /> AI-Generated Daily Planner
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-wide mt-0.5">
            Hourly coaching targets generated around peak productivity windows
          </p>
        </div>

        <button
          onClick={handleGenerateAIPlannerPlan}
          disabled={isGenerating}
          className="px-4.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 rounded-lg shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer min-h-[40px]"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} /> Generate Today Plan
        </button>
      </div>

      {isGenerating ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Daily Advice Bubble Widget */}
          <div className="lg:col-span-4 bg-white dark:bg-[#1A1A1A] border-none rounded-xl p-5 space-y-4 max-h-[300px] flex flex-col justify-center text-center bg-linear-to-b from-indigo-50/40 to-indigo-50/10 dark:from-indigo-650/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1.5 bg-indigo-600 dark:bg-indigo-500 text-white font-mono text-[9px] font-bold uppercase rounded-bl-lg">
              Daily Coach Quote
            </div>
            <Sparkles className="w-8 h-8 text-indigo-500 mx-auto animate-pulse" />
            <p className="text-sm text-gray-600 dark:text-neutral-350 italic leading-relaxed">
              "{plannerQuote}"
            </p>
          </div>

          {/* Today Plan block lists */}
          <div className="lg:col-span-8 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-900 rounded-xl p-5 space-y-4">
            <div className="border-b border-gray-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-[#EFEFEF] flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-indigo-400" /> Agenda Milestones — {todayStr}
              </h3>
            </div>

            <div className="space-y-3.5">
              {plannerItems.length === 0 ? (
                <div className="text-center p-12 text-xs text-gray-400 dark:text-neutral-500 font-mono">
                  No agenda records built. Choose 'Generate Today Plan' to record micro-steps.
                </div>
              ) : (
                plannerItems.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 bg-slate-50/40 dark:bg-neutral-900/30 rounded-xl border border-gray-100 dark:border-neutral-850 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={!!item.finished}
                        onChange={() => toggleLocalCheck(idx)}
                        className="w-4.5 h-4.5 rounded-sm text-indigo-600 cursor-pointer min-w-[18px] min-h-[18px]"
                      />
                      <span className={`text-xs font-semibold text-gray-800 dark:text-neutral-200 leading-snug truncate ${
                        item.finished ? "line-through text-gray-400 dark:text-neutral-550" : ""
                      }`}>
                        {item.title}
                      </span>
                    </div>

                    {item.due_time && (
                      <span className="p-1 px-2.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100/30 text-[10px] font-mono font-bold rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {item.due_time}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
