import '@/global.css';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#FFFFFF',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',
    textSecondary: '#64748B',
    tint: '#0EA5E9',
    success: '#16A34A',
    error: '#DC2626',
    border: '#E2E8F0',
  },
  dark: {
    text: '#F8FAFC',
    background: '#020617',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    textSecondary: '#94A3B8',
    tint: '#38BDF8',
    success: '#4ADE80',
    error: '#F87171',
    border: '#334155',
  },
};

export const Spacing = {
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

// Small phone / large phone start at 0 (the default), so only the wider
// breakpoints need an explicit cutoff. Tablet doubles as the switch from
// mobile bottom-tab navigation to the desktop-style sidebar.
export const Breakpoints = {
  largePhone: 400,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
};
