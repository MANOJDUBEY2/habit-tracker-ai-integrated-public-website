/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Task, Goal, UserProfile } from "../types";
import { TaskItem } from "../components/TaskItem";
import { CheckSquare, PlusCircle, Check, Filter, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TasksProps {
  id?: string;
  user: UserProfile;
  goals: Goal[];
  tasks: Task[];
  onCreateTask: (task: Omit<Task, "id" | "user_id" | "status" | "missed_count">) => void;
  onToggleTaskComplete: (id: string, isCompleted: boolean) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksPage: React.FC<TasksProps> = ({
  id,
  user,
  goals,
  tasks,
  onCreateTask,
  onToggleTaskComplete,
  onDeleteTask,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly">("none");
  const [goalId, setGoalId] = useState("");

  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "upcoming" | "missed">("all");
  const [selectedGoalId, setSelectedGoalId] = useState("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateTask({
      title: title.trim(),
      due_date: dueDate || null,
      due_time: dueTime || null,
      goal_id: goalId || null,
      recurrence,
      created_from_chat: false,
    });

    setTitle("");
    setDueDate("");
    setDueTime("");
    setRecurrence("none");
    setGoalId("");
    setShowAddForm(false);
  };

  const getFilteredTasks = () => {
    return tasks.filter((t) => {
      // 1. Status Filter
      if (statusFilter === "pending" && t.status !== "pending") return false;
      if (statusFilter === "completed" && t.status !== "completed") return false;

      // 2. Goal Id Filter
      if (selectedGoalId !== "all" && t.goal_id !== selectedGoalId) return false;

      // 3. Date Filter
      if (!t.due_date) return dateFilter === "all";

      const todayStr = new Date().toISOString().split("T")[0];
      if (dateFilter === "today" && t.due_date !== todayStr) return false;
      if (dateFilter === "upcoming" && t.due_date <= todayStr) return false;
      if (dateFilter === "missed" && (t.due_date >= todayStr || t.status === "completed")) return false;

      return true;
    });
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div id={id} className="space-y-6 pb-24 md:pb-6 animate-in fade-in duration-150">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-900 rounded-xl">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-500" /> Daily Target Checklist
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-wide mt-0.5">
            Individual checklist items to fulfill core commitments
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 rounded-lg shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer min-h-[40px]"
        >
          <PlusCircle className="w-4 h-4" /> Add Task Item
        </button>
      </div>

      {/* Add Task Subpage Form */}
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
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Create Action Item Check-off
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Code auth forms for 1 hour"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-medium text-gray-900 dark:text-white min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Associate with Goal Connection</label>
                <select
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-medium text-gray-950 dark:text-white min-h-[44px]"
                >
                  <option value="">None — General Sandbox Item</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      🎯 {goal.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-medium text-gray-900 dark:text-white min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Due Time</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-medium text-gray-900 dark:text-white min-h-[44px]"
                />
              </div>

              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold font-mono text-gray-400 uppercase block mb-1">Recurrence Frequency Plan</label>
                <div className="flex gap-2">
                  {[
                    { id: "none", label: "One-Off Item" },
                    { id: "daily", label: "Daily Loop" },
                    { id: "weekly", label: "Weekly Check-off" },
                  ].map((prio) => (
                    <button
                      key={prio.id}
                      type="button"
                      onClick={() => setRecurrence(prio.id as any)}
                      className={`flex-1 p-2 border rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                        recurrence === prio.id
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
                <Check className="w-4 h-4 stroke-[3px]" /> Save Action Item
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Complex Filter Hub */}
      <div className="p-4 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-900 rounded-xl space-y-3">
        <h3 className="text-xs font-bold font-mono text-gray-500 dark:text-neutral-400 flex items-center gap-1.5 pb-2 border-b border-gray-100 dark:border-neutral-800">
          <Filter className="w-3.5 h-3.5" /> Filtering System Coordinates
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending checklists</option>
              <option value="completed">Finished</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Due Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs"
            >
              <option value="all">Any range</option>
              <option value="today">Due Today</option>
              <option value="upcoming">Upcoming days</option>
              <option value="missed">Overdue / Missed</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Aligned Goal</label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs"
            >
              <option value="all">All goal alignments</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task list rendering */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-[#1A1A1A] border border-gray-105 dark:border-neutral-900 rounded-xl font-mono text-xs text-gray-400 dark:text-neutral-500">
            No pending task items in criteria. Choose 'Add Task Item' to feed your roadmap checklist.
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-1 duration-200">
            {filteredTasks.map((task) => {
              const matchedGoal = goals.find((g) => g.id === task.goal_id);
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleTaskComplete}
                  onDelete={onDeleteTask}
                  goalTitle={matchedGoal ? matchedGoal.title : null}
                />
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
