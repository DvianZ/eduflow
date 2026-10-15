import { useColorScheme as useRNColorScheme } from 'react-native';
import { useSettingsStore } from '@/store/useSettingsStore';

/**
 * Resolves active theme scheme ('light' | 'dark') based on user setting or system preference
 */
export function useColorScheme(): 'light' | 'dark' {
  const systemScheme = useRNColorScheme();
  const theme = useSettingsStore((state) => state.theme);

  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  return systemScheme === 'dark' ? 'dark' : 'light';
}
