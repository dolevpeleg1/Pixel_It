export const colors = {
  background: '#0f0e17',
  surface: '#1a1828',
  surfaceElevated: '#252238',
  primary: '#22d3ee',
  primaryMuted: '#0891b2',
  text: '#f4f4f5',
  textMuted: '#a1a1aa',
  textSubtle: '#71717a',
  border: '#3f3d56',
  error: '#f87171',
  overlayLine: '#22d3ee',
  overlayHandle: '#22d3ee',
  overlayHandleBorder: '#f4f4f5',
  headerBackground: '#0f0e17',
  headerTint: '#f4f4f5',
  imageBackdrop: '#12111c',
  devStatus: '#71717a',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 10,
  lg: 14,
  full: 999,
} as const;

export const typography = {
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
} as const;
