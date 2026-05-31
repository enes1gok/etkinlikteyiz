import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Attendee } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Colors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { BorderRadius, Spacing } from '../../theme/spacing';

interface Props {
  attendees: Attendee[];
  totalCount: number;
  categoryColor: string;
  label?: string;
}

export function AttendeesPreview({ attendees, totalCount, categoryColor, label = 'Katılımcılar' }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  if (attendees.length === 0) return null;

  const preview = attendees.slice(0, 5);
  const remaining = Math.max(0, totalCount - preview.length);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${categoryColor}20` }]}>
          <Ionicons name="people-outline" size={16} color={categoryColor} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.count, { color: categoryColor }]}>{totalCount} kişi</Text>
      </View>

      <View style={styles.avatarRow}>
        {preview.map((a, idx) => (
          <View key={a.id} style={[styles.avatarWrap, { marginLeft: idx > 0 ? -10 : 0 }]}>
            <Avatar name={a.name} size="sm" />
          </View>
        ))}
        {remaining > 0 && (
          <View style={[styles.moreBadge, { backgroundColor: `${categoryColor}20`, borderColor: isDark ? Colors.dark.card : Colors.light.card }]}>
            <Text style={[styles.moreText, { color: categoryColor }]}>+{remaining > 99 ? '99' : remaining}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.subtitle, { color: theme.textMuted }]}>
        {preview[0]?.name.split(' ')[0]}
        {preview.length > 1 && ` ve ${totalCount - 1} kişi daha katılacak`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
  count: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    borderWidth: 2,
    borderRadius: 999,
    borderColor: 'transparent',
  },
  moreBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  moreText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
  },
});
