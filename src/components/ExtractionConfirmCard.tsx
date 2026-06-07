/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ExtractedItems } from "../types";
import { Sparkles, Check, Edit2, Target, Calendar, RefreshCw, AlertTriangle, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExtractionConfirmCardProps {
  id?: string;
  extracted: ExtractedItems;
  onCommit: (confirmed: ExtractedItems) => void;
}

export const ExtractionConfirmCard: React.FC<ExtractionConfirmCardProps> = ({
  id,
  extracted,
  onCommit,
}) => {
  const [items, setItems] = useState<ExtractedItems>({
    goals: extracted.goals || [],
    tasks: extracted.tasks || [],
    habits: extracted.habits || [],
    excuses: extracted.excuses || [],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);

  // If there's absolutely nothing extracted, hide the box completely or return null
  const hasGoals = (items.goals || []).length > 0;
  const hasTasks = (items.tasks || []).length > 0;
  const hasHabits = (items.habits || []).length > 0;
  const hasExcuses = (items.excuses || []).length > 0;

  if (!hasGoals && !hasTasks && !hasHabits && !hasExcuses) return null;

  const handleConfirm = () => {
    onCommit(items);
    setIsCommitted(true);
    setIsEditing(false);
  };

  const updateGoalText = (idx: number, prop: string, val: any) => {
    const nextGoals = [...(items.goals || [])];
    nextGoals[idx] = { ...nextGoals[idx], [prop]: val };
    setItems({ ...items, goals: nextGoals });
  };

  const updateTaskText = (idx: number, prop: string, val: any) => {
    const nextTasks = [...(items.tasks || [])];
    nextTasks[idx] = { ...nextTasks[idx], [prop]: val };
    setItems({ ...items, tasks: nextTasks });
  };

  const updateHabitText = (idx: number, prop: string, val: any) => {
    const nextHabits = [...(items.habits || [])];
    nextHabits[idx] = { ...nextHabits[idx], [prop]: val };
    setItems({ ...items, habits: nextHabits });
  };

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`my-3 p-4 border rounded-xl overflow-hidden shadow-xs relative ${
        isCommitted
          ? "border-emerald-200 bg-emerald-500/5 dark:border-emerald-500/20 dark:bg-emerald-500/5 text-gray-500"
          : "border-indigo-100 bg-linear-to-b from-indigo-50/40 to-indigo-50/10 dark:border-indigo-500/10 dark:from-indigo-500/5 dark:to-transparent text-gray-800"
      }`}
    >
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 p-1.5 px-2.5 bg-indigo-600 dark:bg-indigo-500 text-white font-mono text-[9px] font-bold uppercase tracking-wider rounded-bl-xl shadow-xs flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: "10s" }} />
        AccountaAI Noted Items
      </div>

      <h5 className="text-[11px] font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
        Brain Sync Panel
      </h5>

      <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1 mb-3.5">
        {isCommitted
          ? "Synced successfully! These items have been populated to your dashboard."
          : "I automatically detected some targets from our chat. Review and confirm them below:"}
      </p>

      {/* List / Edit display */}
      <div className="space-y-3">
        {/* GOALS */}
        {items.goals && items.goals.length > 0 && (
          <div className="space-y-1.5 bg-white dark:bg-[#151515] p-2.5 rounded-lg border border-gray-100 dark:border-neutral-800">
            <span className="text-[10px] font-bold font-mono text-indigo-500 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" /> GOAL COMMITMENT
            </span>
            {items.goals.map((g, idx) => (
              <div key={idx} className="text-xs">
                {isEditing ? (
                  <input
                    type="text"
                    value={g.title}
                    onChange={(e) => updateGoalText(idx, "title", e.target.value)}
                    className="w-full mt-1 p-1 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-sm text-xs font-medium focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-[#EFEFEF]"
                  />
                ) : (
                  <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 pt-0.5">
                    🎯 [{g.category || "General"}] {g.title}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TASKS */}
        {items.tasks && items.tasks.length > 0 && (
          <div className="space-y-1.5 bg-white dark:bg-[#151515] p-2.5 rounded-lg border border-gray-100 dark:border-neutral-800 font-mono">
            <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5" /> EXTRACTED TASK
            </span>
            {items.tasks.map((t, idx) => (
              <div key={idx} className="text-xs">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-1.5 mt-1">
                    <input
                      type="text"
                      value={t.title}
                      onChange={(e) => updateTaskText(idx, "title", e.target.value)}
                      className="col-span-2 p-1 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-sm text-xs text-gray-900 dark:text-[#EFEFEF]"
                    />
                    <input
                      type="date"
                      value={t.due_date || ""}
                      onChange={(e) => updateTaskText(idx, "due_date", e.target.value)}
                      className="p-1 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-sm text-[10px]"
                    />
                    <input
                      type="time"
                      value={t.due_time || ""}
                      onChange={(e) => updateTaskText(idx, "due_time", e.target.value)}
                      className="p-1 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-sm text-[10px]"
                    />
                  </div>
                ) : (
                  <div className="font-semibold text-gray-800 dark:text-neutral-200 pt-0.5 flex items-center gap-1">
                    📌 {t.title} {t.due_date ? `— ${t.due_date}` : ""} {t.due_time ? `@ ${t.due_time}` : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* HABITS */}
        {items.habits && items.habits.length > 0 && (
          <div className="space-y-1.5 bg-white dark:bg-[#151515] p-2.5 rounded-lg border border-gray-100 dark:border-neutral-800">
            <span className="text-[10px] font-bold font-mono text-emerald-500 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> RECURRING HABIT
            </span>
            {items.habits.map((h, idx) => (
              <div key={idx} className="text-xs">
                {isEditing ? (
                  <input
                    type="text"
                    value={h.title}
                    onChange={(e) => updateHabitText(idx, "title", e.target.value)}
                    className="w-full mt-1 p-1 bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-sm text-xs focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-[#EFEFEF]"
                  />
                ) : (
                  <div className="font-semibold text-gray-900 dark:text-[#EFEFEF] pt-0.5">
                    ⚙️ [{h.frequency || "daily"}] {h.title}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* EXCUSES */}
        {items.excuses && items.excuses.length > 0 && (
          <div className="p-2.5 bg-rose-50/60 dark:bg-rose-950/20 rounded-lg border border-rose-100 dark:border-rose-950/40 text-xs">
            <span className="text-[10px] font-bold font-mono text-rose-500 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> DETECTED EXCUSE PATTERNS
            </span>
            <div className="font-mono text-rose-700 dark:text-rose-400 mt-1 flex flex-wrap gap-1.5">
              {items.excuses.map((exc, idx) => (
                <span key={idx} className="p-1 px-2.5 bg-rose-100 dark:bg-rose-500/10 rounded-full font-bold">
                  "{exc}"
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Control Triggers */}
      <div className="mt-4.5 flex gap-2 justify-end">
        {!isCommitted && (
          <>
            {isEditing ? (
              <button
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 font-mono border border-gray-200 dark:border-neutral-800 text-gray-700 bg-white hover:bg-gray-50 dark:bg-neutral-900 dark:text-neutral-300 rounded-lg text-xs cursor-pointer min-h-[44px] flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> Keep Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-2 font-mono text-gray-500 hover:text-indigo-600 rounded-lg text-xs cursor-pointer min-h-[44px] flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Adjust Items
              </button>
            )}

            <button
              onClick={handleConfirm}
              className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-semibold cursor-pointer min-h-[44px] flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4 stroke-[3px]" /> Confirm & Sync Brain
            </button>
          </>
        )}

        {isCommitted && (
          <div className="text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
            <Check className="w-4 h-4 stroke-[3px]" /> Synced Successfully!
          </div>
        )}
      </div>
    </motion.div>
  );
};
