import { TextStyle } from 'react-native';

// Color palette type — every entry must exist in both DARK_COLORS and LIGHT_COLORS.
export type ColorPalette = {
  background: string;
  surface: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceVariant: string;
  surfaceBright: string;
  surfaceDim: string;
  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;

  primary: string;
  primaryContainer: string;
  onPrimary: string;
  onPrimaryContainer: string;

  secondary: string;
  secondaryContainer: string;
  onSecondary: string;
  onSecondaryContainer: string;

  tertiary: string;
  tertiaryContainer: string;
  onTertiary: string;

  error: string;
  errorContainer: string;
  onError: string;
  onErrorContainer: string;

  // Semi-transparent overlays. Names are historical; values flip by mode
  // (rgba(255,255,255,…) on dark, rgba(0,0,0,…) on light).
  white05: string;
  white08: string;
  white10: string;
  glassBackground: string;
  primaryGlowSoft: string;
  primaryGlowMid: string;
  primaryGlowStrong: string;
  primaryTint10: string;
  primaryTint20: string;
  secondaryTint10: string;
  secondaryTint20: string;
  secondaryContainerTint10: string;
  tertiaryTint10: string;
  onSurfaceVariantMuted: string;
  inputPlaceholder: string;
  chartGuide: string;
  shadow: string;
};

export const DARK_COLORS: ColorPalette = {
  background: '#131313',
  surface: '#131313',
  surfaceContainerLowest: '#0e0e0e',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainer: '#201f1f',
  surfaceContainerHigh: '#2a2a2a',
  surfaceContainerHighest: '#353534',
  surfaceVariant: '#353534',
  surfaceBright: '#393939',
  surfaceDim: '#131313',
  onBackground: '#e5e2e1',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#bbcabf',
  outline: '#86948a',
  outlineVariant: '#3c4a42',

  primary: '#4edea3',
  primaryContainer: '#10b981',
  onPrimary: '#003824',
  onPrimaryContainer: '#00422b',

  secondary: '#adc6ff',
  secondaryContainer: '#0566d9',
  onSecondary: '#002e6a',
  onSecondaryContainer: '#e6ecff',

  tertiary: '#d0bcff',
  tertiaryContainer: '#b090ff',
  onTertiary: '#3c0091',

  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',

  white05: 'rgba(255, 255, 255, 0.05)',
  white08: 'rgba(255, 255, 255, 0.08)',
  white10: 'rgba(255, 255, 255, 0.10)',
  glassBackground: 'rgba(26, 26, 26, 0.6)',
  primaryGlowSoft: 'rgba(78, 222, 163, 0.20)',
  primaryGlowMid: 'rgba(78, 222, 163, 0.30)',
  primaryGlowStrong: 'rgba(78, 222, 163, 0.50)',
  primaryTint10: 'rgba(78, 222, 163, 0.10)',
  primaryTint20: 'rgba(78, 222, 163, 0.20)',
  secondaryTint10: 'rgba(173, 198, 255, 0.10)',
  secondaryTint20: 'rgba(5, 102, 217, 0.20)',
  secondaryContainerTint10: 'rgba(5, 102, 217, 0.10)',
  tertiaryTint10: 'rgba(208, 188, 255, 0.10)',
  onSurfaceVariantMuted: 'rgba(187, 202, 191, 0.60)',
  inputPlaceholder: 'rgba(187, 202, 191, 0.30)',
  chartGuide: 'rgba(78, 222, 163, 0.30)',
  shadow: '#000000',
};

// Light counterparts. Derived to match M3 conventions where applicable:
// the dark scheme's `primary` (a light mint) becomes the light scheme's
// `onPrimaryContainer` / `primaryContainer`, and the dark scheme's
// `primaryContainer` darkens further to become the light scheme's `primary`.
export const LIGHT_COLORS: ColorPalette = {
  background: '#f5f8f6',
  surface: '#f5f8f6',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#edf4f0',
  surfaceContainer: '#e6efea',
  surfaceContainerHigh: '#d9e6df',
  surfaceContainerHighest: '#cbdad2',
  surfaceVariant: '#dfe9e4',
  surfaceBright: '#ffffff',
  surfaceDim: '#dae3de',
  onBackground: '#16211b',
  onSurface: '#16211b',
  onSurfaceVariant: '#526258',
  outline: '#76877d',
  outlineVariant: '#c3d0c8',

  primary: '#0a8f62',
  primaryContainer: '#10b981',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#e7fff5',

  secondary: '#235fb8',
  secondaryContainer: '#0566d9',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#eef4ff',

  tertiary: '#7652d6',
  tertiaryContainer: '#b090ff',
  onTertiary: '#ffffff',

  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#410002',

  white05: 'rgba(22, 33, 27, 0.06)',
  white08: 'rgba(22, 33, 27, 0.09)',
  white10: 'rgba(22, 33, 27, 0.12)',
  glassBackground: 'rgba(255, 255, 255, 0.76)',
  primaryGlowSoft: 'rgba(10, 143, 98, 0.14)',
  primaryGlowMid: 'rgba(10, 143, 98, 0.22)',
  primaryGlowStrong: 'rgba(10, 143, 98, 0.36)',
  primaryTint10: 'rgba(10, 143, 98, 0.10)',
  primaryTint20: 'rgba(10, 143, 98, 0.20)',
  secondaryTint10: 'rgba(35, 95, 184, 0.10)',
  secondaryTint20: 'rgba(5, 102, 217, 0.18)',
  secondaryContainerTint10: 'rgba(5, 102, 217, 0.10)',
  tertiaryTint10: 'rgba(118, 82, 214, 0.10)',
  onSurfaceVariantMuted: 'rgba(82, 98, 88, 0.64)',
  inputPlaceholder: 'rgba(82, 98, 88, 0.42)',
  chartGuide: 'rgba(10, 143, 98, 0.28)',
  shadow: '#526258',
};

// Backwards-compatible alias. Components that haven't migrated to
// `useThemeColors()` will keep rendering with the dark palette regardless of
// the user's theme preference. Migrate to the hook to make a component
// theme-reactive.
export const Colors = DARK_COLORS;

export const Spacing = {
  stackXs: 4,
  stackSm: 8,
  stackMd: 16,
  stackLg: 32,
  gutterGrid: 16,
  marginMain: 24,
} as const;

export const Radius = {
  sm: 4,
  lg: 8,
  xl: 12,
  card: 16,
  cardLg: 24,
  pill: 9999,
} as const;

export const Type = {
  displayLg: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.64,
    fontWeight: '700',
  } as TextStyle,
  headlineMd: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
    fontWeight: '600',
  } as TextStyle,
  titleSm: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.18,
    fontWeight: '600',
  } as TextStyle,
  bodyLg: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.32,
    fontWeight: '400',
  } as TextStyle,
  bodyMd: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    fontWeight: '400',
  } as TextStyle,
  labelCaps: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    fontWeight: '700',
    textTransform: 'uppercase',
  } as TextStyle,
} as const;
