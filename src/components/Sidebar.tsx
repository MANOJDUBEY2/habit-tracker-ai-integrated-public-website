/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  Target, 
  CheckSquare, 
  Calendar, 
  TrendingUp, 
  Award, 
  Menu, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { motion } from "motion/react";

interface SidebarProps {
  id?: string;
  activePage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  id,
  activePage,
  onNavigate,
  collapsed,
  onToggleCollapse,
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "chat", label: "AI Coach Chat", icon: MessageSquareCode, highlight: true },
    { id: "goals", label: "Core Goals", icon: Target },
    { id: "tasks", label: "Task List", icon: CheckSquare },
    { id: "habits", label: "Habit Tracker", icon: TrendingUp },
    { id: "planner", label: "Daily Planner", icon: Calendar },
    { id: "reports", label: "Weekly Reports", icon: Award },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR - Hidden on mobile */}
      <aside
        id={id}
        className={`hidden md:flex flex-col h-[calc(100vh-4rem)] border-r border-gray-150 dark:border-neutral-900 bg-white dark:bg-[#0F0F0F] transition-all duration-300 relative ${
          collapsed ? "w-16" : "w-64"
        } shrink-0`}
      >
        {/* Navigation list */}
        <div className="flex-1 py-4 space-y-1.5 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 p-2.5 px-3.5 rounded-xl transition-all cursor-pointer group hover:bg-slate-50 dark:hover:bg-neutral-900 relative min-h-[44px] ${
                  isActive
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 font-bold"
                    : "text-gray-600 dark:text-neutral-400 font-medium"
                }`}
              >
                <div className="shrink-0">
                  <Icon className={`w-5 h-5 ${isActive ? "scale-105 stroke-[2.5px]" : "stroke-[1.8px]"}`} />
                </div>
                {!collapsed && (
                  <span className="text-xs tracking-tight truncate leading-none">
                    {item.label}
                  </span>
                )}

                {/* Left indicators */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-1 w-1 h-6 rounded-full bg-white dark:bg-indigo-400"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Collapsing arrow controls */}
        <div className="p-3 border-t border-gray-100 dark:border-neutral-900 flex justify-end">
          <button
            onClick={onToggleCollapse}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300 rounded-md hover:bg-slate-50 dark:hover:bg-neutral-900 cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR - Fixed to page baseline on smaller screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-gray-150 dark:border-neutral-900 bg-white/95 dark:bg-[#0F0F0F] z-40 backdrop-blur-md flex items-center justify-around px-2 pb-safe">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-transform duration-150 min-h-[44px] min-w-[44px] relative ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 scale-105"
                  : "text-gray-400 dark:text-neutral-500 hover:text-gray-600"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
              <span className="text-[9px] font-mono mt-1 font-bold truncate leading-none max-w-[55px]">
                {item.label.split(" ")[0]}
              </span>

              {isActive && (
                <div className="absolute top-0 w-4 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
