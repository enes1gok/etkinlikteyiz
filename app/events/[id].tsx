import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Share,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { useEventsStore } from '../../src/store/eventsStore';
import { useAuthStore } from '../../src/store/authStore';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Avatar } from '../../src/components/ui/Avatar';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Colors } from '../../src/theme/colors';
import { FontSize, FontWeight } from '../../src/theme/typography';
import { BorderRadius, Spacing } from '../../src/theme/spacing';
import {
  formatDate,
  getEventCategoryLabel,
  getAttendanceRate,
  getCapacityRate,
  getEventStatusLabel,
} from '../../src/utils/helpers';

const statusVariants: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'neutral'> = {
  upcoming: 'primary',
  ongoing: 'success',
  completed: 'neutral',
  cancelled: 'error',
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { events, attendees, selectEvent, selectedEvent, registerForEvent } = useEventsStore();
  const { user } = useAuthStore();
  const [registering, setRegistering] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (id) selectEvent(id);
  }, [id]);

  const event = selectedEvent ?? events.find((e) => e.id === id);
  if (!event) return null;

  const eventAttendees = attendees.filter((a) => a.eventId === event.id);
  const isRegistered = user?.eventsRegistered.includes(event.id) ?? false;
  const isOrganizer = user?.role === 'admin' || user?.role === 'organizer';
  const capacityRate = getCapacityRate(event.registeredCount, event.maxCapacity);
  const attendanceRate = getAttendanceRate(event.checkedInCount, event.registeredCount);
  const categoryColor = Colors.eventCategoryColors[event.category] ?? Colors.primary;

  const handleRegister = async () => {
    if (!user) return;
    setRegistering(true);
    await registerForEvent(event.id, user.id);
    setRegistering(false);
    Alert.alert('Kayıt Başarılı!', 'Etkinliğe kaydoldunuz. QR kodunuzu etkinlik girişinde gösterin.', [{ text: 'QR Kodu Göster', onPress: () => setShowQR(true) }, { text: 'Tamam' }]);
  };

  const handleShare = () => {
    Share.share({
      title: event.title,
      message: `${event.title}\n${formatDate(event.date)} · ${event.startTime}\n${event.location}\n\nUniComm ile keşfet!`,
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? Colors.dark.bg : Colors.light.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <LinearGradient
          colors={[`${categoryColor}44`, `${categoryColor}11`]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]}>
              <Ionicons name="arrow-back" size={20} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={[styles.shareBtn, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]}>
              <Ionicons name="share-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.badgeRow}>
              <Badge label={getEventCategoryLabel(event.category)} variant="primary" />
              <Badge label={getEventStatusLabel(event.status)} variant={statusVariants[event.status] ?? 'neutral'} dot />
            </View>
            <Text style={[styles.eventTitle, { color: theme.text }]}>{event.title}</Text>
            <Text style={[styles.communityName, { color: categoryColor }]}>{event.communityName}</Text>
          </View>
        </LinearGradient>

        {/* Key Info */}
        <View style={styles.infoGrid}>
          {[
            { icon: 'calendar-outline' as const, label: 'Tarih', value: formatDate(event.date) },
            { icon: 'time-outline' as const, label: 'Saat', value: `${event.startTime} – ${event.endTime}` },
            { icon: 'location-outline' as const, label: 'Konum', value: event.location },
            { icon: 'people-outline' as const, label: 'Kapasite', value: `${event.registeredCount}/${event.maxCapacity}` },
          ].map((info) => (
            <View key={info.label} style={[styles.infoCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
              <View style={[styles.infoIcon, { backgroundColor: `${categoryColor}22` }]}>
                <Ionicons name={info.icon} size={16} color={categoryColor} />
              </View>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{info.label}</Text>
              <Text style={[styles.infoValue, { color: theme.text }]} numberOfLines={2}>{info.value}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Hakkında</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>{event.description}</Text>
        </View>

        {/* Tags */}
        {event.tags.length > 0 && (
          <View style={styles.tags}>
            {event.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: `${categoryColor}18`, borderColor: `${categoryColor}40` }]}>
                <Text style={[styles.tagText, { color: categoryColor }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Capacity */}
        <View style={[styles.section, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
          <View style={styles.capacityHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Kapasite</Text>
            <Text style={[styles.capacityPct, { color: capacityRate > 90 ? Colors.error : categoryColor }]}>
              {capacityRate}% dolu
            </Text>
          </View>
          <ProgressBar
            value={event.registeredCount}
            max={event.maxCapacity}
            color={capacityRate > 90 ? Colors.error : categoryColor}
            height={8}
            trackColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
          />
          <Text style={[styles.capacityDetail, { color: theme.textMuted }]}>
            {event.maxCapacity - event.registeredCount} kişilik yer kaldı
          </Text>

          {event.status === 'completed' && (
            <>
              <View style={styles.divider} />
              <View style={styles.attendanceHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Giriş Oranı</Text>
                <Text style={[styles.capacityPct, { color: attendanceRate >= 80 ? Colors.success : Colors.warning }]}>
                  {attendanceRate}%
                </Text>
              </View>
              <ProgressBar
                value={event.checkedInCount}
                max={event.registeredCount}
                color={attendanceRate >= 80 ? Colors.success : Colors.warning}
                height={8}
                trackColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              />
              <Text style={[styles.capacityDetail, { color: theme.textMuted }]}>
                {event.checkedInCount} giriş / {event.registeredCount} kayıtlı
              </Text>
            </>
          )}
        </View>

        {/* Attendees Preview */}
        {isOrganizer && eventAttendees.length > 0 && (
          <View style={[styles.section, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Katılımcılar ({eventAttendees.length})
              </Text>
            </View>
            <View style={styles.attendeeList}>
              {eventAttendees.slice(0, 5).map((a) => (
                <View key={a.id} style={styles.attendeeRow}>
                  <Avatar name={a.name} size="sm" />
                  <View style={styles.attendeeInfo}>
                    <Text style={[styles.attendeeName, { color: theme.text }]}>{a.name}</Text>
                    <Text style={[styles.attendeeId, { color: theme.textMuted }]}>{a.studentId}</Text>
                  </View>
                  {a.checkedIn ? (
                    <View style={[styles.checkinBadge, { backgroundColor: Colors.successMuted }]}>
                      <Ionicons name="checkmark" size={12} color={Colors.success} />
                      <Text style={[styles.checkinText, { color: Colors.success }]}>Giriş</Text>
                    </View>
                  ) : (
                    <View style={[styles.checkinBadge, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                      <Text style={[styles.checkinText, { color: theme.textMuted }]}>Bekliyor</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* QR Code */}
        {(isRegistered || showQR) && (
          <View style={[styles.qrSection, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: Colors.primary }]}>
            <View style={styles.qrHeader}>
              <Ionicons name="qr-code" size={20} color={Colors.primary} />
              <Text style={[styles.qrTitle, { color: theme.text }]}>Giriş QR Kodunuz</Text>
            </View>
            <Text style={[styles.qrSubtitle, { color: theme.textSecondary }]}>
              Etkinlik girişinde bu kodu gösterin
            </Text>
            <View style={[styles.qrBox, { backgroundColor: '#fff' }]}>
              <QRCode value={event.qrCodeData} size={180} color="#0F0F14" backgroundColor="#fff" />
            </View>
            <Text style={[styles.qrEventName, { color: theme.textMuted }]} numberOfLines={1}>
              {event.title}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <View style={[styles.cta, { backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface, borderTopColor: theme.border }]}>
        {isOrganizer ? (
          <Button
            label="QR Okuyucu Aç"
            onPress={() => router.push(`/scanner?eventId=${event.id}`)}
            fullWidth
            size="lg"
            leftIcon={<Ionicons name="qr-code-outline" size={20} color="#fff" />}
          />
        ) : isRegistered ? (
          <View style={styles.registeredRow}>
            <View style={[styles.registeredBadge, { backgroundColor: Colors.successMuted }]}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={[styles.registeredText, { color: Colors.success }]}>Kayıtlısınız</Text>
            </View>
            <Button
              label="QR Kodunu Gör"
              onPress={() => setShowQR(true)}
              variant="outline"
              size="md"
            />
          </View>
        ) : event.isRegistrationOpen && event.status === 'upcoming' ? (
          <Button
            label="Kayıt Ol"
            onPress={handleRegister}
            loading={registering}
            fullWidth
            size="lg"
            disabled={capacityRate >= 100}
          />
        ) : (
          <Button label="Kayıt Kapalı" onPress={() => {}} variant="ghost" fullWidth size="lg" disabled />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 120 },
  header: { padding: Spacing.base, gap: Spacing.md, paddingTop: Spacing.base },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  shareBtn: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  heroContent: { gap: Spacing.sm, paddingBottom: Spacing.sm },
  badgeRow: { flexDirection: 'row', gap: Spacing.xs },
  eventTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, letterSpacing: -0.3, lineHeight: FontSize['2xl'] * 1.25 },
  communityName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, padding: Spacing.base },
  infoCard: { width: '47%', borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, gap: Spacing.xs },
  infoIcon: { width: 32, height: 32, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  infoValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, lineHeight: FontSize.sm * 1.4 },
  section: { marginHorizontal: Spacing.base, borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.base, gap: Spacing.sm, marginBottom: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  description: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.65 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, paddingHorizontal: Spacing.base, marginBottom: Spacing.md },
  tag: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full, borderWidth: 1 },
  tagText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  capacityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  capacityPct: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  capacityDetail: { fontSize: FontSize.xs },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: Spacing.sm },
  attendanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attendeeList: { gap: Spacing.sm },
  attendeeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  attendeeInfo: { flex: 1, gap: 2 },
  attendeeName: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  attendeeId: { fontSize: FontSize.xs },
  checkinBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  checkinText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  qrSection: { marginHorizontal: Spacing.base, borderRadius: BorderRadius.xl, borderWidth: 1.5, padding: Spacing.base, alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  qrHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qrTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  qrSubtitle: { fontSize: FontSize.xs, textAlign: 'center' },
  qrBox: { padding: Spacing.base, borderRadius: BorderRadius.lg },
  qrEventName: { fontSize: FontSize.xs, textAlign: 'center', maxWidth: 200 },
  cta: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.base, borderTopWidth: 1 },
  registeredRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  registeredBadge: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.lg },
  registeredText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});
