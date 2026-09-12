import { db } from "@/lib/firebase/config";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { eventService } from "./eventService";
import { taskService } from "./taskService";
import { EventItem, TaskItem } from "@/types";

function sanitizeForFirestore(obj: any): any {
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

export const syncService = {
  // Đồng bộ toàn diện 2 chiều và ép lưu toàn bộ dữ liệu máy này lên Cloud Firestore
  async syncAllWithCloud(userId: string): Promise<{
    success: boolean;
    eventsCount: number;
    tasksCount: number;
    error?: string;
  }> {
    if (!userId) throw new Error("Chưa xác thực tài khoản");

    // 1. Lấy tất cả lịch và công việc hiện có
    const localEvents = await eventService.getEvents(userId);
    const localTasks = await taskService.getTasks(userId);

    if (!db) {
      return {
        success: false,
        eventsCount: localEvents.length,
        tasksCount: localTasks.length,
        error: "Chưa kết nối được Firebase"
      };
    }

    try {
      // 2. Đẩy toàn bộ local events lên Cloud Firestore
      for (const ev of localEvents) {
        const cleanEv = sanitizeForFirestore(ev);
        const docRef = doc(db, "users", userId, "events", ev.id);
        await setDoc(docRef, cleanEv, { merge: true });
      }

      // 3. Đẩy toàn bộ local tasks lên Cloud Firestore
      for (const t of localTasks) {
        const cleanTask = sanitizeForFirestore(t);
        const docRef = doc(db, "users", userId, "tasks", t.id);
        await setDoc(docRef, cleanTask, { merge: true });
      }

      // 4. Đọc ngược lại từ Cloud Firestore để cập nhật dữ liệu mới
      const eventsCol = collection(db, "users", userId, "events");
      const snapEvents = await getDocs(eventsCol);
      const cloudEvents = snapEvents.docs.map((d) => ({ id: d.id, ...d.data() } as EventItem));

      const tasksCol = collection(db, "users", userId, "tasks");
      const snapTasks = await getDocs(tasksCol);
      const cloudTasks = snapTasks.docs.map((d) => ({ id: d.id, ...d.data() } as TaskItem));

      // 5. Hợp nhất lại vào LocalStorage
      const mergedEventsMap = new Map<string, EventItem>();
      for (const e of localEvents) mergedEventsMap.set(e.id, e);
      for (const e of cloudEvents) mergedEventsMap.set(e.id, e);

      const mergedTasksMap = new Map<string, TaskItem>();
      for (const t of localTasks) mergedTasksMap.set(t.id, t);
      for (const t of cloudTasks) mergedTasksMap.set(t.id, t);

      const finalEvents = Array.from(mergedEventsMap.values());
      const finalTasks = Array.from(mergedTasksMap.values());

      localStorage.setItem("congivec_real_events_" + userId, JSON.stringify(finalEvents));
      localStorage.setItem("congivec_real_tasks_" + userId, JSON.stringify(finalTasks));
      localStorage.setItem("congivec_last_sync_" + userId, new Date().toISOString());

      return {
        success: true,
        eventsCount: finalEvents.length,
        tasksCount: finalTasks.length
      };
    } catch (err: unknown) {
      console.error("Lỗi đồng bộ Cloud:", err);
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        eventsCount: localEvents.length,
        tasksCount: localTasks.length,
        error: msg
      };
    }
  }
};