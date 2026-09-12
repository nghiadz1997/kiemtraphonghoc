"use client";

import React, { useState, useMemo } from "react";
import { useEvents } from "@/hooks/useEvents";
import { useTasks } from "@/hooks/useTasks";
import { formatDateVN, formatTimeVN } from "@/utils/dateUtils";
import { CalendarClock, Clock, MapPin, Flame } from "lucide-react";
import { EVENT_TYPE_MAP } from "@/utils/categoryUtils";
import { EventModal } from "@/components/calendar/EventModal";
import { EventItem } from "@/types";
import { useToast } from "@/hooks/useToast";

export default function UpcomingPage() {
  const { upcomingEvents, saveEvent, deleteEvent, checkConflicts } = useEvents();
  const { tasks } = useTasks();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<"7days" | "30days" | "deadlines">("7days");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const now = Date.now();
  const sevenDaysLater = now + 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysLater = now + 30 * 24 * 60 * 60 * 1000;

  // 7 ngày tới
  const eventsIn7Days = useMemo(() => {
    return upcomingEvents.filter((e) => {
      const t = new Date(e.startDateTime).getTime();
      return t >= now && t <= sevenDaysLater;
    });
  }, [upcomingEvents, now, sevenDaysLater]);

  // 30 ngày tới
  const eventsIn30Days = useMemo(() => {
    return upcomingEvents.filter((e) => {
      const t = new Date(e.startDateTime).getTime();
      return t >= now && t <= thirtyDaysLater;
    });
  }, [upcomingEvents, now, thirtyDaysLater]);

  // Deadlines sắp tới (cả từ sự kiện type deadline và tasks có due date)
  const upcomingDeadlines = useMemo(() => {
    const eventDeadlines = upcomingEvents
      .filter((e) => e.type === "deadline")
      .map((e) => ({
        id: e.id,
        title: e.title,
        dueDate: e.startDateTime,
        type: "event" as const,
        priority: e.priority,
        raw: e
      }));

    const taskDeadlines = tasks
      .filter((t) => !t.completed && t.dueDate && new Date(t.dueDate).getTime() >= now)
      .map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate!,
        type: "task" as const,
        priority: t.priority,
        raw: t
      }));

    return [...eventDeadlines, ...taskDeadlines].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }, [upcomingEvents, tasks, now]);

  const handleSaveEvent = async (
    eventData: Omit<EventItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    try {
      await saveEvent(eventData);
      success("Đã cập nhật sự kiện!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      error("Không thể lưu", msg);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Xác nhận xóa sự kiện này?")) {
      try {
        await deleteEvent(id);
        success("Đã xóa sự kiện!");
        setIsModalOpen(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
        error("Không thể xóa", msg);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 p-6 sm:p-8 shadow-xs">
        <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          TIMELINE TƯƠNG LAI
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2 flex items-center gap-2">
          <CalendarClock className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Sự Kiện & Deadline Sắp Tới
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Theo dõi tổng thể các mốc thời gian quan trọng trong 7 ngày, 30 ngày và hạn chót cần hoàn thành.
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-5 bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-2xl w-fit border border-transparent dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("7days")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "7days"
                ? "bg-white dark:bg-[#0c0c0e] text-blue-600 dark:text-blue-400 shadow-2xs border border-transparent dark:border-zinc-700"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            7 Ngày Tới ({eventsIn7Days.length})
          </button>
          <button
            onClick={() => setActiveTab("30days")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "30days"
                ? "bg-white dark:bg-[#0c0c0e] text-blue-600 dark:text-blue-400 shadow-2xs border border-transparent dark:border-zinc-700"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            30 Ngày Tới ({eventsIn30Days.length})
          </button>
          <button
            onClick={() => setActiveTab("deadlines")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              activeTab === "deadlines"
                ? "bg-white dark:bg-[#0c0c0e] text-rose-600 dark:text-rose-400 shadow-2xs border border-transparent dark:border-zinc-700"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            Deadline Sắp Tới ({upcomingDeadlines.length})
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 p-6 shadow-xs">
        {activeTab === "deadlines" ? (
          upcomingDeadlines.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Tuyệt vời! Hiện tại bạn không có deadline nào sắp tới 🎉
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingDeadlines.map((dl) => (
                <div
                  key={dl.id}
                  className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-600 text-white">
                        Hạn chót
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                        {formatDateVN(dl.dueDate)} {formatTimeVN(dl.dueDate)}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {dl.title}
                    </h4>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {dl.type === "event" ? "Sự kiện" : "Công việc"}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : (
          (() => {
            const list = activeTab === "7days" ? eventsIn7Days : eventsIn30Days;
            if (list.length === 0) {
              return (
                <div className="py-12 text-center text-xs text-slate-400">
                  Không có sự kiện nào trong khoảng thời gian này.
                </div>
              );
            }
            return (
              <div className="space-y-3">
                {list.map((ev) => {
                  const typeInfo = EVENT_TYPE_MAP[ev.type];
                  return (
                    <div
                      key={ev.id}
                      onClick={() => {
                        setSelectedEvent(ev);
                        setIsModalOpen(true);
                      }}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 transition cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                          <span>{formatDateVN(ev.startDateTime)}</span>
                          <span>•</span>
                          <span>{formatTimeVN(ev.startDateTime)}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {ev.title}
                        </h4>
                        {ev.location && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" /> {ev.location}
                          </p>
                        )}
                      </div>

                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-md border font-semibold shrink-0 ${typeInfo.bgClass} ${typeInfo.textClass} ${typeInfo.borderClass}`}
                      >
                        {typeInfo.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()
        )}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        checkConflicts={checkConflicts}
        initialEvent={selectedEvent}
      />
    </div>
  );
}
