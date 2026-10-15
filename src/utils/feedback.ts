import { useSettingsStore } from '@/store/useSettingsStore';

/**
 * Triggers audio and haptic feedback upon milestone completion (quizzes, lessons, claims)
 * respects the user's soundAndHaptics toggle in Settings
 */
export function triggerMilestoneFeedback() {
  const { soundAndHaptics } = useSettingsStore.getState();
  if (!soundAndHaptics) return;

  try {
    // 1. Mobile & Web Haptic Vibration
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([40, 60, 40]);
    }

    // 2. Synthesized Celebratory Audio Chime via Web Audio API
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Dual harmonic pleasant chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    }
  } catch {
    // Graceful fallback if audio context blocked by browser autoplay policy
  }
}
