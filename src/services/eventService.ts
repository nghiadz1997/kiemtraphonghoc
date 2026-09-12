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
import { EventItem, ConflictCheckResult } from "@/types";
import { areTimeIntervalsOverlapping } from "@/utils/dateUtils";

const LOCAL_KEY_PREFIX = "congivec_real_events_";

let isFirestoreUnavailable = false;

function withTimeout<T>(promise: Promise<T>, ms: number = 600): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout kết nối Firestore")), ms)
    )
  ]);
}

// Helper làm sạch dữ liệu trước khi gửi lên Cloud Firestore (loại bỏ hoàn toàn các trường có giá trị undefined)
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

// Đọc danh sách sự kiện từ LocalStorage an toàn (0ms)
function getLocalEvents(userId: string): EventItem[] {
  if (typeof window === "undefined" || !userId) return [];
  const localKey = `${LOCAL_KEY_PREFIX}${userId}`;
  const saved = localStorage.getItem(localKey);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

// Ghi danh sách sự kiện vào LocalStorage an toàn (0ms)
function setLocalEvents(userId: string, events: EventItem[]): void {
  if (typeof window === "undefined" || !userId) return;
  const localKey = `${LOCAL_KEY_PREFIX}${userId}`;
  try {
    localStorage.setItem(localKey, JSON.stringify(events));
  } catch (e) {
    console.error("Lỗi khi lưu LocalStorage:", e);
  }
}

export const eventService = {
  // Lấy tất cả sự kiện: Tự động đồng bộ 2 chiều giữa Cloud Firestore và LocalStorage
  async getEvents(userId: string): Promise<EventItem[]> {
    if (!userId) return [];

    // 1. Đọc ngay lập tức từ LocalStorage (0ms) để không bị đơ giao diện
    const localEvents = getLocalEvents(userId);

    if (!db) {
      return localEvents;
    }

    // 2. Thử truy vấn Cloud Firestore để đồng bộ 2 chiều
    try {
      const colRef = collection(db, "users", userId, "events");
      const q = query(colRef, orderBy("startDateTime", "asc"));
      const snap = await withTimeout(getDocs(q), 2500);

      const remoteEvents = snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventItem));

      // Hợp nhất dữ liệu thông minh giữa Máy khách và Đám mây
      const mergedMap = new Map<string, EventItem>();
      for (const ev of localEvents) {
        mergedMap.set(ev.id, ev);
      }
      for (const ev of remoteEvents) {
        mergedMap.set(ev.id, ev);
      }

      const mergedList = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
      );

      // Cập nhật lại LocalStorage để lần sau mở lên tức thì
      setLocalEvents(userId, mergedList);

      // Tự động đẩy các sự kiện ở máy này lên Đám mây nếu Firestore chưa có (Auto-upload to Cloud)
      const remoteIdSet = new Set(remoteEvents.map((r) => r.id));
      for (const ev of localEvents) {
        if (!remoteIdSet.has(ev.id)) {
          const cleanData = sanitizeForFirestore(ev);
          const docRef = doc(db, "users", userId, "events", ev.id);
          setDoc(docRef, cleanData, { merge: true }).catch(() => {});
        }
      }

      isFirestoreUnavailable = false;
      return mergedList;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("not found") || msg.includes("Database")) {
        isFirestoreUnavailable = true;
      }
      return localEvents;
    }
  },

  // Tạo hoặc cập nhật sự kiện: LƯU TỨC THÌ (0ms) vào LocalStorage, đồng bộ ngầm lên Firestore
  async saveEvent(
    userId: string,
    event: Omit<EventItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ): Promise<EventItem> {
    if (!userId) throw new Error("Chưa xác thực người dùng");

    const now = new Date().toISOString();
    const eventId = event.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const fullEvent: EventItem = {
      ...event,
      id: eventId,
      userId,
      createdAt: (event as EventItem).createdAt || now,
      updatedAt: now
    };

    // 1. Lưu tức thì vào LocalStorage (0ms)
    const current = getLocalEvents(userId);
    const existingIndex = current.findIndex((e) => e.id === eventId);
    let updated: EventItem[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = fullEvent;
    } else {
      updated = [fullEvent, ...current];
    }
    setLocalEvents(userId, updated);

    // 2. Đồng bộ ngầm lên Firestore (fire-and-forget)
    if (db) {
      const cleanData = sanitizeForFirestore(fullEvent);
      const docRef = doc(db, "users", userId, "events", eventId);
      setDoc(docRef, cleanData, { merge: true }).catch((err) => {
        const msg = String(err);
        if (msg.includes("not found") || msg.includes("Database")) {
          isFirestoreUnavailable = true;
        }
      });
    }

    return fullEvent;
  },

  // Xóa sự kiện: XÓA TỨC THÌ (0ms), đồng bộ ngầm
  async deleteEvent(userId: string, eventId: string): Promise<void> {
    if (!userId || !eventId) return;

    // 1. Xóa tức thì khỏi LocalStorage
    const current = getLocalEvents(userId);
    const updated = current.filter((e) => e.id !== eventId);
    setLocalEvents(userId, updated);

    // 2. Xóa ngầm trên Firestore nếu có
    if (db && !isFirestoreUnavailable) {
      const docRef = doc(db, "users", userId, "events", eventId);
      deleteDoc(docRef).catch((err) => {
        const msg = String(err);
        if (msg.includes("not found") || msg.includes("Database") || msg.includes("offline")) {
          isFirestoreUnavailable = true;
        }
      });
    }
  },

  // Lưu hàng loạt nhiều sự kiện cùng lúc trong 1 ngày (1 thao tác duy nhất, 0ms)
  async saveMultipleEvents(
    userId: string,
    toSave: Array<Omit<EventItem, "id" | "createdAt" | "updatedAt"> & { id?: string }>,
    toDeleteIds: string[] = []
  ): Promise<EventItem[]> {
    if (!userId) throw new Error("Chưa xác thực người dùng");

    const now = new Date().toISOString();
    let current = getLocalEvents(userId);

    // Xóa các sự kiện được đánh dấu xóa
    if (toDeleteIds.length > 0) {
      const deleteSet = new Set(toDeleteIds);
      current = current.filter((e) => !deleteSet.has(e.id));
    }

    // Upsert các sự kiện mới/đã sửa
    for (const item of toSave) {
      const eventId = item.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const fullEvent: EventItem = {
        ...item,
        id: eventId,
        userId,
        createdAt: (item as EventItem).createdAt || now,
        updatedAt: now
      };

      const idx = current.findIndex((e) => e.id === eventId);
      if (idx >= 0) {
        current[idx] = fullEvent;
      } else {
        current.unshift(fullEvent);
      }

      // Sync ngầm từng event lên Firestore
      if (db && !isFirestoreUnavailable) {
        const cleanData = sanitizeForFirestore(fullEvent);
        const docRef = doc(db, "users", userId, "events", eventId);
        setDoc(docRef, cleanData, { merge: true }).catch(() => {});
      }
    }

    // Xóa ngầm trên Firestore
    if (db && !isFirestoreUnavailable) {
      for (const delId of toDeleteIds) {
        const docRef = doc(db, "users", userId, "events", delId);
        deleteDoc(docRef).catch(() => {});
      }
    }

    // Lưu một lần duy nhất vào LocalStorage (0ms)
    setLocalEvents(userId, current);

    return current;
  },

  // Kiểm tra trùng lịch
  checkConflicts(
    targetStart: string,
    targetEnd: string,
    existingEvents: EventItem[],
    excludeEventId?: string
  ): ConflictCheckResult {
    if (!targetStart || !targetEnd) {
      return { hasConflict: false, conflictingEvents: [] };
    }

    const conflicts = existingEvents.filter((ev) => {
      if (excludeEventId && ev.id === excludeEventId) return false;
      if (ev.allDay) return false;

      return areTimeIntervalsOverlapping(
        targetStart,
        targetEnd,
        ev.startDateTime,
        ev.endDateTime
      );
    });

    return {
      hasConflict: conflicts.length > 0,
      conflictingEvents: conflicts
    };
  },

  // Tạo hàng loạt lịch học theo danh sách ngày: LƯU TỨC THÌ (0ms)
  async createBulkStudyEvents(
    userId: string,
    baseData: {
      title: string;
      subject: string;
      className: string;
      lecturer: string;
      room: string;
      format: "Trực tiếp" | "Online" | "Điểm cầu";
      startTime: string;
      endTime: string;
      description?: string;
      priority?: "low" | "normal" | "high" | "urgent";
    },
    dates: string[]
  ): Promise<EventItem[]> {
    const createdEvents: EventItem[] = [];
    const now = new Date().toISOString();

    for (const dateStr of dates) {
      if (!dateStr) continue;
      const startDateTime = `${dateStr}T${baseData.startTime}`;
      const endDateTime = `${dateStr}T${baseData.endTime}`;
      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      const ev: EventItem = {
        id: eventId,
        userId,
        title: baseData.title || `Học: ${baseData.subject}`,
        description: baseData.description,
        type: baseData.format === "Online" ? "online" : "study",
        startDateTime,
        endDateTime,
        allDay: false,
        location: baseData.format === "Online" ? (baseData.room || "Google Meet") : baseData.room,
        priority: baseData.priority || "high",
        status: "confirmed",
        color: baseData.format === "Online" ? "#06b6d4" : "#2563eb",
        reminders: [{ minutesBefore: 30 }],
        createdAt: now,
        updatedAt: now,
        studyInfo: {
          subject: baseData.subject,
          className: baseData.className,
          lecturer: baseData.lecturer,
          room: baseData.room,
          format: baseData.format
        }
      };

      createdEvents.push(ev);
    }

    // Lưu một lần duy nhất vào LocalStorage
    const current = getLocalEvents(userId);
    const updated = [...createdEvents, ...current];
    setLocalEvents(userId, updated);

    // Đồng bộ ngầm lên Firestore
    if (db && !isFirestoreUnavailable) {
      for (const ev of createdEvents) {
        const cleanData = sanitizeForFirestore(ev);
        const docRef = doc(db, "users", userId, "events", ev.id);
        setDoc(docRef, cleanData, { merge: true }).catch(() => {});
      }
    }

    return createdEvents;
  }
};
