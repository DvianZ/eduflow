import { useSettingsStore } from '@/store/useSettingsStore';
import { en } from './translations/en';
import { TranslationDictionary, Language } from './types';

export const translations: Record<Language, TranslationDictionary> = {
  en,
};

export function useTranslation() {
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const t = translations[language] || translations.en;

  return {
    t,
    language: 'en' as const,
    setLanguage,
  };
}

export function getTranslation(_lang?: Language): TranslationDictionary {
  return translations.en;
}

export * from './types';
