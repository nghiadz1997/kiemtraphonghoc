"use client";

import React, { useMemo } from "react";
import { useEvents } from "@/hooks/useEvents";
import { useTasks } from "@/hooks/useTasks";
import { BarChart3, CheckCircle2, AlertTriangle, Clock, GraduationCap, Briefcase } from "lucide-react";

export default function StatisticsPage() {
  const { events } = useEvents();
  const { tasks, completedTasks, incompleteTasks, overdueTasks, completionRate } = useTasks();

  // Tính số giờ dành cho Học tập vs Công việc
  const { studyHours, workHours } = useMemo(() => {
    let sMinutes = 0;
    let wMinutes = 0;

    events.forEach((ev) => {
      const s = new Date(ev.startDateTime).getTime();
      const e = new Date(ev.endDateTime).getTime();
      const diffMins = Math.max(0, Math.floor((e - s) / 60000));

      if (ev.type === "study" || ev.type === "online") {
        sMinutes += diffMins;
      } else if (ev.type === "work" || ev.type === "meeting") {
        wMinutes += diffMins;
      }
    });

    return {
      studyHours: (sMinutes / 60).toFixed(1),
      workHours: (wMinutes / 60).toFixed(1)
    };
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 p-6 sm:p-8 shadow-xs">
        <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          BÁO CÁO HIỆU SUẤT
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Thống Kê Hoạt Động & Thời Gian
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Theo dõi tỷ lệ hoàn thành công việc và thời lượng phân bổ giữa học tập và công việc.
        </p>
      </div>

      {/* Grid thẻ số liệu thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tỷ lệ hoàn thành */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Tỷ Lệ Hoàn Thành</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {completionRate}%
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Đã xong <b>{completedTasks.length}</b> / <b>{tasks.length}</b> công việc
          </p>
        </div>

        {/* Việc còn lại */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Công Việc Còn Lại</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {incompleteTasks.length}
          </div>
          <p className="text-[11px] text-slate-400">
            Đang trong tiến trình thực hiện
          </p>
        </div>

        {/* Việc quá hạn */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Công Việc Quá Hạn</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
            {overdueTasks.length}
          </div>
          <p className="text-[11px] text-rose-500 font-semibold">
            {overdueTasks.length > 0 ? "Cần ưu tiên hoàn thành ngay" : "Không có việc quá hạn 🎉"}
          </p>
        </div>

        {/* Tổng sự kiện trên lịch */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Tổng Sự Kiện Lịch</span>
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
            {events.length}
          </div>
          <p className="text-[11px] text-slate-400">
            Bao gồm học tập, công việc & họp
          </p>
        </div>
      </div>

      {/* Phân bổ thời gian: Học tập vs Công việc */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Thời Gian Dành Cho Học Tập
              </h3>
              <p className="text-xs text-slate-400">Ước tính từ các buổi học và ôn thi</p>
            </div>
          </div>

          <div className="text-4xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {studyHours} <span className="text-lg text-slate-400 font-normal">giờ</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Thời Gian Dành Cho Công Việc & Họp
              </h3>
              <p className="text-xs text-slate-400">Ước tính từ các ca làm việc và lịch họp</p>
            </div>
          </div>

          <div className="text-4xl font-black text-orange-600 dark:text-orange-400 font-mono">
            {workHours} <span className="text-lg text-slate-400 font-normal">giờ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
