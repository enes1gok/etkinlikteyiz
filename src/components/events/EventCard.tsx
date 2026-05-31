import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Event } from '../../types';
import { Colors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { BorderRadius, Shadow, Spacing } from '../../theme/spacing';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import {
  formatShortDate,
  formatDaysUntil,
  getEventCategoryLabel,
  getCapacityRate,
  getEventStatusLabel,
} from '../../utils/helpers';
import { useColorScheme } from '../../hooks/useColorScheme';

interface EventCardProps {
  event: Event;
  onPress: () => void;
  compact?: boolean;
}

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  workshop: 'hammer-outline',
  seminar: 'mic-outline',
  social: 'people-outline',
  competition: 'trophy-outline',
  trip: 'airplane-outline',
  meetup: 'cafe-outline',
  conference: 'business-outline',
  other: 'calendar-outline',
};

const statusVariants: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'neutral'> = {
  upcoming: 'primary',
  ongoing: 'success',
  completed: 'neutral',
  cancelled: 'error',
};

export const EventCard = memo(function EventCard({ event, onPress, compact = false }: EventCardProps) {
  const { isDark, theme } = useColorScheme();
  const categoryColor = Colors.eventCategoryColors[event.category] ?? Colors.primary;
  const capacityRate = getCapacityRate(event.registeredCount, event.maxCapacity);
  const icon = categoryIcons[event.category] ?? 'calendar-outline';
  const daysUntil = formatDaysUntil(event.date);
  const isUpcoming = event.status === 'upcoming';

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.compactCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }, Shadow.sm]}
        accessibilityRole="button"
        accessibilityLabel={`${event.title}, ${formatShortDate(event.date)}, ${event.startTime}`}
      >
        <View style={[styles.compactAccent, { backgroundColor: categoryColor }]} />
        <View style={[styles.compactIconBox, { backgroundColor: `${categoryColor}22` }]}>
          <Ionicons name={icon} size={16} color={categoryColor} />
        </View>
        <View style={styles.compactContent}>
          <Text style={[styles.compactTitle, { color: theme.text }]} numberOfLines={1}>{event.title}</Text>
          <Text style={[styles.compactMeta, { color: theme.textSecondary }]}>
            {formatShortDate(event.date)} · {event.startTime}
          </Text>
        </View>
        <View style={styles.compactRight}>
          <Text style={[styles.compactDays, { color: isUpcoming ? categoryColor : theme.textMuted }]}>
            {daysUntil}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }, Shadow.card]}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}. ${getEventStatusLabel(event.status)}. ${formatShortDate(event.date)}, ${event.startTime}. ${event.location}`}
    >
      <LinearGradient
        colors={[`${categoryColor}33`, `${categoryColor}08`]}
        style={styles.cardHeader}
      >
        <View style={styles.cardHeaderTop}>
          <View style={[styles.iconBox, { backgroundColor: `${categoryColor}33` }]}>
            <Ionicons name={icon} size={22} color={categoryColor} />
          </View>
          <View style={styles.headerRight}>
            <Badge
              label={getEventStatusLabel(event.status)}
              variant={statusVariants[event.status] ?? 'neutral'}
              dot
            />
            <Badge label={getEventCategoryLabel(event.category)} variant="neutral" />
          </View>
        </View>

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={13} color={theme.textSecondary} />
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            {formatShortDate(event.date)}
          </Text>
          <Ionicons name="time-outline" size={13} color={theme.textSecondary} />
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            {event.startTime} – {event.endTime}
          </Text>
          {isUpcoming && (
            <View style={[styles.daysChip, { backgroundColor: `${categoryColor}22` }]}>
              <Text style={[styles.daysChipText, { color: categoryColor }]}>{daysUntil}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={styles.cardBody}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{event.title}</Text>
        <Text style={[styles.desc, { color: theme.textSecondary }]} numberOfLines={2}>{event.description}</Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={theme.textMuted} />
          <Text style={[styles.locationText, { color: theme.textMuted }]} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        <View style={styles.capacitySection}>
          <View style={styles.capacityHeader}>
            <Text style={[styles.capacityLabel, { color: theme.textSecondary }]}>
              Kapasite
            </Text>
            <Text style={[styles.capacityValue, { color: capacityRate > 90 ? Colors.error : categoryColor }]}>
              {event.registeredCount}/{event.maxCapacity}
            </Text>
          </View>
          <ProgressBar
            value={event.registeredCount}
            max={event.maxCapacity}
            color={capacityRate > 90 ? Colors.error : categoryColor}
            height={5}
            trackColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
          />
        </View>

        <View style={styles.communityRow}>
          <View style={[styles.communityDot, { backgroundColor: categoryColor }]} />
          <Text style={[styles.communityText, { color: theme.textSecondary }]}>
            {event.communityName}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  cardHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dateText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  daysChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.xs,
  },
  daysChipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  cardBody: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.md * 1.35,
  },
  desc: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  locationText: {
    fontSize: FontSize.sm,
    flex: 1,
  },
  capacitySection: {
    gap: Spacing.xs,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  capacityLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  capacityValue: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  communityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs / 2,
  },
  communityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  communityText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    height: 68,
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  compactAccent: {
    width: 3,
    height: '100%',
  },
  compactIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContent: {
    flex: 1,
    gap: 3,
  },
  compactTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  compactMeta: {
    fontSize: FontSize.xs,
  },
  compactRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  compactDays: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
});
