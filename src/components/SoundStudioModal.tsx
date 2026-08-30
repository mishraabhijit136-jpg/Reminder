import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  Play, 
  Square, 
  Sparkles, 
  Plus, 
  Trash2, 
  Sliders, 
  Check, 
  Music, 
  X,
  Radio,
  Layers,
  Activity,
  AudioWaveform
} from 'lucide-react';
import { CustomToneConfig, MelodyPattern, WaveformType } from '../types';
import { BUILT_IN_TONES, playTone } from '../utils/audio';

interface SoundStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  customTones: CustomToneConfig[];
  defaultToneId: string;
  masterVolume: number;
  onSaveCustomTone: (tone: CustomToneConfig) => void;
  onDeleteCustomTone: (id: string) => void;
  onSetDefaultTone: (id: string) => void;
}

const WAVEFORMS: { id: WaveformType; label: string; desc: string }[] = [
  { id: 'sine', label: 'Pure Sine', desc: 'Smooth & gentle' },
  { id: 'triangle', label: 'Warm Triangle', desc: 'Soft acoustic feel' },
  { id: 'bell', label: 'Metallic Bell', desc: 'Resonant harmonic bell' },
  { id: 'organ', label: 'Poly Organ', desc: 'Warm chordal depth' },
  { id: 'square', label: 'Digital Square', desc: 'Crisp 8-bit clarity' },
  { id: 'sawtooth', label: 'Vibrant Saw', desc: 'Brisk & piercing' },
];

const PATTERNS: { id: MelodyPattern; label: string; desc: string }[] = [
  { id: 'ascending-arpeggio', label: 'Ascending Chime', desc: 'Major chord arpeggio' },
  { id: 'double-pulse', label: 'Dual Ping', desc: 'Modern 2-step prompt' },
  { id: 'single-bell', label: 'Singular Ding', desc: 'Clean single alert' },
  { id: 'descending-cascade', label: 'Soft Cascade', desc: 'Gentle step down' },
  { id: 'triple-alert', label: 'Triple Pip', desc: '3 fast attention pulses' },
  { id: 'trill-pulse', label: 'Urgent Trill', desc: 'Energetic rhythm' },
  { id: 'zen-gong', label: 'Singing Bowl', desc: 'Deep meditative gong' },
  { id: 'subtle-tap', label: 'Subtle Blip', desc: 'Minimalist low profile' },
];

export const SoundStudioModal: React.FC<SoundStudioModalProps> = ({
  isOpen,
  onClose,
  customTones,
  defaultToneId,
  masterVolume,
  onSaveCustomTone,
  onDeleteCustomTone,
  onSetDefaultTone,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom-builder'>('presets');
  const [playingToneId, setPlayingToneId] = useState<string | null>(null);

  // Custom tone builder state
  const [toneName, setToneName] = useState('My Custom Melody');
  const [waveform, setWaveform] = useState<WaveformType>('sine');
  const [baseFreq, setBaseFreq] = useState(587.33); // D5
  const [pattern, setPattern] = useState<MelodyPattern>('ascending-arpeggio');
  const [tempo, setTempo] = useState(1.2);
  const [decay, setDecay] = useState(1.5);
  const [richness, setRichness] = useState(0.5);
  const [volume, setVolume] = useState(0.85);
  const [repeatCount, setRepeatCount] = useState(1);

  if (!isOpen) return null;

  const currentPreviewTone: CustomToneConfig = {
    id: 'preview-temp',
    name: toneName || 'Custom Preview',
    waveform,
    baseFrequency: baseFreq,
    pattern,
    tempo,
    decay,
    harmonicRichness: richness,
    volume,
    repeatCount,
  };

  const handleTestPlay = (tone: CustomToneConfig) => {
    setPlayingToneId(tone.id);
    playTone(tone, masterVolume, () => {
      setPlayingToneId(null);
    });
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toneName.trim()) return;

    const newTone: CustomToneConfig = {
      id: `custom-tone-${Date.now()}`,
      name: toneName.trim(),
      isBuiltIn: false,
      waveform,
      baseFrequency: baseFreq,
      pattern,
      tempo,
      decay,
      harmonicRichness: richness,
      volume,
      repeatCount,
    };

    onSaveCustomTone(newTone);
    setActiveTab('presets');
    // Test play the newly created tone
    handleTestPlay(newTone);
  };

  // Helper to map frequency to rough musical note
  const getNoteName = (freq: number): string => {
    if (freq < 250) return 'Low Bass (A3 ~220Hz)';
    if (freq < 350) return 'Mid Bass (E4 ~330Hz)';
    if (freq < 500) return 'Concert Pitch (A4 ~440Hz)';
    if (freq < 700) return 'Crystal Mid (E5 ~659Hz)';
    if (freq < 1000) return 'High Chime (A5 ~880Hz)';
    return 'Sparkle Bell (C6 ~1046Hz+)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-3xl bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-[#E0E0E0]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0A0A0A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif italic text-[#F5F5F0] flex items-center gap-2">
                Sound Reminder Studio
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] font-mono border border-[#D4AF37]/30 uppercase tracking-wider">
                  Harmonic Synthesizer
                </span>
              </h2>
              <p className="text-xs text-white/50 font-sans">
                Curate notification tones, audition audio alarms, or synthesize custom melodic frequencies
              </p>
            </div>
          </div>

          <button
            id="sound-studio-close-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 bg-[#0A0A0A] px-6 pt-3">
          <button
            id="sound-tab-presets-btn"
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`pb-3 px-4 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'presets'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-white/40 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Acoustic Library ({BUILT_IN_TONES.length + customTones.length})
          </button>
          <button
            id="sound-tab-builder-btn"
            type="button"
            onClick={() => setActiveTab('custom-builder')}
            className={`pb-3 px-4 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'custom-builder'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-white/40 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Synthesizer Atelier (Create New)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'presets' ? (
            <div className="space-y-6">
              {/* Built-in Tones Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                    Handcrafted Acoustic Library
                  </h3>
                  <span className="text-xs text-white/40 font-serif italic">
                    Audition • Set default for new schedule items
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BUILT_IN_TONES.map((tone) => {
                    const isDefault = defaultToneId === tone.id;
                    const isPlaying = playingToneId === tone.id;

                    return (
                      <div
                        key={tone.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                          isDefault
                            ? 'bg-[#D4AF37]/15 border-[#D4AF37]/50 shadow-md shadow-[#D4AF37]/10'
                            : 'bg-[#0A0A0A] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            id={`play-tone-${tone.id}-btn`}
                            type="button"
                            onClick={() => handleTestPlay(tone)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
                              isPlaying
                                ? 'bg-[#D4AF37] text-black animate-pulse'
                                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                            }`}
                            title="Play preview"
                          >
                            {isPlaying ? <Square className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-serif italic text-[#F5F5F0]">
                                {tone.name}
                              </span>
                              {isDefault && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold uppercase tracking-wider border border-[#D4AF37]/40">
                                  Active
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-white/40 capitalize">
                              {tone.waveform} • {tone.pattern.replace('-', ' ')}
                            </span>
                          </div>
                        </div>

                        <div>
                          {!isDefault && (
                            <button
                              id={`set-default-tone-${tone.id}-btn`}
                              type="button"
                              onClick={() => onSetDefaultTone(tone.id)}
                              className="text-[11px] px-3 py-1 rounded-full bg-white/5 hover:bg-[#D4AF37]/15 text-white/50 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/30 transition-colors font-medium"
                            >
                              Set Active
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* User Custom Created Tones */}
              <div>
                <div className="flex items-center justify-between mb-3 pt-4 border-t border-white/10">
                  <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                    Custom Synthesized Tones ({customTones.length})
                  </h3>
                  <button
                    id="goto-tone-builder-btn"
                    type="button"
                    onClick={() => setActiveTab('custom-builder')}
                    className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-serif italic"
                  >
                    <Plus className="w-3.5 h-3.5" /> Synthesize New Tone
                  </button>
                </div>

                {customTones.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center bg-[#0A0A0A]">
                    <p className="text-xs text-white/40 mb-3 font-serif italic">No bespoke tones synthesized yet.</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('custom-builder')}
                      className="px-5 py-2 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30 text-xs font-bold uppercase tracking-widest border border-[#D4AF37]/40 transition-colors"
                    >
                      Open Atelier
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customTones.map((tone) => {
                      const isDefault = defaultToneId === tone.id;
                      const isPlaying = playingToneId === tone.id;

                      return (
                        <div
                          key={tone.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                            isDefault
                              ? 'bg-[#D4AF37]/15 border-[#D4AF37]/50'
                              : 'bg-[#0A0A0A] border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              id={`play-custom-tone-${tone.id}-btn`}
                              type="button"
                              onClick={() => handleTestPlay(tone)}
                              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                                isPlaying
                                  ? 'bg-[#D4AF37] text-black animate-pulse'
                                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                              }`}
                            >
                              {isPlaying ? <Square className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />}
                            </button>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-serif italic text-[#F5F5F0]">
                                  {tone.name}
                                </span>
                                {isDefault && (
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold uppercase tracking-wider">
                                    Active
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-white/40 capitalize">
                                {tone.waveform} • {tone.baseFrequency.toFixed(0)}Hz
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isDefault && (
                              <button
                                type="button"
                                onClick={() => onSetDefaultTone(tone.id)}
                                className="text-[11px] px-3 py-1 rounded-full bg-white/5 hover:bg-[#D4AF37]/15 text-white/50 hover:text-[#D4AF37] border border-white/10"
                              >
                                Active
                              </button>
                            )}
                            <button
                              id={`delete-custom-tone-${tone.id}-btn`}
                              type="button"
                              onClick={() => onDeleteCustomTone(tone.id)}
                              className="p-2 rounded-full hover:bg-rose-500/20 text-white/40 hover:text-rose-300 transition-colors"
                              title="Delete custom tone"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Custom Tone Synthesizer Lab */
            <form onSubmit={handleSaveCustom} className="space-y-5">
              {/* Tone Name */}
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">
                  Tone Name
                </label>
                <input
                  id="custom-tone-name-input"
                  type="text"
                  value={toneName}
                  onChange={(e) => setToneName(e.target.value)}
                  placeholder="e.g. Zen Focus Bell, Urgent Pulse"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Waveform Selector */}
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">
                  Waveform Timbre (Acoustic Character)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {WAVEFORMS.map((wf) => (
                    <button
                      key={wf.id}
                      type="button"
                      onClick={() => setWaveform(wf.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        waveform === wf.id
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37]/60 text-[#D4AF37] shadow-sm'
                          : 'bg-[#0A0A0A] border-white/10 text-white/50 hover:text-white'
                      }`}
                    >
                      <span className="block text-xs font-serif italic text-[#F5F5F0]">{wf.label}</span>
                      <span className="block text-[11px] text-white/40 mt-0.5">{wf.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Melody Pattern */}
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">
                  Melodic Pattern & Note Sequence
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PATTERNS.map((pat) => (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => setPattern(pat.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        pattern === pat.id
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37]/60 text-[#D4AF37]'
                          : 'bg-[#0A0A0A] border-white/10 text-white/50 hover:text-white'
                      }`}
                    >
                      <span className="block text-xs font-serif italic text-[#F5F5F0]">{pat.label}</span>
                      <span className="block text-[10px] text-white/40 mt-0.5">{pat.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Acoustic Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#0A0A0A] border border-white/10">
                {/* Base Frequency */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/70 font-serif italic">Base Pitch: {baseFreq.toFixed(0)} Hz</span>
                    <span className="text-[#D4AF37] text-[11px] font-mono">{getNoteName(baseFreq)}</span>
                  </div>
                  <input
                    id="custom-tone-freq-slider"
                    type="range"
                    min="180"
                    max="1200"
                    step="10"
                    value={baseFreq}
                    onChange={(e) => setBaseFreq(Number(e.target.value))}
                    className="w-full accent-[#D4AF37]"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>Deep (200Hz)</span>
                    <span>Concert (440Hz)</span>
                    <span>High (1000Hz)</span>
                  </div>
                </div>

                {/* Tempo / Speed */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/70 font-serif italic">Speed / Tempo</span>
                    <span className="text-[#D4AF37] font-mono text-[11px]">{tempo}x</span>
                  </div>
                  <input
                    id="custom-tone-tempo-slider"
                    type="range"
                    min="0.5"
                    max="2.2"
                    step="0.1"
                    value={tempo}
                    onChange={(e) => setTempo(Number(e.target.value))}
                    className="w-full accent-[#D4AF37]"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>Adagio (Slow)</span>
                    <span>Allegro (Snappy)</span>
                  </div>
                </div>

                {/* Ring / Decay Time */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/70 font-serif italic">Resonance & Decay</span>
                    <span className="text-[#D4AF37] font-mono text-[11px]">{decay}s</span>
                  </div>
                  <input
                    id="custom-tone-decay-slider"
                    type="range"
                    min="0.3"
                    max="4.0"
                    step="0.1"
                    value={decay}
                    onChange={(e) => setDecay(Number(e.target.value))}
                    className="w-full accent-[#D4AF37]"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>Staccato (0.3s)</span>
                    <span>Singing Bowl (4.0s)</span>
                  </div>
                </div>

                {/* Harmonic Richness */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/70 font-serif italic">Harmonic Overtone Depth</span>
                    <span className="text-[#D4AF37] font-mono text-[11px]">{(richness * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    id="custom-tone-richness-slider"
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.05"
                    value={richness}
                    onChange={(e) => setRichness(Number(e.target.value))}
                    className="w-full accent-[#D4AF37]"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>Pure Tone</span>
                    <span>Rich Symphony</span>
                  </div>
                </div>
              </div>

              {/* Live Preview Bar & Save Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
                <button
                  id="preview-custom-tone-btn"
                  type="button"
                  onClick={() => handleTestPlay(currentPreviewTone)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-[#D4AF37] font-bold text-xs uppercase tracking-widest border border-[#D4AF37]/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Audition Tone
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('presets')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white/5 text-white/50 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    id="save-custom-tone-btn"
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#D4AF37] hover:bg-[#C5A028] text-black text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all hover:scale-102"
                  >
                    <Check className="w-4 h-4" />
                    Save Synthesized Tone
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
