import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { TaskItem, TaskStatus } from "@/types";

const LOCAL_KEY_PREFIX = "congivec_real_tasks_";

export function computeTaskStatus(task: TaskItem): TaskStatus {
  if (task.completed) {
    return "completed";
  }

  if (task.dueDate) {
    const dueTime = new Date(task.dueDate).getTime();
    const now = Date.now();
    if (dueTime < now) {
      return "overdue";
    }
  }

  return task.status === "completed" ? "todo" : task.status;
}

// Helper làm sạch dữ liệu trước khi gửi lên Cloud Firestore
export function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  if (typeof obj === "object") {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        cleaned[k] = sanitizeForFirestore(v);
      }
    }
    return cleaned;
  }
  return obj;
}

// Đọc công việc từ LocalStorage (0ms) kèm khôi phục tự động mọi session cũ
export function getLocalTasks(userId: string): TaskItem[] {
  if (typeof window === "undefined" || !userId) return [];
  const localKey = `${LOCAL_KEY_PREFIX}${userId}`;
  const saved = localStorage.getItem(localKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      //
    }
  }

  // Quét tìm dữ liệu công việc từ các khóa cũ hoặc session trước để không bao giờ bị mất công việc
  const allTasksMap = new Map<string, TaskItem>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes("tasks") || key.startsWith("congivec_"))) {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            const arr = JSON.parse(val);
            if (Array.isArray(arr)) {
              for (const item of arr) {
                if (item && item.id && item.title && !item.startDateTime) {
                  allTasksMap.set(item.id, { ...item, userId });
                }
              }
            }
          } catch {}
        }
      }
    }
  } catch {}

  const recovered = Array.from(allTasksMap.values());
  if (recovered.length > 0) {
    setLocalTasks(userId, recovered);
  }
  return recovered;
}

// Ghi công việc vào LocalStorage (0ms)
export function setLocalTasks(userId: string, tasks: TaskItem[]): void {
  if (typeof window === "undefined" || !userId) return;
  const localKey = `${LOCAL_KEY_PREFIX}${userId}`;
  try {
    localStorage.setItem(localKey, JSON.stringify(tasks));
  } catch (e) {
    console.error("Lỗi khi lưu LocalStorage task:", e);
  }
}

export const taskService = {
  // Lấy tất cả công việc: Tự động đồng bộ 2 chiều giữa Cloud Firestore và LocalStorage
  async getTasks(userId: string): Promise<TaskItem[]> {
    if (!userId) return [];

    const localTasks = getLocalTasks(userId);

    if (!db) {
      return localTasks.map((t) => ({ ...t, status: computeTaskStatus(t) }));
    }

    try {
      const colRef = collection(db, "users", userId, "tasks");
      const snap = await getDocs(colRef);

      const remoteTasks = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TaskItem));

      const mergedMap = new Map<string, TaskItem>();
      for (const t of localTasks) {
        mergedMap.set(t.id, t);
      }
      for (const t of remoteTasks) {
        mergedMap.set(t.id, t);
      }

      const mergedList = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setLocalTasks(userId, mergedList);

      // Tự động đẩy task máy này lên Firestore nếu Firestore chưa có
      const remoteIdSet = new Set(remoteTasks.map((r) => r.id));
      for (const t of localTasks) {
        if (!remoteIdSet.has(t.id)) {
          const cleanData = sanitizeForFirestore(t);
          const docRef = doc(db, "users", userId, "tasks", t.id);
          setDoc(docRef, cleanData, { merge: true }).catch(() => {});
        }
      }

      return mergedList.map((t) => ({ ...t, status: computeTaskStatus(t) }));
    } catch (err: unknown) {
      console.warn("Lưu ý kết nối Firestore tasks:", err);
      return localTasks.map((t) => ({ ...t, status: computeTaskStatus(t) }));
    }
  },

  // Tạo hoặc lưu công việc: TỨC THÌ (0ms), đồng bộ ngầm
  async saveTask(
    userId: string,
    task: Omit<TaskItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ): Promise<TaskItem> {
    if (!userId) throw new Error("Chưa xác thực người dùng");

    const now = new Date().toISOString();
    const taskId = task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    let computedStatus = task.completed ? "completed" : task.status;
    if (!task.completed && task.dueDate) {
      const dueTime = new Date(task.dueDate).getTime();
      if (dueTime < Date.now()) {
        computedStatus = "overdue";
      }
    }

    const fullTask: TaskItem = {
      ...task,
      id: taskId,
      userId,
      status: computedStatus,
      createdAt: (task as TaskItem).createdAt || now,
      updatedAt: now
    };

    // 1. Lưu tức thì vào LocalStorage (0ms)
    const current = getLocalTasks(userId);
    const existingIndex = current.findIndex((t) => t.id === taskId);
    let updated: TaskItem[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = fullTask;
    } else {
      updated = [fullTask, ...current];
    }
    setLocalTasks(userId, updated);

    // 2. Đồng bộ ngầm lên Firestore (không block UI)
    if (db) {
      const cleanData = sanitizeForFirestore(fullTask);
      const docRef = doc(db, "users", userId, "tasks", taskId);
      setDoc(docRef, cleanData, { merge: true }).catch((err) => {
        console.warn("Lưu Firestore task:", err);
      });
    }

    return fullTask;
  },

  // Bật/tắt trạng thái hoàn thành task: TỨC THÌ (0ms)
  async toggleTaskCompleted(userId: string, task: TaskItem): Promise<TaskItem> {
    const newCompleted = !task.completed;
    const updatedChecklist = task.checklist.map((item) => ({
      ...item,
      completed: newCompleted
    }));

    return this.saveTask(userId, {
      ...task,
      completed: newCompleted,
      status: newCompleted ? "completed" : "todo",
      checklist: updatedChecklist
    });
  },

  // Bật/tắt trạng thái 1 mục checklist: TỨC THÌ (0ms)
  async toggleChecklistItem(userId: string, task: TaskItem, itemId: string): Promise<TaskItem> {
    const updatedChecklist = task.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const allChecked = updatedChecklist.length > 0 && updatedChecklist.every((i) => i.completed);

    return this.saveTask(userId, {
      ...task,
      checklist: updatedChecklist,
      completed: allChecked ? true : (task.completed && !allChecked ? false : task.completed),
      status: allChecked ? "completed" : (task.status === "completed" ? "in_progress" : task.status)
    });
  },

  // Xóa công việc: TỨC THÌ (0ms)
  async deleteTask(userId: string, taskId: string): Promise<void> {
    if (!userId || !taskId) return;

    // 1. Xóa tức thì khỏi LocalStorage
    const current = getLocalTasks(userId);
    const updated = current.filter((t) => t.id !== taskId);
    setLocalTasks(userId, updated);

    // 2. Xóa ngầm trên Firestore
    if (db) {
      const docRef = doc(db, "users", userId, "tasks", taskId);
      deleteDoc(docRef).catch((err) => {
        console.warn("Xóa Firestore task:", err);
      });
    }
  }
};
