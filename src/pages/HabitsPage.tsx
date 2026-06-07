/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Habit, UserProfile } from "../types";
import { HabitCard } from "../components/HabitCard";
import { TrendingUp, PlusCircle, Check, Sparkles, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HabitsProps {
  id?: string;
  user: UserProfile;
  habits: Habit[];
  onCreateHabit: (habit: Omit<Habit, "id" | "user_id" | "streak_count" | "longest_streak" | "last_completed" | "failure_count" | "times_rescheduled">) => void;
  onMarkHabitDone: (id: string, dateStr: string, isRescue?: boolean) => void;
  onDeleteHabit: (id: string) => void;
}

export const HabitsPage: React.FC<HabitsProps> = ({
  id,
  user,
  habits,
  onCreateHabit,
  onMarkHabitDone,
  onDeleteHabit,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">("daily");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateHabit({
      title: title.trim(),
      frequency,
    });

    setTitle("");
    setShowAddForm(false);
  };

  return (
    <div id={id} className="space-y-6 pb-24 md:pb-6 animate-in fade-in duration-150">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#1A1A1A] border border-gray-150 dark:border-neutral-900 rounded-xl">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-500" /> Habit Streaks Tracker
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-wide mt-0.5">
            Set and maintain daily recurring rituals with 90-day completion maps
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 rounded-lg shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer min-h-[40px]"
        >
          <PlusCircle className="w-4 h-4" /> Log New Habit
        </button>
      </div>

      {/* Slide-out Add Habit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="p-5 bg-white dark:bg-[#1A1A1A] border border-indigo-120 dark:border-indigo-500/15 rounded-xl space-y-4 overflow-hidden"
          >
            <h3 className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Create RECURRING Habit ritual
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Habit Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read physical book for 15 minutes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-medium text-gray-900 dark:text-white min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold font-mono text-gray-400 uppercase block mb-1">Ritual Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-medium text-gray-905 dark:text-white min-h-[44px]"
                >
                  <option value="daily">Daily Commit</option>
                  <option value="weekly">Weekly Check-in</option>
                  <option value="custom">Custom days alternate</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer min-h-[40px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer min-h-[40px] flex items-center gap-1"
              >
                <Check className="w-4 h-4 stroke-[3px]" /> Save Ritual Habit
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Habits card list widgets rendering */}
      {habits.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-[#1A1A1A] border border-gray-105 dark:border-neutral-900 rounded-xl font-mono text-xs text-gray-400 dark:text-neutral-500">
          No habits logged yet. Define a habit with the button above to begin accountability tracking.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {habits.map((habit) => {
            // Retrieve actual completions list (last completed strings, etc.)
            // We can also simulation-fill completed dates for our testing map
            const dates = habit.last_completed ? [habit.last_completed] : [];
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                completedDates={dates}
                onMarkDone={onMarkHabitDone}
                onDelete={onDeleteHabit}
              />
            );
          })}
        </div>
      )}

    </div>
  );
};
