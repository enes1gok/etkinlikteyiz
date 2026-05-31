import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../theme/colors';
import { BorderRadius, Shadow, Spacing } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  elevated?: boolean;
}

export function Card({ children, style, padding = Spacing.base, elevated = false }: CardProps) {
  const { isDark, theme } = useColorScheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
          borderColor: theme.border,
          padding,
        },
        elevated ? Shadow.card : Shadow.sm,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
});
