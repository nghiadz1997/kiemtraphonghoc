"use client";

import React, { useState, useMemo } from "react";
import { Modal } from "../ui/Modal";
import { EventItem, TaskItem } from "@/types";
import { Search, Calendar, CheckSquare, MapPin, ArrowRight } from "lucide-react";
import { formatDateVN, formatTimeVN } from "@/utils/dateUtils";
import { EVENT_TYPE_MAP } from "@/utils/categoryUtils";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventItem[];
  tasks: TaskItem[];
  onSelectEvent: (event: EventItem) => void;
  onSelectTask: (task: TaskItem) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  events,
  tasks,
  onSelectEvent,
  onSelectTask
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q)) ||
        (e.studyInfo?.subject && e.studyInfo.subject.toLowerCase().includes(q)) ||
        (e.studyInfo?.className && e.studyInfo.className.toLowerCase().includes(q))
    );
  }, [events, searchTerm]);

  const filteredTasks = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }, [tasks, searchTerm]);

  const totalResults = filteredEvents.length + filteredTasks.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      title={
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <Search className="w-5 h-5 text-blue-500" />
          <span>Tìm kiếm toàn hệ thống</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên sự kiện, môn học, địa điểm, ghi chú... (VD: Học online, CNTT)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {searchTerm.trim() && totalResults === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              Không tìm thấy kết quả phù hợp với &quot;{searchTerm}&quot;.
            </div>
          )}

          {/* Events results */}
          {filteredEvents.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" /> Lịch & Sự kiện ({filteredEvents.length})
              </div>
              <div className="space-y-1.5">
                {filteredEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => {
                      onSelectEvent(ev);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition cursor-pointer group"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {ev.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>
                          {formatTimeVN(ev.startDateTime)} {formatDateVN(ev.startDateTime)}
                        </span>
                        {ev.location && (
                          <span className="flex items-center gap-1">
                            • <MapPin className="w-3 h-3 text-slate-400" /> {ev.location}
                          </span>
                        )}
                        <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
                          {EVENT_TYPE_MAP[ev.type]?.label}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks results */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> Công việc ({filteredTasks.length})
              </div>
              <div className="space-y-1.5">
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onSelectTask(t);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-600 transition cursor-pointer group"
                  >
                    <div className="space-y-0.5">
                      <div
                        className={`font-semibold text-sm text-slate-800 dark:text-slate-100 ${
                          t.completed ? "line-through text-slate-400" : ""
                        }`}
                      >
                        {t.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {t.dueDate && <span>Hạn: {formatDateVN(t.dueDate)}</span>}
                        <span
                          className={`text-[11px] px-1.5 py-0.2 rounded ${
                            t.completed
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {t.completed ? "Hoàn thành" : "Đang thực hiện"}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
