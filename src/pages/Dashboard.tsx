/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Flame, 
  CheckSquare, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Bot, 
  RefreshCw, 
  Volume2 
} from "lucide-react";
import { UserProfile, Goal, Task, Habit } from "../types";
import { MetricCard, EmptyState } from "../components/SharedItems";
import { HeatmapCalendar } from "../components/HeatmapCalendar";
import { speakCoachMessage } from "../utils/speech";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  id?: string;
  user: UserProfile;
  goals: Goal[];
  tasks: Task[];
  habits: Habit[];
  onToggleTask: (id: string, isCompleted: boolean) => void;
  onNavigate: (page: string) => void;
  onSendMessageQuick: (text: string) => Promise<string>; // Sends to chat & returns text stream/response
}

export const Dashboard: React.FC<DashboardProps> = ({
  id,
  user,
  goals,
  tasks,
  habits,
  onToggleTask,
  onNavigate,
  onSendMessageQuick,
}) => {
  const [quickMessage, setQuickMessage] = useState("");
  const [quickReply, setQuickReply] = useState("");
  const [isTalking, setIsTalking] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [dailyQuote, setDailyQuote] = useState("Your only limitation is the excuse you choose to believe today. Rise up.");
  
  // Local plan from AI
  const [aiPlan, setAiPlan] = useState<Task[]>([]);

  // 1. Calculate dashboard statistics
  const todayStr = new Date().toISOString().split("T")[0];
  
  // Filter today's tasks
  const todayTasks = tasks.filter(t => t.due_date === todayStr);
  const todayCompleted = todayTasks.filter(t => t.status === "completed").length;
  const todayTotal = todayTasks.length;

  // Max streak
  const longestStreak = habits.length > 0 
    ? Math.max(...habits.map(h => h.streak_count)) 
    : 0;

  // Average goal completion
  const activeGoals = goals.filter(g => g.status === "active");
  const avgGoalCompletion = goals.length > 0
    ? Math.round(goals.reduce((acc, g) => acc + g.progress_pct, 0) / goals.length)
    : 0;

  // Missed tasks this week (due date in past, not completed)
  const missedTasksThisWeek = tasks.filter(t => {
    if (t.status === "completed" || !t.due_date) return false;
    const due = new Date(t.due_date);
    const today = new Date();
    today.setHours(0,0,0,0);
    return due < today;
  }).length;

  // Next 7 days deadlines
  const getUpcomingDeadlines = () => {
    const list: Array<{ id: string; title: string; due_date: string; due_time: string | null; type: "task" | "goal"; urgency: "high" | "medium" | "low" }> = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Add pending tasks in next 7 days
    tasks.forEach(t => {
      if (t.status === "completed" || !t.due_date) return;
      const due = new Date(t.due_date);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays <= 7) {
        list.push({
          id: t.id,
          title: t.title,
          due_date: t.due_date,
          due_time: t.due_time,
          type: "task",
          urgency: diffDays <= 1 ? "high" : diffDays <= 3 ? "medium" : "low",
        });
      }
    });

    // Add active goals with targets in next 7 days
    activeGoals.forEach(g => {
      if (!g.target_date) return;
      const due = new Date(g.target_date);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 7) {
        list.push({
          id: g.id,
          title: `🎯 Target Goal: ${g.title}`,
          due_date: g.target_date,
          due_time: null,
          type: "goal",
          urgency: diffDays <= 2 ? "high" : "medium",
        });
      }
    });

    return list.slice(0, 5); // top 5
  };

  const upcomingDeadlines = getUpcomingDeadlines();

  // Load / Generate Day Plan from API
  const handleRegeneratePlan = async () => {
    setIsGeneratingPlan(true);
    setQuickReply("");
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
            // map plan items to Task entities
            const parsedTasks = data.plan.map((p: any) => ({
              id: crypto.randomUUID(),
              title: p.title,
              due_date: p.due_date || todayStr,
              due_time: p.due_time || null,
              status: "pending" as any,
              recurrence: p.recurrence || "none",
              missed_count: 0,
              created_from_chat: true,
            }));
            setAiPlan(parsedTasks);
            if (data.quote) setDailyQuote(data.quote);
          }
        }
      } else {
        // Mock Generation with offline template items
        setTimeout(() => {
          setAiPlan([
            { id: "p1", title: "Study active goal targets for 25 minutes", due_date: todayStr, due_time: "10:30", status: "pending", recurrence: "none", missed_count: 0, created_from_chat: true },
            { id: "p2", title: "Complete outstanding reminders checklist", due_date: todayStr, due_time: "14:00", status: "pending", recurrence: "none", missed_count: 0, created_from_chat: true },
            { id: "p3", title: "Engage in 10 minutes of active micro-exercise", due_date: todayStr, due_time: "18:00", status: "pending", recurrence: "none", missed_count: 0, created_from_chat: true },
          ]);
          setDailyQuote("Discipline is choosing between what you want now and what you want most.");
        }, 1000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  useEffect(() => {
    handleRegeneratePlan();
  }, [goals, tasks, habits]);

  // Handle Quick Chat submissions
  const handleQuickChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMessage.trim()) return;

    const messageToSend = quickMessage.trim();
    setQuickMessage("");
    setIsTalking(true);
    setQuickReply("Coach is analyzing your thoughts... 📡");

    try {
      const responseStreamText = await onSendMessageQuick(messageToSend);
      setQuickReply(responseStreamText);
    } catch (err: any) {
      setQuickReply("Brain block occurred. Please check your OpenRouter API Key configuration.");
    } finally {
      setIsTalking(false);
    }
  };

  const speakQuote = () => {
    speakCoachMessage(dailyQuote);
  };

  const hasNoData = goals.length === 0 && tasks.length === 0 && habits.length === 0;

  return (
    <div id={id} className="space-y-6 pb-24 md:pb-6 animate-in fade-in duration-150">
      
      {/* 1. Missing brain API key connection banner warning */}
      {!user.openrouter_api_key && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-linear-to-r from-rose-500 to-rose-600 border-none text-white rounded-xl shadow-xs relative flex flex-col sm:flex-row items-center justify-between gap-3 font-medium"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 animate-bounce text-amber-300" />
            <div className="text-center sm:text-left text-xs">
              <strong className="font-bold">Coaching Brain Silent!</strong>
              <p className="opacity-90 mt-0.5">Your personal OpenRouter API Key has not been connected. AI responses, daily plans, and reports will utilize dummy states.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("api-keys")}
            className="p-2 px-4 text-xs font-bold text-rose-600 bg-white hover:bg-rose-50 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Connect My AI Key
          </button>
        </motion.div>
      )}

      {/* 2. Top Header greeting */}
      <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-900 rounded-xl relative overflow-hidden">
        <div>
          <span className="text-xs font-bold font-mono text-indigo-500 uppercase tracking-widest block mb-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-gray-950 dark:text-white tracking-tight leading-none pt-0.5">
            Good morning, {user.name || "Adventurer"}!
          </h1>
          
          {/* Animated Quote */}
          <div className="mt-3.5 flex items-start gap-2.5 max-w-2xl bg-indigo-500/5 dark:bg-indigo-500/5 p-3 rounded-lg border border-indigo-100/30">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs text-gray-600 dark:text-neutral-350 italic leading-relaxed pr-6">
              "{dailyQuote}"
            </div>
            <button
              onClick={speakQuote}
              className="p-1.5 text-gray-400 hover:text-indigo-500 rounded-md hover:bg-indigo-100/60 dark:hover:bg-neutral-800 cursor-pointer text-xs leading-none"
              title="Hear Coach voice"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dashboard Navigation overview widget shortcuts */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => onNavigate("chat")}
            className="p-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer min-h-[40px] flex items-center gap-1"
          >
            <Bot className="w-4 h-4 animate-bounce" /> Open Full Coach Chat
          </button>
        </div>
      </div>

      {hasNoData ? (
        <EmptyState
          title="Your Roadmap is a Blank Slate!"
          description="A personal accountability coach requires goals, tasks, or recurring habits to monitor your performance. Talk to AccountaAI inside the Coach Chat to launch instantly."
          ctaText="Open Core AI Chat"
          onCtaClick={() => onNavigate("chat")}
        />
      ) : (
        <>
          {/* 3. ROW 1: 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Tasks Done Today"
              value={`${todayCompleted} / ${todayTotal}`}
              icon={CheckSquare}
              subtext="Progress targets tracker"
              trendColor="text-indigo-600 dark:text-indigo-400"
            />
            <MetricCard
              title="Longest Habit Streak"
              value={`${longestStreak} Days`}
              icon={Flame}
              subtext="Active momentum streak"
              trendColor="text-amber-500"
              variant="flame"
            />
            <MetricCard
              title="Average Goal Completion"
              value={`${avgGoalCompletion}%`}
              icon={Target}
              subtext="Percentage across active goals"
              trendColor="text-emerald-500"
            />
            <MetricCard
              title="Missed Tasks This Week"
              value={missedTasksThisWeek}
              icon={AlertTriangle}
              subtext="Urget recovery targets"
              trendColor={missedTasksThisWeek >= 3 ? "text-rose-500" : "text-gray-450"}
              variant="scale"
            />
          </div>

          {/* 4. ROW 2: Two Columns Plan + Deadlines */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* LEFT COLUMN: Today's AI plan */}
            <div className="lg:col-span-7 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-[#EFEFEF] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> Today's AI Personal Plan
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono tracking-wide mt-0.5">
                    Structure generated around peak efficiency hours
                  </p>
                </div>
                <button
                  onClick={handleRegeneratePlan}
                  disabled={isGeneratingPlan}
                  className="p-1 px-2.5 text-[11px] font-mono leading-none border border-gray-150 dark:border-neutral-800 rounded-md text-gray-500 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 font-bold hover:bg-slate-50 cursor-pointer min-h-[30px] flex items-center gap-1 shrink-0"
                  title="Regenerate structure"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPlan ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {isGeneratingPlan ? (
                <div className="space-y-4 p-4 animate-pulse">
                  <div className="h-6 bg-slate-100 dark:bg-neutral-800 rounded-md w-3/4"></div>
                  <div className="h-6 bg-slate-100 dark:bg-neutral-800 rounded-md"></div>
                  <div className="h-6 bg-slate-100 dark:bg-neutral-800 rounded-md w-5/6"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiPlan.length === 0 ? (
                    <div className="text-center p-8 text-xs text-gray-400 dark:text-neutral-500 font-mono">
                      No customized daily plan items yet. Add structured tasks to trigger insights.
                    </div>
                  ) : (
                    aiPlan.map((p, idx) => (
                      <div 
                        key={p.id}
                        className="p-3 bg-slate-50/50 dark:bg-neutral-900/30 rounded-xl border border-gray-100 dark:border-neutral-850 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={p.status === "completed"}
                            onChange={() => {
                              const next = [...aiPlan];
                              next[idx].status = next[idx].status === "completed" ? "pending" : "completed";
                              setAiPlan(next);
                            }}
                            className="w-4 h-4 rounded-sm text-indigo-600 cursor-pointer min-w-[16px] min-h-[16px]"
                          />
                          <span className={`text-xs font-semibold text-gray-700 dark:text-neutral-300 truncate leading-snug ${
                            p.status === "completed" ? "line-through text-gray-400 dark:text-neutral-550" : ""
                          }`}>
                            {p.title}
                          </span>
                        </div>

                        {p.due_time && (
                          <span className="p-1 px-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-[10px] font-mono font-bold rounded-full text-indigo-600 dark:text-indigo-400 shrink-0">
                            ⏱️ {p.due_time}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Upcoming deadlines */}
            <div className="lg:col-span-5 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-900 rounded-xl p-5 space-y-4">
              <div className="border-b border-gray-100 dark:border-neutral-800 pb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-[#EFEFEF] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" /> Upcoming Deadlines (7 Days)
                </h3>
                <p className="text-[10px] text-gray-400 font-mono tracking-wide mt-0.5">
                  Color-graded priority notifications
                </p>
              </div>

              <div className="space-y-3">
                {upcomingDeadlines.length === 0 ? (
                  <div className="text-center p-8 text-xs text-gray-400 dark:text-neutral-500 font-mono">
                    No active deadlines on calendar for next 7 days.
                  </div>
                ) : (
                  upcomingDeadlines.map((item) => {
                    const urgencyStyle = {
                      high: "border-l-4 border-l-rose-500 bg-rose-500/5",
                      medium: "border-l-4 border-l-amber-500 bg-amber-505/5",
                      low: "border-l-4 border-l-indigo-500 bg-indigo-500/5",
                    }[item.urgency];

                    const textLabel = {
                      high: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-450",
                      medium: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-450",
                      low: "text-indigo-600 bg-indigo-50 dark:bg-indigo-550/10 dark:text-indigo-400",
                    }[item.urgency];

                    return (
                      <div 
                        key={item.id}
                        className={`p-3 rounded-lg flex items-center justify-between gap-3 text-xs border border-gray-100 dark:border-neutral-850 ${urgencyStyle}`}
                      >
                        <div className="min-w-0 pr-4">
                          <p className="font-semibold text-gray-800 dark:text-neutral-200 truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 mt-1 block">
                            📅 {item.due_date} {item.due_time ? `@ ${item.due_time}` : ""}
                          </span>
                        </div>

                        <span className={`p-1 px-2 rounded-full font-mono font-bold uppercase text-[9px] select-none shrink-0 border border-current leading-none ${textLabel}`}>
                          {item.urgency}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* 5. ROW 3: Habit streaks heatmap calendar */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-900 rounded-xl p-5 space-y-4">
            <div className="border-b border-gray-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-[#EFEFEF] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" /> Habit Stream Heatmaps (Last 90 Days)
              </h3>
              <p className="text-[10px] text-gray-400 font-mono tracking-wide mt-0.5">
                Each cell tracks a calendar day completion level
              </p>
            </div>

            <div className="space-y-4">
              {habits.length === 0 ? (
                <div className="text-center p-8 text-xs text-gray-400 dark:text-neutral-500 font-mono">
                  No habits listed yet.
                </div>
              ) : (
                habits.map((habit) => (
                  <div key={habit.id} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-gray-700 dark:text-neutral-300">
                        {habit.title}
                      </span>
                      <span className="text-[10px] font-mono text-amber-500 font-bold flex items-center gap-1">
                        🔥Streak: {habit.streak_count} Days
                      </span>
                    </div>
                    {/* Generates placeholder completion dates for the mock map if no events mapped */}
                    <HeatmapCalendar 
                      completedDates={habit.last_completed ? [habit.last_completed] : []} 
                      createdAt={habit.created_at} 
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 6. ROW 4: Quick chat with AccountaAI */}
          <div className="bg-linear-to-b from-white to-gray-50/50 dark:from-[#1A1A1A] dark:to-neutral-900/10 border border-gray-150 dark:border-neutral-900 rounded-xl p-5 space-y-4 shadow-sm relative">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3.5">
              <div className="flex items-center gap-2">
                <div className="p-1 px-1.5 bg-indigo-600 dark:bg-indigo-500 rounded-lg text-white font-bold shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
                    Quick Accountability Coach Check-in
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono tracking-wide mt-0.2">
                    Submit feelings, logs, excuse blocks, or updates directly in one box
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("chat")}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-600 cursor-pointer flex items-center gap-1 font-mono"
              >
                Open Full Chat <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick interactive chat input form */}
            <form onSubmit={handleQuickChatSubmit} className="flex gap-2">
              <input
                type="text"
                required
                value={quickMessage}
                onChange={(e) => setQuickMessage(e.target.value)}
                placeholder="Submit updates: e.g. I worked out today for 15 minutes, but felt too tired to code..."
                className="flex-1 p-2.5 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 min-h-[44px]"
              />
              <button
                type="submit"
                disabled={isTalking}
                className="px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0 min-h-[44px]"
              >
                {isTalking ? "Thinking..." : "Coach Prompt"}
              </button>
            </form>

            <AnimatePresence>
              {quickReply && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="p-3.5 bg-indigo-50/60 dark:bg-indigo-500/5 border border-indigo-150/40 dark:border-indigo-500/10 rounded-lg text-xs leading-relaxed text-gray-700 dark:text-neutral-300 font-medium"
                >
                  <p className="font-bold text-indigo-500 font-mono uppercase text-[9px] pb-1">AI Advisor Reply</p>
                  {quickReply}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

    </div>
  );
};
