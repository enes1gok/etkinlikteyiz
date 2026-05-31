import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme/colors';
import { FontWeight } from '../../theme/typography';
import { generateInitials } from '../../utils/helpers';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  uri?: string;
  size?: AvatarSize;
}

const sizes: Record<AvatarSize, { container: number; fontSize: number }> = {
  xs: { container: 28, fontSize: 10 },
  sm: { container: 36, fontSize: 13 },
  md: { container: 44, fontSize: 16 },
  lg: { container: 56, fontSize: 20 },
  xl: { container: 72, fontSize: 26 },
};

export function Avatar({ name, uri, size = 'md' }: AvatarProps) {
  const { container, fontSize } = sizes[size];
  const initials = generateInitials(name);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: container, height: container, borderRadius: container / 2 }}
      />
    );
  }

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.secondary]}
      style={[styles.container, { width: container, height: container, borderRadius: container / 2 }]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
});
