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

/**
 * Triggers audio and haptic feedback tailored to Alert Modal popups
 */
export function triggerAlertFeedback(
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm' = 'info'
) {
  const { soundAndHaptics } = useSettingsStore.getState();
  if (!soundAndHaptics) return;

  try {
    // 1. Tactile haptic vibration
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      if (type === 'error' || type === 'warning') {
        navigator.vibrate([60, 40, 60]);
      } else {
        navigator.vibrate([35]);
      }
    }

    // 2. Synthesized audio tone
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        if (type === 'success') {
          // Upward happy chime
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.14); // G5
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.28);
        } else if (type === 'error' || type === 'warning') {
          // Low cautionary double tap
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.16);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.22);
        } else {
          // Soft modern pop
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.18);
        }
      }
    }
  } catch {
    // Graceful fallback
  }
}
