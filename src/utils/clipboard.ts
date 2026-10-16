import * as Clipboard from 'expo-clipboard';
import { Platform } from 'react-native';

/**
 * Copies string text to clipboard across Native (Android/iOS) and Web.
 * Returns true if successful, false otherwise.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (Clipboard && typeof Clipboard.setStringAsync === 'function') {
      await Clipboard.setStringAsync(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard.setStringAsync failed, trying fallback', err);
  }

  // Web fallback if running on web without clipboard permissions
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (successful) return true;
    } catch {
      // ignore
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // ignore
      }
    }
  }

  return false;
}
