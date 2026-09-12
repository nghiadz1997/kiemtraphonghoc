"use client";

import React, { useState, useEffect } from "react";
import { EventItem } from "@/types";
import { formatTimeVN, getRemainingTime } from "@/utils/dateUtils";
import { Clock, AlertTriangle, Flame, BellRing, MapPin } from "lucide-react";
import { EVENT_TYPE_MAP } from "@/utils/categoryUtils";

interface UpcomingWidgetProps {
  event: EventItem | null;
  onOpenEventModal: (event: EventItem) => void;
}

export const UpcomingWidget: React.FC<UpcomingWidgetProps> = ({
  event,
  onOpenEventModal
}) => {
  const [countdown, setCountdown] = useState<{
    countdownText: string;
    isUnder30m: boolean;
    isUnder10m: boolean;
    isPassed: boolean;
  }>({
    countdownText: "---",
    isUnder30m: false,
    isUnder10m: false,
    isPassed: false
  });

  useEffect(() => {
    if (!event) return;

    const update = () => {
      const res = getRemainingTime(event.startDateTime);
      setCountdown(res);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [event]);

  if (!event) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-400 flex items-center justify-center mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          SẮP DIỄN RA
        </h3>
        <p className="text-sm font-semibold text-slate-600 dark:text-zinc-300">
          Hiện tại không có lịch sắp diễn ra.
        </p>
      </div>
    );
  }

  const startTime = formatTimeVN(event.startDateTime);
  const typeInfo = EVENT_TYPE_MAP[event.type];

  // Quyết định màu sắc cảnh báo theo thời gian còn lại
  let borderClass = "border-slate-200 dark:border-zinc-800/80";
  let bgClass = "bg-white dark:bg-[#0c0c0e]";
  let countdownBadgeClass = "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800";

  if (countdown.isUnder10m) {
    borderClass = "border-rose-500 shadow-lg shadow-rose-500/10 ring-2 ring-rose-500/20";
    bgClass = "bg-gradient-to-br from-rose-500/10 to-transparent dark:bg-[#0c0c0e]";
    countdownBadgeClass = "bg-rose-600 text-white font-black animate-bounce";
  } else if (countdown.isUnder30m) {
    borderClass = "border-amber-500 shadow-md shadow-amber-500/10";
    bgClass = "bg-gradient-to-br from-amber-500/10 to-transparent dark:bg-[#0c0c0e]";
    countdownBadgeClass = "bg-amber-500 text-white font-bold";
  }

  return (
    <div
      onClick={() => onOpenEventModal(event)}
      className={`rounded-3xl border ${borderClass} ${bgClass} p-6 transition-all duration-200 hover:scale-[1.01] cursor-pointer relative overflow-hidden group`}
    >
      {/* Header Tag */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>SẮP DIỄN RA</span>
        </div>

        {/* Cảnh báo <10m hoặc <30m */}
        {countdown.isUnder10m ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white animate-pulse">
            <Flame className="w-3.5 h-3.5" /> Sắp đến giờ!
          </span>
        ) : countdown.isUnder30m ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
            <AlertTriangle className="w-3.5 h-3.5" /> Còn dưới 30 phút
          </span>
        ) : (
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border ${typeInfo.bgClass} ${typeInfo.textClass} ${typeInfo.borderClass} font-semibold`}
          >
            {typeInfo.label}
          </span>
        )}
      </div>

      {/* Main Info */}
      <div className="space-y-1 mb-4">
        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {startTime}
        </div>
        <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2">
          {event.title}
        </h4>
        {event.location && (
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {event.location}
          </p>
        )}
      </div>

      {/* Countdown Card */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <BellRing className="w-3.5 h-3.5 text-blue-500" /> Còn lại:
        </span>
        <div
          className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition ${countdownBadgeClass}`}
        >
          {countdown.countdownText}
        </div>
      </div>
    </div>
  );
};
