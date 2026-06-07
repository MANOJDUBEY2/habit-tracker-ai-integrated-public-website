/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Goal, UserProfile } from "../types";
import { GoalCard } from "../components/GoalCard";
import { Target, PlusCircle, Check, Sparkles, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GoalsProps {
  id?: string;
  user: UserProfile;
  goals: Goal[];
  onCreateGoal: (goal: Omit<Goal, "id" | "user_id" | "progress_pct" | "status">) => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalsPage: React.FC<GoalsProps> = ({
  id,
  user,
  goals,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Education");
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [targetDate, setTargetDate] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateGoal({
      title: title.trim(),
      description: desc.trim() || null,
      category,
      priority,
      target_date: targetDate || null,
    });

    setTitle("");
    setDesc("");
    setTargetDate("");
    setShowAddForm(false);
  };

  const filteredGoals = goals.filter((g) => {
    if (filter === "active") return g.status === "active";
    if (filter === "completed") return g.status === "completed";
    return true;
  });

  return (
    <div id={id} className="space-y-6 pb-24 md:pb-6 animate-in fade-in duration-150">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-900 rounded-xl">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-500" /> Core Commitments & Goals
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-wide mt-0.5">
            Define your micro/macro targets to feed the accountability coach
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 rounded-lg shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer min-h-[40px]"
        >
          <PlusCircle className="w-4 h-4" /> Define New Goal
        </button>
      </div>

      {/* Slide-out Add Goal Card Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="p-5 bg-white dark:bg-[#1A1A1A] border border-indigo-100 dark:border-indigo-500/10 rounded-xl space-y-4 overflow-hidden"
          >
            <h3 className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Add Core TARGET Object
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Target Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master React Native and publish an app store build"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-medium text-gray-900 dark:text-white min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Deadline Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-medium text-gray-900 dark:text-white min-h-[44px]"
                />
              </div>

              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Short Description (Reasoning / KPI)</label>
                <textarea
                  placeholder="Why is this paramount? e.g. To secure a remote developer position before end of year."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-medium text-gray-900 dark:text-white h-16 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold font-mono text-gray-400 uppercase block mb-1">Goal Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-medium text-gray-950 dark:text-white min-h-[44px]"
                >
                  {["Education", "Work", "Personal", "Health", "Finances", "Skills"].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold font-mono text-gray-400 uppercase block mb-1">AI Priority Weighting</label>
                <div className="flex gap-2">
                  {[
                    { val: 1, label: "Low" },
                    { val: 2, label: "Medium" },
                    { val: 3, label: "High" },
                  ].map((prio) => (
                    <button
                      key={prio.val}
                      type="button"
                      onClick={() => setPriority(prio.val as any)}
                      className={`flex-1 p-2 border rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                        priority === prio.val
                          ? "bg-indigo-600 border-indigo-600 text-white font-bold"
                          : "bg-slate-50 border-gray-200 text-gray-600 dark:bg-neutral-800 dark:border-neutral-750 dark:text-neutral-300"
                      }`}
                    >
                      {prio.label}
                    </button>
                  ))}
                </div>
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
                <Check className="w-4 h-4 stroke-[3px]" /> Save Target Object
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Goal Filters tab links */}
      <div className="flex gap-1.5 p-1 bg-slate-100/60 dark:bg-neutral-900/40 rounded-xl w-max">
        {[
          { id: "all", label: "All Commitments" },
          { id: "active", label: "Active" },
          { id: "completed", label: "Fulfilled" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`p-1.5 px-4 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filter === tab.id
                ? "bg-white dark:bg-[#1A1A1A] text-indigo-600 dark:text-indigo-400 shadow-3xs font-extrabold"
                : "text-gray-500 hover:text-gray-700 dark:text-neutral-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Goals lists rendering */}
      {filteredGoals.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-[#1A1A1A] border border-gray-105 dark:border-neutral-900 rounded-xl font-mono text-xs text-gray-400 dark:text-neutral-500">
          No goals matches selected filters. Select 'Define New Goal' to record targets.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {filteredGoals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onUpdate={onUpdateGoal}
              onDelete={onDeleteGoal}
            />
          ))}
        </div>
      )}

    </div>
  );
};
