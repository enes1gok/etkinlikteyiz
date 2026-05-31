import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { BorderRadius, Spacing } from '../../theme/spacing';

interface Props {
  eventId: string;
  interestedCount: number;
  isInterested: boolean;
  onToggleInterest: () => void;
  onShare: () => void;
}

export function EventReactions({ interestedCount, isInterested, onToggleInterest, onShare }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const handleInterest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleInterest();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
      <TouchableOpacity
        onPress={handleInterest}
        style={[
          styles.btn,
          isInterested
            ? { backgroundColor: `${Colors.primary}20`, borderColor: Colors.primary }
            : { backgroundColor: 'transparent', borderColor: theme.border },
        ]}
        accessibilityRole="button"
        accessibilityLabel={isInterested ? 'İlginizi kaldır' : 'İlgilendim'}
      >
        <Ionicons
          name={isInterested ? 'star' : 'star-outline'}
          size={18}
          color={isInterested ? Colors.primary : theme.textMuted}
        />
        <Text style={[styles.btnText, { color: isInterested ? Colors.primary : theme.textSecondary }]}>
          İlgilendim
        </Text>
        <View style={[styles.countBadge, { backgroundColor: isInterested ? `${Colors.primary}30` : `${theme.textMuted}20` }]}>
          <Text style={[styles.countText, { color: isInterested ? Colors.primary : theme.textMuted }]}>
            {interestedCount > 999 ? `${Math.floor(interestedCount / 1000)}B` : interestedCount}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <TouchableOpacity
        onPress={onShare}
        style={[styles.btn, { backgroundColor: 'transparent', borderColor: theme.border }]}
        accessibilityRole="button"
        accessibilityLabel="Etkinliği paylaş"
      >
        <Ionicons name="share-social-outline" size={18} color={theme.textMuted} />
        <Text style={[styles.btnText, { color: theme.textSecondary }]}>Paylaş</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderWidth: 0,
  },
  btnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  countBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 28,
    alignItems: 'center',
  },
  countText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  divider: {
    width: 1,
    height: 32,
  },
});
