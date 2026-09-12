"use client";

import React from "react";
import { EventItem } from "@/types";
import { formatTimeVN } from "@/utils/dateUtils";
import { Clock, MapPin, Sparkles } from "lucide-react";
import { EVENT_TYPE_MAP } from "@/utils/categoryUtils";
import { EmptyState } from "../ui/EmptyState";

interface TodayTimelineProps {
  events: EventItem[];
  onOpenEvent: (event: EventItem) => void;
  onAddNewEvent: () => void;
}

export const TodayTimeline: React.FC<TodayTimelineProps> = ({
  events,
  onOpenEvent,
  onAddNewEvent
}) => {
  const now = Date.now();

  // Tìm sự kiện gần nhất tiếp theo trong ngày hôm nay
  const nextEventId = events.find((e) => new Date(e.startDateTime).getTime() > now)?.id;

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" /> Timeline Hôm Nay
        </h3>
        <EmptyState
          title="Hôm nay bạn chưa có lịch nào 🎉"
          description="Lên lịch học, cuộc họp hoặc công việc ngay để quản lý ngày thật hiệu quả!"
          onAction={onAddNewEvent}
          actionText="+ Thêm lịch hôm nay"
        />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] p-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" /> Timeline Hôm Nay ({events.length})
        </h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("congivec:openDaySchedule", {
                  detail: { date: new Date().toISOString().split("T")[0] }
                })
              )
            }
            className="text-xs font-bold text-slate-500 hover:text-blue-500 dark:text-zinc-400 dark:hover:text-blue-400 transition cursor-pointer"
          >
            ⚡ Chỉnh nhanh các lịch
          </button>
          <button
            onClick={onAddNewEvent}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            + Thêm sự kiện
          </button>
        </div>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800">
        {events.map((ev) => {
          const isNext = ev.id === nextEventId;
          const isPassed = new Date(ev.endDateTime).getTime() < now;
          const typeInfo = EVENT_TYPE_MAP[ev.type];

          return (
            <div
              key={ev.id}
              onClick={() => onOpenEvent(ev)}
              className={`relative group transition-all duration-200 cursor-pointer ${
                isPassed ? "opacity-60" : ""
              }`}
            >
              {/* Timeline Dot Indicator */}
              <div
                className={`absolute -left-[27px] top-3.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  isNext
                    ? "bg-blue-600 border-white dark:border-[#0c0c0e] ring-4 ring-blue-500/30 scale-125"
                    : isPassed
                    ? "bg-slate-400 border-white dark:border-[#0c0c0e]"
                    : "bg-white dark:bg-[#0c0c0e] border-blue-500"
                }`}
              />

              {/* Event Card */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isNext
                    ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-sm"
                    : "bg-slate-50/70 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800/80 hover:border-blue-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                        {formatTimeVN(ev.startDateTime)}
                      </span>
                      {ev.endDateTime && (
                        <span className="text-[11px] text-slate-400">
                          - {formatTimeVN(ev.endDateTime)}
                        </span>
                      )}
                      {isNext && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-600 text-white animate-pulse">
                          <Sparkles className="w-2.5 h-2.5" /> Kế tiếp
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {ev.title}
                    </h4>

                    {ev.location && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{ev.location}</span>
                      </p>
                    )}
                  </div>

                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${typeInfo.bgClass} ${typeInfo.textClass} ${typeInfo.borderClass} shrink-0`}
                  >
                    {typeInfo.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
