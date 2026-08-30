/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  ListOrdered, 
  LayoutDashboard, 
  Sparkles, 
  Plus, 
  Volume2, 
  VolumeX, 
  Music, 
  SlidersHorizontal,
  BellRing,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  AppSettings, 
  CustomToneConfig, 
  ReminderOffset, 
  Task, 
  ThemeId 
} from './types';
import { 
  DEFAULT_SETTINGS, 
  findToneById, 
  generateSampleTasks, 
  getTodayDateString, 
  loadCustomTones, 
  loadSettings, 
  loadTasks, 
  saveCustomTones, 
  saveSettings, 
  saveTasks 
} from './utils/storage';
import { unlockAudio, playTone, sendBrowserNotification } from './utils/audio';
import { isTaskDueNow, formatTimeDisplay } from './utils/helpers';
import { Header } from './components/Header';
import { DayStatsBar } from './components/DayStatsBar';
import { ScheduleTimeline } from './components/ScheduleTimeline';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { SoundStudioModal } from './components/SoundStudioModal';
import { ActiveAlarmModal } from './components/ActiveAlarmModal';
import { TemplateModal } from './components/TemplateModal';

export default function App() {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [customTones, setCustomTones] = useState<CustomToneConfig[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSoundStudioOpen, setIsSoundStudioOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeAlarmTask, setActiveAlarmTask] = useState<Task | null>(null);

  // Initial Load from Storage
  useEffect(() => {
    const storedTasks = loadTasks();
    const storedSettings = loadSettings();
    const storedTones = loadCustomTones();

    setTasks(storedTasks);
    setSettings(storedSettings);
    setCustomTones(storedTones);
  }, []);

  // Save changes
  useEffect(() => {
    if (tasks.length > 0) saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveCustomTones(customTones);
  }, [customTones]);

  // Master Clock & Live Alarm Reminder Engine
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check all tasks for scheduled sound reminders
      tasks.forEach((task) => {
        if (!task.completed && isTaskDueNow(task, now)) {
          // Check if already active or triggered this exact minute
          if (!activeAlarmTask || activeAlarmTask.id !== task.id) {
            triggerAlarm(task);
          }
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [tasks, activeAlarmTask, settings]);

  // Unlock Web Audio on first global user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      unlockAudio();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Keyboard Shortcuts (N for new task, T for today, Space for dismiss/test)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        unlockAudio();
        handleOpenNewTask();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setSelectedDate(getTodayDateString());
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        unlockAudio();
        setIsSoundStudioOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Trigger sound alarm for a task
  const triggerAlarm = useCallback((task: Task) => {
    unlockAudio();
    setActiveAlarmTask(task);

    // Also trigger browser push notification if enabled
    if (settings.browserNotifications) {
      sendBrowserNotification(`⏰ Reminder: ${task.title}`, {
        body: `${formatTimeDisplay(task.startTime, settings.timeFormat24h)} - ${task.description || 'Scheduled task due now'}`,
      });
    }
  }, [settings]);

  // Tasks for currently selected day
  const currentDayTasks = useMemo(() => {
    return tasks.filter((t) => t.date === selectedDate);
  }, [tasks, selectedDate]);

  // Handlers for Task CRUD
  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } as Task : t));
    } else {
      setTasks(prev => [...prev, taskData as Task]);
    }
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeAlarmTask?.id === id) {
      setActiveAlarmTask(null);
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const isNowCompleted = !t.completed;
        if (isNowCompleted) {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#818cf8', '#38bdf8', '#34d399', '#fbbf24'],
            });
          } catch (e) {
            console.warn(e);
          }
        }
        return {
          ...t,
          completed: isNowCompleted,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    }));

    if (activeAlarmTask?.id === id) {
      setActiveAlarmTask(null);
    }
  };

  const handleSnooze = (taskId: string, minutes: number) => {
    const snoozeUntilDate = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, snoozedUntil: snoozeUntilDate } : t));
    setActiveAlarmTask(null);
  };

  const handleOpenNewTask = (hour?: number) => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleApplyTemplate = (newTasks: Task[]) => {
    setTasks(prev => {
      // Filter out non-completed existing tasks on this date to replace cleanly, or append
      const otherDayTasks = prev.filter(t => t.date !== selectedDate);
      return [...otherDayTasks, ...newTasks];
    });
  };

  const handleResetSampleSchedule = () => {
    if (window.confirm('Reset current day with standard sample schedule?')) {
      const samples = generateSampleTasks();
      setTasks(samples);
      setSelectedDate(getTodayDateString());
    }
  };

  const handleTestSoundAlert = () => {
    const dummyTask: Task = {
      id: 'test-reminder-alert',
      title: 'Sound Reminder Test Alert',
      description: 'Audio synthesizer is active with customizable tones and responsive dark UI.',
      date: selectedDate,
      startTime: '10:00',
      endTime: '11:00',
      category: 'focus',
      priority: 'urgent',
      completed: false,
      soundToneId: settings.defaultSoundToneId,
      reminderOffset: 0,
      recurrence: 'none',
      createdAt: new Date().toISOString(),
    };
    triggerAlarm(dummyTask);
  };

  // Theme atmosphere CSS classes mapping
  const getThemeClass = (theme: ThemeId): string => {
    switch (theme) {
      case 'sophisticated':
        return 'bg-[#0A0A0A] text-[#E0E0E0] selection:bg-[#D4AF37] selection:text-black';
      case 'midnight':
        return 'bg-[#0a0b16] text-neutral-100 selection:bg-violet-500';
      case 'forest':
        return 'bg-[#08120e] text-neutral-100 selection:bg-emerald-500';
      case 'cyber':
        return 'bg-[#120f09] text-neutral-100 selection:bg-amber-500';
      case 'espresso':
        return 'bg-[#140e0b] text-neutral-100 selection:bg-orange-500';
      case 'light':
        return 'bg-slate-50 text-neutral-900 selection:bg-indigo-500';
      case 'onyx':
      default:
        return 'bg-[#0A0A0A] text-[#E0E0E0] selection:bg-[#D4AF37] selection:text-black';
    }
  };

  const isToday = selectedDate === getTodayDateString();
  const currentAlarmTone = activeAlarmTask 
    ? findToneById(activeAlarmTask.soundToneId, customTones)
    : findToneById(settings.defaultSoundToneId, customTones);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${getThemeClass(settings.theme)}`}>
      {/* Sticky App Header */}
      <Header
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings(prev => ({ ...prev, ...newVals }))}
        onOpenNewTask={() => handleOpenNewTask()}
        onOpenSoundStudio={() => setIsSoundStudioOpen(true)}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onTestSoundAlert={handleTestSoundAlert}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Daily Completion & Live Sound Stats Bar */}
        <DayStatsBar
          tasks={currentDayTasks}
          currentTime={currentTime}
          soundEnabled={settings.soundEnabled}
          onToggleSound={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
          onOpenSoundStudio={() => setIsSoundStudioOpen(true)}
        />

        {/* Schedule View Controls Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 rounded-2xl bg-[#0F0F0F] border border-white/10 shadow-lg shadow-black/40">
          {/* View Mode Switcher (Timeline 24h vs Structured List) */}
          <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-full border border-white/10 w-full sm:w-auto">
            <button
              id="view-timeline-tab-btn"
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                viewMode === 'timeline'
                  ? 'bg-[#D4AF37] text-black shadow-sm'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Timeline Rhythm
            </button>
            <button
              id="view-list-tab-btn"
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                viewMode === 'list'
                  ? 'bg-[#D4AF37] text-black shadow-sm'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              Task List ({currentDayTasks.length})
            </button>
          </div>

          {/* Quick Schedule Actions (Time format toggle, Reset, New Task) */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              id="toggle-time-format-btn"
              type="button"
              onClick={() => setSettings(s => ({ ...s, timeFormat24h: !s.timeFormat24h }))}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-mono border border-white/10 transition-colors"
              title="Toggle 12-hour AM/PM vs 24-hour time format"
            >
              {settings.timeFormat24h ? '24H' : '12H (AM/PM)'}
            </button>

            <button
              id="reset-sample-schedule-btn"
              type="button"
              onClick={handleResetSampleSchedule}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 transition-colors"
              title="Reset Sample Schedule"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              id="main-add-task-btn"
              type="button"
              onClick={() => handleOpenNewTask()}
              className="px-5 py-2 rounded-full bg-[#D4AF37] hover:bg-[#C5A028] text-black text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-md shadow-[#D4AF37]/20 transition-all hover:scale-102"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Task
            </button>
          </div>
        </div>

        {/* Main Schedule Content (Timeline or List) */}
        {viewMode === 'timeline' ? (
          <ScheduleTimeline
            tasks={currentDayTasks}
            selectedDate={selectedDate}
            isToday={isToday}
            timeFormat24h={settings.timeFormat24h}
            startHour={settings.timelineStartHour}
            endHour={settings.timelineEndHour}
            customTones={customTones}
            masterVolume={settings.masterVolume}
            onSelectTask={handleEditTask}
            onToggleComplete={handleToggleComplete}
            onAddNewTaskAtHour={(h) => handleOpenNewTask(h)}
            onTriggerAlarmNow={triggerAlarm}
          />
        ) : (
          <TaskList
            tasks={currentDayTasks}
            timeFormat24h={settings.timeFormat24h}
            customTones={customTones}
            masterVolume={settings.masterVolume}
            onSelectTask={handleEditTask}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
            onTriggerAlarmNow={triggerAlarm}
            onAddNewTask={() => handleOpenNewTask()}
          />
        )}

      </main>

      {/* Footer info & shortcut cues */}
      <footer className="py-4 border-t border-white/10 text-center text-xs text-white/30 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em]">
          <div className="flex items-center gap-3">
            <span className="text-[#F5F5F0] font-serif italic text-xs tracking-normal">Chronos</span>
            <span>•</span>
            <span className="text-[#D4AF37]">Premium Scheduler & Synthesizer</span>
          </div>
          <div className="flex items-center gap-4 text-white/40">
            <span>System Status: <strong className="text-[#D4AF37]">Synced & Active</strong></span>
            <span>•</span>
            <span className="font-mono tracking-normal">Shortcuts: [N] New [T] Today [S] Studio</span>
          </div>
        </div>
      </footer>

      {/* Task Creation / Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialTask={editingTask}
        selectedDate={selectedDate}
        customTones={customTones}
        defaultToneId={settings.defaultSoundToneId}
        defaultOffset={settings.defaultReminderOffset}
        masterVolume={settings.masterVolume}
      />

      {/* Sound Reminder Studio & Synthesizer Lab */}
      <SoundStudioModal
        isOpen={isSoundStudioOpen}
        onClose={() => setIsSoundStudioOpen(false)}
        customTones={customTones}
        defaultToneId={settings.defaultSoundToneId}
        masterVolume={settings.masterVolume}
        onSaveCustomTone={(newTone) => {
          setCustomTones(prev => [...prev, newTone]);
        }}
        onDeleteCustomTone={(id) => {
          setCustomTones(prev => prev.filter(t => t.id !== id));
          if (settings.defaultSoundToneId === id) {
            setSettings(s => ({ ...s, defaultSoundToneId: 'chime-crystal' }));
          }
        }}
        onSetDefaultTone={(id) => {
          setSettings(s => ({ ...s, defaultSoundToneId: id }));
        }}
      />

      {/* Active Alarm Reminder Alert Modal */}
      <ActiveAlarmModal
        task={activeAlarmTask}
        tone={currentAlarmTone}
        masterVolume={settings.soundEnabled ? settings.masterVolume : 0}
        repeatAlerts={settings.repeatAlerts}
        alertRepeatTimes={settings.alertRepeatTimes}
        onDismiss={() => setActiveAlarmTask(null)}
        onComplete={(id) => {
          handleToggleComplete(id);
          setActiveAlarmTask(null);
        }}
        onSnooze={handleSnooze}
      />

      {/* Schedule Templates Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onApplyTemplate={handleApplyTemplate}
        selectedDate={selectedDate}
      />
    </div>
  );
}
