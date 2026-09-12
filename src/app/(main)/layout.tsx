"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { QuickAddModal } from "@/components/quick-add/QuickAddModal";
import { GlobalSearchModal } from "@/components/layout/GlobalSearchModal";
import { EventModal } from "@/components/calendar/EventModal";
import { TaskModal } from "@/components/tasks/TaskModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/hooks/useToast";
import { EventItem, TaskItem } from "@/types";
import { Loader2 } from "lucide-react";

import { useNotificationWatcher } from "@/hooks/useNotificationWatcher";
import { PwaInstallModal } from "@/components/pwa/PwaInstallModal";
import { DayScheduleModal } from "@/components/calendar/DayScheduleModal";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { events, saveEvent, deleteEvent, saveMultipleEvents, checkConflicts } = useEvents();
  const { tasks, saveTask, deleteTask } = useTasks();
  const { success, error } = useToast();

  // Kích hoạt watcher theo dõi sự kiện sắp tới và gửi thông báo điện thoại
  useNotificationWatcher(events);

  // Redirect to /login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Modal states
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [isDayScheduleModalOpen, setIsDayScheduleModalOpen] = useState(false);
  const [dayScheduleDate, setDayScheduleDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Lắng nghe sự kiện mở modal từ các trang con (Today, Dashboard, Calendar)
  useEffect(() => {
    const handleOpenDaySchedule = (e: any) => {
      if (e.detail?.date) {
        setDayScheduleDate(e.detail.date);
      } else {
        setDayScheduleDate(new Date().toISOString().split("T")[0]);
      }
      setIsDayScheduleModalOpen(true);
    };

    const handleOpenPwa = () => {
      setIsPwaModalOpen(true);
    };

    window.addEventListener("congivec:openDaySchedule", handleOpenDaySchedule);
    window.addEventListener("congivec:openPwaInstall", handleOpenPwa);

    return () => {
      window.removeEventListener("congivec:openDaySchedule", handleOpenDaySchedule);
      window.removeEventListener("congivec:openPwaInstall", handleOpenPwa);
    };
  }, []);

  // Confirm delete dialog state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: "event" | "task" | null;
    id: string | null;
    title: string;
  }>({ isOpen: false, type: null, id: null, title: "" });

  // Global Keyboard shortcuts (Ctrl+K -> Search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSaveEvent = async (
    event: Omit<EventItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    try {
      await saveEvent(event);
      success(
        event.id ? "Cập nhật lịch thành công!" : "Tạo lịch thành công!",
        event.title
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      error("Không thể lưu sự kiện", msg);
    }
  };

  const handleSaveTask = async (
    task: Omit<TaskItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    try {
      await saveTask(task);
      success(
        task.id ? "Cập nhật công việc thành công!" : "Tạo công việc thành công!",
        task.title
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      error("Không thể lưu công việc", msg);
    }
  };

  const requestDeleteEvent = (eventId: string) => {
    const ev = events.find((e) => e.id === eventId);
    setDeleteConfirm({
      isOpen: true,
      type: "event",
      id: eventId,
      title: ev ? ev.title : "sự kiện này"
    });
    setIsEventModalOpen(false);
  };

  const requestDeleteTask = (taskId: string) => {
    const t = tasks.find((item) => item.id === taskId);
    setDeleteConfirm({
      isOpen: true,
      type: "task",
      id: taskId,
      title: t ? t.title : "công việc này"
    });
    setIsTaskModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      if (deleteConfirm.type === "event") {
        await deleteEvent(deleteConfirm.id);
        success("Đã xóa lịch thành công!");
      } else if (deleteConfirm.type === "task") {
        await deleteTask(deleteConfirm.id);
        success("Đã xóa công việc thành công!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      error("Không thể xóa", msg);
    } finally {
      setDeleteConfirm({ isOpen: false, type: null, id: null, title: "" });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="flex flex-col items-center gap-3 text-blue-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Đang kiểm tra xác thực Firebase...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50/50 dark:bg-black w-full max-w-[100vw] overflow-x-hidden relative">
      {/* Desktop Sidebar */}
      <Sidebar onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full pb-24 lg:pb-8 overflow-x-hidden">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenInstallModal={() => setIsPwaModalOpen(true)}
        />

        <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSaveEvent={handleSaveEvent}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        events={events}
        tasks={tasks}
        onSelectEvent={(ev) => {
          setSelectedEvent(ev);
          setIsEventModalOpen(true);
        }}
        onSelectTask={(t) => {
          setSelectedTask(t);
          setIsTaskModalOpen(true);
        }}
      />

      {/* Event Details/Edit Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        onSave={handleSaveEvent}
        onDelete={requestDeleteEvent}
        checkConflicts={checkConflicts}
        initialEvent={selectedEvent}
      />

      {/* Task Details/Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={requestDeleteTask}
        initialTask={selectedTask}
      />

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, type: null, id: null, title: "" })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa "${deleteConfirm.title}" không? Dữ liệu đã xóa sẽ không thể phục hồi.`}
      />

      {/* Chỉnh sửa nhiều lịch trong ngày Modal */}
      <DayScheduleModal
        isOpen={isDayScheduleModalOpen}
        onClose={() => setIsDayScheduleModalOpen(false)}
        initialDate={dayScheduleDate}
        allEvents={events}
        onSaveDayEvents={async (toSave, toDeleteIds) => {
          await saveMultipleEvents(toSave, toDeleteIds);
        }}
      />

      {/* Cài đặt App & Bật thông báo di động Modal */}
      <PwaInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        events={events}
      />
    </div>
  );
}
