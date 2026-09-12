export type EventType = 'work' | 'study' | 'meeting' | 'deadline' | 'personal' | 'online' | 'other';
export type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'overdue';
export type StudyFormat = 'Trực tiếp' | 'Online' | 'Điểm cầu';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  dateFormat: string;
  defaultReminderMinutes: number;
  notificationEnabled: boolean;
  language: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  settings: UserSettings;
}

export interface ReminderItem {
  id?: string;
  minutesBefore: number; // 5, 10, 15, 30, 60, 180, 1440, 2880
  label?: string;
  sent?: boolean;
  scheduledAt?: string;
}

export interface StudyInfo {
  subject: string;
  className: string;
  lecturer: string;
  room: string;
  format: StudyFormat;
}

export interface RecurrenceRule {
  frequency: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  until?: string; // ISO date
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, ...
}

export interface EventItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  categoryId?: string;
  type: EventType;
  startDateTime: string; // ISO string YYYY-MM-DDTHH:mm
  endDateTime: string;   // ISO string YYYY-MM-DDTHH:mm
  allDay: boolean;
  location?: string;
  priority: PriorityLevel;
  status: 'confirmed' | 'cancelled' | 'tentative';
  color?: string;
  reminders: ReminderItem[];
  studyInfo?: StudyInfo;
  recurrence?: RecurrenceRule;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO string YYYY-MM-DDTHH:mm or YYYY-MM-DD
  priority: PriorityLevel;
  status: TaskStatus;
  categoryId?: string;
  completed: boolean;
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  isDefault?: boolean;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingEvents: EventItem[];
}
