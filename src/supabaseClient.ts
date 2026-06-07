/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";
import { UserProfile, Goal, Task, Habit, Memory, Conversation, ChatMessage } from "./types";

// Detect if Supabase environment variables are configured
const supabaseUrl = (((import.meta as any).env || {}).VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = (((import.meta as any).env || {}).VITE_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = (): boolean => {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
};

// Create real client if variables exist, else export a null helper
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initialize robust client-side backup storage for a seamless offline/first-run experience
const LOCAL_STORAGE_KEYS = {
  USER_PROFILE: "accounta_user_profile",
  GOALS: "accounta_goals",
  TASKS: "accounta_tasks",
  HABITS: "accounta_habits",
  MEMORIES: "accounta_memories",
  CONVERSATIONS: "accounta_conversations",
  ACTIVE_SESSION: "accounta_session",
};

// Default template user content
const DEFAULT_USER: UserProfile = {
  id: "demo-user-id",
  email: "demo@accountaai.com",
  name: "Adventurer",
  timezone: "Asia/Kolkata",
  preferred_reminder_time: "08:00",
  productivity_peak: "morning",
  communication_style: "encouraging",
  openrouter_api_key: null,
  onboarding_done: false,
};

// Helper to get from local storage safely
function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Helper to set local storage safely
function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage set failed", e);
  }
}

// Global API / Fallback Service
export const dbService = {
  // --- AUTH / USER SERVICE ---
  async getProfile(): Promise<UserProfile> {
    if (isSupabaseConfigured() && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        if (!error && data) {
          return data as UserProfile;
        }
      }
    }
    // Return mock profile
    return getLocal<UserProfile>(LOCAL_STORAGE_KEYS.USER_PROFILE, DEFAULT_USER);
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    if (isSupabaseConfigured() && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .update(profile)
          .eq("id", user.id)
          .select()
          .single();
        if (!error && data) {
          return data as UserProfile;
        }
      }
    }

    const currentProfile = await this.getProfile();
    const updated = { ...currentProfile, ...profile };
    // If updating openrouter key, trigger custom message
    setLocal(LOCAL_STORAGE_KEYS.USER_PROFILE, updated);
    return updated;
  },

  // --- GOALS SERVICE ---
  async getGoals(): Promise<Goal[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data as Goal[];
      }
    }
    return getLocal<Goal[]>(LOCAL_STORAGE_KEYS.GOALS, []);
  },

  async createGoal(goal: Omit<Goal, "id" | "user_id" | "progress_pct" | "status">): Promise<Goal> {
    const profile = await this.getProfile();
    const newGoal: Goal = {
      ...goal,
      id: crypto.randomUUID(),
      user_id: profile.id,
      progress_pct: 0,
      status: "active",
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("goals")
        .insert({
          title: goal.title,
          description: goal.description,
          category: goal.category,
          priority: goal.priority,
          target_date: goal.target_date,
          progress_pct: 0,
          status: "active",
        })
        .select()
        .single();
      if (!error && data) {
        return data as Goal;
      }
    }

    const current = await this.getGoals();
    setLocal(LOCAL_STORAGE_KEYS.GOALS, [newGoal, ...current]);
    return newGoal;
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("goals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        return data as Goal;
      }
    }

    const current = await this.getGoals();
    const idx = current.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error("Goal not found");
    const updated = { ...current[idx], ...updates };
    current[idx] = updated;
    setLocal(LOCAL_STORAGE_KEYS.GOALS, current);
    return updated;
  },

  async deleteGoal(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from("goals").delete().eq("id", id);
      return;
    }

    const current = await this.getGoals();
    setLocal(LOCAL_STORAGE_KEYS.GOALS, current.filter((g) => g.id !== id));
  },

  // --- TASKS SERVICE ---
  async getTasks(): Promise<Task[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data as Task[];
      }
    }
    return getLocal<Task[]>(LOCAL_STORAGE_KEYS.TASKS, []);
  },

  async createTask(task: Omit<Task, "id" | "user_id" | "status" | "missed_count">): Promise<Task> {
    const profile = await this.getProfile();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      user_id: profile.id,
      status: "pending",
      missed_count: 0,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          goal_id: task.goal_id,
          title: task.title,
          due_date: task.due_date,
          due_time: task.due_time,
          status: "pending",
          recurrence: task.recurrence,
          created_from_chat: task.created_from_chat,
        })
        .select()
        .single();
      if (!error && data) {
        return data as Task;
      }
    }

    const current = await this.getTasks();
    setLocal(LOCAL_STORAGE_KEYS.TASKS, [newTask, ...current]);
    return newTask;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        return data as Task;
      }
    }

    const current = await this.getTasks();
    const idx = current.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Task not found");
    const updated = { ...current[idx], ...updates };
    current[idx] = updated;
    setLocal(LOCAL_STORAGE_KEYS.TASKS, current);
    return updated;
  },

  async deleteTask(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from("tasks").delete().eq("id", id);
      return;
    }

    const current = await this.getTasks();
    setLocal(LOCAL_STORAGE_KEYS.TASKS, current.filter((t) => t.id !== id));
  },

  // --- HABITS SERVICE ---
  async getHabits(): Promise<Habit[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data as Habit[];
      }
    }
    return getLocal<Habit[]>(LOCAL_STORAGE_KEYS.HABITS, []);
  },

  async createHabit(habit: Omit<Habit, "id" | "user_id" | "streak_count" | "longest_streak" | "last_completed" | "failure_count" | "times_rescheduled">): Promise<Habit> {
    const profile = await this.getProfile();
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      user_id: profile.id,
      streak_count: 0,
      longest_streak: 0,
      last_completed: null,
      failure_count: 0,
      times_rescheduled: 0,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("habits")
        .insert({
          title: habit.title,
          frequency: habit.frequency,
          streak_count: 0,
          longest_streak: 0,
          last_completed: null,
          failure_count: 0,
          times_rescheduled: 0,
        })
        .select()
        .single();
      if (!error && data) {
        return data as Habit;
      }
    }

    const current = await this.getHabits();
    setLocal(LOCAL_STORAGE_KEYS.HABITS, [newHabit, ...current]);
    return newHabit;
  },

  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("habits")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        return data as Habit;
      }
    }

    const current = await this.getHabits();
    const idx = current.findIndex((h) => h.id === id);
    if (idx === -1) throw new Error("Habit not found");
    const updated = { ...current[idx], ...updates };
    current[idx] = updated;
    setLocal(LOCAL_STORAGE_KEYS.HABITS, current);
    return updated;
  },

  async deleteHabit(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from("habits").delete().eq("id", id);
      return;
    }

    const current = await this.getHabits();
    setLocal(LOCAL_STORAGE_KEYS.HABITS, current.filter((h) => h.id !== id));
  },

  // --- MEMORIES SERVICE ---
  async getMemories(): Promise<Memory[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("source_date", { ascending: false });
      if (!error && data) {
        return data as Memory[];
      }
    }
    return getLocal<Memory[]>(LOCAL_STORAGE_KEYS.MEMORIES, []);
  },

  async createMemory(content: string, tags: string[] = []): Promise<Memory> {
    const profile = await this.getProfile();
    const newMemory: Memory = {
      id: crypto.randomUUID(),
      user_id: profile.id,
      content,
      source_date: new Date().toISOString(),
      tags,
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("memories")
        .insert({
          content,
          tags,
        })
        .select()
        .single();
      if (!error && data) {
        return data as Memory;
      }
    }

    const current = await this.getMemories();
    setLocal(LOCAL_STORAGE_KEYS.MEMORIES, [newMemory, ...current]);
    return newMemory;
  },

  // --- CONVERSATIONS SERVICE ---
  async getConversations(): Promise<Conversation[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data as Conversation[];
      }
    }
    return getLocal<Conversation[]>(LOCAL_STORAGE_KEYS.CONVERSATIONS, []);
  },

  async saveConversation(date: string, messages: ChatMessage[], extracted_items: any = {}): Promise<Conversation> {
    const profile = await this.getProfile();
    const existing = await this.getConversations();
    const foundIdx = existing.findIndex((c) => c.date === date);

    const updatedConv: Conversation = {
      id: foundIdx !== -1 ? existing[foundIdx].id : crypto.randomUUID(),
      user_id: profile.id,
      date,
      messages,
      extracted_items,
      created_at: foundIdx !== -1 ? existing[foundIdx].created_at : new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      if (foundIdx !== -1) {
        const { data, error } = await supabase
          .from("conversations")
          .update({ messages, extracted_items })
          .eq("id", updatedConv.id)
          .select()
          .single();
        if (!error && data) return data as Conversation;
      } else {
        const { data, error } = await supabase
          .from("conversations")
          .insert({ date, messages, extracted_items })
          .select()
          .single();
        if (!error && data) return data as Conversation;
      }
    }

    if (foundIdx !== -1) {
      existing[foundIdx] = updatedConv;
    } else {
      existing.unshift(updatedConv);
    }
    setLocal(LOCAL_STORAGE_KEYS.CONVERSATIONS, existing);
    return updatedConv;
  },

  // --- TRIGGER SIGN-UP / REGISTER IN LOCAL STORAGE MOCK ---
  localSignUp(name: string, email: string): UserProfile {
    const newUser: UserProfile = {
      ...DEFAULT_USER,
      id: crypto.randomUUID(),
      name,
      email,
    };
    setLocal(LOCAL_STORAGE_KEYS.USER_PROFILE, newUser);
    return newUser;
  },

  localClearSession() {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACTIVE_SESSION);
  },

  async toggleTaskComplete(id: string, isCompleted: boolean): Promise<Task> {
    return this.updateTask(id, { status: isCompleted ? "completed" : "pending" });
  },

  async markHabitDone(id: string, dateStr: string, isRescue: boolean = false): Promise<Habit> {
    const habits = await this.getHabits();
    const habit = habits.find((h) => h.id === id);
    if (!habit) throw new Error("Habit not found");

    const curStreak = habit.streak_count + 1;
    const maxStreak = Math.max(habit.longest_streak, curStreak);

    const updates: Partial<Habit> = {
      streak_count: curStreak,
      longest_streak: maxStreak,
      last_completed: dateStr,
    };

    if (isRescue) {
      updates.times_rescheduled = (habit.times_rescheduled || 0) + 1;
    }

    return this.updateHabit(id, updates);
  },
};
