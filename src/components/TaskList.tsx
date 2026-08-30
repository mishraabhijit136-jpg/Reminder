import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Volume2, 
  Play, 
  Square,
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  AlertCircle,
  Repeat,
  BellRing,
  Check
} from 'lucide-react';
import { Category, CustomToneConfig, Priority, Task } from '../types';
import { 
  CATEGORY_METADATA, 
  PRIORITY_METADATA, 
  formatTimeDisplay, 
  calculateDurationMinutes,
  formatDuration 
} from '../utils/helpers';
import { getAllTones } from '../utils/storage';
import { playTone } from '../utils/audio';

interface TaskListProps {
  tasks: Task[];
  timeFormat24h: boolean;
  customTones: CustomToneConfig[];
  masterVolume: number;
  onSelectTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onTriggerAlarmNow: (task: Task) => void;
  onAddNewTask: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  timeFormat24h,
  customTones,
  masterVolume,
  onSelectTask,
  onToggleComplete,
  onDeleteTask,
  onTriggerAlarmNow,
  onAddNewTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [playingToneId, setPlayingToneId] = useState<string | null>(null);

  const allTones = getAllTones(customTones);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Sort by startTime
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.startTime.localeCompare(b.startTime);
  });

  const handlePlayTone = (e: React.MouseEvent, toneId: string) => {
    e.stopPropagation();
    const tone = allTones.find(t => t.id === toneId) || allTones[0];
    setPlayingToneId(toneId);
    playTone(tone, masterVolume, () => {
      setPlayingToneId(null);
    });
  };

  const pendingTasks = sortedTasks.filter(t => !t.completed);
  const completedTasks = sortedTasks.filter(t => t.completed);

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-[#0F0F0F] border border-white/10 shadow-lg shadow-black/40">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
          <input
            id="task-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schedule tasks..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-[#0A0A0A] border border-white/10 text-xs text-white/90 focus:outline-none focus:border-[#D4AF37] placeholder:text-white/30"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Category Dropdown */}
          <select
            id="task-category-filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
            className="px-3.5 py-2 rounded-full bg-[#0A0A0A] border border-white/10 text-xs text-white/70 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Categories</option>
            {(Object.keys(CATEGORY_METADATA) as Category[]).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_METADATA[cat].label}
              </option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            id="task-priority-filter-select"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as Priority | 'all')}
            className="px-3.5 py-2 rounded-full bg-[#0A0A0A] border border-white/10 text-xs text-white/70 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List Content */}
      {sortedTasks.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center bg-[#0F0F0F]/60">
          <Clock className="w-10 h-10 text-[#D4AF37]/50 mx-auto mb-3" />
          <h3 className="text-base font-serif italic text-[#F5F5F0]">No scheduled tasks match your filter</h3>
          <p className="text-xs text-white/40 mt-1 mb-5">Try clearing your search query or schedule a new task.</p>
          <button
            type="button"
            onClick={onAddNewTask}
            className="px-6 py-2 rounded-full bg-[#D4AF37] hover:bg-[#C5A028] text-black text-xs font-bold uppercase tracking-widest shadow-md shadow-[#D4AF37]/20"
          >
            Schedule First Task
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                  Active & Scheduled ({pendingTasks.length})
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {pendingTasks.map((task) => {
                  const catMeta = CATEGORY_METADATA[task.category];
                  const priMeta = PRIORITY_METADATA[task.priority];
                  const toneObj = allTones.find(t => t.id === task.soundToneId) || allTones[0];
                  const isPlaying = playingToneId === task.soundToneId;
                  const duration = calculateDurationMinutes(task.startTime, task.endTime);

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl border bg-[#0F0F0F] border-white/10 hover:border-[#D4AF37]/40 shadow-lg shadow-black/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                    >
                      {/* Left: Checkbox & Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => onToggleComplete(task.id)}
                          className="mt-0.5 text-white/30 hover:text-[#D4AF37] transition-colors flex-shrink-0"
                          title="Mark complete"
                        >
                          <Circle className="w-5 h-5 hover:stroke-[#D4AF37]" />
                        </button>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h4 
                              onClick={() => onSelectTask(task)}
                              className="text-base font-serif italic text-[#F5F5F0] hover:text-[#D4AF37] cursor-pointer transition-colors"
                            >
                              {task.title}
                            </h4>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-semibold bg-white/5 border border-white/10 text-white/70">
                              {catMeta.label}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-semibold bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]">
                              {priMeta.label}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-xs text-white/50 line-clamp-1 font-sans">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-xs text-white/40 font-mono">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                              {formatTimeDisplay(task.startTime, timeFormat24h)} - {formatTimeDisplay(task.endTime, timeFormat24h)} ({formatDuration(duration)})
                            </span>
                            {task.reminderOffset > 0 && (
                              <span className="text-[11px] text-[#D4AF37] flex items-center gap-1 font-serif italic">
                                <BellRing className="w-3 h-3" />
                                Alert: {task.reminderOffset}m before
                              </span>
                            )}
                            {task.snoozedUntil && (
                              <span className="text-[11px] text-amber-400 font-sans">
                                💤 Snoozed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Sound Tone & Action Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                        {/* Sound reminder preview button */}
                        <button
                          type="button"
                          onClick={(e) => handlePlayTone(e, task.soundToneId)}
                          className={`px-3 py-1.5 rounded-full bg-[#0A0A0A] hover:bg-[#D4AF37]/20 text-xs text-[#D4AF37] flex items-center gap-2 border border-[#D4AF37]/30 font-serif italic transition-all ${
                            isPlaying ? 'bg-[#D4AF37] text-black font-bold animate-pulse' : ''
                          }`}
                          title="Preview reminder sound"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{toneObj.name}</span>
                          {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current opacity-70" />}
                        </button>

                        {/* Test alarm trigger */}
                        <button
                          type="button"
                          onClick={() => onTriggerAlarmNow(task)}
                          className="p-2 rounded-full bg-white/5 hover:bg-[#D4AF37] hover:text-black text-white/40 transition-colors"
                          title="Ring alarm now"
                        >
                          <BellRing className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => onSelectTask(task)}
                          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                          title="Edit task"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          className="p-2 rounded-full bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Completed Tasks ({completedTasks.length})
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {completedTasks.map((task) => {
                  return (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center justify-between gap-3 opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => onToggleComplete(task.id)}
                          className="text-[#D4AF37] flex-shrink-0"
                          title="Mark incomplete"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>

                        <div className="min-w-0">
                          <span className="text-sm font-serif italic line-through text-white/40">
                            {task.title}
                          </span>
                          <span className="block text-[11px] font-mono text-white/30">
                            {formatTimeDisplay(task.startTime, timeFormat24h)} - {formatTimeDisplay(task.endTime, timeFormat24h)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteTask(task.id)}
                        className="p-2 rounded-full hover:bg-rose-500/20 text-white/30 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
