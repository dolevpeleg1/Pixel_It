/** Matches app icon: soft black + rainbow neon accents */
export const colors = {
  background: '#1A1A1A',
  surface: '#242424',
  surfaceElevated: '#2E2E2E',
  primary: '#9B8CFF',
  primaryAlt: '#00E5FF',
  primaryMuted: '#7C6EDC',
  onPrimary: '#FAFAFA',
  text: '#FAFAFA',
  textMuted: '#B3B3B3',
  textSubtle: '#7A7A7A',
  border: '#3D3D3D',
  borderNeon: 'rgba(155, 140, 255, 0.5)',
  error: '#FF6B6B',
  success: '#7CFF9E',
  overlayLine: '#FFFFFF',
  overlayLineGlow: '#9B8CFF',
  overlayHandle: '#FFFFFF',
  overlayHandleBorder: '#9B8CFF',
  headerBackground: '#1A1A1A',
  headerTint: '#FAFAFA',
  imageBackdrop: '#141414',
  devStatus: '#666666',
  neon: {
    magenta: '#FF4DAD',
    cyan: '#00E5FF',
    lime: '#B8FF3C',
    violet: '#A78BFA',
  },
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

export const shadows = {
  neonPrimary: {
    shadowColor: colors.neon.violet,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  neonSubtle: {
    shadowColor: colors.neon.violet,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
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
