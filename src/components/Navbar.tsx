/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Settings, 
  User, 
  Key, 
  LogOut, 
  Sparkles, 
  CloudLightning, 
  Volume2, 
  Check, 
  ShieldCheck, 
  MicOff 
} from "lucide-react";
import { UserProfile } from "../types";
import { speakCoachMessage } from "../utils/speech";

interface NavbarProps {
  id?: string;
  user: UserProfile | null;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  notifications: Array<{ id: string; text: string; read: boolean; date: string }>;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  isVoiceEnabled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  id,
  user,
  activePage,
  onNavigate,
  onLogout,
  isDark,
  onToggleTheme,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  isVoiceEnabled,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getInitials = () => {
    if (!user || !user.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleSpeakerClick = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakCoachMessage(text);
  };

  return (
    <nav
      id={id}
      className="h-16 border-b border-gray-150 bg-white/95 dark:bg-[#0F0F0F] dark:border-neutral-900 sticky top-0 z-40 backdrop-blur-md px-4 flex items-center justify-between"
    >
      {/* Brand logo */}
      <div 
        onClick={() => onNavigate(user ? "dashboard" : "landing")}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
          <Sparkles className="w-5 h-5 fill-white/10 animate-pulse" />
        </div>
        <div>
          <span className="text-base font-extrabold text-gray-900 dark:text-[#EFEFEF] tracking-tight leading-none flex items-center gap-1.5 font-sans">
            AccountaAI
          </span>
          <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-mono tracking-widest uppercase block -mt-1 leading-none">
            Coaching Brain
          </span>
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex items-center gap-3">
        {/* Connection health indicators */}
        {user && (
          <div className="hidden sm:flex items-center gap-2">
            {user.openrouter_api_key ? (
              <span className="px-2 py-1 text-[10px] font-mono leading-none bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100/30 rounded-full flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3 h-3" /> Core AI Online
              </span>
            ) : (
              <span 
                onClick={() => onNavigate("api-keys")}
                className="px-2 py-1 text-[10px] font-mono leading-none bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-100/30 rounded-full flex items-center gap-1 font-bold cursor-pointer hover:bg-rose-100"
              >
                <CloudLightning className="w-3 h-3 animate-ping" /> Connect AI Brain
              </span>
            )}
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-gray-500 dark:text-neutral-400 rounded-lg cursor-pointer transition-colors"
          title="Toggle mode"
        >
          {isDark ? "🌞" : "🌙"}
        </button>

        {user && (
          <>
            {/* Reminders / Notifications center */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-900 cursor-pointer transition-colors relative min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold font-mono flex items-center justify-center border-2 border-white dark:border-[#0F0F0F]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification drop */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-800 rounded-xl shadow-lg ring-1 ring-black/5 z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between p-2 px-3 border-b border-gray-150 dark:border-neutral-800">
                    <span className="font-bold text-xs text-gray-600 dark:text-neutral-300 uppercase tracking-widest font-mono">
                      Reminders and Alerts
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-[10px] text-indigo-500 hover:text-indigo-600 cursor-pointer font-bold font-mono"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800">
                    {notifications.length === 0 ? (
                      <div className="p-5 text-center text-xs text-gray-400 dark:text-neutral-500 font-mono">
                        No recent coaching alerts.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => onMarkNotificationRead(notif.id)}
                          className={`p-3 text-xs flex flex-col gap-1 hover:bg-slate-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors ${
                            !notif.read ? "bg-indigo-500/5 font-medium" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-gray-700 dark:text-neutral-300 pr-5 leading-normal">
                              {notif.text}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={(e) => handleSpeakerClick(e, notif.text)}
                                className="p-1 text-gray-400 hover:text-indigo-500 rounded-sm hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
                                title="Hear coach aloud"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                              )}
                            </div>
                          </div>
                          <span className="text-[9px] text-gray-400 dark:text-neutral-500 font-mono">
                            {notif.date}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Trigger dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200/40 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold text-sm tracking-widest flex items-center justify-center cursor-pointer hover:brightness-105 active:scale-95 transition-all min-h-[40px] min-w-[40px]"
              >
                {getInitials()}
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-800 rounded-lg shadow-lg ring-1 ring-black/5 z-50 p-1 divide-y divide-gray-100 dark:divide-neutral-800 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2.5 px-3">
                    <p className="text-xs font-bold text-gray-900 dark:text-[#EFEFEF] truncate">
                      {user.name || "Adventurer"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono dark:text-neutral-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate("profile");
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left p-2 px-3 text-xs text-gray-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-md flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <User className="w-4 h-4 text-indigo-400" /> My Profile
                    </button>
                    <button
                      onClick={() => {
                        onNavigate("settings");
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left p-2 px-3 text-xs text-gray-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-md flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Settings className="w-4 h-4 text-indigo-400" /> Account Settings
                    </button>
                    <button
                      onClick={() => {
                        onNavigate("api-keys");
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left p-2 px-3 text-xs text-gray-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-md flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Key className="w-4 h-4 text-indigo-400" /> API Keys Hub
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left p-2 px-3 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};
