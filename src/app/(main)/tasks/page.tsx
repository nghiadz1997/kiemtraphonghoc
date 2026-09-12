"use client";

import React, { useState, useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskModal } from "@/components/tasks/TaskModal";
import { Button } from "@/components/ui/Button";
import { Plus, CheckSquare, ListFilter, Search } from "lucide-react";
import { TaskItem, TaskStatus, PriorityLevel } from "@/types";
import { useToast } from "@/hooks/useToast";
import confetti from "canvas-confetti";

export default function TasksPage() {
  const {
    tasks,
    saveTask,
    toggleTaskCompleted,
    deleteTask,
    completedTasks,
    incompleteTasks,
    overdueTasks,
    completionRate
  } = useTasks();

  const { success, error } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lọc danh sách công việc
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "overdue" && t.status === "overdue" && !t.completed) ||
        (statusFilter === "completed" && t.completed) ||
        (statusFilter === "in_progress" && t.status === "in_progress" && !t.completed) ||
        (statusFilter === "todo" && t.status === "todo" && !t.completed);

      const matchPriority = priorityFilter === "ALL" || t.priority === priorityFilter;

      const matchSearch =
        !searchTerm.trim() ||
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchStatus && matchPriority && matchSearch;
    });
  }, [tasks, statusFilter, priorityFilter, searchTerm]);

  const handleToggle = async (task: TaskItem) => {
    try {
      const updated = await toggleTaskCompleted(task);
      if (updated.completed) {
        // Bắn pháo hoa ăn mừng hoàn thành task 🎉
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
        success("Tuyệt vời! Đã hoàn thành công việc 🎉");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      error("Không thể cập nhật", msg);
    }
  };

  const handleSave = async (
    taskData: Omit<TaskItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    try {
      await saveTask(taskData);
      success("Đã lưu công việc thành công!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      error("Không thể lưu công việc", msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xác nhận xóa công việc này?")) {
      try {
        await deleteTask(id);
        success("Đã xóa công việc!");
        setIsModalOpen(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
        error("Không thể xóa", msg);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Thống kê tiến độ */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-500" />
            Danh Sách Công Việc & Todo
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Quản lý tiến độ hoàn thành, công việc con (checklist) và deadline quan trọng.
          </p>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-zinc-900/80 p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tỷ lệ hoàn thành
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {completionRate}%
            </div>
          </div>
          <div className="w-24 h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedTask(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Thêm việc
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0c0c0e] p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800/80">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm công việc..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <ListFilter className="w-3.5 h-3.5" /> Lọc:
          </span>
          {[
            { id: "ALL", label: "Tất cả", count: tasks.length },
            { id: "todo", label: "Chưa làm", count: tasks.filter((t) => t.status === "todo" && !t.completed).length },
            { id: "in_progress", label: "Đang làm", count: tasks.filter((t) => t.status === "in_progress" && !t.completed).length },
            { id: "overdue", label: "Quá hạn", count: overdueTasks.length },
            { id: "completed", label: "Hoàn thành", count: completedTasks.length }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
                statusFilter === st.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {st.label} ({st.count})
            </button>
          ))}
        </div>
      </div>

      {/* Task List Grid */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] text-slate-400 text-xs">
          Không tìm thấy công việc nào phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleCompleted={handleToggle}
              onEdit={(t) => {
                setSelectedTask(t);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal tạo/sửa công việc */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        initialTask={selectedTask}
      />
    </div>
  );
}
