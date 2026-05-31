export const Colors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryMuted: 'rgba(99, 102, 241, 0.15)',

  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',
  secondaryMuted: 'rgba(139, 92, 246, 0.15)',

  accent: '#06B6D4',
  accentMuted: 'rgba(6, 182, 212, 0.15)',

  success: '#22C55E',
  successMuted: 'rgba(34, 197, 94, 0.15)',

  warning: '#F59E0B',
  warningMuted: 'rgba(245, 158, 11, 0.15)',

  error: '#EF4444',
  errorMuted: 'rgba(239, 68, 68, 0.15)',

  dark: {
    bg: '#0A0A12',
    surface: '#13131E',
    card: '#1A1A28',
    cardHover: '#1F1F30',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.15)',
    text: '#F1F1F8',
    textSecondary: '#9898B3',
    textMuted: '#5A5A78',
    overlay: 'rgba(0,0,0,0.7)',
  },

  light: {
    bg: '#F5F5FF',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardHover: '#F0F0FF',
    border: 'rgba(0,0,0,0.08)',
    borderStrong: 'rgba(0,0,0,0.15)',
    text: '#0F0F1A',
    textSecondary: '#5A5A78',
    textMuted: '#9898B3',
    overlay: 'rgba(0,0,0,0.5)',
  },

  categoryColors: {
    technology: '#6366F1',
    sports: '#22C55E',
    arts: '#EC4899',
    science: '#06B6D4',
    social: '#F59E0B',
    music: '#8B5CF6',
    gaming: '#EF4444',
    other: '#64748B',
  },

  eventCategoryColors: {
    workshop: '#6366F1',
    seminar: '#06B6D4',
    social: '#F59E0B',
    competition: '#EF4444',
    trip: '#22C55E',
    meetup: '#8B5CF6',
    conference: '#EC4899',
    other: '#64748B',
  },

  gradients: {
    primary: ['#6366F1', '#8B5CF6'],
    dark: ['#13131E', '#0A0A12'],
    card: ['#1A1A28', '#13131E'],
    success: ['#22C55E', '#16A34A'],
    hero: ['#4F46E5', '#7C3AED'],
  },
} as const;
