import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { BorderRadius } from '../../theme/spacing';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  trackColor?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = Colors.primary,
  height = 6,
  trackColor,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: trackColor ?? 'rgba(255,255,255,0.08)', borderRadius: height },
      ]}
    >
      <View
        style={[
          styles.fill,
          { width: `${percentage}%`, backgroundColor: color, borderRadius: height },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
