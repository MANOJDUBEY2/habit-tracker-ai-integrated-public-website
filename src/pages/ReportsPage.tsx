/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserProfile, Goal, Task, Habit } from "../types";
import { LoadingSpinner } from "../components/SharedItems";
import { 
  Award, 
  Bot, 
  Printer, 
  TrendingUp, 
  Download, 
  Flame, 
  Calendar, 
  ChevronRight,
  ShieldAlert 
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { motion } from "motion/react";

interface ReportsProps {
  id?: string;
  user: UserProfile;
  goals: Goal[];
  tasks: Task[];
  habits: Habit[];
}

export const ReportsPage: React.FC<ReportsProps> = ({
  id,
  user,
  goals,
  tasks,
  habits,
}) => {
  const [report, setReport] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateWeeklyReport = async () => {
    setIsGenerating(true);
    try {
      if (user.openrouter_api_key) {
        const response = await fetch("/api/reports/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userProfile: user, goals, tasks, habits }),
        });
        if (response.ok) {
          const data = await response.json();
          setReport(data);
          setIsGenerating(false);
          return;
        }
      }

      // Offline mock fallback reports structures
      setTimeout(() => {
        setReport({
          coachLetter: `Hello ${user.name || "Adventurer"},

I've been evaluating your logs closely this week, and we need to talk about your consistency. You've recorded excellent work towards your primary commitments earlier in the week, but my pattern analyzer detects a steady decay in task check-offs on Thursdays and Fridays, often citing being 'too tired' after work.
  
This is a standard resistance point. To scale past it, we must streamline your evening expectations. Instead of expecting a full 1-hour session, let's target minor 10-minute blocks to keep your momentum alive. You are fully capable of achieving these targets; let's show up stronger next week.`,
          focusRecommendation: "Focus heavily on performing daily habits immediately in the morning peak before other distractions register.",
          taskDonePercent: 72,
          habitDonePercent: 65,
        });
        setIsGenerating(false);
      }, 850);
    } catch {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    handleGenerateWeeklyReport();
  }, [user, goals]);

  // Recharts Chart Mock Data Arrays
  const barChartData = [
    { name: "Mon", Done: 4, Missed: 1 },
    { name: "Tue", Done: 5, Missed: 0 },
    { name: "Wed", Done: 3, Missed: 2 },
    { name: "Thu", Done: 2, Missed: 3 },
    { name: "Fri", Done: 1, Missed: 4 },
    { name: "Sat", Done: 3, Missed: 1 },
    { name: "Sun", Done: 4, Missed: 0 },
  ];

  const pieChartData = [
    { name: "Completed Habits", value: report?.habitDonePercent || 65, color: "#6366F1" },
    { name: "Missed", value: 100 - (report?.habitDonePercent || 65), color: "#E5E7EB" },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id={id} className="space-y-6 pb-24 md:pb-6 print:p-0 print:bg-white print:text-black animate-in fade-in duration-150">
      
      {/* Header section — Hidden on print */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-900 rounded-xl print:hidden">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-500" /> Weekly Accountability Reports
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-wide mt-0.5">
            Full behavioral audits and visual charts tracking progress trends
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleGenerateWeeklyReport}
            className="p-2 border border-gray-150 dark:border-neutral-800 rounded-lg text-xs hover:bg-slate-50 cursor-pointer text-gray-500 flex items-center gap-1 min-h-[40px]"
            title="Generate fresh reports insights"
          >
            Refilter
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <Printer className="w-4 h-4" /> Download PDF / Print
          </button>
        </div>
      </div>

      {isGenerating ? (
        <LoadingSpinner />
      ) : (
        report && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Visual Recharts section */}
            <div className="lg:col-span-4 space-y-4 print:hidden">
              {/* Pie: Habits Completion % */}
              <div className="p-5 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-900 rounded-xl space-y-3.5">
                <h3 className="text-xs font-bold font-mono text-gray-500 uppercase">Habit Completion Success</h3>
                <div className="h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Central Text display */}
                  <div className="absolute text-center">
                    <span className="text-2xl font-black text-gray-900 dark:text-white leading-none font-mono tracking-tight">
                      {report?.habitDonePercent}%
                    </span>
                    <p className="text-[9px] text-gray-400 font-bold uppercase font-mono mt-0.5">Successful</p>
                  </div>
                </div>
              </div>

              {/* Bar Chart: Done vs Missed Tasks per Day */}
              <div className="p-5 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-900 rounded-xl space-y-3.5">
                <h3 className="text-xs font-bold font-mono text-gray-500 uppercase">Daily Task Frequency Chart</h3>
                <div className="h-48 text-xs font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ left: -25 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Bar dataKey="Done" fill="#4F46E5" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Missed" fill="#EF4444" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Coach's Letter Card */}
            <div className="lg:col-span-8 p-6 md:p-8 bg-white dark:bg-[#1A1A1A] border border-gray-150 dark:border-neutral-900 rounded-2xl relative shadow-xs print:border-none print:shadow-none space-y-6">
              
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-linear-to-tr from-indigo-500 to-indigo-650 flex items-center justify-center text-white font-black text-lg">
                    AI
                  </div>
                  <div>
                    <h2 className="text-base font-black text-gray-900 dark:text-[#EFEFEF] leading-snug">
                      AccountaAI Evaluation Letter
                    </h2>
                    <span className="text-[10px] font-mono text-indigo-500 font-bold uppercase tracking-widest block mt-0.5">
                      Coaching diagnostic dispatch
                    </span>
                  </div>
                </div>

                <div className="text-right text-[10px] font-mono text-gray-450">
                  <p>REPORT DATE:</p>
                  <p className="font-bold text-gray-700 dark:text-neutral-300">
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Weekly text letter */}
              <div className="text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-neutral-300 space-y-4 whitespace-pre-wrap selection:bg-indigo-150 font-medium">
                {report?.coachLetter}
              </div>

              {/* Focus Recommendations highlight box */}
              {report?.focusRecommendation && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10 rounded-xl text-xs space-y-1.5">
                  <h4 className="font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Next Week's Tactical Focus Recommendation
                  </h4>
                  <p className="text-gray-800 dark:text-neutral-300 leading-normal font-semibold">
                    {report?.focusRecommendation}
                  </p>
                </div>
              )}

              {/* Signature print layout */}
              <div className="pt-6 border-t border-gray-105 dark:border-neutral-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-widest block">
                    Your Personal Coach
                  </span>
                  <span className="text-sm font-black text-gray-900 dark:text-white font-sans tracking-tight">
                    AccountaAI Advisor
                  </span>
                </div>
                
                <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 uppercase">
                  Brain state active ✓
                </span>
              </div>

            </div>

          </div>
        )
      )}

    </div>
  );
};
