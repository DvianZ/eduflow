/**
 * EduFlow Design System — Typography Tokens
 *
 * Font: Inter (loaded via expo-font)
 * Based on iOS Dynamic Type scales with 8pt baseline grid.
 */

import { Platform, TextStyle } from 'react-native';

/** Font family for Inter variants */
export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/** System font fallback (used before Inter is loaded) */
export const SystemFont = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

/**
 * Typography scale following the design system spec.
 * Each style is a complete TextStyle ready for StyleSheet use.
 */
export const Typography = {
  displayLg: {
    fontFamily: FontFamily.bold,
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -0.68, // -0.02em
    fontWeight: '700',
  } as TextStyle,

  displayLgMobile: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.42, // -0.015em
    fontWeight: '700',
  } as TextStyle,

  headlineLg: {
    fontFamily: FontFamily.semiBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.24, // -0.01em
    fontWeight: '600',
  } as TextStyle,

  headlineMd: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.1, // -0.005em
    fontWeight: '600',
  } as TextStyle,

  headlineSm: {
    fontFamily: FontFamily.semiBold,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  } as TextStyle,

  bodyLg: {
    fontFamily: FontFamily.regular,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400',
  } as TextStyle,

  bodyMd: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  } as TextStyle,

  bodySm: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  } as TextStyle,

  labelLg: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  } as TextStyle,

  labelMd: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  } as TextStyle,

  labelSm: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.11, // 0.01em
    fontWeight: '500',
  } as TextStyle,
} as const;

export type TypographyKey = keyof typeof Typography;
