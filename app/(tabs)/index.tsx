import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useEventsStore } from '../../src/store/eventsStore';
import { useNotificationsStore } from '../../src/store/notificationsStore';
import { EventCard } from '../../src/components/events/EventCard';
import { StatCard } from '../../src/components/ui/StatCard';
import { Colors } from '../../src/theme/colors';
import { FontSize, FontWeight } from '../../src/theme/typography';
import { BorderRadius, Spacing } from '../../src/theme/spacing';
import { getAttendanceRate } from '../../src/utils/helpers';

const QUICK_ACTIONS = [
  { icon: 'add-circle-outline' as const, label: 'Etkinlik\nOluştur', route: '/events/create', color: Colors.primary },
  { icon: 'qr-code-outline' as const, label: 'QR\nOku', route: '/scanner', color: Colors.success },
  { icon: 'stats-chart-outline' as const, label: 'İstatistik', route: '/(tabs)/members', color: Colors.warning },
  { icon: 'megaphone-outline' as const, label: 'Bildirim\nGönder', route: '/(tabs)/notifications', color: Colors.secondary },
] as const;

export default function HomeScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { user, community } = useAuthStore();
  const { events, fetchEvents, isLoading } = useEventsStore();
  const { fetchNotifications, unreadCount } = useNotificationsStore();

  const userId = user?.id;

  useEffect(() => {
    fetchEvents();
    if (userId) fetchNotifications(userId);
  }, [fetchEvents, fetchNotifications, userId]);

  const upcomingEvents = useMemo(
    () => events.filter((e) => e.status === 'upcoming').slice(0, 3),
    [events]
  );

  const { avgAttendance } = useMemo(() => {
    const completedEvents = events.filter((e) => e.status === 'completed');
    const totalCheckedIn = completedEvents.reduce((s, e) => s + e.checkedInCount, 0);
    const totalRegistered = completedEvents.reduce((s, e) => s + e.registeredCount, 0);
    return { avgAttendance: getAttendanceRate(totalCheckedIn, totalRegistered) };
  }, [events]);

  const handleRefresh = useCallback(() => {
    fetchEvents();
    if (userId) fetchNotifications(userId);
  }, [fetchEvents, fetchNotifications, userId]);

  const navigateToNotifications = useCallback(() => router.push('/(tabs)/notifications'), []);
  const navigateToAllEvents = useCallback(() => router.push('/(tabs)/events'), []);
  const navigateToScanner = useCallback(() => router.push('/scanner'), []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? Colors.dark.bg : Colors.light.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              Merhaba, {user?.name.split(' ')[0]} 👋
            </Text>
            <Text style={[styles.communityName, { color: theme.text }]}>
              {community?.shortName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={navigateToNotifications}
            style={styles.notifBtn}
            accessibilityRole="button"
            accessibilityLabel={`Bildirimler${unreadCount > 0 ? `, ${unreadCount} okunmamış` : ''}`}
          >
            <Ionicons name="notifications-outline" size={22} color={theme.text} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <LinearGradient
          colors={Colors.gradients.hero as readonly [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>Yaklaşan Etkinlik</Text>
            {upcomingEvents[0] ? (
              <>
                <Text style={styles.heroTitle} numberOfLines={2}>{upcomingEvents[0].title}</Text>
                <View style={styles.heroMeta}>
                  <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.heroMetaText}>
                    {new Date(upcomingEvents[0].date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                  </Text>
                  <Ionicons name="people-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.heroMetaText}>{upcomingEvents[0].registeredCount} kayıtlı</Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push(`/events/${upcomingEvents[0].id}`)}
                  style={styles.heroBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`${upcomingEvents[0].title} etkinliğinin detaylarını gör`}
                >
                  <Text style={styles.heroBtnText}>Detayları Gör</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.heroTitle}>Yeni Etkinlikler Bekleniyor</Text>
            )}
          </View>
          <View style={styles.heroBg}>
            <Ionicons name="calendar" size={120} color="rgba(255,255,255,0.06)" />
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Etkinlik"
            value={events.length}
            icon="calendar"
            gradient={[Colors.primary, Colors.primaryDark]}
          />
          <StatCard
            label="Üyeler"
            value={community?.memberCount ?? 0}
            icon="people"
            gradient={[Colors.secondary, '#7C3AED']}
          />
          <StatCard
            label="Katılım"
            value={`${avgAttendance}%`}
            icon="trending-up"
            color={Colors.success}
            trend={{ value: 12, isPositive: true }}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Hızlı İşlemler</Text>
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={() => router.push(action.route as never)}
                style={[styles.quickAction, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}
                accessibilityRole="button"
                accessibilityLabel={action.label.replace('\n', ' ')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}22` }]}>
                  <Ionicons name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={[styles.quickActionLabel, { color: theme.text }]} numberOfLines={2}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Yaklaşan Etkinlikler</Text>
            <TouchableOpacity
              onPress={navigateToAllEvents}
              accessibilityRole="button"
              accessibilityLabel="Tüm etkinlikleri gör"
            >
              <Text style={{ color: Colors.primaryLight, fontSize: FontSize.sm, fontWeight: FontWeight.semibold }}>
                Tümü
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.eventList}>
            {upcomingEvents.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>Yaklaşan etkinlik yok.</Text>
            ) : (
              upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  compact
                  onPress={() => router.push(`/events/${event.id}`)}
                />
              ))
            )}
          </View>
        </View>

        {/* Role Banner */}
        {(user?.role === 'admin' || user?.role === 'organizer') && (
          <TouchableOpacity
            onPress={navigateToScanner}
            style={styles.scannerBanner}
            accessibilityRole="button"
            accessibilityLabel="QR kod okuyucuyu aç"
          >
            <LinearGradient
              colors={[Colors.success, '#16A34A']}
              style={styles.scannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="qr-code-outline" size={28} color="#fff" />
              <View>
                <Text style={styles.scannerTitle}>Etkinlik Girişi</Text>
                <Text style={styles.scannerSub}>QR kod okuyucuyu aç</Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={24} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.base, gap: Spacing.xl, paddingBottom: Spacing['3xl'] },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerLeft: { gap: 2 },
  greeting: { fontSize: FontSize.sm },
  communityName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, letterSpacing: -0.3 },
  notifBtn: { position: 'relative', padding: Spacing.xs },
  notifBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: Colors.error, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { fontSize: 9, color: '#fff', fontWeight: FontWeight.bold },
  hero: { borderRadius: BorderRadius['2xl'], padding: Spacing.xl, overflow: 'hidden', minHeight: 140 },
  heroContent: { gap: Spacing.sm, flex: 1, zIndex: 1 },
  heroLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', fontWeight: FontWeight.semibold, letterSpacing: 1, textTransform: 'uppercase' },
  heroTitle: { fontSize: FontSize.lg, color: '#fff', fontWeight: FontWeight.bold, lineHeight: FontSize.lg * 1.3 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  heroMetaText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', fontWeight: FontWeight.medium },
  heroBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: '#fff', borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, alignSelf: 'flex-start' },
  heroBtnText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  heroBg: { position: 'absolute', right: -10, bottom: -20, opacity: 0.4 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  section: { gap: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  quickActions: { flexDirection: 'row', gap: Spacing.sm },
  quickAction: { flex: 1, alignItems: 'center', borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.md, gap: Spacing.sm },
  quickActionIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, textAlign: 'center', lineHeight: FontSize.xs * 1.4 },
  eventList: { gap: Spacing.sm },
  emptyText: { textAlign: 'center', fontSize: FontSize.sm, paddingVertical: Spacing.xl },
  scannerBanner: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
  scannerGradient: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base + 4 },
  scannerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
  scannerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)' },
});
