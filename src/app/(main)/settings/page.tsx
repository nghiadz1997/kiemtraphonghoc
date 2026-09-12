"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/useToast";
import { notificationService } from "@/services/notificationService";
import { Button } from "@/components/ui/Button";
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Bell,
  Globe,
  Calendar,
  LogOut,
  User,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, signOut, updateSettings } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success, info } = useToast();
  const router = useRouter();

  const [notificationEnabled, setNotificationEnabled] = useState(
    user?.settings.notificationEnabled ?? true
  );
  const [defaultReminder, setDefaultReminder] = useState(
    user?.settings.defaultReminderMinutes ?? 15
  );

  const handleToggleNotification = async () => {
    const nextState = !notificationEnabled;
    if (nextState) {
      const permission = await notificationService.requestPermission();
      if (permission === "granted") {
        setNotificationEnabled(true);
        await updateSettings({ notificationEnabled: true });
        notificationService.showNotification("Thông báo đã được bật!", {
          body: "CongiVec sẽ gửi lời nhắc khi sắp đến giờ lịch học hoặc công việc của bạn."
        });
        success("Đã bật thông báo trình duyệt!");
      } else {
        info("Quyền thông báo chưa được cấp trong cài đặt trình duyệt.");
      }
    } else {
      setNotificationEnabled(false);
      await updateSettings({ notificationEnabled: false });
      info("Đã tắt thông báo.");
    }
  };

  const handleReminderChange = async (minutes: number) => {
    setDefaultReminder(minutes);
    await updateSettings({ defaultReminderMinutes: minutes });
    success("Đã cập nhật thời gian nhắc mặc định!");
  };

  const handleSignOut = async () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      await signOut();
      router.push("/login");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 p-6 sm:p-8 shadow-xs">
        <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          TÙY CHỈNH HỆ THỐNG
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Cài Đặt Cá Nhân & Giao Diện
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Cấu hình giao diện Sáng / Tối, thời gian nhắc nhở và thông tin hồ sơ tài khoản.
        </p>
      </div>

      {/* Thông tin cá nhân */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" /> Hồ Sơ Cá Nhân
        </h3>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
          {user?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/30"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center">
              {user?.displayName?.charAt(0) || "U"}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
              {user?.displayName || "Người dùng"}
            </h4>
            <p className="text-xs text-slate-500 truncate">{user?.email || "Chưa có email"}</p>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Dữ liệu được mã hóa và bảo mật riêng tư
            </div>
          </div>
        </div>
      </div>

      {/* Chế độ Giao diện: Sáng / Tối / Tự động */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" /> Chế Độ Giao Diện (Theme)
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "light", label: "Sáng", icon: Sun, desc: "Giao diện thanh lịch" },
            { id: "dark", label: "Tối", icon: Moon, desc: "Bảo vệ mắt ban đêm (Nền đen)" },
            { id: "system", label: "Hệ thống", icon: Monitor, desc: "Theo thiết bị của bạn" }
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = theme === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => setTheme(mode.id as "light" | "dark" | "system")}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  isSelected
                    ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                    : "bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  />
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {mode.label}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{mode.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Thông báo & Lời nhắc */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-500" /> Thông Báo & Nhắc Nhở
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">
                Bật Thông Báo Trình Duyệt / PWA
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Nhận cảnh báo khi sắp đến giờ họp, deadline hoặc lịch học
              </p>
            </div>
            <button
              onClick={handleToggleNotification}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                notificationEnabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                  notificationEnabled ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("congivec:openPwaInstall"))}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-500/30 hover:bg-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Cài đặt ứng dụng về điện thoại & Thử thông báo di động</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Thời gian nhắc nhở mặc định
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[5, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleReminderChange(mins)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    defaultReminder === mins
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-blue-300"
                  }`}
                >
                  Trước {mins} phút
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Múi giờ, Định dạng ngày, Ngôn ngữ */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-500" /> Ngôn Ngữ & Định Dạng
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
            <span className="text-[11px] text-slate-400 font-bold block mb-1">MÚI GIỜ</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
              Asia/Ho_Chi_Minh (GMT+7)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
            <span className="text-[11px] text-slate-400 font-bold block mb-1">ĐỊNH DẠNG NGÀY</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
              DD/MM/YYYY (Chuẩn Việt Nam)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
            <span className="text-[11px] text-slate-400 font-bold block mb-1">NGÔN NGỮ</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
              Tiếng Việt (Mặc định)
            </span>
          </div>
        </div>
      </div>

      {/* Đăng xuất */}
      <div className="pt-2">
        <Button
          variant="danger"
          size="md"
          onClick={handleSignOut}
          className="w-full sm:w-auto font-bold"
        >
          <LogOut className="w-4 h-4 mr-2" /> Đăng xuất khỏi tài khoản
        </Button>
      </div>
    </div>
  );
}
