"use client";

import React, { useState, useEffect } from "react";
import { getVietnameseDayOfWeek, formatDateVN } from "@/utils/dateUtils";
import { Calendar as CalendarIcon, Sparkles } from "lucide-react";

export const BigDateCard: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    // Cập nhật mỗi phút để luôn chuẩn xác
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const dayName = getVietnameseDayOfWeek(currentDate);
  const dateStr = formatDateVN(currentDate);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20">
      {/* Decorative background glow */}
      <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute left-1/2 -top-12 w-32 h-32 rounded-full bg-indigo-400/20 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-100 font-semibold text-xs tracking-wider uppercase mb-1">
            <CalendarIcon className="w-4 h-4 text-blue-200" />
            <span>Hôm Nay</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold backdrop-blur-xs">
              <Sparkles className="w-3 h-3 text-amber-300" /> Live
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-none drop-shadow-xs">
            {dayName}
          </h2>

          <div className="text-2xl sm:text-3xl font-extrabold text-blue-100 mt-2 tracking-wide font-mono">
            {dateStr}
          </div>
        </div>

        <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-white/20 pt-3 sm:pt-0 sm:pl-6">
          <p className="text-xs text-blue-100 font-medium">Chúc bạn một ngày làm việc</p>
          <p className="text-sm sm:text-base font-bold text-white">Hiệu quả & Tập trung! 🎯</p>
        </div>
      </div>
    </div>
  );
};
