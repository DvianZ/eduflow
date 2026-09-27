/**
 * EduFlow Design System — Color Tokens
 *
 * Light mode: "Clarity & Quiet Focus" design system
 * Dark mode:  "Nocturne Focus" design system
 *
 * Based on the DESIGN.md specifications from the mockup package.
 */

export const Colors = {
  light: {
    // ── Surface Tiers ──
    surface0: '#FFFFFF',
    surface1: '#F9F9F9',
    surface2: '#F2F2F7',
    surface3: '#E5E5EA',
    surface4: '#D1D1D6',

    // ── Material Design Surfaces ──
    surface: '#F9F9F9',
    surfaceDim: '#DADADA',
    surfaceBright: '#F9F9F9',
    surfaceContainerLowest: '#FFFFFF',
    surfaceContainerLow: '#F3F3F3',
    surfaceContainer: '#EEEEEE',
    surfaceContainerHigh: '#E8E8E8',
    surfaceContainerHighest: '#E2E2E2',

    // ── Text Hierarchy ──
    textPrimary: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textDisabled: '#CCCCCC',

    // ── On-Surface ──
    onSurface: '#1B1B1B',
    onSurfaceVariant: '#464554',
    inverseSurface: '#303030',
    inverseOnSurface: '#F1F1F1',

    // ── Primary Accent ──
    primary: '#4441CC',
    onPrimary: '#FFFFFF',
    primaryContainer: '#5E5CE6',
    onPrimaryContainer: '#F4F1FF',
    inversePrimary: '#C2C1FF',

    // ── Secondary ──
    secondary: '#5C5E66',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#DFDFE9',
    onSecondaryContainer: '#61626A',

    // ── Tertiary ──
    tertiary: '#894200',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#AE5600',
    onTertiaryContainer: '#FFEFE7',

    // ── Semantic ──
    error: '#FF3B30',
    onError: '#FFFFFF',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#93000A',
    success: '#32B76B',
    warning: '#FF9500',

    // ── Outline ──
    outline: '#777586',
    outlineVariant: '#C7C4D7',

    // ── Fixed Colors ──
    primaryFixed: '#E2DFFF',
    primaryFixedDim: '#C2C1FF',
    secondaryFixed: '#E1E2EB',
    secondaryFixedDim: '#C5C6CF',

    // ── Glass / Overlay ──
    glassLight: 'rgba(255, 255, 255, 0.70)',
    glassDark: 'rgba(0, 0, 0, 0.04)',
    glassBlur: 20,

    // ── Background ──
    background: '#F9F9F9',
    onBackground: '#1B1B1B',

    // ── Tab Bar ──
    tabBarBackground: 'rgba(255, 255, 255, 0.80)',
    tabBarBorder: 'rgba(0, 0, 0, 0.03)',
    tabBarActive: '#5E5CE6',
    tabBarInactive: '#999999',
    // ── Semantic Backgrounds (Tints for dark/light mode) ──
    headerBg: 'rgba(249, 249, 249, 0.9)',
    headerBorder: 'rgba(0, 0, 0, 0.05)',
    dockBg: 'rgba(249, 249, 249, 0.95)',
    dockBorder: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.4)',
    cardHighlight: 'rgba(242, 242, 247, 0.6)',
    subtleBg: 'rgba(0, 0, 0, 0.05)',
    successTint: 'rgba(50, 183, 107, 0.15)',
    primaryTint: 'rgba(68, 65, 204, 0.1)',
    warningTint: 'rgba(255, 149, 0, 0.1)',
    errorTint: 'rgba(255, 59, 48, 0.1)',
  },

  dark: {
    // ── Surface Tiers ──
    surface0: '#000000',
    surface1: '#1C1C1E',
    surface2: '#2C2C2E',
    surface3: '#3A3A3C',
    surface4: '#48484A',

    // ── Material Design Surfaces ──
    surface: '#131315',
    surfaceDim: '#131315',
    surfaceBright: '#39393B',
    surfaceContainerLowest: '#0E0E10',
    surfaceContainerLow: '#1B1B1D',
    surfaceContainer: '#1F1F21',
    surfaceContainerHigh: '#2A2A2C',
    surfaceContainerHighest: '#353437',

    // ── Text Hierarchy ──
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(235, 235, 245, 0.60)',
    textTertiary: '#8E8E93',
    textDisabled: '#48484A',

    // ── On-Surface ──
    onSurface: '#E4E2E4',
    onSurfaceVariant: '#C8C4D5',
    inverseSurface: '#E4E2E4',
    inverseOnSurface: '#303032',

    // ── Primary Accent ──
    primary: '#C4C0FF',
    onPrimary: '#251097',
    primaryContainer: '#8B84FF',
    onPrimaryContainer: '#200593',
    inversePrimary: '#554DC5',

    // ── Secondary ──
    secondary: '#C2C1FF',
    onSecondary: '#1D05A2',
    secondaryContainer: '#372FB7',
    onSecondaryContainer: '#AFADFF',

    // ── Tertiary ──
    tertiary: '#FCBB40',
    onTertiary: '#422C00',
    tertiaryContainer: '#C28900',
    onTertiaryContainer: '#3D2900',

    // ── Semantic ──
    error: '#FFB4AB',
    onError: '#690005',
    errorContainer: '#93000A',
    onErrorContainer: '#FFDAD6',
    success: '#32B76B',
    warning: '#FF9500',

    // ── Outline ──
    outline: '#918F9F',
    outlineVariant: '#474553',

    // ── Fixed Colors ──
    primaryFixed: '#E3DFFF',
    primaryFixedDim: '#C4C0FF',
    secondaryFixed: '#E2DFFF',
    secondaryFixedDim: '#C2C1FF',

    // ── Glass / Overlay ──
    glassLight: 'rgba(30, 30, 35, 0.72)',
    glassDark: 'rgba(255, 255, 255, 0.08)',
    glassBlur: 20,

    // ── Background ──
    background: '#000000',
    onBackground: '#E4E2E4',

    // ── Tab Bar ──
    tabBarBackground: 'rgba(28, 28, 30, 0.80)',
    tabBarBorder: 'rgba(255, 255, 255, 0.06)',
    tabBarActive: '#8B84FF',
    tabBarInactive: '#8E8E93',

    // ── Semantic Backgrounds (Tints for dark/light mode) ──
    headerBg: 'rgba(0, 0, 0, 0.85)',
    headerBorder: 'rgba(255, 255, 255, 0.1)',
    dockBg: 'rgba(28, 28, 30, 0.95)',
    dockBorder: 'rgba(255, 255, 255, 0.08)',
    overlay: 'rgba(0, 0, 0, 0.65)',
    cardHighlight: 'rgba(44, 44, 46, 0.6)',
    subtleBg: 'rgba(255, 255, 255, 0.08)',
    successTint: 'rgba(50, 183, 107, 0.2)',
    primaryTint: 'rgba(139, 132, 255, 0.15)',
    warningTint: 'rgba(255, 149, 0, 0.2)',
    errorTint: 'rgba(255, 59, 48, 0.2)',
  },
} as const;

/** Accent colors shared across light/dark (for components that need raw values) */
export const AccentColors = {
  light: {
    accent: '#5E5CE6',
    accentLight: '#F5F5FF',
    accentSoft: 'rgba(94, 92, 230, 0.10)',
  },
  dark: {
    accent: '#8B84FF',
    accentSecondary: '#7D7AFF',
    accentSoft: 'rgba(139, 132, 255, 0.15)',
  },
} as const;

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = (typeof Colors)['light'] | (typeof Colors)['dark'];
