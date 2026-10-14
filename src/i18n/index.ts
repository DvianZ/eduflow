import { useSettingsStore } from '@/store/useSettingsStore';
import { en } from './translations/en';
import { id } from './translations/id';
import { TranslationDictionary, Language } from './types';

export const translations: Record<Language, TranslationDictionary> = {
  en,
  id,
};

export function useTranslation() {
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const t = translations[language] || translations.en;

  return {
    t,
    language,
    setLanguage,
  };
}

export function getTranslation(lang?: Language): TranslationDictionary {
  const currentLang = lang || useSettingsStore.getState().language || 'en';
  return translations[currentLang] || translations.en;
}

export * from './types';
