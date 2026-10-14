import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '@/i18n/types';

export type AppTheme = 'system' | 'light' | 'dark';

interface SettingsState {
  language: Language;
  theme: AppTheme;
  tactileEffects: boolean;
  soundAndHaptics: boolean;
  autoAdvanceLesson: boolean;
  notifGrades: boolean;
  notifRevisions: boolean;
  notifAnnouncements: boolean;
  notifDeadlines: boolean;

  setLanguage: (lang: Language) => void;
  setTheme: (theme: AppTheme) => void;
  setTactileEffects: (enabled: boolean) => void;
  setSoundAndHaptics: (enabled: boolean) => void;
  setAutoAdvanceLesson: (enabled: boolean) => void;
  toggleNotifSetting: (
    key: 'notifGrades' | 'notifRevisions' | 'notifAnnouncements' | 'notifDeadlines'
  ) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS = {
  language: 'en' as Language, // Formal English default per client requirement
  theme: 'system' as AppTheme,
  tactileEffects: true,
  soundAndHaptics: true,
  autoAdvanceLesson: true,
  notifGrades: true,
  notifRevisions: true,
  notifAnnouncements: true,
  notifDeadlines: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setLanguage: (language: Language) => set({ language }),

      setTheme: (theme: AppTheme) => set({ theme }),

      setTactileEffects: (tactileEffects: boolean) => set({ tactileEffects }),

      setSoundAndHaptics: (soundAndHaptics: boolean) => set({ soundAndHaptics }),

      setAutoAdvanceLesson: (autoAdvanceLesson: boolean) =>
        set({ autoAdvanceLesson }),

      toggleNotifSetting: (key) =>
        set((state) => ({ [key]: !state[key] })),

      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'eduflow_settings_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
