"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { EventItem, EventType, PriorityLevel, ReminderItem } from "@/types";
import { toInputDate } from "@/utils/dateUtils";
import { AlertTriangle, Clock, MapPin, Bell, Calendar as CalendarIcon, Tag } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<EventItem, "id" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<void>;
  onDelete?: (id: string) => void;
  checkConflicts: (start: string, end: string, excludeId?: string) => { hasConflict: boolean; conflictingEvents: EventItem[] };
  initialEvent?: Partial<EventItem> | null;
  defaultDate?: string;
}

const REMINDER_OPTIONS = [
  { value: 0, label: "Không nhắc" },
  { value: 5, label: "Trước 5 phút" },
  { value: 10, label: "Trước 10 phút" },
  { value: 15, label: "Trước 15 phút" },
  { value: 30, label: "Trước 30 phút" },
  { value: 60, label: "Trước 1 giờ" },
  { value: 180, label: "Trước 3 giờ" },
  { value: 1440, label: "Trước 1 ngày" },
  { value: 2880, label: "Trước 2 ngày" }
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  checkConflicts,
  initialEvent,
  defaultDate
}) => {
  const { error: showError } = useToast();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("meeting");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("normal");
  const [selectedReminders, setSelectedReminders] = useState<number[]>([15]);
  const [recurrenceFreq, setRecurrenceFreq] = useState<string>("none");
  const [isLoading, setIsLoading] = useState(false);

  // Trạng thái kiểm tra trùng lịch
  const [conflictWarning, setConflictWarning] = useState<{
    show: boolean;
    conflictingEvents: EventItem[];
  }>({ show: false, conflictingEvents: [] });

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title || "");
      setType(initialEvent.type || "meeting");
      const start = initialEvent.startDateTime ? new Date(initialEvent.startDateTime) : new Date();
      const end = initialEvent.endDateTime ? new Date(initialEvent.endDateTime) : new Date();
      setDate(toInputDate(start));
      setStartTime(
        `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`
      );
      setEndTime(
        `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`
      );
      setAllDay(initialEvent.allDay || false);
      setLocation(initialEvent.location || "");
      setDescription(initialEvent.description || "");
      setPriority(initialEvent.priority || "normal");
      setSelectedReminders(
        initialEvent.reminders && initialEvent.reminders.length > 0
          ? initialEvent.reminders.map((r) => r.minutesBefore)
          : [15]
      );
      setRecurrenceFreq(initialEvent.recurrence?.frequency || "none");
    } else {
      const targetD = defaultDate || toInputDate(new Date());
      setTitle("");
      setType("meeting");
      setDate(targetD);
      setStartTime("09:00");
      setEndTime("10:00");
      setAllDay(false);
      setLocation("");
      setDescription("");
      setPriority("normal");
      setSelectedReminders([15]);
      setRecurrenceFreq("none");
    }
    setConflictWarning({ show: false, conflictingEvents: [] });
  }, [initialEvent, defaultDate, isOpen]);

  const handleSubmit = async (e?: React.FormEvent, forceSave: boolean = false) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      showError("Thiếu thông tin", "Vui lòng nhập tên công việc hoặc sự kiện.");
      return;
    }
    if (!date) {
      showError("Thiếu thông tin", "Vui lòng chọn ngày diễn ra.");
      return;
    }

    const startDateTime = allDay ? `${date}T00:00` : `${date}T${startTime}`;
    const endDateTime = allDay ? `${date}T23:59` : `${date}T${endTime}`;

    // Kiểm tra trùng lịch nếu không phải forceSave và không phải allDay
    if (!forceSave && !allDay) {
      const conflictCheck = checkConflicts(startDateTime, endDateTime, initialEvent?.id);
      if (conflictCheck.hasConflict) {
        setConflictWarning({
          show: true,
          conflictingEvents: conflictCheck.conflictingEvents
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const remindersList: ReminderItem[] = selectedReminders
        .filter((min) => min > 0)
        .map((min) => ({ minutesBefore: min }));

      await onSave({
        id: initialEvent?.id,
        title: title.trim(),
        type,
        startDateTime,
        endDateTime,
        allDay,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        priority,
        status: "confirmed",
        reminders: remindersList,
        recurrence:
          recurrenceFreq !== "none"
            ? { frequency: recurrenceFreq as "daily" | "weekly" | "monthly" | "yearly" }
            : undefined,
        userId: initialEvent?.userId || ""
      });

      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReminder = (minutes: number) => {
    if (minutes === 0) {
      setSelectedReminders([]);
      return;
    }
    setSelectedReminders((prev) =>
      prev.includes(minutes) ? prev.filter((m) => m !== minutes) : [...prev, minutes]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <span className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          {initialEvent?.id ? "Chỉnh sửa Lịch" : "Thêm Lịch Mới"}
        </span>
      }
    >
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
        {/* Cảnh báo Trùng Lịch */}
        {conflictWarning.show && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-sm space-y-2">
            <div className="flex items-start gap-2 font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>Cảnh báo: Bạn đang có một lịch khác vào thời gian này!</span>
            </div>
            <div className="pl-7 text-xs space-y-1">
              {conflictWarning.conflictingEvents.map((ce) => (
                <div key={ce.id} className="font-semibold text-amber-800 dark:text-amber-300">
                  • {ce.title} ({ce.startDateTime.split("T")[1]} - {ce.endDateTime.split("T")[1]})
                </div>
              ))}
            </div>
            <div className="pl-7 flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConflictWarning({ show: false, conflictingEvents: [] })}
                className="px-2.5 py-1 text-xs rounded-lg bg-amber-200 dark:bg-amber-900/50 hover:bg-amber-300 font-semibold cursor-pointer"
              >
                Chỉnh giờ lại
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(undefined, true)}
                className="px-2.5 py-1 text-xs rounded-lg bg-amber-600 text-white hover:bg-amber-700 font-bold cursor-pointer"
              >
                Vẫn lưu
              </button>
            </div>
          </div>
        )}

        {/* Tên công việc */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Tên công việc / Sự kiện <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Họp phòng CNTT hoặc Học lớp Web"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Phân loại & Mức độ ưu tiên */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-500" /> Loại sự kiện
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
            >
              <option value="work">Công việc (Màu cam)</option>
              <option value="study">Học tập (Màu xanh dương)</option>
              <option value="meeting">Họp (Màu tím)</option>
              <option value="deadline">Deadline (Màu đỏ)</option>
              <option value="personal">Cá nhân (Màu xanh lá)</option>
              <option value="online">Online (Màu cyan)</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Mức độ ưu tiên
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
            >
              <option value="low">Thấp</option>
              <option value="normal">Bình thường</option>
              <option value="high">Cao</option>
              <option value="urgent">Khẩn cấp</option>
            </select>
          </div>
        </div>

        {/* Ngày & Thời gian */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Thời gian
            </span>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Cả ngày
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Ngày</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            {!allDay && (
              <>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Giờ bắt đầu</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Giờ kết thúc</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Địa điểm & Lặp lại */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-500" /> Địa điểm
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="VD: Phòng A101 hoặc Google Meet"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Lịch lặp
            </label>
            <select
              value={recurrenceFreq}
              onChange={(e) => setRecurrenceFreq(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
            >
              <option value="none">Không lặp</option>
              <option value="daily">Hằng ngày</option>
              <option value="weekly">Hằng tuần</option>
              <option value="monthly">Hằng tháng</option>
              <option value="yearly">Hằng năm</option>
            </select>
          </div>
        </div>

        {/* Nhắc nhở (Nhiều mốc nhắc nhở) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-blue-500" /> Nhắc nhở trước
          </label>
          <div className="flex flex-wrap gap-1.5">
            {REMINDER_OPTIONS.map((opt) => {
              const isSelected =
                opt.value === 0
                  ? selectedReminders.length === 0
                  : selectedReminders.includes(opt.value);
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => toggleReminder(opt.value)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Ghi chú thêm
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nội dung chuẩn bị, tài liệu liên quan..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          {initialEvent?.id && onDelete ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onDelete(initialEvent.id!)}
            >
              Xóa lịch
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              {initialEvent?.id ? "Lưu thay đổi" : "Tạo lịch"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
