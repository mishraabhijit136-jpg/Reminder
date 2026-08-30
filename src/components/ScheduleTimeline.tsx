import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  Volume2, 
  Play, 
  Square,
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Plus,
  Repeat
} from 'lucide-react';
import { CustomToneConfig, Task } from '../types';
import { 
  CATEGORY_METADATA, 
  PRIORITY_METADATA, 
  formatTimeDisplay, 
  parseMinutesFromTime,
  calculateDurationMinutes,
  formatDuration 
} from '../utils/helpers';
import { getAllTones } from '../utils/storage';
import { playTone } from '../utils/audio';

interface ScheduleTimelineProps {
  tasks: Task[];
  selectedDate: string;
  isToday: boolean;
  timeFormat24h: boolean;
  startHour?: number;
  endHour?: number;
  customTones: CustomToneConfig[];
  masterVolume: number;
  onSelectTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onAddNewTaskAtHour?: (hour: number) => void;
  onTriggerAlarmNow?: (task: Task) => void;
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({
  tasks,
  selectedDate,
  isToday,
  timeFormat24h,
  startHour = 6,
  endHour = 23,
  customTones,
  masterVolume,
  onSelectTask,
  onToggleComplete,
  onAddNewTaskAtHour,
  onTriggerAlarmNow,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const allTones = getAllTones(customTones);
  const [playingToneId, setPlayingToneId] = React.useState<string | null>(null);

  // Current time position calculation
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinuteOfDay = startHour * 60;
  const totalMinutesInView = (endHour - startHour + 1) * 60;
  const pixelsPerMinute = 2.0; // 120px per hour for spacious breathing room

  const currentLineTop = (currentMinutes - startMinuteOfDay) * pixelsPerMinute;

  // Auto-scroll to current time on mount if today
  useEffect(() => {
    if (isToday && containerRef.current && currentLineTop > 200) {
      containerRef.current.scrollTo({
        top: Math.max(0, currentLineTop - 180),
        behavior: 'smooth',
      });
    }
  }, [isToday]);

  const handlePlayTone = (e: React.MouseEvent, toneId: string) => {
    e.stopPropagation();
    const tone = allTones.find(t => t.id === toneId) || allTones[0];
    setPlayingToneId(toneId);
    playTone(tone, masterVolume, () => {
      setPlayingToneId(null);
    });
  };

  const hoursArray = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i
  );

  return (
    <div 
      id="schedule-timeline-container"
      ref={containerRef}
      className="relative w-full h-[640px] overflow-y-auto bg-[#0F0F0F] border border-white/10 rounded-2xl p-6 shadow-2xl"
    >
      <div 
        className="relative min-h-full"
        style={{ height: `${totalMinutesInView * pixelsPerMinute}px` }}
      >
        {/* Hour Guide Lines & Labels */}
        {hoursArray.map((hour) => {
          const hourMinute = hour * 60;
          const topPosition = (hourMinute - startMinuteOfDay) * pixelsPerMinute;
          const formattedHour = formatTimeDisplay(`${String(hour).padStart(2, '0')}:00`, timeFormat24h);

          return (
            <div
              key={hour}
              className="absolute left-0 right-0 group flex items-start border-t border-white/5 hover:border-[#D4AF37]/30 transition-colors"
              style={{ top: `${topPosition}px`, height: `${60 * pixelsPerMinute}px` }}
            >
              {/* Hour text pill */}
              <div className="w-16 sm:w-24 pr-4 text-right">
                <span className="text-xs font-serif italic text-white/40 group-hover:text-[#D4AF37] transition-colors">
                  {formattedHour}
                </span>
              </div>

              {/* Add slot hover button */}
              <div className="flex-1 h-full relative">
                {onAddNewTaskAtHour && (
                  <button
                    type="button"
                    onClick={() => onAddNewTaskAtHour(hour)}
                    className="absolute top-1 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 px-3 py-1 rounded-full bg-[#0A0A0A] hover:bg-[#D4AF37] hover:text-black text-[10px] uppercase tracking-widest text-white/60 flex items-center gap-1.5 border border-white/10"
                  >
                    <Plus className="w-3 h-3" /> Add Slot
                  </button>
                )}
                {/* 30-min dashed sub-line */}
                <div 
                  className="absolute left-0 right-0 border-t border-white/5"
                  style={{ top: `${30 * pixelsPerMinute}px` }}
                />
              </div>
            </div>
          );
        })}

        {/* Current Time Indicator Line (If selected date is today) */}
        {isToday && currentLineTop >= 0 && currentLineTop <= totalMinutesInView * pixelsPerMinute && (
          <div
            id="current-time-marker-line"
            className="absolute left-0 right-0 z-30 flex items-center pointer-events-none transition-all duration-1000"
            style={{ top: `${currentLineTop}px` }}
          >
            <div className="w-16 sm:w-24 pr-2 flex justify-end">
              <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-[10px] font-bold uppercase tracking-wider text-black font-mono shadow-md shadow-[#D4AF37]/30">
                {formatTimeDisplay(
                  `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                  timeFormat24h
                )}
              </span>
            </div>
            <div className="w-3 h-3 rounded-full bg-[#D4AF37] -ml-1.5 shadow-md shadow-[#D4AF37]/50 animate-ping" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] -ml-2.5" />
            <div className="flex-1 h-[1.5px] bg-gradient-to-r from-[#D4AF37] via-[#D4AF37]/60 to-transparent" />
          </div>
        )}

        {/* Scheduled Task Blocks */}
        <div className="absolute left-16 sm:left-24 right-2 top-0 bottom-0 pointer-events-none">
          {tasks.map((task) => {
            const startMins = parseMinutesFromTime(task.startTime);
            const durationMins = calculateDurationMinutes(task.startTime, task.endTime);
            const top = (startMins - startMinuteOfDay) * pixelsPerMinute;
            const height = Math.max(42, durationMins * pixelsPerMinute);

            // Hide if completely out of bounds
            if (top + height < 0 || top > totalMinutesInView * pixelsPerMinute) {
              return null;
            }

            const categoryMeta = CATEGORY_METADATA[task.category];
            const priorityMeta = PRIORITY_METADATA[task.priority];
            const toneObj = allTones.find(t => t.id === task.soundToneId) || allTones[0];
            const isPlaying = playingToneId === task.soundToneId;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onSelectTask(task)}
                className={`absolute left-2 right-2 rounded-2xl p-4 border transition-all cursor-pointer pointer-events-auto flex flex-col justify-between group overflow-hidden ${
                  task.completed
                    ? 'bg-white/5 border-white/5 opacity-40'
                    : 'bg-white/5 hover:bg-[#D4AF37]/5 border-white/10 hover:border-[#D4AF37]/40 shadow-lg shadow-black/40'
                }`}
                style={{
                  top: `${Math.max(0, top)}px`,
                  height: `${height}px`,
                }}
              >
                {/* Header line */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(task.id);
                      }}
                      className="text-white/40 hover:text-[#D4AF37] transition-colors flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                      ) : (
                        <Circle className="w-4 h-4 hover:stroke-[#D4AF37]" />
                      )}
                    </button>

                    <h4 className={`text-sm sm:text-base font-serif italic truncate ${
                      task.completed ? 'line-through text-white/40' : 'text-[#F5F5F0]'
                    }`}>
                      {task.title}
                    </h4>

                    {task.recurrence !== 'none' && (
                      <span title={`Repeats: ${task.recurrence}`}>
                        <Repeat className="w-3 h-3 text-white/40" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Time & Duration badge */}
                    <span className="text-[10px] font-mono text-white/50 px-2 py-0.5 rounded-full bg-[#0A0A0A] border border-white/10">
                      {formatTimeDisplay(task.startTime, timeFormat24h)} - {formatTimeDisplay(task.endTime, timeFormat24h)} ({formatDuration(durationMins)})
                    </span>

                    {/* Sound tone trigger preview */}
                    <button
                      type="button"
                      onClick={(e) => handlePlayTone(e, task.soundToneId)}
                      className={`px-3 py-1 rounded-full bg-[#0A0A0A]/70 hover:bg-[#D4AF37]/20 text-[#D4AF37] hover:text-[#F5F5F0] transition-all flex items-center gap-1.5 text-xs font-serif italic border border-[#D4AF37]/30 ${
                        isPlaying ? 'bg-[#D4AF37] text-black animate-pulse font-bold' : ''
                      }`}
                      title={`Preview tone: ${toneObj.name}`}
                    >
                      <Volume2 className="w-3 h-3" />
                      <span className="hidden sm:inline text-xs max-w-[80px] truncate">{toneObj.name}</span>
                    </button>
                  </div>
                </div>

                {/* Description & Category Pill */}
                {height > 55 && (
                  <div className="flex items-center justify-between mt-1 text-xs">
                    {task.description ? (
                      <p className="text-xs text-white/40 truncate max-w-[70%] font-sans">
                        {task.description}
                      </p>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
                        {categoryMeta.label}
                      </span>
                      {onTriggerAlarmNow && !task.completed && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTriggerAlarmNow(task);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase tracking-widest text-[#D4AF37] hover:underline"
                        >
                          Trigger Chime
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
