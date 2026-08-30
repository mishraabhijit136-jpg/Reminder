import { AppSettings, CustomToneConfig, Task } from '../types';
import { BUILT_IN_TONES } from './audio';

const STORAGE_KEYS = {
  TASKS: 'schedule_app_tasks_v1',
  SETTINGS: 'schedule_app_settings_v1',
  CUSTOM_TONES: 'schedule_app_custom_tones_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'sophisticated',
  masterVolume: 0.85,
  soundEnabled: true,
  repeatAlerts: true,
  alertRepeatTimes: 3,
  browserNotifications: false,
  defaultSoundToneId: 'chime-crystal',
  defaultReminderOffset: 5,
  timeFormat24h: false,
  timelineStartHour: 6,
  timelineEndHour: 23,
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeString(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Generate rich initial sample tasks for today
export function generateSampleTasks(): Task[] {
  const today = getTodayDateString();
  const now = new Date();
  const curHour = now.getHours();
  
  // Calculate relative times so user always sees some upcoming/interactive tasks
  const t1Hour = Math.min(22, Math.max(6, curHour));
  const t1NextHour = Math.min(23, t1Hour + 1);
  const t2NextHour = Math.min(23, t1Hour + 2);
  const t3NextHour = Math.min(23, t1Hour + 3);

  const formatH = (h: number, m: number = 0) => 
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  return [
    {
      id: 'task-1',
      title: 'Morning Focus & Day Review',
      description: 'Review priorities, set top 3 objectives, and check sound notification tones.',
      date: today,
      startTime: formatH(Math.max(6, t1Hour - 2), 0),
      endTime: formatH(Math.max(6, t1Hour - 2), 45),
      category: 'routine',
      priority: 'high',
      completed: true,
      completedAt: new Date(Date.now() - 3600000).toISOString(),
      soundToneId: 'morning-harp',
      reminderOffset: 0,
      recurrence: 'daily',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Deep Work: Project Architecture',
      description: 'Zero distractions focus block. Complete core milestone tasks.',
      date: today,
      startTime: formatH(t1Hour, 0),
      endTime: formatH(t1NextHour, 30),
      category: 'focus',
      priority: 'urgent',
      completed: false,
      soundToneId: 'chime-crystal',
      reminderOffset: 5,
      recurrence: 'weekdays',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Team Sync & Product Strategy',
      description: 'Align sprint priorities and discuss schedule deliverables.',
      date: today,
      startTime: formatH(t1NextHour, 45),
      endTime: formatH(t2NextHour, 30),
      category: 'meeting',
      priority: 'high',
      completed: false,
      soundToneId: 'digital-radar',
      reminderOffset: 10,
      recurrence: 'none',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Hydration & Posture Stretch',
      description: 'Take 5 minutes to stretch, drink water, and rest your eyes.',
      date: today,
      startTime: formatH(t2NextHour, 35),
      endTime: formatH(t2NextHour, 45),
      category: 'health',
      priority: 'medium',
      completed: false,
      soundToneId: 'zen-gong',
      reminderOffset: 0,
      recurrence: 'daily',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'Study & Skill Expansion',
      description: 'Read technical documentation and explore interactive design patterns.',
      date: today,
      startTime: formatH(t3NextHour, 0),
      endTime: formatH(t3NextHour, 50),
      category: 'study',
      priority: 'medium',
      completed: false,
      soundToneId: 'warm-marimba',
      reminderOffset: 5,
      recurrence: 'none',
      createdAt: new Date().toISOString(),
    }
  ];
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      const initial = generateSampleTasks();
      saveTasks(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading tasks:', e);
    return generateSampleTasks();
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error loading settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export function loadCustomTones(): CustomToneConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_TONES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading custom tones:', e);
    return [];
  }
}

export function saveCustomTones(tones: CustomToneConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TONES, JSON.stringify(tones));
  } catch (e) {
    console.error('Error saving custom tones:', e);
  }
}

export function getAllTones(customTones: CustomToneConfig[]): CustomToneConfig[] {
  return [...BUILT_IN_TONES, ...customTones];
}

export function findToneById(id: string, customTones: CustomToneConfig[]): CustomToneConfig {
  const all = getAllTones(customTones);
  return all.find(t => t.id === id) || BUILT_IN_TONES[0];
}
