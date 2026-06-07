/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Sparkles, LucideIcon } from "lucide-react";

// --- METRIC CARD COMPONENT WITH ANIMATED TRANSITIONS ---
interface MetricProps {
  id?: string;
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trendColor?: string;
  variant?: "pulse" | "scale" | "flame";
}

export const MetricCard: React.FC<MetricProps> = ({
  id,
  title,
  value,
  icon: Icon,
  subtext,
  trendColor = "text-indigo-600 dark:text-indigo-400",
  variant = "scale",
}) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="p-5 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-neutral-800 rounded-xl shadow-xs transition-shadow hover:shadow-xs flex items-center justify-between"
    >
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-neutral-400 font-medium">
          {title}
        </p>
        <motion.h3 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-3xl font-bold text-gray-900 dark:text-[#EFEFEF] mt-2 font-sans tracking-tight"
        >
          {value}
        </motion.h3>
        {subtext && (
          <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1 flex items-center gap-1 font-mono">
            {subtext}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full bg-slate-50 dark:bg-neutral-800/60 ${trendColor}`}>
        <Icon className={`w-6 h-6 ${variant === "flame" ? "animate-pulse" : ""}`} />
      </div>
    </motion.div>
  );
};

// --- GENERAL EMPTY STATES COMPONENT ---
interface EmptyStateProps {
  id?: string;
  title: string;
  description: string;
  ctaText?: string;
  onCtaClick?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id,
  title,
  description,
  ctaText,
  onCtaClick,
  icon,
}) => {
  return (
    <div id={id} className="flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-neutral-900/45 rounded-xl border border-dashed border-gray-200 dark:border-neutral-800/80 text-center max-w-lg mx-auto my-6">
      <div className="p-4 bg-white dark:bg-[#1A1A1A] rounded-full shadow-xs mb-4 text-indigo-500">
        {icon || <Sparkles className="w-8 h-8 animate-bounce" />}
      </div>
      <h4 className="text-lg font-semibold text-gray-900 dark:text-[#EFEFEF]">
        {title}
      </h4>
      <p className="text-sm text-gray-500 dark:text-neutral-400 mt-2 mb-5">
        {description}
      </p>
      {ctaText && onCtaClick && (
        <button
          onClick={onCtaClick}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer shadow-xs min-h-[44px]"
        >
          {ctaText}
        </button>
      )}
    </div>
  );
};

// --- LOADING SPINNER COMPONENT ---
export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-8 min-h-[150px]">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-indigo-100 dark:border-neutral-800"></div>
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
};

// --- SKELETON LOADER COMPONENT ---
export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-4 p-4 w-full animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded-sm w-1/3"></div>
      <div className="space-y-2">
        <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded-md"></div>
        <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded-md"></div>
        <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded-md w-5/6"></div>
      </div>
    </div>
  );
};
