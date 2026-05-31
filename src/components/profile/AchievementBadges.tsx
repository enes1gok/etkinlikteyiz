import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Achievement } from '../../types';
import { Colors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { BorderRadius, Spacing } from '../../theme/spacing';

interface Props {
  achievements: Achievement[];
}

export function AchievementBadges({ achievements }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${Colors.warning}20` }]}>
          <Ionicons name="trophy-outline" size={18} color={Colors.warning} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Başarılar</Text>
        <View style={[styles.countBadge, { backgroundColor: `${Colors.warning}15` }]}>
          <Text style={[styles.countText, { color: Colors.warning }]}>
            {achievements.filter((a) => a.unlocked).length}/{achievements.length}
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {achievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.badge,
              {
                backgroundColor: achievement.unlocked
                  ? `${achievement.color}15`
                  : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                borderColor: achievement.unlocked ? `${achievement.color}40` : theme.border,
              },
            ]}
            accessibilityLabel={`${achievement.title}: ${achievement.description}`}
          >
            <View style={[
              styles.badgeIcon,
              {
                backgroundColor: achievement.unlocked ? `${achievement.color}25` : theme.border + '40',
              }
            ]}>
              <Ionicons
                name={achievement.icon as keyof typeof Ionicons.glyphMap}
                size={22}
                color={achievement.unlocked ? achievement.color : theme.textMuted}
              />
            </View>
            <Text
              style={[
                styles.badgeTitle,
                { color: achievement.unlocked ? theme.text : theme.textMuted },
              ]}
              numberOfLines={2}
            >
              {achievement.title}
            </Text>

            {achievement.maxProgress > 1 && !achievement.unlocked && (
              <View style={styles.progressWrap}>
                <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: achievement.color,
                        width: `${Math.min(100, (achievement.progress / achievement.maxProgress) * 100)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: theme.textMuted }]}>
                  {achievement.progress}/{achievement.maxProgress}
                </Text>
              </View>
            )}

            {achievement.unlocked && (
              <View style={[styles.checkmark, { backgroundColor: achievement.color }]}>
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  countText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  list: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  badge: {
    width: 92,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.xs,
    position: 'relative',
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    lineHeight: FontSize.xs * 1.4,
  },
  progressWrap: {
    width: '100%',
    gap: 3,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 9,
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
