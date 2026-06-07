/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  timezone: string;
  preferred_reminder_time: string;
  productivity_peak: "morning" | "afternoon" | "evening";
  communication_style: "encouraging" | "direct" | "strict";
  openrouter_api_key: string | null;
  onboarding_done: boolean;
  created_at?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  priority: 1 | 2 | 3; // 1=low, 2=medium, 3=high
  target_date: string | null; // ISO date string YYYY-MM-DD
  progress_pct: number;
  status: "active" | "completed" | "paused";
  created_at?: string;
}

export interface Task {
  id: string;
  user_id: string;
  goal_id: string | null;
  title: string;
  due_date: string | null; // YYYY-MM-DD
  due_time: string | null; // HH:MM
  status: "pending" | "completed";
  recurrence: "none" | "daily" | "weekly";
  missed_count: number;
  created_from_chat: boolean;
  created_at?: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  frequency: "daily" | "weekly" | "custom";
  streak_count: number;
  longest_streak: number;
  last_completed: string | null; // YYYY-MM-DD
  failure_count: number;
  times_rescheduled: number;
  created_at?: string;
  is_rescue?: boolean; // temporary flag for daily rescue state
}

export interface Memory {
  id: string;
  user_id: string;
  content: string;
  embedding?: number[];
  source_date: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  extracted?: ExtractedItems | null;
}

export interface Conversation {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  messages: ChatMessage[];
  extracted_items?: ExtractedItems;
  created_at?: string;
}

export interface ExtractedItems {
  goals?: Array<{
    title: string;
    category?: string;
    priority?: number;
    target_date?: string;
  }>;
  tasks?: Array<{
    title: string;
    due_date?: string;
    due_time?: string;
    goal_title?: string;
    recurrence?: string;
  }>;
  habits?: Array<{
    title: string;
    frequency?: string;
  }>;
  excuses?: string[];
}

export interface DashboardData {
  tasksDoneToday: number;
  totalTasksToday: number;
  longestHabitStreak: number;
  avgGoalCompletion: number;
  missedTasksThisWeek: number;
  todayPlan: Task[];
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    due_date: string;
    due_time: string | null;
    type: "task" | "goal";
    urgency: "high" | "medium" | "low";
  }>;
  heatmapData: Array<{
    date: string; // YYYY-MM-DD
    count: number; // number of habits completed
  }>;
  habits: Habit[];
  goals: Goal[];
  excuseInsights?: string[];
}
