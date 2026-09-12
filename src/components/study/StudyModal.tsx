"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { StudyFormat } from "@/types";
import { GraduationCap, Calendar, Plus, X, Clock, MapPin, User } from "lucide-react";
import { toInputDate, formatDateVN } from "@/utils/dateUtils";

interface StudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBulkStudy: (
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
  ) => Promise<void>;
}

export const StudyModal: React.FC<StudyModalProps> = ({
  isOpen,
  onClose,
  onCreateBulkStudy
}) => {
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [room, setRoom] = useState("");
  const [format, setFormat] = useState<StudyFormat>("Trực tiếp");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:30");
  const [description, setDescription] = useState("");
  const [dates, setDates] = useState<string[]>([toInputDate(new Date())]);
  const [dateInputVal, setDateInputVal] = useState("");
  const [bulkDateText, setBulkDateText] = useState("");
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addDate = (dateStr: string) => {
    if (!dateStr) return;
    if (!dates.includes(dateStr)) {
      setDates((prev) => [...prev, dateStr].sort());
    }
    setDateInputVal("");
  };

  const removeDate = (dateStr: string) => {
    setDates((prev) => prev.filter((d) => d !== dateStr));
  };

  // Nhập dán nhiều ngày cùng lúc (VD: dán danh sách 11/10/2026, 18/10/2026...)
  const handleProcessBulkPaste = () => {
    if (!bulkDateText.trim()) return;
    // Tìm tất cả các chuỗi ngày DD/MM/YYYY hoặc YYYY-MM-DD
    const regex = /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/g;
    let match;
    const newFoundDates: string[] = [];

    while ((match = regex.exec(bulkDateText)) !== null) {
      const day = match[1].padStart(2, "0");
      const month = match[2].padStart(2, "0");
      const year = match[3];
      newFoundDates.push(`${year}-${month}-${day}`);
    }

    if (newFoundDates.length > 0) {
      setDates((prev) => Array.from(new Set([...prev, ...newFoundDates])).sort());
      setBulkDateText("");
      setShowBulkPaste(false);
    } else {
      alert("Không tìm thấy ngày định dạng DD/MM/YYYY trong văn bản vừa dán.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || dates.length === 0) return;

    setIsLoading(true);
    try {
      await onCreateBulkStudy(
        {
          title: `Lịch học: ${subject.trim()}`,
          subject: subject.trim(),
          className: className.trim(),
          lecturer: lecturer.trim(),
          room: room.trim() || (format === "Online" ? "Google Meet" : "Phòng học"),
          format,
          startTime,
          endTime,
          description: description.trim() || undefined
        },
        dates
      );

      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      title={
        <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <GraduationCap className="w-5 h-5" />
          Tạo Lịch Học (Hỗ Trợ Nhiều Ngày)
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tên môn học & Tên lớp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Môn học <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="VD: Lập trình Web hoặc Toán rời rạc"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Tên lớp / Mã lớp
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="VD: CNTT-K18A"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Giảng viên & Phòng học & Hình thức */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-500" /> Giảng viên
            </label>
            <input
              type="text"
              value={lecturer}
              onChange={(e) => setLecturer(e.target.value)}
              placeholder="VD: ThS. Nguyễn Văn A"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500" /> Phòng học
            </label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="VD: Phòng B204 hoặc Link Meet"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Hình thức học
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as StudyFormat)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
            >
              <option value="Trực tiếp">Trực tiếp</option>
              <option value="Online">Online</option>
              <option value="Điểm cầu">Điểm cầu</option>
            </select>
          </div>
        </div>

        {/* Khung Giờ học */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500" /> Khung giờ học áp dụng
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-[11px] text-slate-500 mb-1">Giờ bắt đầu</span>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <span className="block text-[11px] text-slate-500 mb-1">Giờ kết thúc</span>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Multi-date Selector (Nhập nhiều ngày một lần) */}
        <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Các ngày học ({dates.length} ngày)
            </span>
            <button
              type="button"
              onClick={() => setShowBulkPaste(!showBulkPaste)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {showBulkPaste ? "Ẩn khung dán" : "+ Dán danh sách ngày"}
            </button>
          </div>

          {/* Bulk Paste Box */}
          {showBulkPaste && (
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 space-y-2">
              <p className="text-[11px] text-slate-500 leading-normal">
                Dán danh sách ngày có dạng: <code>11/10/2026, 18/10/2026, 01/11/2026...</code>
              </p>
              <textarea
                rows={3}
                value={bulkDateText}
                onChange={(e) => setBulkDateText(e.target.value)}
                placeholder="Dán các ngày tại đây..."
                className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="button" size="sm" variant="primary" onClick={handleProcessBulkPaste}>
                Xác nhận danh sách ngày
              </Button>
            </div>
          )}

          {/* Date Picker Input */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateInputVal}
              onChange={(e) => setDateInputVal(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => addDate(dateInputVal)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Thêm ngày
            </Button>
          </div>

          {/* Selected Dates Badges */}
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            {dates.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 shadow-2xs"
              >
                {formatDateVN(d)}
                <button
                  type="button"
                  onClick={() => removeDate(d)}
                  className="hover:text-rose-500 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
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
            placeholder="Tài liệu giáo trình, quy định điểm danh..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={dates.length === 0}
            isLoading={isLoading}
          >
            Tạo {dates.length} buổi học
          </Button>
        </div>
      </form>
    </Modal>
  );
};
