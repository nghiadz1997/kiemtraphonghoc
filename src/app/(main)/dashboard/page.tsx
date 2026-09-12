"use client";

import React, { useState } from "react";
import { BigDateCard } from "@/components/dashboard/BigDateCard";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { UpcomingWidget } from "@/components/dashboard/UpcomingWidget";
import { TodayTimeline } from "@/components/dashboard/TodayTimeline";
import { TomorrowWidget } from "@/components/dashboard/TomorrowWidget";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { useEvents } from "@/hooks/useEvents";
import { useTasks } from "@/hooks/useTasks";
import { EventModal } from "@/components/calendar/EventModal";
import { EventItem } from "@/types";
import { useToast } from "@/hooks/useToast";

export default function DashboardPage() {
  const {
    todayEvents,
    tomorrowEvents,
    upcomingEvents,
    nextUpcomingEvent,
    loading: eventsLoading,
    saveEvent,
    deleteEvent,
    checkConflicts
  } = useEvents();

  const {
    tasks,
    completedTasks,
    incompleteTasks,
    overdueTasks,
    nearestDeadlineTask,
    loading: tasksLoading
  } = useTasks();

  const { success, error } = useToast();

  const [activeModalEvent, setActiveModalEvent] = useState<EventItem | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const handleOpenEvent = (event: EventItem) => {
    setActiveModalEvent(event);
    setIsEventModalOpen(true);
  };

  const handleAddNewTodayEvent = () => {
    setActiveModalEvent(null);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (
    eventData: Omit<EventItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    try {
      await saveEvent(eventData);
      success("Đã lưu sự kiện thành công!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      error("Không thể lưu sự kiện", msg);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      try {
        await deleteEvent(id);
        success("Đã xóa sự kiện thành công!");
        setIsEventModalOpen(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
        error("Không thể xóa sự kiện", msg);
      }
    }
  };

  if (eventsLoading && tasksLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Phần đầu trang hiển thị cực lớn THỨ... DD/MM/YYYY */}
      <BigDateCard />

      {/* 2. Thống kê nhanh: Việc hôm nay, Lịch sắp tới, Việc quá hạn, Deadline */}
      <StatsCards
        todayEventsCount={todayEvents.length}
        upcomingEventsCount={upcomingEvents.length}
        completedTasksCount={completedTasks.length}
        incompleteTasksCount={incompleteTasks.length}
        overdueTasksCount={overdueTasks.length}
        nearestDeadlineTask={nearestDeadlineTask}
      />

      {/* 3. Grid chính: Widget Sắp diễn ra & Timeline hôm nay & Widget Ngày mai */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Timeline hôm nay */}
        <div className="lg:col-span-2 space-y-6">
          <TodayTimeline
            events={todayEvents}
            onOpenEvent={handleOpenEvent}
            onAddNewEvent={handleAddNewTodayEvent}
          />
        </div>

        {/* Cột phải: Widget Sắp diễn ra & Widget Ngày mai */}
        <div className="space-y-6">
          <UpcomingWidget
            event={nextUpcomingEvent}
            onOpenEventModal={handleOpenEvent}
          />

          <TomorrowWidget
            events={tomorrowEvents}
            onOpenEvent={handleOpenEvent}
          />
        </div>
      </div>

      {/* Modal chi tiết / tạo sự kiện */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setActiveModalEvent(null);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        checkConflicts={checkConflicts}
        initialEvent={activeModalEvent}
      />
    </div>
  );
}
