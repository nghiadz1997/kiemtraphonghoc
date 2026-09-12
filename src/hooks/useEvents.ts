"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { EventItem, ConflictCheckResult } from "@/types";
import { eventService, getLocalEvents, setLocalEvents, sanitizeForFirestore } from "@/services/eventService";
import { useAuth } from "./useAuth";
import { isToday, isTomorrow } from "@/utils/dateUtils";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const SYNCED_EVENTS_KEY_PREFIX = "congivec_synced_event_ids_";

function getSyncedIds(userId: string): Set<string> {
  if (typeof window === "undefined" || !userId) return new Set();
  try {
    const raw = localStorage.getItem(`${SYNCED_EVENTS_KEY_PREFIX}${userId}`);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
}

function saveSyncedIds(userId: string, ids: Set<string>): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(`${SYNCED_EVENTS_KEY_PREFIX}${userId}`, JSON.stringify(Array.from(ids)));
  } catch {}
}

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Tự động đồng bộ thời gian thực 2 chiều (Cloud Firestore onSnapshot)
  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    // Hiển thị ngay từ LocalStorage (0ms)
    const initialLocal = getLocalEvents(user.uid);
    setEvents(initialLocal);
    setLoading(false);

    if (!db) return;

    // Lắng nghe tức thì mọi thay đổi từ Đám mây (PC <-> Điện thoại)
    const colRef = collection(db, "users", user.uid, "events");
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const remoteEvents: EventItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        } as EventItem));

        const remoteIdSet = new Set(remoteEvents.map((r) => r.id));
        const syncedIds = getSyncedIds(user.uid);
        const currentLocal = getLocalEvents(user.uid);

        // Tự động đẩy lên Cloud các sự kiện mới tạo trên máy này chưa từng sync
        for (const localEv of currentLocal) {
          if (!remoteIdSet.has(localEv.id) && !syncedIds.has(localEv.id)) {
            const clean = sanitizeForFirestore(localEv);
            setDoc(doc(db, "users", user.uid, "events", localEv.id), clean, { merge: true }).catch(() => {});
            remoteEvents.push(localEv);
            remoteIdSet.add(localEv.id);
          }
        }

        // Đánh dấu các sự kiện đã có trên Cloud
        for (const ev of remoteEvents) {
          syncedIds.add(ev.id);
        }
        saveSyncedIds(user.uid, syncedIds);

        const sorted = remoteEvents.sort(
          (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
        );

        setEvents(sorted);
        setLocalEvents(user.uid, sorted);
        setLoading(false);
      },
      (error) => {
        console.warn("Lưu ý kết nối Real-time Firestore events:", error.message);
        setEvents(getLocalEvents(user.uid));
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  const refreshEvents = useCallback(async () => {
    if (!user) {
      setEvents([]);
      return;
    }
    try {
      const data = await eventService.getEvents(user.uid);
      setEvents(data);
    } catch (err) {
      console.error("Error refreshing events:", err);
    }
  }, [user]);

  const saveEvent = async (event: Omit<EventItem, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
    if (!user) throw new Error("Chưa đăng nhập");
    const saved = await eventService.saveEvent(user.uid, event);
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    return saved;
  };

  const deleteEvent = async (eventId: string) => {
    if (!user) throw new Error("Chưa đăng nhập");
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    const syncedIds = getSyncedIds(user.uid);
    syncedIds.add(eventId);
    saveSyncedIds(user.uid, syncedIds);
    await eventService.deleteEvent(user.uid, eventId);
  };

  const saveMultipleEvents = async (
    toSave: Array<Omit<EventItem, "id" | "createdAt" | "updatedAt"> & { id?: string }>,
    toDeleteIds: string[] = []
  ) => {
    if (!user) throw new Error("Chưa đăng nhập");
    if (toDeleteIds.length > 0) {
      const syncedIds = getSyncedIds(user.uid);
      toDeleteIds.forEach((id) => syncedIds.add(id));
      saveSyncedIds(user.uid, syncedIds);
    }
    const updated = await eventService.saveMultipleEvents(user.uid, toSave, toDeleteIds);
    setEvents(updated);
    return updated;
  };

  const checkConflicts = (
    start: string,
    end: string,
    excludeEventId?: string
  ): ConflictCheckResult => {
    return eventService.checkConflicts(start, end, events, excludeEventId);
  };

  const createBulkStudyEvents = async (
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
    },
    dates: string[]
  ) => {
    if (!user) throw new Error("Chưa đăng nhập");
    const created = await eventService.createBulkStudyEvents(user.uid, baseData, dates);
    setEvents((prev) => [...created, ...prev]);
    return created;
  };

  // Các danh sách sự kiện được lọc sẵn tiện dụng
  const todayEvents = useMemo(() => {
    return events
      .filter((e) => isToday(e.startDateTime))
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
  }, [events]);

  const tomorrowEvents = useMemo(() => {
    return events
      .filter((e) => isTomorrow(e.startDateTime))
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return events
      .filter((e) => new Date(e.startDateTime).getTime() > now)
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
  }, [events]);

  // Sự kiện sắp diễn ra gần nhất
  const nextUpcomingEvent = useMemo(() => {
    return upcomingEvents[0] || null;
  }, [upcomingEvents]);

  return {
    events,
    loading,
    refreshEvents,
    saveEvent,
    deleteEvent,
    saveMultipleEvents,
    checkConflicts,
    createBulkStudyEvents,
    todayEvents,
    tomorrowEvents,
    upcomingEvents,
    nextUpcomingEvent
  };
}
