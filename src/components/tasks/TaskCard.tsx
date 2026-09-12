"use client";

import React from "react";
import { TaskItem } from "@/types";
import { formatDateVN, formatTimeVN } from "@/utils/dateUtils";
import { Clock, CheckCircle2, Trash2, Edit3, Flame } from "lucide-react";
import { Badge } from "../ui/Badge";
import { PRIORITY_MAP } from "@/utils/categoryUtils";

interface TaskCardProps {
  task: TaskItem;
  onToggleCompleted: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleCompleted,
  onEdit,
  onDelete
}) => {
  const isOverdue = task.status === "overdue" && !task.completed;
  const completedCount = task.checklist.filter((i) => i.completed).length;
  const totalChecklist = task.checklist.length;
  const checklistPercent =
    totalChecklist > 0 ? Math.round((completedCount / totalChecklist) * 100) : 0;

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 ${
        task.completed
          ? "border-slate-200 dark:border-slate-800 opacity-60"
          : isOverdue
          ? "border-rose-500/50 shadow-xs shadow-rose-500/5 bg-rose-500/5 dark:bg-slate-900"
          : "border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 shadow-xs"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Toggle Checkbox */}
        <button
          type="button"
          onClick={() => onToggleCompleted(task)}
          className="mt-0.5 text-slate-300 hover:text-emerald-500 transition cursor-pointer shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 transition" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => onEdit(task)}>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge status={task.status} />
            <Badge priority={task.priority} />
            {isOverdue && (
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-600 dark:text-rose-400">
                <Flame className="w-3 h-3" /> Quá hạn!
              </span>
            )}
          </div>

          <h4
            className={`font-bold text-sm text-slate-900 dark:text-white cursor-pointer ${
              task.completed ? "line-through text-slate-400 dark:text-slate-500" : ""
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Checklist progress bar */}
          {totalChecklist > 0 && (
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Tiến độ checklist</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {completedCount} / {totalChecklist} ({checklistPercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all rounded-full"
                  style={{ width: `${checklistPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Due date */}
          {task.dueDate && (
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className={isOverdue ? "font-bold text-rose-600 dark:text-rose-400" : ""}>
                Hạn chót: {formatDateVN(task.dueDate)} {formatTimeVN(task.dueDate)}
              </span>
            </div>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Sửa"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Xóa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
