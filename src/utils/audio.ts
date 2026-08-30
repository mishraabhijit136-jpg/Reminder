import { CustomToneConfig, MelodyPattern, WaveformType } from '../types';

// Web Audio API context singleton with safe lazy initialization
let audioCtx: AudioContext | null = null;
let currentAlarmSource: { stop: () => void } | null = null;

export const BUILT_IN_TONES: CustomToneConfig[] = [
  {
    id: 'chime-crystal',
    name: 'Celestial Chime',
    isBuiltIn: true,
    waveform: 'sine',
    baseFrequency: 659.25, // E5
    pattern: 'ascending-arpeggio',
    tempo: 1.2,
    decay: 1.8,
    harmonicRichness: 0.4,
    volume: 0.85,
    repeatCount: 1,
  },
  {
    id: 'zen-gong',
    name: 'Zen Singing Bowl',
    isBuiltIn: true,
    waveform: 'bell',
    baseFrequency: 220, // A3
    pattern: 'zen-gong',
    tempo: 0.8,
    decay: 3.5,
    harmonicRichness: 0.8,
    volume: 0.9,
    repeatCount: 1,
  },
  {
    id: 'digital-radar',
    name: 'Digital Radar',
    isBuiltIn: true,
    waveform: 'triangle',
    baseFrequency: 880, // A5
    pattern: 'double-pulse',
    tempo: 1.5,
    decay: 0.5,
    harmonicRichness: 0.3,
    volume: 0.8,
    repeatCount: 2,
  },
  {
    id: 'warm-marimba',
    name: 'Warm Marimba',
    isBuiltIn: true,
    waveform: 'triangle',
    baseFrequency: 523.25, // C5
    pattern: 'ascending-arpeggio',
    tempo: 1.4,
    decay: 0.9,
    harmonicRichness: 0.6,
    volume: 0.85,
    repeatCount: 1,
  },
  {
    id: 'cosmic-melody',
    name: 'Cosmic Melody',
    isBuiltIn: true,
    waveform: 'organ',
    baseFrequency: 587.33, // D5
    pattern: 'ascending-arpeggio',
    tempo: 1.3,
    decay: 1.5,
    harmonicRichness: 0.5,
    volume: 0.8,
    repeatCount: 1,
  },
  {
    id: 'brisk-pulse',
    name: 'Brisk Attention',
    isBuiltIn: true,
    waveform: 'square',
    baseFrequency: 987.77, // B5
    pattern: 'triple-alert',
    tempo: 1.6,
    decay: 0.4,
    harmonicRichness: 0.2,
    volume: 0.75,
    repeatCount: 1,
  },
  {
    id: 'morning-harp',
    name: 'Morning Harp',
    isBuiltIn: true,
    waveform: 'sine',
    baseFrequency: 440, // A4
    pattern: 'ascending-arpeggio',
    tempo: 1.0,
    decay: 2.2,
    harmonicRichness: 0.5,
    volume: 0.85,
    repeatCount: 1,
  },
  {
    id: 'cyber-ding',
    name: 'Cyber Ding',
    isBuiltIn: true,
    waveform: 'bell',
    baseFrequency: 1046.50, // C6
    pattern: 'single-bell',
    tempo: 1.0,
    decay: 1.6,
    harmonicRichness: 0.7,
    volume: 0.85,
    repeatCount: 1,
  },
  {
    id: 'subtle-tap',
    name: 'Subtle Blip',
    isBuiltIn: true,
    waveform: 'sine',
    baseFrequency: 587.33, // D5
    pattern: 'subtle-tap',
    tempo: 1.8,
    decay: 0.25,
    harmonicRichness: 0.1,
    volume: 0.6,
    repeatCount: 1,
  },
  {
    id: 'urgent-beacon',
    name: 'Urgent Beacon',
    isBuiltIn: true,
    waveform: 'sawtooth',
    baseFrequency: 783.99, // G5
    pattern: 'trill-pulse',
    tempo: 1.8,
    decay: 0.6,
    harmonicRichness: 0.6,
    volume: 0.8,
    repeatCount: 3,
  }
];

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function unlockAudio() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    // Play an ultra-short silent pulse to prime audio engine
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.01);
  } catch (e) {
    console.warn('Audio unlock failed or pending user gesture', e);
  }
}

// Frequency ratio offsets for patterns (semitones to ratio: 2^(semitones/12))
function getPatternFrequencies(pattern: MelodyPattern, baseFreq: number): number[] {
  switch (pattern) {
    case 'single-bell':
      return [baseFreq];
    case 'double-pulse':
      return [baseFreq, baseFreq * 1.2599]; // Root, Major 3rd
    case 'ascending-arpeggio':
      // Root, Major 3rd, Perfect 5th, Octave
      return [
        baseFreq,
        baseFreq * 1.2599, // +4 semitones (M3)
        baseFreq * 1.4983, // +7 semitones (P5)
        baseFreq * 2.0,    // +12 semitones (Octave)
      ];
    case 'descending-cascade':
      return [
        baseFreq * 2.0,
        baseFreq * 1.4983,
        baseFreq * 1.2599,
        baseFreq,
      ];
    case 'triple-alert':
      return [baseFreq, baseFreq * 1.122, baseFreq * 1.334]; // Root, M2, P4
    case 'trill-pulse':
      return [baseFreq, baseFreq * 1.4983, baseFreq, baseFreq * 1.4983, baseFreq * 2.0];
    case 'zen-gong':
      return [baseFreq, baseFreq * 1.005, baseFreq * 2.76, baseFreq * 5.4]; // Resonant beating harmonics
    case 'subtle-tap':
      return [baseFreq, baseFreq * 1.334];
    default:
      return [baseFreq];
  }
}

// Play a single synthesized note with harmonic richness and realistic envelope
function playSynthesizedNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  waveform: WaveformType,
  richness: number,
  noteVolume: number,
  masterVolume: number
) {
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  
  // Calculate final volume safely
  const peakVol = Math.max(0.01, Math.min(1.0, noteVolume * masterVolume));
  
  // Create Main Oscillator
  let oscType: OscillatorType = 'sine';
  if (waveform === 'triangle') oscType = 'triangle';
  else if (waveform === 'square') oscType = 'square';
  else if (waveform === 'sawtooth') oscType = 'sawtooth';
  else if (waveform === 'organ') oscType = 'triangle';
  else if (waveform === 'bell') oscType = 'sine';

  const osc = ctx.createOscillator();
  osc.type = oscType;
  osc.frequency.setValueAtTime(freq, startTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, startTime);
  
  // Attack: fast punchy attack (10ms)
  const attackTime = Math.min(0.02, duration * 0.1);
  gain.gain.linearRampToValueAtTime(peakVol, startTime + attackTime);
  
  // Decay / Release: exponential decay to zero
  const releaseStart = startTime + attackTime;
  const releaseDuration = Math.max(0.05, duration - attackTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, releaseStart + releaseDuration);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);

  // Add Harmonics for Bell/Organ/Richness
  if (richness > 0.05 || waveform === 'bell' || waveform === 'organ') {
    const overtoneCount = waveform === 'bell' ? 3 : (waveform === 'organ' ? 2 : 1);
    
    for (let i = 1; i <= overtoneCount; i++) {
      const harmOsc = ctx.createOscillator();
      const harmGain = ctx.createGain();
      
      const harmFreq = waveform === 'bell'
        ? freq * (i === 1 ? 2.76 : i === 2 ? 5.4 : 8.9) // Metallic inharmonic ratios
        : freq * (i + 1); // Natural harmonic series
      
      harmOsc.type = waveform === 'organ' ? 'sine' : 'triangle';
      harmOsc.frequency.setValueAtTime(harmFreq, startTime);
      
      const harmVol = peakVol * (richness * (0.4 / i));
      harmGain.gain.setValueAtTime(0.0001, startTime);
      harmGain.gain.linearRampToValueAtTime(Math.max(0.0001, harmVol), startTime + attackTime * 0.5);
      harmGain.gain.exponentialRampToValueAtTime(0.0001, releaseStart + (releaseDuration * (0.8 / i)));

      harmOsc.connect(harmGain);
      harmGain.connect(masterGain);

      harmOsc.start(startTime);
      harmOsc.stop(startTime + duration + 0.05);
    }
  }
}

/**
 * Play a custom tone configuration immediately
 */
export function playTone(
  toneConfig: CustomToneConfig,
  masterVolume: number = 1.0,
  onFinish?: () => void
): { stop: () => void } {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = getPatternFrequencies(toneConfig.pattern, toneConfig.baseFrequency);
    
    // Note spacing based on tempo
    const stepDuration = Math.max(0.08, 0.22 / (toneConfig.tempo || 1.0));
    const noteDecay = Math.max(0.2, toneConfig.decay || 1.0);
    const repeats = Math.max(1, toneConfig.repeatCount || 1);

    let currentOffset = 0;
    
    for (let r = 0; r < repeats; r++) {
      notes.forEach((freq, idx) => {
        const noteStart = now + currentOffset + (idx * stepDuration);
        playSynthesizedNote(
          ctx,
          freq,
          noteStart,
          noteDecay,
          toneConfig.waveform,
          toneConfig.harmonicRichness,
          toneConfig.volume,
          masterVolume
        );
      });
      currentOffset += (notes.length * stepDuration) + 0.35; // pause between repeats
    }

    const totalDuration = currentOffset + noteDecay;
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, totalDuration * 1000);

    return {
      stop: () => {
        clearTimeout(timer);
      }
    };
  } catch (err) {
    console.error('Failed to play tone:', err);
    return { stop: () => {} };
  }
}

/**
 * Start repeating alarm for active reminder until dismissed
 */
export function startAlarmLoop(
  toneConfig: CustomToneConfig,
  masterVolume: number = 1.0,
  maxRepeats: number = 10
): { stop: () => void } {
  if (currentAlarmSource) {
    currentAlarmSource.stop();
    currentAlarmSource = null;
  }

  let count = 0;
  let isCancelled = false;
  let activeTimeout: NodeJS.Timeout | null = null;

  const playNext = () => {
    if (isCancelled || count >= maxRepeats) {
      return;
    }
    count++;
    
    playTone(toneConfig, masterVolume, () => {
      if (!isCancelled && count < maxRepeats) {
        activeTimeout = setTimeout(playNext, 1200); // 1.2s rest between loops
      }
    });
  };

  playNext();

  const stopHandle = {
    stop: () => {
      isCancelled = true;
      if (activeTimeout) clearTimeout(activeTimeout);
      if (currentAlarmSource === stopHandle) {
        currentAlarmSource = null;
      }
    }
  };

  currentAlarmSource = stopHandle;
  return stopHandle;
}

export function stopCurrentAlarm() {
  if (currentAlarmSource) {
    currentAlarmSource.stop();
    currentAlarmSource = null;
  }
}

// Request and trigger browser notification if allowed
export async function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (e) {
      console.warn('Browser notification failed:', e);
    }
  } else if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      try {
        new Notification(title, options);
      } catch (e) {
        console.warn('Browser notification failed:', e);
      }
    }
  }
}
