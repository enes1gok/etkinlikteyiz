import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useEventsStore } from '../../src/store/eventsStore';
import { useAuthStore } from '../../src/store/authStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Colors } from '../../src/theme/colors';
import { FontSize, FontWeight } from '../../src/theme/typography';
import { BorderRadius, Spacing } from '../../src/theme/spacing';
import { MOCK_ATTENDEES, MOCK_USERS } from '../../src/utils/mockData';
import { getAttendanceRate, formatShortDate } from '../../src/utils/helpers';

const MONTHLY_DATA = [
  { month: 'Oca', events: 3, attendees: 145 },
  { month: 'Şub', events: 4, attendees: 210 },
  { month: 'Mar', events: 5, attendees: 287 },
  { month: 'Nis', events: 6, attendees: 342 },
  { month: 'May', events: 4, attendees: 198 },
  { month: 'Haz', events: 7, attendees: 421 },
] as const;

type SummaryItem = {
  label: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

export default function MembersScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { events, fetchEvents } = useEventsStore();
  const { community } = useAuthStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const { completedEvents, avgRate } = useMemo(() => {
    const completed = events.filter((e) => e.status === 'completed');
    const totalAttendees = completed.reduce((s, e) => s + e.checkedInCount, 0);
    const totalRegistered = completed.reduce((s, e) => s + e.registeredCount, 0);
    return { completedEvents: completed, avgRate: getAttendanceRate(totalAttendees, totalRegistered) };
  }, [events]);

  const topMembers = useMemo(
    () =>
      MOCK_USERS.map((u) => ({
        ...u,
        attended: MOCK_ATTENDEES.filter((a) => a.userId === u.id && a.checkedIn).length,
      })).sort((a, b) => b.attended - a.attended),
    []
  );

  const maxAttendees = Math.max(...MONTHLY_DATA.map((d) => d.attendees));

  const summaryItems: SummaryItem[] = [
    { label: 'Toplam Üye', value: community?.memberCount ?? 0, icon: 'people', color: Colors.primary },
    { label: 'Etkinlik', value: events.length, icon: 'calendar', color: Colors.secondary },
    { label: 'Katılım %', value: `${avgRate}%`, icon: 'trending-up', color: Colors.success },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? Colors.dark.bg : Colors.light.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Üyeler & İstatistikler</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {community?.name}
        </Text>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          {summaryItems.map((item) => (
            <View
              key={item.label}
              style={[styles.summaryCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}
              accessibilityLabel={`${item.label}: ${item.value}`}
            >
              <View style={[styles.summaryIcon, { backgroundColor: `${item.color}22` }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={[styles.summaryValue, { color: theme.text }]}>{item.value}</Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Monthly Chart */}
        <View style={[styles.chartCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>Aylık Katılım</Text>
            <View style={styles.chartLegend}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>Katılımcı</Text>
            </View>
          </View>

          <View style={styles.chart}>
            {MONTHLY_DATA.map((d) => {
              const height = Math.max((d.attendees / maxAttendees) * 120, 6);
              return (
                <View
                  key={d.month}
                  style={styles.chartBar}
                  accessibilityLabel={`${d.month}: ${d.attendees} katılımcı`}
                >
                  <Text style={[styles.chartValue, { color: theme.textMuted }]}>{d.attendees}</Text>
                  <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    style={[styles.bar, { height }]}
                  />
                  <Text style={[styles.chartMonth, { color: theme.textSecondary }]}>{d.month}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Event Attendance Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Etkinlik Katılım Oranları</Text>
          <View style={styles.eventBreakdown}>
            {completedEvents.map((event) => {
              const rate = getAttendanceRate(event.checkedInCount, event.registeredCount);
              const color = rate >= 80 ? Colors.success : rate >= 60 ? Colors.warning : Colors.error;
              return (
                <View
                  key={event.id}
                  style={[styles.breakdownItem, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}
                >
                  <View style={styles.breakdownHeader}>
                    <Text style={[styles.breakdownTitle, { color: theme.text }]} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={[styles.breakdownRate, { color }]}>{rate}%</Text>
                  </View>
                  <ProgressBar
                    value={event.checkedInCount}
                    max={event.registeredCount}
                    color={color}
                    height={6}
                    trackColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                  />
                  <Text style={[styles.breakdownMeta, { color: theme.textMuted }]}>
                    {event.checkedInCount}/{event.registeredCount} katılımcı · {formatShortDate(event.date)}
                  </Text>
                </View>
              );
            })}
            {completedEvents.length === 0 && (
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>Henüz tamamlanan etkinlik yok.</Text>
            )}
          </View>
        </View>

        {/* Top Members */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>En Aktif Üyeler</Text>
          <View style={styles.memberList}>
            {topMembers.map((member, index) => (
              <View
                key={member.id}
                style={[styles.memberItem, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}
                accessibilityLabel={`${index + 1}. ${member.name}, ${member.attended} etkinliğe katıldı`}
              >
                <Text style={[styles.rank, { color: index < 3 ? Colors.warning : theme.textMuted }]}>
                  #{index + 1}
                </Text>
                <Avatar name={member.name} size="sm" />
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, { color: theme.text }]}>{member.name}</Text>
                  <Text style={[styles.memberMeta, { color: theme.textSecondary }]}>
                    {member.studentId} · {member.role === 'admin' ? 'Yönetici' : member.role === 'organizer' ? 'Organizatör' : 'Üye'}
                  </Text>
                </View>
                <View style={styles.memberStats}>
                  <Text style={[styles.memberAttended, { color: Colors.primary }]}>{member.attended}</Text>
                  <Text style={[styles.memberAttendedLabel, { color: theme.textMuted }]}>katılım</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.base, gap: Spacing.xl, paddingBottom: Spacing['3xl'] },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, letterSpacing: -0.3 },
  subtitle: { fontSize: FontSize.sm, marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm },
  summaryCard: { flex: 1, borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.md, gap: Spacing.xs, alignItems: 'center' },
  summaryIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  summaryValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  summaryLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, textAlign: 'center' },
  chartCard: { borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.base },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  chartTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.xs },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 160 },
  chartBar: { flex: 1, alignItems: 'center', gap: Spacing.xs },
  chartValue: { fontSize: 9, fontWeight: FontWeight.medium },
  bar: { width: '65%', borderRadius: BorderRadius.sm },
  chartMonth: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  eventBreakdown: { gap: Spacing.sm },
  breakdownItem: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, gap: Spacing.sm },
  breakdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakdownTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, flex: 1 },
  breakdownRate: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  breakdownMeta: { fontSize: FontSize.xs },
  emptyText: { textAlign: 'center', fontSize: FontSize.sm, paddingVertical: Spacing.lg },
  memberList: { gap: Spacing.sm },
  memberItem: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, gap: Spacing.md },
  rank: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, width: 24 },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  memberMeta: { fontSize: FontSize.xs },
  memberStats: { alignItems: 'center' },
  memberAttended: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  memberAttendedLabel: { fontSize: 9 },
});
