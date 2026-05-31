import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AgendaItem } from '../../types';
import { Colors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { BorderRadius, Spacing } from '../../theme/spacing';

interface Props {
  agenda: AgendaItem[];
  categoryColor: string;
}

export function EventAgenda({ agenda, categoryColor }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const [expanded, setExpanded] = useState(false);

  if (!agenda || agenda.length === 0) return null;

  const visible = expanded ? agenda : agenda.slice(0, 3);
  const hasMore = agenda.length > 3;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${categoryColor}20` }]}>
          <Ionicons name="list-outline" size={16} color={categoryColor} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Etkinlik Programı</Text>
        <View style={[styles.countBadge, { backgroundColor: `${categoryColor}15` }]}>
          <Text style={[styles.countText, { color: categoryColor }]}>{agenda.length} oturum</Text>
        </View>
      </View>

      <View style={styles.timeline}>
        {visible.map((item, idx) => (
          <View key={item.id} style={styles.row}>
            <View style={styles.timeCol}>
              <Text style={[styles.time, { color: categoryColor }]}>{item.time}</Text>
              <Text style={[styles.duration, { color: theme.textMuted }]}>{item.duration}dk</Text>
            </View>

            <View style={styles.lineCol}>
              <View style={[styles.dot, { backgroundColor: categoryColor, borderColor: isDark ? Colors.dark.card : Colors.light.card }]} />
              {idx < visible.length - 1 && (
                <View style={[styles.line, { backgroundColor: `${categoryColor}30` }]} />
              )}
            </View>

            <View style={styles.content}>
              <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
              {item.speaker && (
                <View style={styles.speakerRow}>
                  <Ionicons name="person-outline" size={11} color={theme.textMuted} />
                  <Text style={[styles.speaker, { color: theme.textMuted }]}>{item.speaker}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {hasMore && (
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          style={[styles.toggleBtn, { borderColor: `${categoryColor}30` }]}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Programı daralt' : 'Programın tamamını gör'}
        >
          <Text style={[styles.toggleText, { color: categoryColor }]}>
            {expanded ? 'Daha az göster' : `${agenda.length - 3} oturum daha gör`}
          </Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={categoryColor} />
        </TouchableOpacity>
      )}
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
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  countText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  timeline: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    minHeight: 52,
  },
  timeCol: {
    width: 48,
    alignItems: 'flex-end',
    paddingTop: 2,
    gap: 2,
  },
  time: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  duration: {
    fontSize: 10,
  },
  lineCol: {
    width: 20,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    marginTop: 3,
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingBottom: Spacing.sm,
    gap: 3,
  },
  itemTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.sm * 1.4,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  speaker: {
    fontSize: FontSize.xs,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    marginTop: Spacing.xs,
  },
  toggleText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
