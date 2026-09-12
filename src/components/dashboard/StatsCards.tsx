"use client";

import React from "react";
import { CheckCircle2, Clock, AlertTriangle, CalendarDays, ListTodo, Flame } from "lucide-react";
import { TaskItem } from "@/types";
import { formatDateVN } from "@/utils/dateUtils";

interface StatsCardsProps {
  todayEventsCount: number;
  upcomingEventsCount: number;
  completedTasksCount: number;
  incompleteTasksCount: number;
  overdueTasksCount: number;
  nearestDeadlineTask: TaskItem | null;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  todayEventsCount,
  upcomingEventsCount,
  completedTasksCount,
  incompleteTasksCount,
  overdueTasksCount,
  nearestDeadlineTask
}) => {
  return (
    <div className="space-y-3">
      {/* Overdue Alert Banner if overdue > 0 */}
      {overdueTasksCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3 shadow-xs animate-pulse">
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>Bạn có {overdueTasksCount} công việc đã quá hạn!</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold shrink-0">
            Cần xử lý gấp
          </span>
        </div>
      )}

      {/* Grid of 4 key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Lịch hôm nay */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Lịch Hôm Nay
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {todayEventsCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        {/* Việc hoàn thành */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Đã Hoàn Thành
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {completedTasksCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Việc chưa xong */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Chưa Hoàn Thành
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {incompleteTasksCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ListTodo className="w-5 h-5" />
          </div>
        </div>

        {/* Deadline gần nhất */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Deadline Gần Nhất
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">
              {nearestDeadlineTask ? nearestDeadlineTask.title : "Không có"}
            </div>
            {nearestDeadlineTask?.dueDate && (
              <div className="text-[10px] text-rose-500 font-semibold font-mono">
                {formatDateVN(nearestDeadlineTask.dueDate)}
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
