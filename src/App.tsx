/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserProfile, Goal, Task, Habit, ExtractedItems, ChatMessage } from "./types";
import { dbService } from "./supabaseClient";

// Import Layout Panels
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";

// Import Content Pages
import { Landing } from "./pages/Landing";
import { Auth } from "./pages/Auth";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Chat } from "./pages/Chat";
import { GoalsPage } from "./pages/GoalsPage";
import { TasksPage } from "./pages/TasksPage";
import { HabitsPage } from "./pages/HabitsPage";
import { PlannerPage } from "./pages/PlannerPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ProfileAndSettings } from "./pages/ProfileAndSettings";

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; read: boolean; date: string }>>([]);

  // Navigation page views tracking state
  const [activePage, setActivePage] = useState<string>("landing");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load profile session on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        const profile = await dbService.getProfile();
        
        // Retrieve optional theme details
        const savedTheme = localStorage.getItem("accountaai_theme");
        if (savedTheme === "light") {
          setIsDarkMode(false);
        } else {
          document.documentElement.classList.add("dark");
        }

        if (profile && profile.onboarding_done) {
          setUser(profile);
          setActivePage("dashboard");
          await fetchAllData();
        } else if (profile) {
          setUser(profile);
          setActivePage("onboarding");
        } else {
          setActivePage("landing");
        }

        // Seed notifications
        setNotifications([
          {
            id: "notif-1",
            text: "Welcome to AccountaAI! Connect your OpenRouter API Key to unlock customized AI check-ins.",
            read: false,
            date: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          },
        ]);
        
        // Request visual Service Worker notifications approvals
        if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission();
        }

      } catch (err) {
        console.error("Initialization failed", err);
      }
    };
    initApp();
  }, []);

  const fetchAllData = async () => {
    try {
      const fGoals = await dbService.getGoals();
      setGoals(fGoals);
      const fTasks = await dbService.getTasks();
      setTasks(fTasks);
      const fHabits = await dbService.getHabits();
      setHabits(fHabits);
    } catch (err) {
      console.error("Failed to query records", err);
    }
  };

  // Sync data dynamically when user profile changes
  useEffect(() => {
    if (user && user.onboarding_done) {
      fetchAllData();
    }
  }, [user]);

  const handleToggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("accountaai_theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("accountaai_theme", "dark");
      setIsDarkMode(true);
    }
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    if (profile.onboarding_done) {
      setActivePage("dashboard");
    } else {
      setActivePage("onboarding");
    }
  };

  const handleLogout = () => {
    dbService.localClearSession();
    setUser(null);
    setActivePage("landing");
  };

  const handleOnboardingFinished = (profile: UserProfile) => {
    setUser(profile);
    setActivePage("dashboard");
    
    // Welcome Coaching Alert
    setNotifications(prev => [
      {
        id: crypto.randomUUID(),
        text: `Your coaching plan is active! Rahul is monitoring your daily achievements.`,
        read: false,
        date: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      },
      ...prev
    ]);
  };

  // --- GOALS OPERATIONS ---
  const handleCreateGoal = async (g: Omit<Goal, "id" | "user_id" | "progress_pct" | "status">) => {
    try {
      await dbService.createGoal(g);
      await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      await dbService.updateGoal(id, updates);
      await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await dbService.deleteGoal(id);
      await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- TASKS OPERATIONS ---
  const handleCreateTask = async (t: Omit<Task, "id" | "user_id" | "status" | "missed_count">) => {
    try {
      await dbService.createTask(t);
      await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTaskComplete = async (id: string, isCompleted: boolean) => {
    try {
      await dbService.toggleTaskComplete(id, isCompleted);
      await fetchAllData();
      
      if (isCompleted) {
        // Trigger quick toast notification inside active session
        setNotifications(prev => [
          {
            id: crypto.randomUUID(),
            text: "Goal checklist item marked complete! Momentum preserved. ✓",
            read: false,
            date: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          },
          ...prev
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await dbService.deleteTask(id);
      await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- HABITS OPERATIONS ---
  const handleCreateHabit = async (h: Omit<Habit, "id" | "user_id" | "streak_count" | "longest_streak" | "last_completed" | "failure_count" | "times_rescheduled">) => {
    try {
      await dbService.createHabit(h);
      await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkHabitDone = async (id: string, dateStr: string, isRescue?: boolean) => {
    try {
      const resp = await dbService.markHabitDone(id, dateStr, isRescue);
      await fetchAllData();
      
      setNotifications(prev => [
        {
          id: crypto.randomUUID(),
          text: isRescue 
            ? `Streak saved with custom 5-minute rescue fallback plan! 🛡️`
            : `Habit checked off! Dynamic streak updated: ${resp.streak_count} Days. 🔥`,
          read: false,
          date: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        },
        ...prev
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await dbService.deleteHabit(id);
      await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- EXTRACTED ITEMS COMMIT ---
  const handleCommitExtraction = async (items: ExtractedItems) => {
    try {
      // 1. Commit each extracted goal item
      if (items.goals && items.goals.length > 0) {
        for (const eg of items.goals) {
          await dbService.createGoal({
            title: eg.title,
            description: (eg as any).description || "Extracted dynamically by AccountaAI",
            category: eg.category || "Personal",
            priority: 2,
            target_date: eg.target_date || null,
          });
        }
      }

      // 2. Commit each extracted task item
      if (items.tasks && items.tasks.length > 0) {
        for (const et of items.tasks) {
          await dbService.createTask({
            title: et.title,
            due_date: et.due_date || new Date().toISOString().split("T")[0],
            due_time: et.due_time || null,
            goal_id: null,
            recurrence: (et.recurrence === "daily" || et.recurrence === "weekly" ? et.recurrence : "none"),
            created_from_chat: true,
          });
        }
      }

      // 3. Commit each extracted habit ritual
      if (items.habits && items.habits.length > 0) {
        for (const eh of items.habits) {
          await dbService.createHabit({
            title: eh.title,
            frequency: (eh.frequency === "weekly" || eh.frequency === "custom" ? eh.frequency : "daily"),
          });
        }
      }

      // Sync and reload state
      await fetchAllData();

      setNotifications(prev => [
        {
          id: crypto.randomUUID(),
          text: `AccountaAI integrated extracted milestones to your active sheets!`,
          read: false,
          date: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        },
        ...prev
      ]);

    } catch (err) {
      console.error("Failed to commit extracted blueprints", err);
    }
  };

  // --- QUICK CHAT SENDER ---
  const handleSendMessageQuick = async (text: string): Promise<string> => {
    // Helper to request SSE stream response packets inline on Dashboard quickly
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const convs = await dbService.getConversations();
      const match = convs.find(c => c.date === todayStr);
      const preList = match ? match.messages : [];

      const latestMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "user",
        text,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      };

      const compiledConvs = [...preList, latestMsg];

      // Format memory structures
      const memoryContext = {
        goals: goals.filter(g => g.status === "active").map(g => g.title),
        pending_tasks: tasks.filter(t => t.status === "pending").map(t => t.title),
        missed_tasks: [],
        habit_streaks: habits.map(h => `${h.title}: ${h.streak_count}d`),
        memories: [],
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          previousMessages: compiledConvs,
          memoryContext,
          userProfile: user,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to contact coaching servers.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamReplyText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dStr = line.slice(6).trim();
              if (dStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(dStr);
                if (parsed.type === "content") {
                  streamReplyText += parsed.text;
                }
              } catch (e) {
                // skip broken JSON fragments
              }
            }
          }
        }
      }

      // Save combined logs
      const finalMsg = {
        id: crypto.randomUUID(),
        sender: "assistant",
        text: streamReplyText,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      };
      await dbService.saveConversation(todayStr, [...compiledConvs, finalMsg as ChatMessage], {});
      return streamReplyText;

    } catch (e: any) {
      console.error(e);
      throw new Error("Coaching backend block. Verify OpenRouter keys.");
    }
  };

  // --- ROUTING LOGICS CONTROLLER ---
  const renderActiveScreen = () => {
    switch (activePage) {
      case "landing":
        return <Landing onNavigate={setActivePage} />;
      
      case "login":
        return <Auth mode="login" onLoginSuccess={handleLoginSuccess} onNavigate={setActivePage} />;
      
      case "register":
        return <Auth mode="register" onLoginSuccess={handleLoginSuccess} onNavigate={setActivePage} />;
      
      case "onboarding":
        if (!user) return <Auth mode="login" onLoginSuccess={handleLoginSuccess} onNavigate={setActivePage} />;
        return <Onboarding user={user} onFinished={handleOnboardingFinished} />;

      case "dashboard":
        if (!user) return <Landing onNavigate={setActivePage} />;
        return (
          <Dashboard 
            user={user} 
            goals={goals} 
            tasks={tasks} 
            habits={habits}
            onToggleTask={handleToggleTaskComplete}
            onNavigate={setActivePage}
            onSendMessageQuick={handleSendMessageQuick}
          />
        );

      case "chat":
        if (!user) return <Landing onNavigate={setActivePage} />;
        return (
          <Chat 
            user={user} 
            goals={goals} 
            tasks={tasks} 
            habits={habits} 
            onCommitExtraction={handleCommitExtraction}
          />
        );

      case "goals":
        if (!user) return <Landing onNavigate={setActivePage} />;
        return (
          <GoalsPage 
            user={user} 
            goals={goals} 
            onCreateGoal={handleCreateGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        );

      case "tasks":
        if (!user) return <Landing onNavigate={setActivePage} />;
        return (
          <TasksPage 
            user={user} 
            goals={goals} 
            tasks={tasks} 
            onCreateTask={handleCreateTask}
            onToggleTaskComplete={handleToggleTaskComplete}
            onDeleteTask={handleDeleteTask}
          />
        );

      case "habits":
        if (!user) return <Landing onNavigate={setActivePage} />;
        return (
          <HabitsPage
            user={user}
            habits={habits}
            onCreateHabit={handleCreateHabit}
            onMarkHabitDone={handleMarkHabitDone}
            onDeleteHabit={handleDeleteHabit}
          />
        );

      case "planner":
        if (!user) return <Landing onNavigate={setActivePage} />;
        return <PlannerPage user={user} goals={goals} tasks={tasks} habits={habits} />;

      case "reports":
        if (!user) return <Landing onNavigate={setActivePage} />;
        return <ReportsPage user={user} goals={goals} tasks={tasks} habits={habits} />;

      case "profile":
      case "settings":
      case "api-keys":
        if (!user) return <Landing onNavigate={setActivePage} />;
        return <ProfileAndSettings user={user} onUpdateUser={setUser} />;

      default:
        return <Landing onNavigate={setActivePage} />;
    }
  };

  const isAuthScreen = ["landing", "login", "register", "onboarding"].includes(activePage);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080808] text-gray-900 dark:text-gray-100 transition-colors">
      
      {/* 1. Global Navbar layout (visible when authenticated screens active) */}
      {!isAuthScreen && (
        <Navbar
          user={user}
          activePage={activePage}
          onNavigate={setActivePage}
          onLogout={handleLogout}
          isDark={isDarkMode}
          onToggleTheme={handleToggleTheme}
          notifications={notifications}
          onMarkAllNotificationsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
          onMarkNotificationRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
          isVoiceEnabled={true}
        />
      )}

      {/* 2. Main body content framework */}
      {isAuthScreen ? (
        <div className="w-full">
          {renderActiveScreen()}
        </div>
      ) : (
        <div className="flex min-h-[calc(100vh-4rem)]">
          {/* Desktop Left Sidebar Panel */}
          <Sidebar
            activePage={activePage}
            onNavigate={setActivePage}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* Main Active Page Component Canvas */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full transition-all">
            {renderActiveScreen()}
          </main>
        </div>
      )}

    </div>
  );
}
