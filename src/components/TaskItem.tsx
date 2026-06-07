/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Task } from "../types";
import { Check, Trash2, Calendar, RefreshCw, AlertCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TaskItemProps {
  id?: string;
  task: Task;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
  goalTitle?: string | null;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  id,
  task,
  onToggleComplete,
  onDelete,
  goalTitle,
}) => {
  const isCompleted = task.status === "completed";

  // Check if task is overdue or due today
  const getDueStatus = () => {
    if (!task.due_date || isCompleted) return { color: "text-gray-400", bg: "bg-slate-50 dark:bg-neutral-800" };
    
    const todayStr = new Date().toISOString().split("T")[0];
    if (task.due_date === todayStr) {
      return { 
        color: "text-amber-600 dark:text-amber-400 font-semibold", 
        badge: "Due Today",
        bg: "bg-amber-500/10 border-amber-500/20" 
      };
    } else if (task.due_date < todayStr) {
      return { 
        color: "text-rose-600 dark:text-rose-400 font-bold", 
        badge: `Overdue (${task.missed_count}x missed)`,
        bg: "bg-rose-500/10 border-rose-500/20" 
      };
    }
    return { color: "text-gray-400", bg: "" };
  };

  const dueStatus = getDueStatus();

  return (
    <motion.div
      id={id}
      layout
      className={`p-4 bg-white dark:bg-[#1A1A1A] border rounded-xl flex items-center justify-between gap-4 transition-all ${
        isCompleted 
          ? "border-gray-150 dark:border-neutral-900 bg-gray-50/50 opacity-75" 
          : "border-gray-100 dark:border-neutral-800 shadow-3xs"
      }`}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {/* Luxury animated custom checkbox circle */}
        <button
          onClick={() => onToggleComplete(task.id, !isCompleted)}
          className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all border shrink-0 min-h-[24px] min-w-[24px] ${
            isCompleted
              ? "bg-emerald-500 border-emerald-600 text-white"
              : "border-gray-300 dark:border-neutral-700 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-neutral-800"
          }`}
        >
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            >
              <Check className="w-4 h-4 stroke-[3px]" />
            </motion.div>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold text-gray-800 dark:text-[#EFEFEF] transition-all truncate leading-snug ${
              isCompleted ? "line-through text-gray-400 dark:text-neutral-500" : ""
            }`}
          >
            {task.title}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] font-mono whitespace-nowrap">
            {goalTitle && (
              <span className="text-indigo-500 dark:text-indigo-400 font-medium">
                🎯 {goalTitle}
              </span>
            )}
            
            {task.due_date && (
              <span className="text-gray-400 dark:text-neutral-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-400" />
                {task.due_date}
              </span>
            )}

            {task.due_time && (
              <span className="text-gray-400 dark:text-neutral-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400" />
                {task.due_time}
              </span>
            )}

            {task.recurrence && task.recurrence !== "none" && (
              <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded-sm flex items-center gap-1 leading-none uppercase text-[9px] font-bold border border-indigo-100/40">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: "12s" }} />
                {task.recurrence}
              </span>
            )}

            {dueStatus.badge && (
              <span className={`px-1.5 py-0.5 rounded-sm border flex items-center gap-1 leading-none uppercase text-[9px] ${dueStatus.color} ${dueStatus.bg}`}>
                <AlertCircle className="w-2.5 h-2.5" />
                {dueStatus.badge}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="p-2 text-gray-400 hover:text-rose-500 rounded-md hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer shrink-0 transition-colors"
        title="Delete task"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
