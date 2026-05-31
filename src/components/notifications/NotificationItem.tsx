import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification, NotificationType } from '../../types';
import { Colors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { BorderRadius, Spacing } from '../../theme/spacing';
import { formatRelativeTime } from '../../utils/helpers';
import { useColorScheme } from '../../hooks/useColorScheme';

const typeConfig: Record<NotificationType, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  event_reminder: { icon: 'alarm-outline', color: Colors.warning },
  event_created: { icon: 'add-circle-outline', color: Colors.primary },
  event_cancelled: { icon: 'close-circle-outline', color: Colors.error },
  event_updated: { icon: 'refresh-circle-outline', color: Colors.accent },
  check_in_success: { icon: 'checkmark-circle-outline', color: Colors.success },
  general: { icon: 'megaphone-outline', color: Colors.secondary },
};

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const { isDark, theme } = useColorScheme();
  const config = typeConfig[notification.type];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          backgroundColor: notification.read
            ? isDark ? Colors.dark.card : Colors.light.card
            : isDark ? `${Colors.primary}18` : `${Colors.primary}0A`,
          borderColor: notification.read ? theme.border : `${Colors.primary}40`,
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: `${config.color}22` }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {notification.title}
          </Text>
          {!notification.read && <View style={[styles.unreadDot, { backgroundColor: Colors.primary }]} />}
        </View>
        <Text style={[styles.body, { color: theme.textSecondary }]} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={[styles.time, { color: theme.textMuted }]}>
          {formatRelativeTime(notification.createdAt)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  body: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
  },
  time: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
});
