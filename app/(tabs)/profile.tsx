import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useEventsStore } from '../../src/store/eventsStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { Badge } from '../../src/components/ui/Badge';
import { AchievementBadges } from '../../src/components/profile/AchievementBadges';
import { Colors } from '../../src/theme/colors';
import { FontSize, FontWeight } from '../../src/theme/typography';
import { BorderRadius, Spacing } from '../../src/theme/spacing';
import { formatDate } from '../../src/utils/helpers';
import { Achievement } from '../../src/types';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  color?: string;
  chevron?: boolean;
};

function MenuRow({ icon, label, value, onPress, color, chevron = true }: MenuItem) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.75}
      style={[styles.menuRow, { borderBottomColor: theme.border }]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={value ? `${label}: ${value}` : label}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${color ?? Colors.primary}22` }]}>
        <Ionicons name={icon} size={18} color={color ?? Colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
      <View style={styles.menuRight}>
        {value && <Text style={[styles.menuValue, { color: theme.textSecondary }]}>{value}</Text>}
        {chevron && <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />}
      </View>
    </TouchableOpacity>
  );
}

function buildAchievements(eventsAttended: number, eventsRegistered: number): Achievement[] {
  return [
    {
      id: 'first_event',
      title: 'İlk Adım',
      description: 'İlk etkinliğine katıldın',
      icon: 'footsteps-outline',
      color: Colors.success,
      unlocked: eventsAttended >= 1,
      unlockedAt: eventsAttended >= 1 ? '2023-10-01' : undefined,
      progress: Math.min(1, eventsAttended),
      maxProgress: 1,
    },
    {
      id: 'active_member',
      title: 'Aktif Üye',
      description: '5 etkinliğe katıl',
      icon: 'flame-outline',
      color: Colors.warning,
      unlocked: eventsAttended >= 5,
      unlockedAt: eventsAttended >= 5 ? '2023-11-15' : undefined,
      progress: Math.min(5, eventsAttended),
      maxProgress: 5,
    },
    {
      id: 'hero',
      title: 'Kahraman',
      description: '10 etkinliğe katıl',
      icon: 'trophy-outline',
      color: Colors.primary,
      unlocked: eventsAttended >= 10,
      progress: Math.min(10, eventsAttended),
      maxProgress: 10,
    },
    {
      id: 'legend',
      title: 'Efsane',
      description: '20 etkinliğe katıl',
      icon: 'diamond-outline',
      color: Colors.secondary,
      unlocked: eventsAttended >= 20,
      progress: Math.min(20, eventsAttended),
      maxProgress: 20,
    },
    {
      id: 'registered_5',
      title: 'Meraklı',
      description: '5 etkinliğe kayıt ol',
      icon: 'bookmark-outline',
      color: Colors.accent,
      unlocked: eventsRegistered >= 5,
      progress: Math.min(5, eventsRegistered),
      maxProgress: 5,
    },
    {
      id: 'networker',
      title: 'Networker',
      description: 'Kariyer etkinliğine katıl',
      icon: 'people-circle-outline',
      color: '#F59E0B',
      unlocked: eventsAttended >= 3,
      progress: Math.min(3, eventsAttended),
      maxProgress: 3,
    },
  ];
}

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { user, community, logout } = useAuthStore();
  const { events } = useEventsStore();

  const userEvents = events.filter((e) => user?.eventsRegistered.includes(e.id));

  const roleLabel = user?.role === 'admin' ? 'Yönetici' : user?.role === 'organizer' ? 'Organizatör' : 'Üye';
  const roleVariant: 'primary' | 'warning' | 'success' =
    user?.role === 'admin' ? 'warning' : user?.role === 'organizer' ? 'primary' : 'success';

  const achievements = useMemo(
    () => buildAchievements(user?.eventsAttended ?? 0, userEvents.length),
    [user?.eventsAttended, userEvents.length]
  );

  const handleLogout = useCallback(() => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istediğinden emin misin?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }, [logout]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? Colors.dark.bg : Colors.light.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile Header */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.secondary]}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.profileHeader}>
            <Avatar name={user?.name ?? 'U'} size="xl" />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.profileBadges}>
                <Badge label={roleLabel} variant={roleVariant} />
                <View style={[styles.studentIdChip]}>
                  <Ionicons name="card-outline" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.studentIdText}>{user?.studentId}</Text>
                </View>
              </View>
            </View>
          </View>

          {unlockedCount > 0 && (
            <View style={styles.achievementSummary}>
              <Ionicons name="trophy" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.achievementSummaryText}>
                {unlockedCount} başarı kazanıldı
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Community Info */}
        <View style={[styles.card, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
          <View style={styles.communityRow}>
            <View style={[styles.communityIcon, { backgroundColor: Colors.primaryMuted }]}>
              <Ionicons name="people" size={20} color={Colors.primary} />
            </View>
            <View style={styles.communityInfo}>
              <Text style={[styles.communityName, { color: theme.text }]}>{community?.name}</Text>
              <Text style={[styles.communityMeta, { color: theme.textSecondary }]}>
                {community?.university}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Kayıtlı', value: userEvents.length, icon: 'calendar-outline' as const, color: Colors.primary },
            { label: 'Katıldım', value: user?.eventsAttended ?? 0, icon: 'checkmark-circle-outline' as const, color: Colors.success },
            { label: 'Üyelik', value: formatDate(user?.joinedAt ?? '').split(' ').slice(1).join(' '), icon: 'time-outline' as const, color: Colors.secondary },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}
              accessibilityLabel={`${stat.label}: ${stat.value}`}
            >
              <Ionicons name={stat.icon} size={20} color={stat.color} />
              <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Achievements */}
        <AchievementBadges achievements={achievements} />

        {/* Menu Sections */}
        <View style={[styles.menuSection, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
          <Text style={[styles.menuSectionTitle, { color: theme.textMuted }]}>Hesap</Text>
          <MenuRow icon="person-outline" label="Profil Düzenle" color={Colors.primary} onPress={() => {}} />
          <MenuRow icon="notifications-outline" label="Bildirim Ayarları" color={Colors.warning} onPress={() => {}} />
          <MenuRow icon="shield-checkmark-outline" label="Gizlilik" color={Colors.success} onPress={() => {}} />
          <MenuRow icon="key-outline" label="Şifre Değiştir" color={Colors.secondary} onPress={() => {}} chevron />
        </View>

        <View style={[styles.menuSection, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
          <Text style={[styles.menuSectionTitle, { color: theme.textMuted }]}>Uygulama</Text>
          <MenuRow icon="color-palette-outline" label="Tema" value="Sistem" color={Colors.accent} />
          <MenuRow icon="language-outline" label="Dil" value="Türkçe" color={Colors.primary} />
          <MenuRow icon="information-circle-outline" label="Sürüm" value="1.0.0" color={Colors.secondary} chevron={false} />
        </View>

        <View style={[styles.menuSection, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
          <Text style={[styles.menuSectionTitle, { color: theme.textMuted }]}>Destek</Text>
          <MenuRow icon="help-circle-outline" label="Yardım & SSS" color={Colors.warning} onPress={() => {}} />
          <MenuRow icon="chatbubble-outline" label="Geri Bildirim" color={Colors.success} onPress={() => {}} />
          <MenuRow icon="document-text-outline" label="Kullanım Koşulları" color={Colors.textSecondary} onPress={() => {}} />
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutBtn, { backgroundColor: Colors.errorMuted, borderColor: `${Colors.error}40` }]}
          accessibilityRole="button"
          accessibilityLabel="Hesaptan çıkış yap"
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={[styles.logoutText, { color: Colors.error }]}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  heroGradient: { padding: Spacing.xl, paddingTop: Spacing['2xl'], gap: Spacing.md },
  profileHeader: { flexDirection: 'row', gap: Spacing.base, alignItems: 'center' },
  profileInfo: { flex: 1, gap: Spacing.xs },
  userName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#fff' },
  userEmail: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  profileBadges: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', marginTop: Spacing.xs / 2 },
  studentIdChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  studentIdText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', fontWeight: FontWeight.medium },
  achievementSummary: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: 'rgba(255,255,255,0.12)', alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  achievementSummaryText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.9)', fontWeight: FontWeight.semibold },
  card: { marginHorizontal: Spacing.base, borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.base },
  communityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  communityIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  communityInfo: { flex: 1, gap: 2 },
  communityName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  communityMeta: { fontSize: FontSize.xs },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base },
  statCard: { flex: 1, borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.md, alignItems: 'center', gap: Spacing.xs },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, textAlign: 'center' },
  menuSection: { marginHorizontal: Spacing.base, borderRadius: BorderRadius.xl, borderWidth: 1, overflow: 'hidden', paddingTop: Spacing.sm },
  menuSectionTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, letterSpacing: 0.5, textTransform: 'uppercase', paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, gap: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  menuIcon: { width: 36, height: 36, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.medium },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  menuValue: { fontSize: FontSize.sm },
  logoutBtn: { marginHorizontal: Spacing.base, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, borderRadius: BorderRadius.xl, borderWidth: 1, paddingVertical: Spacing.base },
  logoutText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
});
