"use client";

import React, { useState, useMemo } from "react";
import { useEvents } from "@/hooks/useEvents";
import { StudyModal } from "@/components/study/StudyModal";
import { EventModal } from "@/components/calendar/EventModal";
import { Button } from "@/components/ui/Button";
import { GraduationCap, Plus, Calendar, Clock, MapPin, User, Globe } from "lucide-react";
import { EventItem, StudyFormat } from "@/types";
import { formatDateVN, formatTimeVN } from "@/utils/dateUtils";
import { useToast } from "@/hooks/useToast";

export default function StudyPage() {
  const { events, saveEvent, deleteEvent, createBulkStudyEvents, checkConflicts } = useEvents();
  const { success, error } = useToast();

  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Lọc tất cả sự kiện có loại 'study' hoặc 'online' hoặc có studyInfo
  const studyEvents = useMemo(() => {
    return events
      .filter((e) => e.type === "study" || e.type === "online" || e.studyInfo)
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
  }, [events]);

  const handleBulkCreate = async (
    baseData: {
      title: string;
      subject: string;
      className: string;
      lecturer: string;
      room: string;
      format: StudyFormat;
      startTime: string;
      endTime: string;
      description?: string;
    },
    dates: string[]
  ) => {
    try {
      const created = await createBulkStudyEvents(baseData, dates);
      success(
        "Tạo lịch học thành công!",
        `Đã tạo ${created.length} buổi học cho môn ${baseData.subject}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      error("Không thể tạo lịch học", msg);
    }
  };

  const handleSaveEvent = async (
    eventData: Omit<EventItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    try {
      await saveEvent(eventData);
      success("Đã cập nhật buổi học!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      error("Không thể lưu", msg);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Xác nhận xóa buổi học này?")) {
      try {
        await deleteEvent(id);
        success("Đã xóa buổi học!");
        setIsEventModalOpen(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
        error("Không thể xóa", msg);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            LỊCH HỌC SINH VIÊN
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Thời Khóa Biểu & Học Trực Tuyến
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Hỗ trợ nhập nhiều ngày một lần theo kỳ học, quản lý phòng học, giảng viên và điểm cầu trực tuyến.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsStudyModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Nhập lịch học nhiều ngày
        </Button>
      </div>

      {/* Danh sách các buổi học */}
      {studyEvents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] text-slate-400 text-xs">
          Bạn chưa có lịch học nào. Nhấn nút &quot;Nhập lịch học nhiều ngày&quot; ở trên để tạo thời khóa biểu nhé!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studyEvents.map((ev) => {
            const format = ev.studyInfo?.format || (ev.type === "online" ? "Online" : "Trực tiếp");
            const isOnline = format === "Online" || format === "Điểm cầu";

            return (
              <div
                key={ev.id}
                onClick={() => {
                  setSelectedEvent(ev);
                  setIsEventModalOpen(true);
                }}
                className="p-4 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 hover:border-blue-400 dark:hover:border-blue-600 transition cursor-pointer shadow-xs group space-y-3"
              >
                {/* Header tag */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                      isOnline
                        ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                    }`}
                  >
                    {isOnline ? <Globe className="w-3 h-3 inline mr-1" /> : null}
                    {format}
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {formatTimeVN(ev.startDateTime)} - {formatTimeVN(ev.endDateTime)}
                  </span>
                </div>

                {/* Title & Subject */}
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-1">
                    {ev.studyInfo?.subject || ev.title}
                  </h3>
                  {ev.studyInfo?.className && (
                    <div className="text-xs text-slate-400 mt-0.5 font-medium">
                      Lớp: {ev.studyInfo.className}
                    </div>
                  )}
                </div>

                {/* Info pills */}
                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{formatDateVN(ev.startDateTime)}</span>
                  </div>

                  {ev.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  )}

                  {ev.studyInfo?.lecturer && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">GV: {ev.studyInfo.lecturer}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal nhập lịch học nhiều ngày */}
      <StudyModal
        isOpen={isStudyModalOpen}
        onClose={() => setIsStudyModalOpen(false)}
        onCreateBulkStudy={handleBulkCreate}
      />

      {/* Modal xem / chỉnh sửa buổi học */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
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
