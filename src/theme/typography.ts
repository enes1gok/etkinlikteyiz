import { TextStyle } from 'react-native';

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 42,
} as const;

export const FontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '800' as TextStyle['fontWeight'],
} as const;

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
} as const;

export const Typography = {
  display: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.extrabold,
    letterSpacing: -0.5,
  } as TextStyle,
  h1: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  } as TextStyle,
  h2: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.2,
  } as TextStyle,
  h3: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  } as TextStyle,
  h4: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  } as TextStyle,
  body: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.base * 1.5,
  } as TextStyle,
  bodyMedium: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  } as TextStyle,
  caption: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  } as TextStyle,
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  } as TextStyle,
} as const;
