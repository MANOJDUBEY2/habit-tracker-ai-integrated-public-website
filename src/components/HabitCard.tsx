/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Habit } from "../types";
import { Flame, Check, ShieldCheck, HeartPulse, RefreshCw, Trash2, HelpCircle } from "lucide-react";
import { HeatmapCalendar } from "./HeatmapCalendar";
import { motion, AnimatePresence } from "motion/react";

interface HabitCardProps {
  id?: string;
  habit: Habit;
  completedDates: string[]; // List of YYYY-MM-DD
  onMarkDone: (id: string, dateStr: string, isRescue?: boolean) => void;
  onDelete: (id: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  id,
  habit,
  completedDates,
  onMarkDone,
  onDelete,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const isCompletedToday = completedDates.includes(todayStr);

  const [showRescueAlert, setShowRescueAlert] = useState(() => {
    // Show rescue trigger only if not done, and current time is past 8 PM (20:00)
    // For demo purposes, we also allow the user to easily toggle it!
    const hour = new Date().getHours();
    return !isCompletedToday && hour >= 20;
  });

  // Check if habit missed 3+ times to show the AI failure insight card
  const isMissedFrequent = habit.failure_count >= 3;

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-800 rounded-xl relative shadow-2xs"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="p-1 px-2 py-0.5 rounded-full text-[9px] font-mono border font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100/40">
            {habit.frequency}
          </span>
          <h3 className="text-base font-bold text-gray-900 dark:text-[#EFEFEF] mt-2 tracking-tight">
            {habit.title}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Flame streak count-up visual */}
          <div className="flex items-center gap-1 p-1 px-2.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-100/30">
            <motion.div
              animate={habit.streak_count > 0 ? {
                scale: [1, 1.25, 1],
                color: ["#F59E0B", "#EF4444", "#F59E0B"],
              } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Flame className="w-5 h-5 fill-amber-500" />
            </motion.div>
            <span className="text-sm font-bold font-mono">{habit.streak_count}</span>
          </div>

          <button
            onClick={() => onDelete(habit.id)}
            className="p-2 text-gray-400 hover:text-rose-500 rounded-md hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
            title="Delete habit"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Heatmap module */}
      <div className="mt-4">
        <p className="text-[10px] font-mono uppercase text-gray-400 dark:text-neutral-500 mb-1.5">
          90-Day Completion Map
        </p>
        <HeatmapCalendar completedDates={completedDates} createdAt={habit.created_at} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-neutral-800">
        <div className="text-[11px] font-mono text-gray-400 dark:text-neutral-500">
          Longest Streak: <span className="text-gray-600 dark:text-neutral-300 font-bold">{habit.longest_streak} days</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Manual test toggle for Rescue mode */}
          {!isCompletedToday && (
            <button
              onClick={() => setShowRescueAlert(!showRescueAlert)}
              className="text-[10px] font-mono text-gray-400 hover:text-indigo-500 underline cursor-pointer"
              title="Force display Rescue Streaks option for testing"
            >
              Toggle Rescue Mode
            </button>
          )}

          <button
            onClick={() => onMarkDone(habit.id, todayStr, false)}
            disabled={isCompletedToday}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all min-h-[44px] ${
              isCompletedToday
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20"
                : "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            }`}
          >
            {isCompletedToday ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 stroke-[3px]" />
                Completed Today
              </>
            ) : (
              "Mark Done"
            )}
          </button>
        </div>
      </div>

      {/* Rescue streak banner section if risk threshold is met */}
      <AnimatePresence>
        {showRescueAlert && !isCompletedToday && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-lg flex items-center justify-between gap-3 overflow-hidden text-xs"
          >
            <div className="flex gap-2">
              <HeartPulse className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <strong className="text-amber-800 dark:text-amber-400 font-bold">Streak Endangered!</strong>
                <p className="text-gray-600 dark:text-neutral-400 mt-0.5 leading-snug">
                  Unfinished past 8:00 PM. Do a rapid <strong className="text-indigo-600 dark:text-indigo-400">5-minute emergency fallback version</strong> to protect your streak!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onMarkDone(habit.id, todayStr, true);
                setShowRescueAlert(false);
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-md shrink-0 cursor-pointer min-h-[38px] transition-colors shadow-2xs text-[11px]"
            >
              I did 5 mins!
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Failure Insight banner */}
      {isMissedFrequent && !isCompletedToday && (
        <div className="mt-3.5 p-3.5 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/15 dark:border-rose-500/20 rounded-lg text-xs leading-relaxed text-gray-700 dark:text-neutral-300">
          <div className="flex items-center gap-1.5 mb-1 text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider font-mono text-[9px]">
            <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
            AI Coach Personal Insight
          </div>
          You have missed this habit <span className="font-bold text-rose-500">{habit.failure_count} times</span> recently. This typically happens when the block feels too heavy or you are tired. Let's restart with just a 10-minute micro-commitment today!
        </div>
      )}
    </motion.div>
  );
};
