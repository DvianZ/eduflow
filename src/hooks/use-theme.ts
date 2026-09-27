/**
 * EduFlow Theme Hook
 *
 * Provides the full design system tokens for the current color scheme.
 * Automatically switches between light and dark palettes.
 */

import { useColorScheme } from 'react-native';

import { Colors, AccentColors, type ColorScheme, type ThemeColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, Margins, Radii, Shadows, HitSlop } from '@/constants/Spacing';

export interface Theme {
  /** Current color scheme identifier */
  colorScheme: ColorScheme;
  /** Whether the current scheme is dark */
  isDark: boolean;
  /** All color tokens for the active scheme */
  colors: ThemeColors;
  /** Accent color tokens for the active scheme */
  accent: typeof AccentColors.light | typeof AccentColors.dark;
  /** Typography styles */
  typography: typeof Typography;
  /** Spacing scale */
  spacing: typeof Spacing;
  /** Screen margins */
  margins: typeof Margins;
  /** Border radii */
  radii: typeof Radii;
  /** Shadow presets */
  shadows: typeof Shadows;
  /** Touch target sizes */
  hitSlop: typeof HitSlop;
}

/**
 * Returns the full EduFlow design system for the active color scheme.
 *
 * Usage:
 * ```tsx
 * const { colors, typography, isDark } = useTheme();
 * ```
 */
export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  const colorScheme: ColorScheme =
    systemScheme === 'dark' ? 'dark' : 'light';

  return {
    colorScheme,
    isDark: colorScheme === 'dark',
    colors: Colors[colorScheme],
    accent: AccentColors[colorScheme],
    typography: Typography,
    spacing: Spacing,
    margins: Margins,
    radii: Radii,
    shadows: Shadows,
    hitSlop: HitSlop,
  };
}
