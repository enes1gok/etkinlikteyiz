import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { BorderRadius, Spacing } from '../../theme/spacing';

interface Props {
  date: string;
  startTime: string;
  status: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(date: string, startTime: string): TimeLeft | null {
  const [h, m] = startTime.split(':').map(Number);
  const target = new Date(date);
  target.setHours(h, m, 0, 0);
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function EventCountdown({ date, startTime, status }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calcTimeLeft(date, startTime));

  useEffect(() => {
    if (status !== 'upcoming') return;
    const id = setInterval(() => {
      setTimeLeft(calcTimeLeft(date, startTime));
    }, 1000);
    return () => clearInterval(id);
  }, [date, startTime, status]);

  if (status !== 'upcoming' || !timeLeft) return null;

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 3;
  const accentColor = isUrgent ? Colors.error : Colors.primary;

  const units = [
    { label: 'GÜN', value: timeLeft.days },
    { label: 'SAAT', value: timeLeft.hours },
    { label: 'DAK', value: timeLeft.minutes },
    { label: 'SN', value: timeLeft.seconds },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: `${accentColor}40` }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${accentColor}20` }]}>
          <Ionicons name="timer-outline" size={16} color={accentColor} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Etkinliğe Kalan Süre</Text>
        {isUrgent && (
          <View style={[styles.urgentBadge, { backgroundColor: `${Colors.error}20` }]}>
            <Text style={[styles.urgentText, { color: Colors.error }]}>Bugün!</Text>
          </View>
        )}
      </View>
      <View style={styles.units}>
        {units.map((unit, idx) => (
          <React.Fragment key={unit.label}>
            <View style={styles.unit}>
              <View style={[styles.numBox, { backgroundColor: `${accentColor}15`, borderColor: `${accentColor}30` }]}>
                <Text style={[styles.num, { color: accentColor }]}>{pad(unit.value)}</Text>
              </View>
              <Text style={[styles.label, { color: theme.textMuted }]}>{unit.label}</Text>
            </View>
            {idx < units.length - 1 && (
              <Text style={[styles.colon, { color: accentColor }]}>:</Text>
            )}
          </React.Fragment>
        ))}
      </View>
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
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
  urgentBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  urgentText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  units: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  unit: {
    alignItems: 'center',
    gap: 4,
  },
  numBox: {
    width: 60,
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
  },
  colon: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.base,
  },
});
