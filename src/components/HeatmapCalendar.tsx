/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface HeatmapCalendarProps {
  id?: string;
  completedDates: string[]; // List of YYYY-MM-DD strings
  createdAt?: string;       // Date habit was created
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({
  id,
  completedDates,
  createdAt,
}) => {
  // Generate list of last 90 days including today, sorted chronologically
  const generateLast90Days = () => {
    const days: string[] = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      days.push(`${yyyy}-${mm}-${dd}`);
    }
    return days;
  };

  const daysList = generateLast90Days();

  // Helper to resolve cell styling
  const getCellClass = (dateStr: string) => {
    const isCompleted = completedDates.includes(dateStr);
    
    // If before creation date, mark as blank/neutral
    if (createdAt) {
      const cellDate = new Date(dateStr);
      const creationDate = new Date(createdAt.split("T")[0]);
      if (cellDate < creationDate) {
        return "bg-gray-50 dark:bg-neutral-900/30 border border-gray-100 dark:border-neutral-900";
      }
    }

    if (isCompleted) {
      return "bg-emerald-500 hover:bg-emerald-600 border border-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xs";
    }

    // Checking if today
    const todayStr = new Date().toISOString().split("T")[0];
    if (dateStr === todayStr) {
      return "bg-amber-100/60 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/50 rounded-xs animate-pulse";
    }

    return "bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700/50 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-xs";
  };

  const formatHeaderDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div id={id} className="w-full bg-slate-50/50 dark:bg-neutral-900/10 p-3 rounded-lg overflow-x-auto border border-gray-100 dark:border-neutral-800/40">
      <div className="min-w-[620px]">
        {/* Cell grid */}
        <div className="flex flex-wrap gap-[3px] items-center">
          {daysList.map((dayStr) => {
            const isCompleted = completedDates.includes(dayStr);
            const label = `${formatHeaderDate(dayStr)}: ${isCompleted ? "Completed!" : "Not done"}`;
            return (
              <div
                key={dayStr}
                className={`w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] transition-transform duration-100 hover:scale-125 cursor-pointer ${getCellClass(
                  dayStr
                )}`}
                title={label}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-3 text-[10px] font-mono text-gray-400 dark:text-neutral-500 px-1">
          <span>90 days ago</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="w-2.5 h-2.5 bg-gray-100 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-xs" />
            <div className="w-2.5 h-2.5 bg-emerald-500 border border-emerald-600 rounded-xs" />
            <span>More</span>
          </div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};
