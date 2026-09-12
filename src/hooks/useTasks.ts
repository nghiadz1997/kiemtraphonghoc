"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TaskItem } from "@/types";
import { taskService } from "@/services/taskService";
import { useAuth } from "./useAuth";

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await taskService.getTasks(user.uid);
      setTasks(data);
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const saveTask = async (task: Omit<TaskItem, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
    if (!user) throw new Error("Chưa đăng nhập");
    const saved = await taskService.saveTask(user.uid, task);
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    return saved;
  };

  const toggleTaskCompleted = async (task: TaskItem) => {
    if (!user) throw new Error("Chưa đăng nhập");
    const updated = await taskService.toggleTaskCompleted(user.uid, task);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    return updated;
  };

  const toggleChecklistItem = async (task: TaskItem, itemId: string) => {
    if (!user) throw new Error("Chưa đăng nhập");
    const updated = await taskService.toggleChecklistItem(user.uid, task, itemId);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    return updated;
  };

  const deleteTask = async (taskId: string) => {
    if (!user) throw new Error("Chưa đăng nhập");
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await taskService.deleteTask(user.uid, taskId);
  };

  // Thống kê công việc
  const completedTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);
  const incompleteTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const overdueTasks = useMemo(() => tasks.filter((t) => t.status === "overdue" && !t.completed), [tasks]);

  const nearestDeadlineTask = useMemo(() => {
    const uncompletedWithDue = tasks
      .filter((t) => !t.completed && t.dueDate)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    return uncompletedWithDue[0] || null;
  }, [tasks]);

  const completionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTasks.length / tasks.length) * 100);
  }, [tasks, completedTasks]);

  return {
    tasks,
    loading,
    refreshTasks: fetchTasks,
    saveTask,
    toggleTaskCompleted,
    toggleChecklistItem,
    deleteTask,
    completedTasks,
    incompleteTasks,
    overdueTasks,
    nearestDeadlineTask,
    completionRate
  };
}
