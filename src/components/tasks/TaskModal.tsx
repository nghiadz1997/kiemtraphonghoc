"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { TaskItem, PriorityLevel, TaskStatus, ChecklistItem } from "@/types";
import { CheckSquare, Plus, Trash2, Clock, CheckCircle2 } from "lucide-react";
import { toInputDateTime } from "@/utils/dateUtils";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<TaskItem, "id" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<void>;
  onDelete?: (id: string) => void;
  initialTask?: Partial<TaskItem> | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTask
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("normal");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || "");
      setDescription(initialTask.description || "");
      setDueDate(initialTask.dueDate ? initialTask.dueDate.slice(0, 16) : "");
      setPriority(initialTask.priority || "normal");
      setStatus(initialTask.status || "todo");
      setChecklist(initialTask.checklist || []);
    } else {
      setTitle("");
      setDescription("");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0);
      setDueDate(toInputDateTime(tomorrow));
      setPriority("normal");
      setStatus("todo");
      setChecklist([]);
    }
    setNewChecklistTitle("");
  }, [initialTask, isOpen]);

  const addChecklistItem = () => {
    if (!newChecklistTitle.trim()) return;
    const newItem: ChecklistItem = {
      id: `chk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: newChecklistTitle.trim(),
      completed: false,
      order: checklist.length + 1
    };
    setChecklist((prev) => [...prev, newItem]);
    setNewChecklistTitle("");
  };

  const removeChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedChecklistCount = checklist.filter((i) => i.completed).length;
  const progressPercent =
    checklist.length > 0 ? Math.round((completedChecklistCount / checklist.length) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const isAllChecked = checklist.length > 0 && completedChecklistCount === checklist.length;
      const isCompleted = status === "completed" || isAllChecked;

      await onSave({
        id: initialTask?.id,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
        status: isCompleted ? "completed" : status,
        completed: isCompleted,
        checklist,
        userId: initialTask?.userId || ""
      });

      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <span className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          {initialTask?.id ? "Chỉnh sửa Công việc" : "Tạo Công việc Mới"}
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tên công việc */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Tiêu đề công việc <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Chuẩn bị sự kiện hội thảo công nghệ"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Deadline & Độ ưu tiên */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Hạn chót (Deadline)
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Mức độ ưu tiên
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
            >
              <option value="low">Thấp</option>
              <option value="normal">Bình thường</option>
              <option value="high">Cao</option>
              <option value="urgent">Khẩn cấp</option>
            </select>
          </div>
        </div>

        {/* Trạng thái công việc */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Trạng thái hiện tại
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["todo", "in_progress", "completed"] as TaskStatus[]).map((st) => (
              <button
                type="button"
                key={st}
                onClick={() => setStatus(st)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  status === st
                    ? st === "completed"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : st === "in_progress"
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-blue-600 text-white border-blue-600"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                }`}
              >
                {st === "todo" && "Chưa làm"}
                {st === "in_progress" && "Đang làm"}
                {st === "completed" && "Hoàn thành"}
              </button>
            ))}
          </div>
        </div>

        {/* Checklist công việc con */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Danh sách kiểm tra (Checklist)
            </span>
            {checklist.length > 0 && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {completedChecklistCount} / {checklist.length} ({progressPercent}%)
              </span>
            )}
          </div>

          {/* Progress bar */}
          {checklist.length > 0 && (
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Checklist items list */}
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700"
              >
                <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span
                    className={`text-xs text-slate-800 dark:text-slate-200 truncate ${
                      item.completed ? "line-through opacity-60 text-slate-500" : ""
                    }`}
                  >
                    {item.title}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => removeChecklistItem(item.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Input thêm checklist item */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newChecklistTitle}
              onChange={(e) => setNewChecklistTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addChecklistItem();
                }
              }}
              placeholder="Thêm mục checklist mới..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="button" size="sm" variant="secondary" onClick={addChecklistItem}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Thêm
            </Button>
          </div>
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Mô tả chi tiết
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Yêu cầu cụ thể, liên kết tài liệu..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          {initialTask?.id && onDelete ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onDelete(initialTask.id!)}
            >
              Xóa công việc
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              {initialTask?.id ? "Lưu thay đổi" : "Tạo công việc"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
