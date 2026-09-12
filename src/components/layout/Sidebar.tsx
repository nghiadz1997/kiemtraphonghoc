"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  GraduationCap,
  CalendarClock,
  BarChart3,
  Settings,
  CalendarCheck,
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  onOpenQuickAdd: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Hôm nay", href: "/today", icon: CalendarCheck, badge: "Today" },
  { label: "Lịch", href: "/calendar", icon: CalendarDays },
  { label: "Công việc", href: "/tasks", icon: CheckSquare },
  { label: "Lịch học", href: "/study", icon: GraduationCap },
  { label: "Sắp tới", href: "/upcoming", icon: CalendarClock },
  { label: "Thống kê", href: "/statistics", icon: BarChart3 },
  { label: "Cài đặt", href: "/settings", icon: Settings }
];

export const Sidebar: React.FC<SidebarProps> = ({ onOpenQuickAdd }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-2xl border-r border-slate-200/80 dark:border-zinc-800/60 shrink-0 h-screen sticky top-0 select-none z-30 transition-colors">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-zinc-800/60 gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/25">
          C
        </div>
        <div>
          <h1 className="font-black text-base tracking-tight text-slate-900 dark:text-white leading-tight">
            CongiVec
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Lịch & Công Việc</p>
        </div>
      </div>

      {/* Quick Add Button */}
      <div className="px-4 pt-5 pb-2">
        <button
          onClick={onOpenQuickAdd}
          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition transform active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Thêm lịch nhanh</span>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-500/15 to-indigo-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 font-bold shadow-2xs"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-850/80 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Profile */}
      {user && (
        <div className="p-3 border-t border-slate-100 dark:border-zinc-800/60">
          <Link
            href="/settings"
            className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-zinc-850/80 transition"
          >
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                {user.displayName?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                {user.displayName || "Người dùng"}
              </div>
              <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
};
