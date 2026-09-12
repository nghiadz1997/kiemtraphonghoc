import { CategoryItem, EventType } from "@/types";

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: "cat_study",
    userId: "system",
    name: "Học tập",
    color: "#2563eb", // Xanh dương
    icon: "GraduationCap",
    isDefault: true
  },
  {
    id: "cat_work",
    userId: "system",
    name: "Công việc",
    color: "#f97316", // Cam
    icon: "Briefcase",
    isDefault: true
  },
  {
    id: "cat_deadline",
    userId: "system",
    name: "Deadline",
    color: "#ef4444", // Đỏ
    icon: "ClockAlert",
    isDefault: true
  },
  {
    id: "cat_meeting",
    userId: "system",
    name: "Họp",
    color: "#a855f7", // Tím
    icon: "Users",
    isDefault: true
  },
  {
    id: "cat_personal",
    userId: "system",
    name: "Cá nhân",
    color: "#22c55e", // Xanh lá
    icon: "User",
    isDefault: true
  },
  {
    id: "cat_online",
    userId: "system",
    name: "Online",
    color: "#06b6d4", // Cyan
    icon: "Globe",
    isDefault: true
  }
];

export const EVENT_TYPE_MAP: Record<EventType, { label: string; color: string; bgClass: string; textClass: string; borderClass: string; icon: string }> = {
  study: {
    label: "Học tập",
    color: "#2563eb",
    bgClass: "bg-blue-500/10 dark:bg-blue-500/20",
    textClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-500/30",
    icon: "GraduationCap"
  },
  work: {
    label: "Công việc",
    color: "#f97316",
    bgClass: "bg-orange-500/10 dark:bg-orange-500/20",
    textClass: "text-orange-600 dark:text-orange-400",
    borderClass: "border-orange-500/30",
    icon: "Briefcase"
  },
  deadline: {
    label: "Deadline",
    color: "#ef4444",
    bgClass: "bg-red-500/10 dark:bg-red-500/20",
    textClass: "text-red-600 dark:text-red-400",
    borderClass: "border-red-500/30",
    icon: "AlertCircle"
  },
  meeting: {
    label: "Họp",
    color: "#a855f7",
    bgClass: "bg-purple-500/10 dark:bg-purple-500/20",
    textClass: "text-purple-600 dark:text-purple-400",
    borderClass: "border-purple-500/30",
    icon: "Users"
  },
  personal: {
    label: "Cá nhân",
    color: "#22c55e",
    bgClass: "bg-green-500/10 dark:bg-green-500/20",
    textClass: "text-green-600 dark:text-green-400",
    borderClass: "border-green-500/30",
    icon: "User"
  },
  online: {
    label: "Online",
    color: "#06b6d4",
    bgClass: "bg-cyan-500/10 dark:bg-cyan-500/20",
    textClass: "text-cyan-600 dark:text-cyan-400",
    borderClass: "border-cyan-500/30",
    icon: "Globe"
  },
  other: {
    label: "Khác",
    color: "#64748b",
    bgClass: "bg-slate-500/10 dark:bg-slate-500/20",
    textClass: "text-slate-600 dark:text-slate-400",
    borderClass: "border-slate-500/30",
    icon: "Tag"
  }
};

export const PRIORITY_MAP = {
  low: { label: "Thấp", color: "#64748b", bg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  normal: { label: "Bình thường", color: "#3b82f6", bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  high: { label: "Cao", color: "#f59e0b", bg: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  urgent: { label: "Khẩn cấp", color: "#ef4444", bg: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" }
};
