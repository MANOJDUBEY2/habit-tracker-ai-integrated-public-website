/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Goal } from "../types";
import { Target, Trash2, Calendar, Edit2, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface GoalCardProps {
  id?: string;
  goal: Goal;
  onUpdate: (id: string, updates: Partial<Goal>) => void;
  onDelete: (id: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  id,
  goal,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(goal.progress_pct);
  const [title, setTitle] = useState(goal.title);
  const [desc, setDesc] = useState(goal.description || "");

  const handleProgressChange = (val: number) => {
    const updatedVal = Math.min(100, Math.max(0, val));
    setProgress(updatedVal);
    onUpdate(goal.id, { 
      progress_pct: updatedVal,
      status: updatedVal === 100 ? "completed" : "active"
    });
  };

  const handleSaveInfo = () => {
    onUpdate(goal.id, { title, description: desc });
    setIsEditing(false);
  };

  const priorityMeta = {
    3: { text: "High Priority", color: "text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" },
    2: { text: "Medium Priority", color: "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" },
    1: { text: "Low Priority", color: "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" },
  }[goal.priority || 2];

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-800 rounded-xl relative shadow-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="p-1 px-2.5 rounded-full text-[10px] font-mono border font-medium inline-block mb-1.5 uppercase tracking-wider bg-slate-50 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border-gray-150 dark:border-neutral-700">
              {goal.category || "General"}
            </span>
            <span className={`p-1 px-2.5 rounded-full text-[10px] font-mono border font-medium inline-block mb-1.5 uppercase tracking-wider ml-1.5 ${priorityMeta.color}`}>
              {priorityMeta.text}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300 rounded-md hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer"
            title="Edit info"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 text-gray-400 hover:text-rose-500 rounded-md hover:bg-rose-50 dark:hover:bg-rose-500/15 cursor-pointer"
            title="Delete goal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        {isEditing ? (
          <div className="space-y-3 p-3 bg-slate-50 dark:bg-neutral-800/20 rounded-lg border border-gray-100 dark:border-neutral-800 mb-4">
            <div>
              <label className="text-[10px] font-mono uppercase text-gray-400">Goal Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 p-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-md text-sm text-gray-900 dark:text-[#EFEFEF] focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-gray-400">Description</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full mt-1 p-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-md text-sm text-gray-900 dark:text-[#EFEFEF] focus:outline-hidden focus:ring-1 focus:ring-indigo-500 h-16 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInfo}
                className="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-md cursor-pointer font-medium"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-base font-semibold text-gray-900 dark:text-[#EFEFEF] tracking-tight">
              {goal.title}
            </h3>
            {goal.description && (
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1 line-clamp-2">
                {goal.description}
              </p>
            )}
          </>
        )}
      </div>

      {goal.target_date && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-mono text-gray-400 dark:text-neutral-500">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>Deadline: {new Date(goal.target_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
      )}

      {/* Progress display and controls */}
      <div className="mt-5 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500 dark:text-neutral-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Goal Completion Progress
          </span>
          <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {progress}%
          </span>
        </div>

        {/* Custom luxury animated progress bar */}
        <div className="w-full h-2.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden relative border border-gray-200/40 dark:border-transparent">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-linear-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 rounded-full"
          />
        </div>

        {/* Rapid inline progress triggers */}
        <div className="flex items-center gap-1.5 pt-1.5 justify-end">
          <button
            onClick={() => handleProgressChange(progress - 10)}
            className="p-1 px-2.5 text-[11px] font-mono font-bold bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-300 rounded-md border border-gray-150 dark:border-neutral-700 cursor-pointer transition-colors"
          >
            -10%
          </button>
          <button
            onClick={() => handleProgressChange(progress + 10)}
            className="p-1 px-2.5 text-[11px] font-mono font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-100 dark:border-indigo-400/30 cursor-pointer transition-colors"
          >
            +10%
          </button>
          <button
            onClick={() => handleProgressChange(100)}
            className="p-1 px-2.5 text-[11px] font-mono font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-100 dark:border-emerald-500/30 cursor-pointer transition-colors"
          >
            Match Done
          </button>
        </div>
      </div>
    </motion.div>
  );
};
