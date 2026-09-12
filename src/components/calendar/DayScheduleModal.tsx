"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { EventItem, EventType } from "@/types";
import { EVENT_TYPE_MAP } from "@/utils/categoryUtils";
import {
  formatDateVN,
  getVietnameseDayOfWeek,
  areTimeIntervalsOverlapping
} from "@/utils/dateUtils";
import {
  CalendarDays,
  Plus,
  Trash2,
  Clock,
  MapPin,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface DayScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string; // YYYY-MM-DD
  allEvents: EventItem[];
  onSaveDayEvents: (
    toSave: Array<Omit<EventItem, "id" | "createdAt" | "updatedAt"> & { id?: string }>,
    toDeleteIds: string[]
  ) => Promise<void>;
}

interface EditableEventItem {
  id?: string;
  tempId: string;
  title: string;
  type: EventType;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  location: string;
  description: string;
  allDay: boolean;
  isDeleted?: boolean;
}

export const DayScheduleModal: React.FC<DayScheduleModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  allEvents,
  onSaveDayEvents
}) => {
  const { success, error } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || new Date().toISOString().split("T")[0]
  );
  const [dayItems, setDayItems] = useState<EditableEventItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Khi mở modal hoặc đổi ngày, tải tất cả sự kiện của ngày đó vào danh sách chỉnh sửa
  useEffect(() => {
    if (!isOpen) return;

    const targetDateStr = selectedDate;
    const eventsOnDay = allEvents.filter((ev) => {
      const evDate = ev.startDateTime.split("T")[0];
      return evDate === targetDateStr;
    });

    // Sắp xếp theo giờ bắt đầu
    eventsOnDay.sort(
      (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    );

    const editableList: EditableEventItem[] = eventsOnDay.map((ev) => {
      const sTime = ev.startDateTime.includes("T")
        ? ev.startDateTime.split("T")[1].substring(0, 5)
        : "08:00";
      const eTime = ev.endDateTime && ev.endDateTime.includes("T")
        ? ev.endDateTime.split("T")[1].substring(0, 5)
        : "10:00";

      return {
        id: ev.id,
        tempId: ev.id,
        title: ev.title,
        type: ev.type,
        startTime: sTime,
        endTime: eTime,
        location: ev.location || "",
        description: ev.description || "",
        allDay: !!ev.allDay,
        isDeleted: false
      };
    });

    setDayItems(editableList);
  }, [isOpen, selectedDate, allEvents]);

  // Đổi ngày tới / lui
  const handleShiftDay = (offsetDays: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offsetDays);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  // Đặt về ngày hôm nay
  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  // Cập nhật giá trị trường trong 1 ca/sự kiện
  const handleUpdateItem = (tempId: string, field: keyof EditableEventItem, value: any) => {
    setDayItems((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, [field]: value } : item))
    );
  };

  // Đánh dấu xóa hoặc phục hồi
  const handleToggleDeleteItem = (tempId: string) => {
    setDayItems((prev) =>
      prev.map((item) =>
        item.tempId === tempId ? { ...item, isDeleted: !item.isDeleted } : item
      )
    );
  };

  // Thêm 1 ca / sự kiện mới vào ngày này
  const handleAddNewItem = () => {
    // Tính toán giờ tiếp nối hợp lý
    const activeItems = dayItems.filter((i) => !i.isDeleted);
    let nextStart = "08:00";
    let nextEnd = "10:00";

    if (activeItems.length > 0) {
      const last = activeItems[activeItems.length - 1];
      if (last.endTime) {
        const [h, m] = last.endTime.split(":").map(Number);
        const endHour = Math.min(22, h + 1);
        const nextHour = Math.min(23, endHour + 2);
        nextStart = `${String(endHour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        nextEnd = `${String(nextHour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      }
    }

    const newItem: EditableEventItem = {
      tempId: `new_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: "",
      type: "study",
      startTime: nextStart,
      endTime: nextEnd,
      location: "",
      description: "",
      allDay: false,
      isDeleted: false
    };

    setDayItems((prev) => [...prev, newItem]);
  };

  // Kiểm tra xung đột thời gian giữa các ca trong ngày hiện tại
  const activeItems = dayItems.filter((i) => !i.isDeleted && !i.allDay);
  const conflicts: Array<{ aIndex: number; bIndex: number; titleA: string; titleB: string }> = [];

  for (let i = 0; i < activeItems.length; i++) {
    for (let j = i + 1; j < activeItems.length; j++) {
      const itemA = activeItems[i];
      const itemB = activeItems[j];
      const startA = `${selectedDate}T${itemA.startTime}:00`;
      const endA = `${selectedDate}T${itemA.endTime}:00`;
      const startB = `${selectedDate}T${itemB.startTime}:00`;
      const endB = `${selectedDate}T${itemB.endTime}:00`;

      if (areTimeIntervalsOverlapping(startA, endA, startB, endB)) {
        conflicts.push({
          aIndex: i + 1,
          bIndex: j + 1,
          titleA: itemA.title || `Ca ${i + 1}`,
          titleB: itemB.title || `Ca ${j + 1}`
        });
      }
    }
  }

  // Lưu toàn bộ thay đổi trong ngày
  const handleSaveAll = async () => {
    // Validate: kiểm tra tên không được trống với các ca active
    const activeToSave = dayItems.filter((i) => !i.isDeleted);
    for (let idx = 0; idx < activeToSave.length; idx++) {
      if (!activeToSave[idx].title.trim()) {
        error("Thiếu thông tin", `Vui lòng nhập tên cho Ca ${idx + 1}`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const toDeleteIds: string[] = dayItems
        .filter((i) => i.isDeleted && i.id)
        .map((i) => i.id!);

      const toSaveEvents = activeToSave.map((item) => {
        const startDateTime = item.allDay
          ? `${selectedDate}T00:00:00`
          : `${selectedDate}T${item.startTime}:00`;
        const endDateTime = item.allDay
          ? `${selectedDate}T23:59:59`
          : `${selectedDate}T${item.endTime}:00`;

        const existingEvent = allEvents.find((e) => e.id === item.id);
        return {
          id: item.id,
          userId: existingEvent?.userId || "",
          title: item.title.trim(),
          type: item.type,
          startDateTime,
          endDateTime,
          location: item.location.trim(),
          description: item.description.trim(),
          allDay: item.allDay,
          priority: existingEvent?.priority || "normal",
          status: existingEvent?.status || "confirmed",
          reminders: existingEvent?.reminders || [{ minutesBefore: 15 }]
        };
      });

      await onSaveDayEvents(toSaveEvents, toDeleteIds);
      success("Thành công", `Đã lưu toàn bộ lịch ngày ${formatDateVN(selectedDate)}!`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu";
      error("Lỗi khi lưu", msg);
    } finally {
      setIsSaving(false);
    }
  };

  const currentDateObj = new Date(selectedDate);
  const dayName = getVietnameseDayOfWeek(currentDateObj);
  const dateFormatted = formatDateVN(currentDateObj);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <CalendarDays className="w-5 h-5" />
          Chỉnh Sửa Nhiều Lịch Trong Ngày
        </span>
      }
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Top Date Switcher Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleShiftDay(-1)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
              title="Ngày trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleSetToday}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 transition cursor-pointer"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => handleShiftDay(1)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
              title="Ngày sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          <div className="text-right sm:border-l border-slate-100 dark:border-zinc-800 sm:pl-4">
            <div className="text-xs font-black uppercase text-blue-600 dark:text-blue-400">
              {dayName}
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
              {dateFormatted}
            </div>
          </div>
        </div>

        {/* Warning khi có trùng giờ */}
        {conflicts.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Cảnh báo phát hiện trùng giờ giữa các ca:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
              {conflicts.map((c, idx) => (
                <li key={idx}>
                  Ca {c.aIndex} ({c.titleA}) trùng thời gian với Ca {c.bIndex} ({c.titleB})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Danh sách các ca/lịch có thể chỉnh sửa trực tiếp */}
        <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
          {dayItems.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 text-slate-400 text-xs space-y-2">
              <p>Ngày này hiện chưa có lịch nào.</p>
              <Button variant="primary" size="sm" onClick={handleAddNewItem}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Thêm ca lịch đầu tiên
              </Button>
            </div>
          ) : (
            dayItems.map((item, index) => {
              const typeInfo = EVENT_TYPE_MAP[item.type];
              if (item.isDeleted) {
                return (
                  <div
                    key={item.tempId}
                    className="p-3 rounded-2xl bg-rose-500/5 border border-dashed border-rose-500/30 flex items-center justify-between text-xs text-rose-500"
                  >
                    <span>
                      Đã xóa ca: <b>{item.title || "Chưa đặt tên"}</b>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleDeleteItem(item.tempId)}
                      className="font-bold underline text-xs cursor-pointer"
                    >
                      Khôi phục
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={item.tempId}
                  className="p-4 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 shadow-xs space-y-3 relative group transition hover:border-blue-400 dark:hover:border-blue-500"
                >
                  {/* Top Bar: Ca Index, Loại lịch, Nút Xóa */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <select
                        value={item.type}
                        onChange={(e) =>
                          handleUpdateItem(item.tempId, "type", e.target.value as EventType)
                        }
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-slate-800 dark:text-zinc-200 cursor-pointer"
                      >
                        {Object.entries(EVENT_TYPE_MAP).map(([key, info]) => (
                          <option key={key} value={key}>
                            {info.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleDeleteItem(item.tempId)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                      title="Xóa ca này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title Input */}
                  <div>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateItem(item.tempId, "title", e.target.value)}
                      placeholder="Tên lịch: VD Học Triết học, Họp phòng, Ôn thi..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Giờ bắt đầu, Giờ kết thúc & Địa điểm */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900">
                      <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Từ:</span>
                      <input
                        type="time"
                        value={item.startTime}
                        onChange={(e) =>
                          handleUpdateItem(item.tempId, "startTime", e.target.value)
                        }
                        className="w-full bg-transparent text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900">
                      <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Đến:</span>
                      <input
                        type="time"
                        value={item.endTime}
                        onChange={(e) =>
                          handleUpdateItem(item.tempId, "endTime", e.target.value)
                        }
                        className="w-full bg-transparent text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <input
                        type="text"
                        value={item.location}
                        onChange={(e) =>
                          handleUpdateItem(item.tempId, "location", e.target.value)
                        }
                        placeholder="Phòng học / Link..."
                        className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Nút thêm ca mới trong ngày */}
        <button
          type="button"
          onClick={handleAddNewItem}
          className="w-full py-2.5 px-4 rounded-2xl border-2 border-dashed border-blue-500/30 hover:border-blue-500/60 bg-blue-50/30 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Thêm ca / sự kiện mới vào ngày {dateFormatted}</span>
        </button>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
          <span className="text-xs text-slate-400">
            Tổng cộng: <b>{dayItems.filter((i) => !i.isDeleted).length}</b> ca lịch
          </span>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAll}
              isLoading={isSaving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 font-bold shadow-md shadow-blue-500/25"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Lưu tất cả thay đổi
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
