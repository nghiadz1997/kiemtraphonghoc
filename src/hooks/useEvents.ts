"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { EventItem, ConflictCheckResult } from "@/types";
import { eventService } from "@/services/eventService";
import { useAuth } from "./useAuth";
import { isToday, isTomorrow } from "@/utils/dateUtils";

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await eventService.getEvents(user.uid);
      setEvents(data);
    } catch (err) {
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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
    await eventService.deleteEvent(user.uid, eventId);
  };

  const saveMultipleEvents = async (
    toSave: Array<Omit<EventItem, "id" | "createdAt" | "updatedAt"> & { id?: string }>,
    toDeleteIds: string[] = []
  ) => {
    if (!user) throw new Error("Chưa đăng nhập");
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
    refreshEvents: fetchEvents,
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
