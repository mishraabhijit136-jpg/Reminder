export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Category = 
  | 'work'
  | 'personal'
  | 'health'
  | 'study'
  | 'meeting'
  | 'routine'
  | 'focus';

export type ReminderOffset = 0 | 5 | 10 | 15 | 30 | 60; // minutes before start

export type RecurrenceType = 'none' | 'daily' | 'weekdays' | 'weekends' | 'weekly';

export type WaveformType = 'sine' | 'triangle' | 'square' | 'sawtooth' | 'organ' | 'bell';

export type MelodyPattern = 
  | 'single-bell'
  | 'double-pulse'
  | 'ascending-arpeggio'
  | 'descending-cascade'
  | 'triple-alert'
  | 'trill-pulse'
  | 'zen-gong'
  | 'subtle-tap';

export interface CustomToneConfig {
  id: string;
  name: string;
  isBuiltIn?: boolean;
  waveform: WaveformType;
  baseFrequency: number; // Hz, e.g., 440 (A4), 523 (C5), 880 (A5)
  pattern: MelodyPattern;
  tempo: number; // speed multiplier: 0.5 (slow) to 2.0 (fast)
  decay: number; // seconds: 0.2 to 4.0
  harmonicRichness: number; // 0 (pure) to 1.0 (rich overtones)
  volume: number; // 0.1 to 1.0
  repeatCount?: number; // times to repeat sequence
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  endTime: string; // HH:mm (24h)
  category: Category;
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  
  // Reminder settings
  soundToneId: string; // points to built-in or custom tone ID
  reminderOffset: ReminderOffset; // minutes before start time
  reminderTriggered?: boolean;
  snoozedUntil?: string; // ISO string if snoozed
  
  // Recurrence
  recurrence: RecurrenceType;
  
  // Metadata
  createdAt: string;
  colorTag?: string;
}

export type ThemeId = 'sophisticated' | 'onyx' | 'midnight' | 'forest' | 'cyber' | 'espresso' | 'light';

export interface AppSettings {
  theme: ThemeId;
  masterVolume: number; // 0 to 1
  soundEnabled: boolean;
  repeatAlerts: boolean;
  alertRepeatTimes: number; // 1 to 5
  browserNotifications: boolean;
  defaultSoundToneId: string;
  defaultReminderOffset: ReminderOffset;
  timeFormat24h: boolean;
  timelineStartHour: number; // default 6 (06:00)
  timelineEndHour: number; // default 23 (23:00)
}

export interface ScheduleStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalScheduledMinutes: number;
  completedMinutes: number;
  categoryDistribution: Record<Category, number>;
}
