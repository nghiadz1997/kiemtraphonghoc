"use client";

import React, { useState } from "react";
import { Search, Sun, Moon, Plus, RefreshCw, CloudCheck, Cloud } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { syncService } from "@/services/syncService";
import { Button } from "../ui/Button";
import Link from "next/link";

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenQuickAdd: () => void;
  onOpenInstallModal?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenQuickAdd,
  onOpenInstallModal
}) => {
  const { actualTheme, setTheme } = useTheme();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncAccount = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const res = await syncService.syncAllWithCloud(user.uid);
      if (res.success) {
        success(
          "Đã lưu vào tài khoản thành công!",
          `Đã đồng bộ ${res.eventsCount} lịch và ${res.tasksCount} công việc lên Google Cloud.`
        );
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        error("Lỗi đồng bộ", res.error || "Không thể kết nối Firebase");
      }
    } catch (err: unknown) {
      error("Lỗi đồng bộ", err instanceof Error ? err.message : "Có lỗi xảy ra khi đồng bộ");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/70 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-zinc-800/60 sticky top-0 z-20 flex items-center justify-between gap-4 transition-colors">
      {/* Mobile Brand */}
      <div className="flex items-center gap-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/25">
            C
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">CongiVec</span>
        </Link>
      </div>

      {/* Global Search Bar trigger */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex-1 max-w-md flex items-center justify-between px-4 py-2 rounded-2xl bg-slate-100/90 dark:bg-zinc-900/90 hover:bg-slate-200/80 dark:hover:bg-zinc-800 border border-slate-200/50 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 text-xs transition cursor-pointer shadow-2xs"
      >
        <span className="flex items-center gap-2.5 truncate font-medium">
          <Search className="w-3.5 h-3.5 text-blue-500" />
          <span>Tìm kiếm sự kiện, môn học, deadline...</span>
        </span>
        <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-zinc-800 rounded-md text-slate-500 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shadow-2xs">
          Ctrl K
        </kbd>
      </button>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Nút Cài đặt App & Thông báo */}
        {onOpenInstallModal && (
          <button
            type="button"
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition shadow-2xs cursor-pointer"
            title="Cài đặt ứng dụng về điện thoại & Bật thông báo"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>Cài App</span>
          </button>
        )}

        {/* Nút Lưu & Đồng bộ tài khoản */}
        {user && (
          <button
            type="button"
            onClick={handleSyncAccount}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Lưu và đồng bộ toàn bộ lịch & công việc lên tài khoản Google"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden xs:inline">{isSyncing ? "Đang lưu..." : "Lưu vào TK"}</span>
            <span className="xs:hidden">Lưu</span>
          </button>
        )}

        {/* Desktop Quick Add Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenQuickAdd}
          className="hidden sm:inline-flex bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 font-bold rounded-xl"
        >
          <Plus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" /> Thêm lịch
        </Button>

        {/* Theme Toggle Button đẹp mắt */}
        <button
          onClick={() => setTheme(actualTheme === "dark" ? "light" : "dark")}
          title={actualTheme === "dark" ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/90 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
        >
          {actualTheme === "dark" ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 transition-transform group-hover:rotate-45" />
              <span className="hidden md:inline">Sáng</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-500 transition-transform group-hover:-rotate-12" />
              <span className="hidden md:inline">Tối</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
