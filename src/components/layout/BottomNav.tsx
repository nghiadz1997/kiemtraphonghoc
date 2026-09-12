"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  CalendarDays,
  CheckSquare,
  Settings,
  Plus
} from "lucide-react";

interface BottomNavProps {
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenQuickAdd }) => {
  const pathname = usePathname();

  const isCurrent = (href: string) => pathname === href;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-black/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 pb-safe">
      <div className="flex items-center justify-around h-16 px-2 relative max-w-md mx-auto">
        {/* Hôm nay */}
        <Link
          href="/today"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            isCurrent("/today")
              ? "text-blue-600 dark:text-blue-400 font-bold"
              : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <CalendarCheck className="w-5 h-5" />
          <span className="text-[10px] mt-1">Hôm nay</span>
        </Link>

        {/* Lịch */}
        <Link
          href="/calendar"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            isCurrent("/calendar")
              ? "text-blue-600 dark:text-blue-400 font-bold"
              : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] mt-1">Lịch</span>
        </Link>

        {/* Nút + ở chính giữa */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onOpenQuickAdd}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 border-4 border-white dark:border-black active:scale-95 transition cursor-pointer"
            aria-label="Thêm lịch nhanh"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Công việc */}
        <Link
          href="/tasks"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            isCurrent("/tasks")
              ? "text-blue-600 dark:text-blue-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px] mt-1">Công việc</span>
        </Link>

        {/* Cài đặt */}
        <Link
          href="/settings"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            isCurrent("/settings")
              ? "text-blue-600 dark:text-blue-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-1">Cài đặt</span>
        </Link>
      </div>
    </div>
  );
};
