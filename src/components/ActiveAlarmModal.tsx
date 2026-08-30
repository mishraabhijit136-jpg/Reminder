import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BellRing, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Repeat,
  Music2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomToneConfig, Task } from '../types';
import { CATEGORY_METADATA, formatTimeDisplay } from '../utils/helpers';
import { startAlarmLoop, stopCurrentAlarm, playTone } from '../utils/audio';

interface ActiveAlarmModalProps {
  task: Task | null;
  tone: CustomToneConfig;
  masterVolume: number;
  repeatAlerts: boolean;
  alertRepeatTimes: number;
  onDismiss: () => void;
  onComplete: (taskId: string) => void;
  onSnooze: (taskId: string, minutes: number) => void;
}

export const ActiveAlarmModal: React.FC<ActiveAlarmModalProps> = ({
  task,
  tone,
  masterVolume,
  repeatAlerts,
  alertRepeatTimes,
  onDismiss,
  onComplete,
  onSnooze,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  useEffect(() => {
    if (!task) return;

    // Start playing alarm loop
    const repeats = repeatAlerts ? Math.max(2, alertRepeatTimes) : 1;
    const alarm = startAlarmLoop(tone, isMuted ? 0 : masterVolume, repeats);

    const interval = setInterval(() => {
      setPulseCount(p => (p + 1) % 100);
    }, 400);

    return () => {
      alarm.stop();
      stopCurrentAlarm();
      clearInterval(interval);
    };
  }, [task, tone, masterVolume, repeatAlerts, alertRepeatTimes, isMuted]);

  if (!task) return null;

  const categoryMeta = CATEGORY_METADATA[task.category];

  const handleComplete = () => {
    stopCurrentAlarm();
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#818cf8', '#38bdf8', '#34d399', '#fbbf24'],
      });
    } catch (e) {
      console.warn(e);
    }
    onComplete(task.id);
  };

  const handleSnooze = (minutes: number) => {
    stopCurrentAlarm();
    onSnooze(task.id, minutes);
  };

  const handleDismiss = () => {
    stopCurrentAlarm();
    onDismiss();
  };

  const toggleMute = () => {
    if (!isMuted) {
      stopCurrentAlarm();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      startAlarmLoop(tone, masterVolume, 3);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="active-alarm-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      >
        {/* Pulsing visual glow rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.4, 1.8],
              opacity: [0.25, 0.1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="w-96 h-96 rounded-full bg-[#D4AF37]/20 blur-3xl absolute"
          />
          <motion.div
            animate={{
              scale: [1, 1.6, 2.2],
              opacity: [0.15, 0.05, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5,
            }}
            className="w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl absolute"
          />
        </div>

        <motion.div
          id="active-alarm-dialog"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-lg bg-[#0F0F0F] border border-[#D4AF37]/40 rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/80 text-[#E0E0E0] overflow-hidden"
        >
          {/* Top category & mute bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                {categoryMeta.label}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/50 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                {formatTimeDisplay(task.startTime)} - {formatTimeDisplay(task.endTime)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="alarm-toggle-mute-btn"
                type="button"
                onClick={toggleMute}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title={isMuted ? 'Unmute reminder tone' : 'Mute tone'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#D4AF37] animate-pulse" />}
              </button>
              <button
                id="alarm-close-top-btn"
                type="button"
                onClick={handleDismiss}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Icon with sound animation waves */}
          <div className="flex flex-col items-center text-center my-4">
            <div className="relative mb-4">
              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                  rotate: [-3, 3, -3],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-20 h-20 rounded-full bg-[#0A0A0A] border-2 border-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 text-[#D4AF37]"
              >
                <BellRing className="w-9 h-9" />
              </motion.div>
              
              {/* Sound wave bars */}
              <div className="flex items-center justify-center gap-1 mt-3 h-5">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: isMuted ? 4 : [4, 16 + (i % 3) * 4, 6],
                    }}
                    transition={{
                      duration: 0.4 + (i * 0.1),
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-1 rounded-full bg-[#D4AF37]"
                  />
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-serif italic text-[#F5F5F0] mb-2 leading-snug">
              {task.title}
            </h2>

            {task.description && (
              <p className="text-xs text-white/50 max-w-sm mb-3 font-sans">
                {task.description}
              </p>
            )}

            {/* Playing sound tone banner */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0A0A] border border-[#D4AF37]/30 text-xs text-[#D4AF37] font-serif italic">
              <Music2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Chiming: <strong>{tone.name}</strong></span>
              <button 
                type="button"
                onClick={() => playTone(tone, masterVolume)}
                className="underline hover:text-white ml-1 text-xs"
              >
                Replay
              </button>
            </div>
          </div>

          {/* Snooze options quick selector */}
          <div className="mb-6 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Repeat className="w-3 h-3 text-[#D4AF37]" /> Snooze Reminder
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[2, 5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  id={`alarm-snooze-${mins}m-btn`}
                  type="button"
                  onClick={() => handleSnooze(mins)}
                  className="py-2 px-3 rounded-full bg-white/5 hover:bg-[#D4AF37]/15 text-xs font-semibold text-white/70 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/40 transition-all hover:scale-102"
                >
                  +{mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Action primary buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              id="alarm-complete-task-btn"
              type="button"
              onClick={handleComplete}
              className="w-full flex-1 py-3 px-6 rounded-full bg-[#D4AF37] hover:bg-[#C5A028] text-black font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#D4AF37]/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Completed
            </button>
            <button
              id="alarm-dismiss-btn"
              type="button"
              onClick={handleDismiss}
              className="w-full sm:w-auto py-3 px-6 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-semibold text-xs transition-colors border border-white/10"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
