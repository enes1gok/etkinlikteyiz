import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Share,
  Alert,
  ActivityIndicator,
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
import { EventCountdown } from '../../src/components/events/EventCountdown';
import { EventReactions } from '../../src/components/events/EventReactions';
import { EventAgenda } from '../../src/components/events/EventAgenda';
import { AttendeesPreview } from '../../src/components/events/AttendeesPreview';
import { RatingModal } from '../../src/components/events/RatingModal';
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

const STATUS_VARIANTS: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'neutral'> = {
  upcoming: 'primary',
  ongoing: 'success',
  completed: 'neutral',
  cancelled: 'error',
};

function StarRating({ value, count }: { value: number; count: number }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons
          key={n}
          name={n <= Math.round(value) ? 'star' : 'star-outline'}
          size={14}
          color={Colors.warning}
        />
      ))}
      <Text style={[starStyles.value, { color: theme.text }]}>{value.toFixed(1)}</Text>
      <Text style={[starStyles.count, { color: theme.textMuted }]}>({count})</Text>
    </View>
  );
}

const starStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  value: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginLeft: 4 },
  count: { fontSize: FontSize.xs },
});

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const {
    events,
    attendees,
    selectEvent,
    selectedEvent,
    registerForEvent,
    joinWaitlist,
    leaveWaitlist,
    getWaitlistPosition,
    toggleInterest,
    isInterested,
    submitRating,
    getUserRating,
    isLoading,
  } = useEventsStore();
  const { user } = useAuthStore();

  const [registering, setRegistering] = useState(false);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (id) selectEvent(id);
  }, [id, selectEvent]);

  const event = selectedEvent ?? events.find((e) => e.id === id);

  if (isLoading && !event) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? Colors.dark.bg : Colors.light.bg }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? Colors.dark.bg : Colors.light.bg }]}>
        <View style={styles.centered}>
          <Ionicons name="calendar-outline" size={64} color={theme.textMuted} />
          <Text style={[styles.notFoundTitle, { color: theme.text }]}>Etkinlik Bulunamadı</Text>
          <Text style={[styles.notFoundSub, { color: theme.textSecondary }]}>
            Bu etkinlik mevcut değil veya kaldırılmış.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backLink, { backgroundColor: Colors.primaryMuted }]}
            accessibilityRole="button"
            accessibilityLabel="Geri dön"
          >
            <Text style={{ color: Colors.primaryLight, fontWeight: FontWeight.semibold }}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const eventAttendees = attendees.filter((a) => a.eventId === event.id);
  const isRegistered = user?.eventsRegistered.includes(event.id) ?? false;
  const isOrganizer = user?.role === 'admin' || user?.role === 'organizer';
  const capacityRate = getCapacityRate(event.registeredCount, event.maxCapacity);
  const attendanceRate = getAttendanceRate(event.checkedInCount, event.registeredCount);
  const categoryColor = Colors.eventCategoryColors[event.category] ?? Colors.primary;
  const isFull = capacityRate >= 100;
  const userId = user?.id ?? '';
  const userInterested = isInterested(event.id, userId);
  const waitlistPos = getWaitlistPosition(event.id, userId);
  const onWaitlist = waitlistPos > 0;
  const userRating = getUserRating(event.id, userId);

  const handleRegister = async () => {
    if (!user) return;
    setRegistering(true);
    const ok = await registerForEvent(event.id, user.id);
    setRegistering(false);
    if (ok) {
      Alert.alert(
        'Kayıt Başarılı!',
        'Etkinliğe kaydoldunuz. QR kodunuzu etkinlik girişinde gösterin.',
        [
          { text: 'QR Kodu Göster', onPress: () => setShowQR(true) },
          { text: 'Tamam' },
        ]
      );
    } else {
      Alert.alert('Hata', 'Kayıt işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleJoinWaitlist = async () => {
    if (!user) return;
    setJoiningWaitlist(true);
    const ok = await joinWaitlist(event.id, user.id, user.name, user.studentId);
    setJoiningWaitlist(false);
    if (ok) {
      const pos = getWaitlistPosition(event.id, user.id);
      Alert.alert(
        'Bekleme Listesine Eklendiniz',
        `Sıranız: ${pos}. Kontenjan açıldığında bildirim alacaksınız.`,
        [{ text: 'Tamam' }]
      );
    }
  };

  const handleLeaveWaitlist = () => {
    if (!user) return;
    Alert.alert('Bekleme Listesinden Çık', 'Bekleme listesinden çıkmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çık', style: 'destructive', onPress: () => leaveWaitlist(event.id, user.id) },
    ]);
  };

  const handleToggleInterest = useCallback(() => {
    if (!userId) return;
    toggleInterest(event.id, userId);
  }, [event.id, userId, toggleInterest]);

  const handleShare = useCallback(() => {
    Share.share({
      title: event.title,
      message: `${event.title}\n${formatDate(event.date)} · ${event.startTime}\n${event.location}\n\nUniComm ile keşfet!`,
    });
  }, [event]);

  const handleRatingSubmit = async (rating: number, comment?: string) => {
    await submitRating(event.id, userId, rating, comment);
    Alert.alert('Teşekkürler!', 'Değerlendirmeniz kaydedildi.');
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
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]}
              accessibilityRole="button"
              accessibilityLabel="Geri dön"
            >
              <Ionicons name="arrow-back" size={20} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              style={[styles.shareBtn, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]}
              accessibilityRole="button"
              accessibilityLabel="Etkinliği paylaş"
            >
              <Ionicons name="share-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.badgeRow}>
              <Badge label={getEventCategoryLabel(event.category)} variant="primary" />
              <Badge label={getEventStatusLabel(event.status)} variant={STATUS_VARIANTS[event.status] ?? 'neutral'} dot />
            </View>
            <Text style={[styles.eventTitle, { color: theme.text }]}>{event.title}</Text>
            <Text style={[styles.communityName, { color: categoryColor }]}>{event.communityName}</Text>
            {event.averageRating != null && event.ratingCount != null && (
              <StarRating value={event.averageRating} count={event.ratingCount} />
            )}
          </View>
        </LinearGradient>

        {/* Countdown */}
        <EventCountdown date={event.date} startTime={event.startTime} status={event.status} />

        {/* Key Info */}
        <View style={styles.infoGrid}>
          {[
            { icon: 'calendar-outline' as const, label: 'Tarih', value: formatDate(event.date) },
            { icon: 'time-outline' as const, label: 'Saat', value: `${event.startTime} – ${event.endTime}` },
            { icon: 'location-outline' as const, label: 'Konum', value: event.location },
            { icon: 'people-outline' as const, label: 'Kapasite', value: `${event.registeredCount}/${event.maxCapacity}` },
          ].map((info) => (
            <View
              key={info.label}
              style={[styles.infoCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}
              accessibilityLabel={`${info.label}: ${info.value}`}
            >
              <View style={[styles.infoIcon, { backgroundColor: `${categoryColor}22` }]}>
                <Ionicons name={info.icon} size={16} color={categoryColor} />
              </View>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{info.label}</Text>
              <Text style={[styles.infoValue, { color: theme.text }]} numberOfLines={2}>{info.value}</Text>
            </View>
          ))}
        </View>

        {/* Reactions */}
        <EventReactions
          eventId={event.id}
          interestedCount={event.interestedCount ?? 0}
          isInterested={userInterested}
          onToggleInterest={handleToggleInterest}
          onShare={handleShare}
        />

        {/* Attendees "See who's going" */}
        {eventAttendees.length > 0 && event.status === 'upcoming' && (
          <AttendeesPreview
            attendees={eventAttendees}
            totalCount={event.registeredCount}
            categoryColor={categoryColor}
            label="Kimler Geliyor"
          />
        )}

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

        {/* Agenda */}
        {event.agenda && event.agenda.length > 0 && (
          <EventAgenda agenda={event.agenda} categoryColor={categoryColor} />
        )}

        {/* Capacity */}
        <View style={[styles.section, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
          <View style={styles.capacityHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Kapasite</Text>
            <Text style={[styles.capacityPct, { color: isFull ? Colors.error : categoryColor }]}>
              {capacityRate}% dolu
            </Text>
          </View>
          <ProgressBar
            value={event.registeredCount}
            max={event.maxCapacity}
            color={isFull ? Colors.error : categoryColor}
            height={8}
            trackColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
          />
          {isFull ? (
            <View style={styles.waitlistInfo}>
              <Ionicons name="hourglass-outline" size={14} color={Colors.warning} />
              <Text style={[styles.capacityDetail, { color: Colors.warning }]}>
                Kontenjan dolu · {event.waitlistCount ?? 0} kişi bekleme listesinde
              </Text>
            </View>
          ) : (
            <Text style={[styles.capacityDetail, { color: theme.textMuted }]}>
              {event.maxCapacity - event.registeredCount} kişilik yer kaldı
            </Text>
          )}

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

        {/* Organizer attendee list */}
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

        {/* Post-event Rating */}
        {event.status === 'completed' && isRegistered && (
          <View style={[styles.section, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Değerlendirme</Text>
              {event.averageRating != null && (
                <StarRating value={event.averageRating} count={event.ratingCount ?? 0} />
              )}
            </View>
            {userRating ? (
              <View style={[styles.myRating, { backgroundColor: `${Colors.warning}15`, borderColor: `${Colors.warning}30` }]}>
                <View style={styles.myRatingStars}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons key={n} name={n <= userRating.rating ? 'star' : 'star-outline'} size={16} color={Colors.warning} />
                  ))}
                </View>
                {userRating.comment && (
                  <Text style={[styles.myRatingComment, { color: theme.textSecondary }]}>"{userRating.comment}"</Text>
                )}
                <Text style={[styles.myRatingDate, { color: theme.textMuted }]}>Değerlendirdiniz</Text>
              </View>
            ) : (
              <Button
                label="Etkinliği Değerlendir"
                onPress={() => setShowRatingModal(true)}
                variant="outline"
                fullWidth
                leftIcon={<Ionicons name="star-outline" size={18} color={Colors.primary} />}
              />
            )}
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
        ) : isFull && event.isRegistrationOpen && event.status === 'upcoming' ? (
          onWaitlist ? (
            <View style={styles.registeredRow}>
              <View style={[styles.registeredBadge, { backgroundColor: `${Colors.warning}20` }]}>
                <Ionicons name="hourglass-outline" size={18} color={Colors.warning} />
                <Text style={[styles.registeredText, { color: Colors.warning }]}>{waitlistPos}. sıradasınız</Text>
              </View>
              <Button label="Listeden Çık" onPress={handleLeaveWaitlist} variant="ghost" size="md" />
            </View>
          ) : (
            <Button
              label="Bekleme Listesine Ekle"
              onPress={handleJoinWaitlist}
              loading={joiningWaitlist}
              fullWidth
              size="lg"
              variant="outline"
              leftIcon={<Ionicons name="hourglass-outline" size={20} color={Colors.primary} />}
            />
          )
        ) : event.isRegistrationOpen && event.status === 'upcoming' ? (
          <Button
            label="Kayıt Ol"
            onPress={handleRegister}
            loading={registering}
            fullWidth
            size="lg"
          />
        ) : (
          <Button label="Kayıt Kapalı" onPress={() => {}} variant="ghost" fullWidth size="lg" disabled />
        )}
      </View>

      <RatingModal
        visible={showRatingModal}
        eventTitle={event.title}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 120 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing['2xl'] },
  notFoundTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center' },
  notFoundSub: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: FontSize.sm * 1.6 },
  backLink: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.lg, marginTop: Spacing.sm },
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
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  description: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.65 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, paddingHorizontal: Spacing.base, marginBottom: Spacing.md },
  tag: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full, borderWidth: 1 },
  tagText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  capacityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  capacityPct: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  capacityDetail: { fontSize: FontSize.xs },
  waitlistInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: Spacing.sm },
  attendanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attendeeList: { gap: Spacing.sm },
  attendeeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  attendeeInfo: { flex: 1, gap: 2 },
  attendeeName: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  attendeeId: { fontSize: FontSize.xs },
  checkinBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  checkinText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  myRating: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, gap: Spacing.xs },
  myRatingStars: { flexDirection: 'row', gap: 3 },
  myRatingComment: { fontSize: FontSize.sm, fontStyle: 'italic', lineHeight: FontSize.sm * 1.5 },
  myRatingDate: { fontSize: FontSize.xs },
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
