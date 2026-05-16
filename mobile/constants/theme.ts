/**
 * BiciTrack Design System — Tokens y utilidades visuales
 * Inspirado en: Uber, Apple Maps, Strava, Nike Run Club
 */

// ─── Paleta de colores ─────────────────────────────────
export const Colors = {
  // Fondos
  bg: '#0B0F1A',
  bgCard: 'rgba(16, 20, 35, 0.88)',
  bgCardSolid: '#10142a',
  bgElevated: 'rgba(22, 27, 45, 0.92)',
  bgSubtle: 'rgba(255, 255, 255, 0.04)',

  // Acentos
  primary: '#FF6B35',      // Naranja BiciTrack
  primaryMuted: 'rgba(255, 107, 53, 0.15)',
  secondary: '#6366F1',    // Indigo vibrante
  secondaryMuted: 'rgba(99, 102, 241, 0.15)',
  accent: '#06B6D4',       // Cyan eléctrico
  accentMuted: 'rgba(6, 182, 212, 0.15)',

  // Estado
  success: '#22C55E',
  successMuted: 'rgba(34, 197, 94, 0.15)',
  warning: '#F59E0B',
  warningMuted: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444',
  dangerMuted: 'rgba(239, 68, 68, 0.15)',

  // Texto
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.55)',
  textTertiary: 'rgba(255, 255, 255, 0.3)',
  textInverse: '#0B0F1A',

  // Bordes y separadores
  border: 'rgba(255, 255, 255, 0.06)',
  borderSubtle: 'rgba(255, 255, 255, 0.03)',
  separator: 'rgba(255, 255, 255, 0.08)',

  // Gradientes
  gradientPrimary: ['#FF6B35', '#FF8F5E'] as const,
  gradientDanger: ['#EF4444', '#DC2626'] as const,
  gradientSecondary: ['#6366F1', '#818CF8'] as const,
  gradientCyan: ['#06B6D4', '#22D3EE'] as const,
  gradientDark: ['rgba(11, 15, 26, 0)', 'rgba(11, 15, 26, 0.95)'] as const,
};

// ─── Tipografía ────────────────────────────────────────
export const Typography = {
  largeTitle: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
  headline: { fontSize: 17, fontWeight: '700' as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '500' as const },
  callout: { fontSize: 13, fontWeight: '600' as const },
  caption: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.3 },
  micro: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 0.5 },
};

// ─── Espaciado ─────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
};

// ─── Radios ────────────────────────────────────────────
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 100,
};

// ─── Sombras ───────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  }),
};
