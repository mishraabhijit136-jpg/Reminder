import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  BellRing, 
  PieChart, 
  Flame,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { Category, Task } from '../types';
import { CATEGORY_METADATA, formatDuration, getNextUpcomingReminder } from '../utils/helpers';

interface DayStatsBarProps {
  tasks: Task[];
  currentTime: Date;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSoundStudio: () => void;
}

export const DayStatsBar: React.FC<DayStatsBarProps> = ({
  tasks,
  currentTime,
  soundEnabled,
  onToggleSound,
  onOpenSoundStudio,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Next upcoming reminder
  const nextReminder = getNextUpcomingReminder(tasks, currentTime);

  // Category counts
  const categoryCounts: Partial<Record<Category, number>> = {};
  tasks.forEach(t => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Progress Box */}
      <div className="p-5 rounded-2xl bg-[#0F0F0F] border border-white/10 shadow-lg shadow-black/40 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Daily Completion
          </span>
          <span className="text-xs font-serif italic text-[#F5F5F0]">
            {completedTasks} / {totalTasks} Tasks ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F5F5F0] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/40">
          <span>{totalTasks - completedTasks} tasks remaining</span>
          <span className="text-[#D4AF37] italic font-serif">{progressPercent === 100 && totalTasks > 0 ? '✦ All tasks completed' : 'Rhythm in progress'}</span>
        </div>
      </div>

      {/* Next Upcoming Reminder Box */}
      <div className="p-5 rounded-2xl bg-[#0F0F0F] border border-white/10 shadow-lg shadow-black/40 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
            <BellRing className="w-3.5 h-3.5 text-[#D4AF37]" /> Next Sound Reminder
          </span>
          {nextReminder && (
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
          )}
        </div>

        {nextReminder ? (
          <div>
            <h4 className="text-sm font-serif italic text-[#F5F5F0] truncate">
              {nextReminder.task.title}
            </h4>
            <p className="text-xs text-[#D4AF37] font-medium mt-0.5">
              Chimes in {nextReminder.minutesRemaining <= 1 ? 'less than a minute' : `~${nextReminder.minutesRemaining} minutes`}
            </p>
          </div>
        ) : (
          <p className="text-xs text-white/40 mt-1 italic">
            No pending reminders scheduled for today.
          </p>
        )}

        <div className="flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/5">
          <span>Auto-alert on scheduled time</span>
          <button
            type="button"
            onClick={onOpenSoundStudio}
            className="text-[#D4AF37] hover:underline font-serif italic text-xs transition-colors"
          >
            Sound Library →
          </button>
        </div>
      </div>

      {/* Sound Reminder Status & Quick Audio Switch */}
      <div className="p-5 rounded-2xl bg-[#0F0F0F] border border-white/10 shadow-lg shadow-black/40 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Sound Synthesizer
          </span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            soundEnabled 
              ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30' 
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}>
            {soundEnabled ? 'ACTIVE' : 'MUTED'}
          </span>
        </div>

        <div className="flex items-center justify-between my-1">
          <div>
            <p className="text-xs font-serif italic text-[#F5F5F0]">
              Web Audio Synthesizer
            </p>
            <p className="text-[11px] text-white/40 mt-0.5">
              {soundEnabled ? 'Custom acoustic tones enabled' : 'Sound reminders temporarily muted'}
            </p>
          </div>

          <button
            id="stats-sound-toggle-btn"
            type="button"
            onClick={onToggleSound}
            className={`p-2.5 rounded-full transition-all ${
              soundEnabled
                ? 'bg-[#D4AF37]/15 text-[#D4AF37] hover:bg-[#D4AF37]/25 border border-[#D4AF37]/30'
                : 'bg-white/5 text-white/30 hover:text-white/70 border border-white/10'
            }`}
            title={soundEnabled ? 'Mute all sound alarms' : 'Enable sound alarms'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/5 no-scrollbar">
          {(Object.keys(categoryCounts) as Category[]).map((cat) => {
            const meta = CATEGORY_METADATA[cat];
            return (
              <span 
                key={cat}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 whitespace-nowrap"
              >
                {meta.label}: <strong className="text-[#D4AF37]">{categoryCounts[cat]}</strong>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
