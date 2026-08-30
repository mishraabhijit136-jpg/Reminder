import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Volume2, 
  VolumeX, 
  Music, 
  Sliders, 
  Sparkles, 
  Moon, 
  Sun, 
  Bell, 
  BellRing,
  Clock
} from 'lucide-react';
import { AppSettings, ThemeId } from '../types';
import { getTodayDateString } from '../utils/storage';
import { unlockAudio, sendBrowserNotification } from '../utils/audio';

interface HeaderProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenNewTask: () => void;
  onOpenSoundStudio: () => void;
  onOpenTemplates: () => void;
  onTestSoundAlert: () => void;
}

const THEME_OPTIONS: { id: ThemeId; label: string; icon: string; dot: string }[] = [
  { id: 'sophisticated', label: 'Sophisticated Dark', icon: '👑', dot: 'bg-[#D4AF37]' },
  { id: 'onyx', label: 'Onyx Dark', icon: '🌌', dot: 'bg-neutral-400' },
  { id: 'midnight', label: 'Midnight Violet', icon: '🔮', dot: 'bg-indigo-500' },
  { id: 'forest', label: 'Deep Forest', icon: '🌲', dot: 'bg-emerald-500' },
  { id: 'cyber', label: 'Cyber Dusk', icon: '⚡', dot: 'bg-amber-500' },
  { id: 'espresso', label: 'Espresso Warm', icon: '☕', dot: 'bg-yellow-700' },
  { id: 'light', label: 'Clean Light', icon: '☀️', dot: 'bg-sky-400' },
];

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onSelectDate,
  settings,
  onUpdateSettings,
  onOpenNewTask,
  onOpenSoundStudio,
  onOpenTemplates,
  onTestSoundAlert,
}) => {
  const [liveTime, setLiveTime] = useState(new Date());
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showSoundPopover, setShowSoundPopover] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;

  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    onSelectDate(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    onSelectDate(date.toISOString().split('T')[0]);
  };

  const handleGoToday = () => {
    onSelectDate(todayStr);
  };

  const formattedDisplayDate = (() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  })();

  const formatLiveClock = () => {
    const hours = settings.timeFormat24h 
      ? String(liveTime.getHours()).padStart(2, '0')
      : liveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return hours;
  };

  const handleToggleNotifications = async () => {
    if (!settings.browserNotifications) {
      await sendBrowserNotification('Sound Reminders Active', {
        body: 'You will receive audible and visual notifications for scheduled tasks.',
      });
      onUpdateSettings({ browserNotifications: true });
    } else {
      onUpdateSettings({ browserNotifications: false });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0F0F0F] backdrop-blur-md border-b border-white/10 px-6 lg:px-8 py-4 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Live Digital Clock */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3.5">
            <div 
              onClick={() => {
                unlockAudio();
                onOpenSoundStudio();
              }}
              className="w-10 h-10 rounded-full border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-serif italic text-xl cursor-pointer hover:bg-[#D4AF37]/10 transition-all shadow-md shadow-[#D4AF37]/10"
              title="Click to open Sound Reminder Studio"
            >
              C
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif italic tracking-wide text-[#F5F5F0]">
                  Chronos
                </h1>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] px-2 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 font-sans">
                  Sound Rhythm
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 flex items-center gap-1.5 font-sans mt-0.5">
                <Clock className="w-3 h-3 text-[#D4AF37]" />
                <span className="text-white/80 font-mono tracking-normal">{formatLiveClock()}</span>
                <span>•</span>
                <span>{liveTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </p>
            </div>
          </div>

          {/* Quick Add for small mobile screens */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-header-new-task-btn"
              type="button"
              onClick={() => {
                unlockAudio();
                onOpenNewTask();
              }}
              className="p-2.5 rounded-full bg-[#D4AF37] text-black shadow-md font-bold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Selector Navigation Center */}
        <div className="flex items-center gap-1.5 bg-[#0A0A0A] p-1.5 rounded-full border border-white/10 shadow-inner">
          <button
            id="date-prev-btn"
            type="button"
            onClick={handlePrevDay}
            className="p-1.5 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1">
            <CalendarIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
            <input
              id="date-picker-native"
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="bg-transparent text-xs font-medium text-[#F5F5F0] focus:outline-none cursor-pointer"
            />
            <span className="hidden sm:inline text-xs text-white/40 font-serif italic">
              ({formattedDisplayDate})
            </span>
          </div>

          <button
            id="date-next-btn"
            type="button"
            onClick={handleNextDay}
            className="p-1.5 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              id="date-today-btn"
              type="button"
              onClick={handleGoToday}
              className="ml-1 px-3 py-1 rounded-full bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest border border-[#D4AF37]/30 transition-colors"
            >
              Today
            </button>
          )}
        </div>

        {/* Actions & Master Sound & Theme Controls */}
        <div className="flex items-center gap-3">
          {/* Sound Controls Popover Toggle */}
          <div className="relative">
            <button
              id="sound-controls-popover-btn"
              type="button"
              onClick={() => {
                unlockAudio();
                setShowSoundPopover(!showSoundPopover);
                setShowThemeMenu(false);
              }}
              className={`px-3 py-2 rounded-full border transition-all flex items-center gap-2 text-xs font-medium ${
                settings.soundEnabled
                  ? 'bg-white/5 border-white/10 text-[#E0E0E0] hover:border-[#D4AF37]/50'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
              title="Sound & Volume Settings"
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-[#D4AF37]" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
              <span className="hidden sm:inline font-mono text-[11px] text-[#D4AF37]">{(settings.masterVolume * 100).toFixed(0)}%</span>
            </button>

            {/* Sound Popover Menu */}
            {showSoundPopover && (
              <div 
                id="sound-popover-menu"
                className="absolute right-0 mt-2 w-72 bg-[#0F0F0F] border border-white/10 rounded-2xl p-5 shadow-2xl z-50 space-y-4 text-[#E0E0E0]"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                    Audio & Reminder Sound
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      settings.soundEnabled ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {settings.soundEnabled ? 'ACTIVE' : 'MUTED'}
                  </button>
                </div>

                {/* Volume Slider */}
                <div>
                  <div className="flex justify-between text-xs text-white/60 mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-white/40">Master Intensity</span>
                    <span className="font-mono text-xs text-[#D4AF37] font-bold">{(settings.masterVolume * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    id="master-volume-slider"
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={settings.masterVolume}
                    onChange={(e) => onUpdateSettings({ masterVolume: Number(e.target.value) })}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                </div>

                {/* Repeat Alarm toggle */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                  <span className="text-white/70">Repeat Chimes for Due Alarms</span>
                  <input
                    type="checkbox"
                    checked={settings.repeatAlerts}
                    onChange={(e) => onUpdateSettings({ repeatAlerts: e.target.checked })}
                    className="accent-[#D4AF37] rounded cursor-pointer"
                  />
                </div>

                {/* Browser notifications */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-white/70">Browser Push Alerts</span>
                  <button
                    type="button"
                    onClick={handleToggleNotifications}
                    className="text-[11px] text-[#D4AF37] hover:underline"
                  >
                    {settings.browserNotifications ? 'Active' : 'Enable'}
                  </button>
                </div>

                {/* Test Sound Button */}
                <div className="pt-2 border-t border-white/5 flex gap-2">
                  <button
                    id="test-sound-reminder-btn"
                    type="button"
                    onClick={() => {
                      unlockAudio();
                      onTestSoundAlert();
                      setShowSoundPopover(false);
                    }}
                    className="w-full py-2 px-3 rounded-full bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold uppercase tracking-wider border border-[#D4AF37]/20 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <BellRing className="w-3.5 h-3.5" /> Test Sound Alert
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sound Studio Modal Button */}
          <button
            id="header-sound-studio-btn"
            type="button"
            onClick={() => {
              unlockAudio();
              onOpenSoundStudio();
            }}
            className="px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors flex items-center gap-2 text-xs font-medium"
            title="Open Tone Synthesizer Studio"
          >
            <Music className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden lg:inline">Sound Studio</span>
          </button>

          {/* Templates Button */}
          <button
            id="header-templates-btn"
            type="button"
            onClick={onOpenTemplates}
            className="px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors flex items-center gap-2 text-xs font-medium"
            title="Load Schedule Template"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden lg:inline">Templates</span>
          </button>

          {/* Theme Dropdown */}
          <div className="relative">
            <button
              id="header-theme-toggle-btn"
              type="button"
              onClick={() => {
                setShowThemeMenu(!showThemeMenu);
                setShowSoundPopover(false);
              }}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
              title="Switch Dark Theme Atmosphere"
            >
              <Moon className="w-4 h-4 text-[#D4AF37]" />
            </button>

            {showThemeMenu && (
              <div 
                id="theme-dropdown-menu"
                className="absolute right-0 mt-2 w-52 bg-[#0F0F0F] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 space-y-1 text-[#E0E0E0]"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                  Theme Atmosphere
                </div>
                {THEME_OPTIONS.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ theme: th.id });
                      setShowThemeMenu(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-medium text-left flex items-center justify-between transition-colors ${
                      settings.theme === th.id
                        ? 'bg-[#D4AF37]/15 text-[#D4AF37] font-bold border border-[#D4AF37]/20'
                        : 'hover:bg-white/5 text-white/70'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{th.icon}</span>
                      <span>{th.label}</span>
                    </span>
                    <span className={`w-2 h-2 rounded-full ${th.dot}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary Add Task Button (Desktop) */}
          <button
            id="header-add-task-btn"
            type="button"
            onClick={() => {
              unlockAudio();
              onOpenNewTask();
            }}
            className="hidden md:flex items-center gap-2 px-6 py-2 rounded-full bg-[#D4AF37] hover:bg-[#C5A028] text-black font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#D4AF37]/20 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>

      </div>
    </header>
  );
};
