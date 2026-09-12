"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TaskItem } from "@/types";
import { taskService, getLocalTasks, setLocalTasks, sanitizeForFirestore, computeTaskStatus } from "@/services/taskService";
import { useAuth } from "./useAuth";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const SYNCED_TASKS_KEY_PREFIX = "congivec_synced_task_ids_";

function getSyncedTaskIds(userId: string): Set<string> {
  if (typeof window === "undefined" || !userId) return new Set();
  try {
    const raw = localStorage.getItem(`${SYNCED_TASKS_KEY_PREFIX}${userId}`);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
}

function saveSyncedTaskIds(userId: string, ids: Set<string>): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(`${SYNCED_TASKS_KEY_PREFIX}${userId}`, JSON.stringify(Array.from(ids)));
  } catch {}
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Tự động đồng bộ thời gian thực 2 chiều (Cloud Firestore onSnapshot)
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    // Hiển thị ngay từ LocalStorage (0ms)
    const initialLocal = getLocalTasks(user.uid).map((t) => ({ ...t, status: computeTaskStatus(t) }));
    setTasks(initialLocal);
    setLoading(false);

    if (!db) return;

    // Lắng nghe tức thì mọi thay đổi công việc từ Đám mây (PC <-> Điện thoại)
    const colRef = collection(db, "users", user.uid, "tasks");
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const remoteTasks: TaskItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        } as TaskItem));

        const remoteIdSet = new Set(remoteTasks.map((r) => r.id));
        const syncedIds = getSyncedTaskIds(user.uid);
        const currentLocal = getLocalTasks(user.uid);

        // Tự động đẩy lên Cloud toàn bộ các task cũ trên máy này chưa có trên Cloud
        for (const localTask of currentLocal) {
          if (!remoteIdSet.has(localTask.id)) {
            const clean = sanitizeForFirestore(localTask);
            setDoc(doc(db, "users", user.uid, "tasks", localTask.id), clean, { merge: true }).catch((err) => {
              console.warn("Auto-upload task to Firestore error:", err);
            });
            remoteTasks.push(localTask);
            remoteIdSet.add(localTask.id);
          }
        }

        // Đánh dấu các task đã có trên Cloud
        for (const t of remoteTasks) {
          syncedIds.add(t.id);
        }
        saveSyncedTaskIds(user.uid, syncedIds);

        const sorted = remoteTasks
          .map((t) => ({ ...t, status: computeTaskStatus(t) }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setTasks(sorted);
        setLocalTasks(user.uid, sorted);
        setLoading(false);
      },
      (error) => {
        console.warn("Lưu ý kết nối Real-time Firestore tasks:", error.message);
        setTasks(getLocalTasks(user.uid).map((t) => ({ ...t, status: computeTaskStatus(t) })));
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  const refreshTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      return;
    }
    try {
      const data = await taskService.getTasks(user.uid);
      setTasks(data);
    } catch (err) {
      console.error("Error refreshing tasks:", err);
    }
  }, [user]);

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
    const syncedIds = getSyncedTaskIds(user.uid);
    syncedIds.add(taskId);
    saveSyncedTaskIds(user.uid, syncedIds);
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
    refreshTasks,
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
