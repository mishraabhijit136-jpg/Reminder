import { Category, Priority, Task } from '../types';

export const CATEGORY_METADATA: Record<Category, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}> = {
  work: {
    label: 'Work',
    color: '#38bdf8', // sky-400
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    badgeBg: 'bg-sky-500/20',
    badgeText: 'text-sky-300',
    dotColor: 'bg-sky-400',
  },
  personal: {
    label: 'Personal',
    color: '#a855f7', // purple-500
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-300',
    dotColor: 'bg-purple-400',
  },
  health: {
    label: 'Health & Fitness',
    color: '#34d399', // emerald-400
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    dotColor: 'bg-emerald-400',
  },
  study: {
    label: 'Study & Learning',
    color: '#fbbf24', // amber-400
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    dotColor: 'bg-amber-400',
  },
  meeting: {
    label: 'Meeting',
    color: '#f472b6', // pink-400
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    badgeBg: 'bg-pink-500/20',
    badgeText: 'text-pink-300',
    dotColor: 'bg-pink-400',
  },
  routine: {
    label: 'Daily Routine',
    color: '#2dd4bf', // teal-400
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    badgeBg: 'bg-teal-500/20',
    badgeText: 'text-teal-300',
    dotColor: 'bg-teal-400',
  },
  focus: {
    label: 'Deep Focus',
    color: '#818cf8', // indigo-400
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    badgeBg: 'bg-indigo-500/20',
    badgeText: 'text-indigo-300',
    dotColor: 'bg-indigo-400',
  },
};

export const PRIORITY_METADATA: Record<Priority, {
  label: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
  rank: number;
}> = {
  urgent: {
    label: 'Urgent',
    badgeBg: 'bg-rose-500/20',
    badgeText: 'text-rose-300',
    borderAccent: 'border-l-4 border-l-rose-500',
    rank: 4,
  },
  high: {
    label: 'High',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    borderAccent: 'border-l-4 border-l-amber-500',
    rank: 3,
  },
  medium: {
    label: 'Medium',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-300',
    borderAccent: 'border-l-4 border-l-blue-500',
    rank: 2,
  },
  low: {
    label: 'Low',
    badgeBg: 'bg-neutral-500/20',
    badgeText: 'text-neutral-400',
    borderAccent: 'border-l-4 border-l-neutral-600',
    rank: 1,
  },
};

export function formatTimeDisplay(timeStr: string, is24h: boolean = false): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  
  if (is24h) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function parseMinutesFromTime(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function calculateDurationMinutes(startTime: string, endTime: string): number {
  const start = parseMinutesFromTime(startTime);
  const end = parseMinutesFromTime(endTime);
  if (end < start) {
    return (1440 - start) + end; // crosses midnight
  }
  return Math.max(1, end - start);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function getReminderExactDateTime(task: Task): Date {
  const [year, month, day] = task.date.split('-').map(Number);
  const [hours, minutes] = task.startTime.split(':').map(Number);
  
  const taskStart = new Date(year, month - 1, day, hours, minutes, 0, 0);
  const reminderTime = new Date(taskStart.getTime() - (task.reminderOffset * 60 * 1000));
  return reminderTime;
}

export function isTaskDueNow(task: Task, now: Date = new Date()): boolean {
  if (task.completed) return false;
  
  // If snoozed, check snooze time
  if (task.snoozedUntil) {
    const snoozeTime = new Date(task.snoozedUntil);
    return now.getTime() >= snoozeTime.getTime() && (now.getTime() - snoozeTime.getTime() < 300000); // 5 min window
  }

  // Calculate reminder time
  const reminderTime = getReminderExactDateTime(task);
  const diffMs = now.getTime() - reminderTime.getTime();
  
  // Due if current time is within [0, 60 seconds] of reminder time or just triggered
  return diffMs >= 0 && diffMs <= 60000;
}

export function getNextUpcomingReminder(tasks: Task[], now: Date = new Date()): { task: Task; reminderTime: Date; minutesRemaining: number } | null {
  const pending = tasks.filter(t => !t.completed);
  let closest: { task: Task; reminderTime: Date; minutesRemaining: number } | null = null;

  for (const t of pending) {
    let targetTime = getReminderExactDateTime(t);
    if (t.snoozedUntil) {
      targetTime = new Date(t.snoozedUntil);
    }

    const diffMs = targetTime.getTime() - now.getTime();
    if (diffMs > 0) {
      const minutesRemaining = Math.ceil(diffMs / 60000);
      if (!closest || targetTime.getTime() < closest.reminderTime.getTime()) {
        closest = { task: t, reminderTime: targetTime, minutesRemaining };
      }
    }
  }

  return closest;
}
