"use client";

import React from "react";
import { EventType, PriorityLevel, TaskStatus } from "@/types";
import { EVENT_TYPE_MAP, PRIORITY_MAP } from "@/utils/categoryUtils";

interface BadgeProps {
  children?: React.ReactNode;
  variant?: "default" | "today" | "tomorrow" | "overdue" | "success" | "warning";
  type?: EventType;
  priority?: PriorityLevel;
  status?: TaskStatus;
  className?: string;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  type,
  priority,
  status,
  className = "",
  size = "sm"
}) => {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs font-semibold" : "px-2.5 py-1 text-xs font-bold";

  if (variant === "today") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-blue-500 text-white uppercase tracking-wider ${sizeClass} ${className}`}
      >
        HÔM NAY
      </span>
    );
  }

  if (variant === "tomorrow") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-indigo-500 text-white uppercase tracking-wider ${sizeClass} ${className}`}
      >
        NGÀY MAI
      </span>
    );
  }

  if (variant === "overdue" || status === "overdue") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 uppercase tracking-wider font-bold ${sizeClass} ${className}`}
      >
        QUÁ HẠN
      </span>
    );
  }

  if (status === "completed") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-medium ${sizeClass} ${className}`}
      >
        Hoàn thành
      </span>
    );
  }

  if (status === "in_progress") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-medium ${sizeClass} ${className}`}
      >
        Đang làm
      </span>
    );
  }

  if (status === "todo") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30 font-medium ${sizeClass} ${className}`}
      >
        Chưa làm
      </span>
    );
  }

  if (type) {
    const typeInfo = EVENT_TYPE_MAP[type];
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md border ${typeInfo.bgClass} ${typeInfo.textClass} ${typeInfo.borderClass} ${sizeClass} ${className}`}
      >
        {children || typeInfo.label}
      </span>
    );
  }

  if (priority) {
    const priorityInfo = PRIORITY_MAP[priority];
    return (
      <span className={`inline-flex items-center rounded-md ${priorityInfo.bg} ${sizeClass} ${className}`}>
        {children || priorityInfo.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
};
