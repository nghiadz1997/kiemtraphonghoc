"use client";

import React, { useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import { getVietnameseDayOfWeek, formatDateVN, formatTimeVN, getTimeSlot, TIME_SLOT_LABELS, DayTimeSlot } from "@/utils/dateUtils";
import { EventItem } from "@/types";
import { EventModal } from "@/components/calendar/EventModal";
import { Button } from "@/components/ui/Button";
import { Plus, Sunrise, Sun, Sunset, Moon, MapPin, Clock, CalendarDays } from "lucide-react";
import { EVENT_TYPE_MAP } from "@/utils/categoryUtils";
import { useToast } from "@/hooks/useToast";

export default function TodayPage() {
  const { todayEvents, loading, saveEvent, deleteEvent, checkConflicts } = useEvents();
  const { success, error } = useToast();

  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const now = new Date();
  const dayName = getVietnameseDayOfWeek(now);
  const dateStr = formatDateVN(now);

  // Nhóm các sự kiện theo 4 ca: Sáng, Trưa, Chiều, Tối
  const slotGroups: Record<DayTimeSlot, EventItem[]> = {
    sang: [],
    trua: [],
    chieu: [],
    toi: []
  };

  todayEvents.forEach((ev) => {
    const slot = getTimeSlot(ev.startDateTime);
    slotGroups[slot].push(ev);
  });

  const handleOpenEvent = (event: EventItem) => {
    setActiveEvent(event);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setActiveEvent(null);
    setIsModalOpen(true);
  };

  const handleSave = async (
    eventData: Omit<EventItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    try {
      await saveEvent(eventData);
      success("Đã cập nhật lịch hôm nay!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      error("Không thể lưu sự kiện", msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xác nhận xóa sự kiện này?")) {
      try {
        await deleteEvent(id);
        success("Đã xóa sự kiện thành công!");
        setIsModalOpen(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
        error("Không thể xóa", msg);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner tối ưu mở mỗi sáng */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            CHẾ ĐỘ XEM HÔM NAY
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-2">
            {dayName}
          </h1>
          <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
            {dateStr}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Tổng cộng: <b>{todayEvents.length}</b> hoạt động được lên lịch trong ngày
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("congivec:openDaySchedule", {
                  detail: { date: now.toISOString().split("T")[0] }
                })
              )
            }
            className="font-bold border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
          >
            <CalendarDays className="w-4 h-4 mr-1.5" /> Chỉnh sửa nhiều lịch trong ngày
          </Button>

          <Button variant="primary" size="md" onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-1" /> Thêm lịch hôm nay
          </Button>
        </div>
      </div>

      {/* 4 Ca trong ngày: Sáng, Trưa, Chiều, Tối */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(["sang", "trua", "chieu", "toi"] as DayTimeSlot[]).map((slotKey) => {
          const slotMeta = TIME_SLOT_LABELS[slotKey];
          const eventsInSlot = slotGroups[slotKey];

          return (
            <div
              key={slotKey}
              className="rounded-3xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] p-5 shadow-xs space-y-3"
            >
              {/* Ca Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border ${slotMeta.color}`}
                  >
                    {slotKey === "sang" && <Sunrise className="w-4 h-4" />}
                    {slotKey === "trua" && <Sun className="w-4 h-4" />}
                    {slotKey === "chieu" && <Sunset className="w-4 h-4" />}
                    {slotKey === "toi" && <Moon className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-wide text-slate-900 dark:text-white">
                      {slotMeta.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">{slotMeta.range}</span>
                  </div>
                </div>

                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                  {eventsInSlot.length} lịch
                </span>
              </div>

              {/* Danh sách sự kiện trong ca */}
              {eventsInSlot.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Chưa có lịch trong khung giờ này
                </div>
              ) : (
                <div className="space-y-2.5">
                  {eventsInSlot.map((ev) => {
                    const typeInfo = EVENT_TYPE_MAP[ev.type];
                    return (
                      <div
                        key={ev.id}
                        onClick={() => handleOpenEvent(ev)}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 hover:bg-slate-100 dark:hover:bg-zinc-850 border border-slate-200/80 dark:border-zinc-800/80 transition cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                              <Clock className="w-3 h-3" />
                              <span>
                                {formatTimeVN(ev.startDateTime)} - {formatTimeVN(ev.endDateTime)}
                              </span>
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
                            className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold shrink-0 ${typeInfo.bgClass} ${typeInfo.textClass} ${typeInfo.borderClass}`}
                          >
                            {typeInfo.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActiveEvent(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        checkConflicts={checkConflicts}
        initialEvent={activeEvent}
      />
    </div>
  );
}
