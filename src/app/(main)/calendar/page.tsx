"use client";

import React, { useState } from "react";
import { CalendarView } from "@/components/calendar/CalendarView";
import { EventModal } from "@/components/calendar/EventModal";
import { useEvents } from "@/hooks/useEvents";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { EventItem } from "@/types";
import { useToast } from "@/hooks/useToast";

export default function CalendarPage() {
  const { events, saveEvent, deleteEvent, checkConflicts } = useEvents();
  const { success, error } = useToast();

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEvent(event);
    setSelectedDate("");
    setIsModalOpen(true);
  };

  const handleSelectDate = (dateStr: string) => {
    // Mở bộ chỉnh sửa nhiều lịch trong ngày cho ngày vừa chọn
    window.dispatchEvent(
      new CustomEvent("congivec:openDaySchedule", {
        detail: { date: dateStr }
      })
    );
  };

  const handleSave = async (
    eventData: Omit<EventItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    try {
      await saveEvent(eventData);
      success("Đã lưu sự kiện thành công!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      error("Không thể lưu sự kiện", msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xác nhận xóa sự kiện này khỏi lịch?")) {
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
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Lịch Làm Việc & Học Tập
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Xem theo Tháng, Tuần, Ngày hoặc Danh sách. Bấm vào bất kỳ ngày nào để chỉnh sửa nhiều lịch trong ngày đó.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("congivec:openDaySchedule", {
                  detail: { date: new Date().toISOString().split("T")[0] }
                })
              )
            }
            className="font-bold border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
          >
            ⚡ Chỉnh nhiều lịch trong ngày
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedEvent(null);
              setSelectedDate("");
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Thêm lịch
          </Button>
        </div>
      </div>

      {/* FullCalendar Component */}
      <CalendarView
        events={events}
        onSelectEvent={handleSelectEvent}
        onSelectDate={handleSelectDate}
      />

      {/* Modal tạo/sửa sự kiện */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
          setSelectedDate("");
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        checkConflicts={checkConflicts}
        initialEvent={selectedEvent}
        defaultDate={selectedDate}
      />
    </div>
  );
}
