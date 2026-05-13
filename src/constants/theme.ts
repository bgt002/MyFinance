import { TextStyle } from 'react-native';

export const Colors = {
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
} as const;

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
