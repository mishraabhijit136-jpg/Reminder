import React from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Briefcase, GraduationCap, HeartPulse, Palette, Check } from 'lucide-react';
import { Task } from '../types';
import { getTodayDateString } from '../utils/storage';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (tasks: Task[]) => void;
  selectedDate: string;
}

interface TemplatePreset {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  tasks: Array<{
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    category: any;
    priority: any;
    soundToneId: string;
    reminderOffset: any;
  }>;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  selectedDate,
}) => {
  if (!isOpen) return null;

  const TEMPLATES: TemplatePreset[] = [
    {
      id: 'workday-focus',
      title: 'High-Impact Workday & Focus',
      desc: 'Structured 9-to-5 with Pomodoro deep work blocks, sync meetings, and hydration breaks.',
      icon: <Briefcase className="w-5 h-5 text-sky-400" />,
      tasks: [
        {
          title: 'Daily Standup & Priority Planning',
          description: 'Review Jira backlog, set top 3 objectives for the day.',
          startTime: '09:00',
          endTime: '09:30',
          category: 'meeting',
          priority: 'high',
          soundToneId: 'chime-crystal',
          reminderOffset: 5,
        },
        {
          title: 'Deep Work: Core Feature Implementation',
          description: 'Zero distractions, Slack on DND, focused code sprint.',
          startTime: '09:45',
          endTime: '12:00',
          category: 'focus',
          priority: 'urgent',
          soundToneId: 'digital-radar',
          reminderOffset: 5,
        },
        {
          title: 'Healthy Lunch & Mindful Walk',
          description: 'Step away from screen, hydrate, and stretch.',
          startTime: '12:15',
          endTime: '13:15',
          category: 'health',
          priority: 'medium',
          soundToneId: 'zen-gong',
          reminderOffset: 0,
        },
        {
          title: 'Team Collaboration & Architecture Review',
          description: 'Cross-functional review with design and engineering.',
          startTime: '13:30',
          endTime: '14:30',
          category: 'work',
          priority: 'high',
          soundToneId: 'warm-marimba',
          reminderOffset: 10,
        },
        {
          title: 'Deep Work: Testing & Bug Fixes',
          description: 'Run integration test suite and address pull request comments.',
          startTime: '15:00',
          endTime: '17:00',
          category: 'focus',
          priority: 'high',
          soundToneId: 'cosmic-melody',
          reminderOffset: 5,
        },
        {
          title: 'Day Wrap-Up & Tomorrow Planning',
          description: 'Log progress, clear inbox, and set tomorrow morning tasks.',
          startTime: '17:15',
          endTime: '17:45',
          category: 'routine',
          priority: 'medium',
          soundToneId: 'morning-harp',
          reminderOffset: 0,
        }
      ]
    },
    {
      id: 'student-study',
      title: 'Deep Study & Exam Prep',
      desc: 'Active recall sessions, spaced repetition, lecture notes revision, and brain recharge breaks.',
      icon: <GraduationCap className="w-5 h-5 text-amber-400" />,
      tasks: [
        {
          title: 'Morning Flashcards & Spaced Repetition',
          description: 'Review Anki decks and key formula cheat sheets.',
          startTime: '08:30',
          endTime: '09:30',
          category: 'study',
          priority: 'high',
          soundToneId: 'chime-crystal',
          reminderOffset: 5,
        },
        {
          title: 'Lecture Topic Deep Dive & Notes',
          description: 'Work through complex theoretical concepts and practice problems.',
          startTime: '10:00',
          endTime: '12:00',
          category: 'study',
          priority: 'urgent',
          soundToneId: 'digital-radar',
          reminderOffset: 5,
        },
        {
          title: 'Nutritious Lunch & Brain Rest',
          description: 'Rest eyes, drink water, prepare for afternoon session.',
          startTime: '12:15',
          endTime: '13:15',
          category: 'health',
          priority: 'medium',
          soundToneId: 'zen-gong',
          reminderOffset: 0,
        },
        {
          title: 'Past Exam Paper Practice (Timed)',
          description: 'Simulate real exam conditions with timer and review mistakes.',
          startTime: '14:00',
          endTime: '16:00',
          category: 'focus',
          priority: 'urgent',
          soundToneId: 'urgent-beacon',
          reminderOffset: 10,
        },
        {
          title: 'Evening Light Review & Relaxation',
          description: 'Summary mind maps and early night sleep preparation.',
          startTime: '19:30',
          endTime: '20:30',
          category: 'routine',
          priority: 'medium',
          soundToneId: 'morning-harp',
          reminderOffset: 0,
        }
      ]
    },
    {
      id: 'healthy-habit',
      title: 'Healthy Habits & Wellness Day',
      desc: 'Balanced routine prioritizing physical exercise, hydration, meditation, and mental clarity.',
      icon: <HeartPulse className="w-5 h-5 text-emerald-400" />,
      tasks: [
        {
          title: 'Morning Sunlight & Breathwork',
          description: '10 min box breathing and gentle mobility yoga.',
          startTime: '07:00',
          endTime: '07:45',
          category: 'health',
          priority: 'high',
          soundToneId: 'zen-gong',
          reminderOffset: 0,
        },
        {
          title: 'Gym Workout / Cardio Session',
          description: 'Strength training and zone 2 cardio.',
          startTime: '08:00',
          endTime: '09:15',
          category: 'health',
          priority: 'high',
          soundToneId: 'warm-marimba',
          reminderOffset: 10,
        },
        {
          title: 'Nutrient-Dense Breakfast & Reading',
          description: 'High protein breakfast and 20 pages of non-fiction book.',
          startTime: '09:30',
          endTime: '10:30',
          category: 'routine',
          priority: 'medium',
          soundToneId: 'morning-harp',
          reminderOffset: 5,
        },
        {
          title: 'Afternoon Outdoor Walk & Hydration Check',
          description: 'Reach 8,000 steps and drink electrolytes.',
          startTime: '15:30',
          endTime: '16:15',
          category: 'health',
          priority: 'medium',
          soundToneId: 'chime-crystal',
          reminderOffset: 5,
        },
        {
          title: 'Digital Sunset & Sleep Prep',
          description: 'Screens off, dim warm lighting, gratitude journaling.',
          startTime: '21:30',
          endTime: '22:15',
          category: 'routine',
          priority: 'high',
          soundToneId: 'zen-gong',
          reminderOffset: 15,
        }
      ]
    }
  ];

  const handleApply = (template: TemplatePreset) => {
    const newTasks: Task[] = template.tasks.map((t, idx) => ({
      id: `task-tpl-${Date.now()}-${idx}`,
      title: t.title,
      description: t.description,
      date: selectedDate,
      startTime: t.startTime,
      endTime: t.endTime,
      category: t.category,
      priority: t.priority,
      soundToneId: t.soundToneId,
      reminderOffset: t.reminderOffset,
      completed: false,
      recurrence: 'none',
      createdAt: new Date().toISOString(),
    }));

    onApplyTemplate(newTasks);
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
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0A0A0A]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-base font-serif italic text-[#F5F5F0]">
              Schedule Architectures & Templates
            </h2>
          </div>

          <button
            id="template-modal-close-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-white/50">
            Choose an artisanal day schedule template with pre-configured acoustic reminder alarms for <strong className="text-[#D4AF37] font-serif italic">{selectedDate}</strong>:
          </p>

          <div className="grid grid-cols-1 gap-3.5">
            {TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl border border-white/10 bg-[#0A0A0A] hover:border-[#D4AF37]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-white/5 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#D4AF37]">
                    {tpl.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-serif italic text-[#F5F5F0]">
                      {tpl.title}
                    </h3>
                    <p className="text-xs text-white/50 mt-1 font-sans">
                      {tpl.desc}
                    </p>
                    <span className="inline-block text-[11px] text-[#D4AF37] mt-1.5 font-mono">
                      {tpl.tasks.length} scheduled time-blocks with customized chimes
                    </span>
                  </div>
                </div>

                <button
                  id={`apply-template-${tpl.id}-btn`}
                  type="button"
                  onClick={() => handleApply(tpl)}
                  className="px-5 py-2.5 rounded-full bg-[#D4AF37] hover:bg-[#C5A028] text-black text-xs font-bold uppercase tracking-widest shadow-md shadow-[#D4AF37]/20 flex items-center gap-1.5 whitespace-nowrap self-end sm:self-center transition-transform hover:scale-102"
                >
                  <Check className="w-3.5 h-3.5" /> Apply Template
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
