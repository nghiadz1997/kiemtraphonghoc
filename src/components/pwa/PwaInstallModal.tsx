"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  Smartphone,
  Share2,
  PlusSquare,
  Bell,
  CheckCircle2,
  DownloadCloud,
  Sparkles
} from "lucide-react";
import { useNotificationWatcher } from "@/hooks/useNotificationWatcher";
import { EventItem } from "@/types";

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  events?: EventItem[];
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  events = []
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { permission, requestPermission, sendTestNotification } = useNotificationWatcher(events);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Kiểm tra xem có phải iOS không
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      // Kiểm tra xem đã cài dạng App chưa
      const isApp =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isApp);

      // Bắt sự kiện cài đặt trên Android / Chrome
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);
      return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Smartphone className="w-5 h-5" />
          Cài Đặt App & Bật Thông Báo Di Động
        </span>
      }
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Banner trạng thái App */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
            C
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                CongiVec Mobile App
              </h4>
              {isStandalone && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Đã cài đặt
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Chạy mượt mà, không quảng cáo, nhận thông báo nhắc lịch tự động khi sắp tới giờ.
            </p>
          </div>
        </div>

        {/* 1. Phần Bật Thông Báo */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-zinc-200">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>Quyền Thông Báo Di Động</span>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                permission === "granted"
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
              }`}
            >
              {permission === "granted" ? "Đã cấp quyền" : "Chưa bật"}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Bật thông báo để điện thoại rung và phát âm thanh chuông khi có môn học, cuộc họp hoặc deadline sắp diễn ra.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {permission !== "granted" ? (
              <Button variant="primary" size="sm" onClick={requestPermission} className="font-bold">
                <Bell className="w-3.5 h-3.5 mr-1" /> Bật thông báo ngay
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={sendTestNotification}
                className="font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Thử gửi chuông báo ngay
              </Button>
            )}
          </div>
        </div>

        {/* 2. Phần Hướng dẫn cài đặt dạng App */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Cách thêm icon ra màn hình chính điện thoại
          </h5>

          {isIOS ? (
            /* Hướng dẫn cho iPhone / iPad */
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-zinc-900/60 border border-blue-200/60 dark:border-zinc-800 space-y-2.5 text-xs text-slate-700 dark:text-zinc-300">
              <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" /> Dành cho iPhone / Safari:
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Mở trang web bằng trình duyệt <b>Safari</b> trên iPhone.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span className="flex items-center gap-1.5 flex-wrap">
                  Bấm biểu tượng <b>Chia sẻ</b> (<Share2 className="w-3.5 h-3.5 inline text-blue-500" />) ở thanh dưới cùng của Safari.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span className="flex items-center gap-1.5 flex-wrap">
                  Cuộn xuống và chọn <b>&quot;Thêm vào MH chính&quot;</b> (<PlusSquare className="w-3.5 h-3.5 inline text-blue-500" /> / Add to Home Screen).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  4
                </span>
                <span>
                  Bấm <b>Thêm</b> ở góc trên bên phải. Ứng dụng sẽ xuất hiện ngoài màn hình chính như một App xịn!
                </span>
              </div>
            </div>
          ) : (
            /* Hướng dẫn cho Android / Chrome / Edge */
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-zinc-900/60 border border-blue-200/60 dark:border-zinc-800 space-y-3 text-xs text-slate-700 dark:text-zinc-300">
              <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" /> Dành cho Android / Chrome:
              </div>

              {deferredPrompt ? (
                <div>
                  <p className="mb-2">
                    Trình duyệt đã sẵn sàng để cài đặt CongiVec thành App độc lập trên điện thoại của bạn:
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleInstallClick}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 font-bold shadow-lg shadow-blue-500/25"
                  >
                    <DownloadCloud className="w-4 h-4 mr-2" /> Cài đặt ứng dụng vào điện thoại
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Mở trang web bằng trình duyệt <b>Chrome</b> trên điện thoại.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Bấm vào biểu tượng <b>3 dấu chấm (⋮)</b> ở góc phải trên cùng của Chrome.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Chọn <b>&quot;Cài đặt ứng dụng&quot;</b> hoặc <b>&quot;Thêm vào màn hình chính&quot;</b>.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-zinc-800">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Đã hiểu
          </Button>
        </div>
      </div>
    </Modal>
  );
};
