import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Clock, 
  Calendar, 
  Tag, 
  AlertCircle, 
  Volume2, 
  Play, 
  Square,
  Repeat, 
  Trash2, 
  Check,
  Music,
  Plus
} from 'lucide-react';
import { Category, CustomToneConfig, Priority, RecurrenceType, ReminderOffset, Task } from '../types';
import { CATEGORY_METADATA, PRIORITY_METADATA } from '../utils/helpers';
import { getAllTones } from '../utils/storage';
import { playTone } from '../utils/audio';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  initialTask?: Task | null;
  selectedDate: string;
  customTones: CustomToneConfig[];
  defaultToneId: string;
  defaultOffset: ReminderOffset;
  masterVolume: number;
}

const REMINDER_OFFSETS: { value: ReminderOffset; label: string }[] = [
  { value: 0, label: 'At event start' },
  { value: 5, label: '5 min before' },
  { value: 10, label: '10 min before' },
  { value: 15, label: '15 min before' },
  { value: 30, label: '30 min before' },
  { value: 60, label: '1 hour before' },
];

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Every Weekday (Mon-Fri)' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'weekly', label: 'Weekly' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTask,
  selectedDate,
  customTones,
  defaultToneId,
  defaultOffset,
  masterVolume,
}) => {
  const allTones = getAllTones(customTones);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<Category>('work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [soundToneId, setSoundToneId] = useState(defaultToneId);
  const [reminderOffset, setReminderOffset] = useState<ReminderOffset>(defaultOffset);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  
  // Audio preview state
  const [playingToneId, setPlayingToneId] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setDate(initialTask.date);
      setStartTime(initialTask.startTime);
      setEndTime(initialTask.endTime);
      setCategory(initialTask.category);
      setPriority(initialTask.priority);
      setSoundToneId(initialTask.soundToneId || defaultToneId);
      setReminderOffset(initialTask.reminderOffset ?? defaultOffset);
      setRecurrence(initialTask.recurrence || 'none');
    } else {
      // New Task defaults
      setTitle('');
      setDescription('');
      setDate(selectedDate);
      
      const now = new Date();
      const curH = now.getHours();
      const nextH = Math.min(23, curH + 1);
      const nextNextH = Math.min(23, curH + 2);
      setStartTime(`${String(nextH).padStart(2, '0')}:00`);
      setEndTime(`${String(nextNextH).padStart(2, '0')}:00`);
      
      setCategory('work');
      setPriority('medium');
      setSoundToneId(defaultToneId);
      setReminderOffset(defaultOffset);
      setRecurrence('none');
    }
  }, [initialTask, isOpen, selectedDate, defaultToneId, defaultOffset]);

  if (!isOpen) return null;

  const handlePreviewTone = (tId: string) => {
    const targetTone = allTones.find(t => t.id === tId) || allTones[0];
    setPlayingToneId(tId);
    playTone(targetTone, masterVolume, () => {
      setPlayingToneId(null);
    });
  };

  const setDuration = (minutes: number) => {
    const [h, m] = startTime.split(':').map(Number);
    const startMins = h * 60 + m;
    const endMins = startMins + minutes;
    const endH = Math.floor((endMins % 1440) / 60);
    const endM = endMins % 60;
    setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialTask?.id || `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      startTime,
      endTime,
      category,
      priority,
      soundToneId,
      reminderOffset,
      recurrence,
      completed: initialTask ? initialTask.completed : false,
      createdAt: initialTask?.createdAt || new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-[#E0E0E0]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0A0A0A]">
          <h2 className="text-base font-serif italic text-[#F5F5F0] flex items-center gap-2">
            {initialTask ? 'Edit Scheduled Task' : 'Schedule New Task'}
          </h2>

          <button
            id="task-modal-close-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">
              Task Title *
            </label>
            <input
              id="task-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Work Sprint, Executive Review, Evening Reflection..."
              required
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D4AF37] placeholder:text-white/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">
              Description / Notes (Optional)
            </label>
            <textarea
              id="task-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key deliverables, meeting notes, or focus intentions..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D4AF37] placeholder:text-white/30 resize-none"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 rounded-2xl bg-[#0A0A0A] border border-white/10">
            <div>
              <label className="block text-xs font-serif italic text-white/60 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> Date
              </label>
              <input
                id="task-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/90 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-serif italic text-white/60 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> Start Time
              </label>
              <input
                id="task-start-time-input"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/90 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-serif italic text-white/60 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> End Time
              </label>
              <input
                id="task-end-time-input"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/90 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Quick duration presets */}
            <div className="sm:col-span-3 flex items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-[11px] text-white/40">Quick Duration:</span>
              {[15, 30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDuration(mins)}
                  className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-[11px] text-white/70 hover:text-white transition-colors"
                >
                  +{mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Category & Priority Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(CATEGORY_METADATA) as Category[]).map((cat) => {
                  const meta = CATEGORY_METADATA[cat];
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/50 ring-1 ring-[#D4AF37]/30'
                          : 'bg-[#0A0A0A] border-white/10 text-white/50 hover:text-white'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#D4AF37]' : 'bg-white/30'}`} />
                      <span className="truncate">{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">
                Priority Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PRIORITY_METADATA) as Priority[]).map((p) => {
                  const meta = PRIORITY_METADATA[p];
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium text-left transition-all ${
                        isSelected
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/50 ring-1 ring-[#D4AF37]/30 font-bold'
                          : 'bg-[#0A0A0A] border-white/10 text-white/50 hover:text-white'
                      }`}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sound Tone & Notification Settings */}
          <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#D4AF37]/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#D4AF37]" /> Sound Reminder Tone
              </span>
              <span className="text-[11px] text-white/40 font-serif italic">
                Acoustic Synthesizer Chimes
              </span>
            </div>

            {/* Tone Selector & inline preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allTones.map((tone) => {
                const isSelected = soundToneId === tone.id;
                const isPlaying = playingToneId === tone.id;

                return (
                  <div
                    key={tone.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37]/60 text-[#D4AF37]'
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                    }`}
                    onClick={() => setSoundToneId(tone.id)}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#D4AF37]' : 'bg-white/30'}`} />
                      <span className="text-xs font-serif italic truncate">{tone.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewTone(tone.id);
                      }}
                      className={`p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors ${
                        isPlaying ? 'text-[#D4AF37] animate-pulse' : ''
                      }`}
                      title="Preview sound tone"
                    >
                      {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Reminder Offset & Recurrence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <div>
                <label className="block text-[11px] font-semibold text-white/50 mb-1">
                  Trigger Reminder Time
                </label>
                <select
                  id="task-reminder-offset-select"
                  value={reminderOffset}
                  onChange={(e) => setReminderOffset(Number(e.target.value) as ReminderOffset)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/90 focus:outline-none focus:border-[#D4AF37]"
                >
                  {REMINDER_OFFSETS.map((off) => (
                    <option key={off.value} value={off.value}>
                      {off.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/50 mb-1">
                  Recurrence
                </label>
                <select
                  id="task-recurrence-select"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/90 focus:outline-none focus:border-[#D4AF37]"
                >
                  {RECURRENCE_OPTIONS.map((rec) => (
                    <option key={rec.value} value={rec.value}>
                      {rec.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {initialTask && onDelete ? (
              <button
                id="task-delete-btn"
                type="button"
                onClick={() => {
                  onDelete(initialTask.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Task
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                id="task-save-submit-btn"
                type="submit"
                className="px-6 py-2 rounded-full bg-[#D4AF37] hover:bg-[#C5A028] text-black text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all hover:scale-102"
              >
                <Check className="w-3.5 h-3.5" />
                {initialTask ? 'Save Changes' : 'Add to Schedule'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
