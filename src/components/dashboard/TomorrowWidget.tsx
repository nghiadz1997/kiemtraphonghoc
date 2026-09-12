"use client";

import React from "react";
import { EventItem } from "@/types";
import { formatTimeVN } from "@/utils/dateUtils";
import { Calendar, ArrowRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { EVENT_TYPE_MAP } from "@/utils/categoryUtils";

interface TomorrowWidgetProps {
  events: EventItem[];
  onOpenEvent: (event: EventItem) => void;
}

export const TomorrowWidget: React.FC<TomorrowWidgetProps> = ({
  events,
  onOpenEvent
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            NGÀY MAI
          </span>
          <span className="text-xs text-slate-400">({events.length} sự kiện)</span>
        </div>

        <Link
          href="/calendar"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          Xem lịch <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          Ngày mai chưa có lịch nào. Bạn có thể dành thời gian nghỉ ngơi hoặc chuẩn bị trước!
        </div>
      ) : (
        <div className="space-y-2.5">
          {events.slice(0, 4).map((ev) => {
            const typeInfo = EVENT_TYPE_MAP[ev.type];
            return (
              <div
                key={ev.id}
                onClick={() => onOpenEvent(ev)}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 hover:bg-slate-100 dark:hover:bg-zinc-850 border border-slate-100 dark:border-zinc-800/80 transition cursor-pointer group"
              >
                <div className="space-y-0.5 min-w-0 flex-1 mr-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    <Clock className="w-3 h-3" />
                    <span>{ev.allDay ? "Cả ngày" : formatTimeVN(ev.startDateTime)}</span>
                  </div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {ev.title}
                  </h5>
                  {ev.location && (
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                      <MapPin className="w-2.5 h-2.5" /> {ev.location}
                    </p>
                  )}
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold shrink-0 ${typeInfo.bgClass} ${typeInfo.textClass} ${typeInfo.borderClass}`}
                >
                  {typeInfo.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
