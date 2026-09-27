/**
 * EduFlow Design System — Spacing & Layout Tokens
 *
 * Base unit: 8px (iOS standard)
 * Touch targets: minimum 44px
 */

/** Core spacing scale (in pixels) based on 8px grid */
export const Spacing = {
  /** 2px */
  xxs: 2,
  /** 4px — extra small */
  xs: 4,
  /** 8px — small */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px — base unit / gutter / margin */
  base: 16,
  /** 20px */
  lg: 20,
  /** 24px */
  xl: 24,
  /** 32px */
  xxl: 32,
  /** 40px */
  xxxl: 40,
  /** 48px */
  xxxxl: 48,
} as const;

/** Screen margins */
export const Margins = {
  /** Mobile screen margin: 16px */
  mobile: 16,
  /** Tablet screen margin: 24px */
  tablet: 24,
  /** Desktop screen margin: 32px */
  desktop: 32,
} as const;

/** Border radius values */
export const Radii = {
  /** 4px — small tags, indicators */
  sm: 4,
  /** 8px — chips, small elements */
  md: 8,
  /** 10px — search inputs */
  default: 10,
  /** 12px — cards, containers */
  lg: 12,
  /** 16px — module cards, lecture containers */
  xl: 16,
  /** 24px — bottom sheets, modals */
  xxl: 24,
  /** 9999px — pill buttons, avatars */
  full: 9999,
} as const;

/** Touch target sizes (iOS HIG minimum 44px) */
export const HitSlop = {
  minTarget: 44,
  tabBarHeight: 64,
  headerHeight: 56,
  statusBarPadding: 44,
} as const;

/** Shadow presets for iOS-style elevation */
export const Shadows = {
  none: {},
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  /** For dark mode: border-based elevation instead of shadows */
  darkBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
} as const;
