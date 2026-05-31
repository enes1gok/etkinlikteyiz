import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { BorderRadius, Spacing } from '../../theme/spacing';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  dot?: boolean;
}

const variantConfig: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: Colors.primaryMuted, text: Colors.primaryLight },
  success: { bg: Colors.successMuted, text: Colors.success },
  warning: { bg: Colors.warningMuted, text: Colors.warning },
  error: { bg: Colors.errorMuted, text: Colors.error },
  neutral: { bg: 'rgba(255,255,255,0.08)', text: '#9898B3' },
};

export function Badge({ label, variant = 'primary', style, dot = false }: BadgeProps) {
  const config = variantConfig[variant];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: config.text }]} />}
      <Text style={[styles.text, { color: config.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs - 1,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.3,
  },
});
