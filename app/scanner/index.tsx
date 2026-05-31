import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useEventsStore } from '../../src/store/eventsStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { Colors } from '../../src/theme/colors';
import { FontSize, FontWeight } from '../../src/theme/typography';
import { BorderRadius, Spacing } from '../../src/theme/spacing';
import { Attendee } from '../../src/types';
import { formatShortDate } from '../../src/utils/helpers';

type ScanResult = { success: boolean; message: string; attendee?: Attendee };

export default function ScannerScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [checkedIn, setCheckedIn] = useState<Attendee[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(eventId ?? '');

  const { events, checkInByQR, fetchEvents } = useEventsStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const upcomingEvents = events.filter((e) => e.status === 'upcoming');
  const activeEvent = events.find((e) => e.id === selectedEventId);

  const handleBarcodeScanned = useCallback(async ({ data }: { data: string }) => {
    if (scanned || !selectedEventId) return;
    setScanned(true);

    const result = await checkInByQR(data, selectedEventId);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (result.attendee) setCheckedIn((prev) => [result.attendee!, ...prev]);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setLastResult(result);
    setTimeout(() => {
      setScanned(false);
      setLastResult(null);
    }, 2500);
  }, [scanned, selectedEventId, checkInByQR]);

  // Permission loading state
  if (!permission) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? Colors.dark.bg : Colors.light.bg }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? Colors.dark.bg : Colors.light.bg }]}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={Colors.primary} />
          <Text style={[styles.permTitle, { color: theme.text }]}>Kamera İzni</Text>
          <Text style={[styles.permText, { color: theme.textSecondary }]}>
            QR kodları okumak için kamera erişimine izin verin.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={styles.permBtn}
            accessibilityRole="button"
            accessibilityLabel="Kamera iznine izin ver"
          >
            <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.permBtnGrad}>
              <Text style={styles.permBtnText}>İzin Ver</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      {selectedEventId ? (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000' }]} />
      )}

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top Bar */}
        <SafeAreaView>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Geri dön"
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.topCenter}>
              <Text style={styles.topTitle}>QR Okuyucu</Text>
              {activeEvent && (
                <Text style={styles.topSub} numberOfLines={1}>{activeEvent.title}</Text>
              )}
            </View>
            <View style={styles.iconBtn} />
          </View>

          {/* Event Selector */}
          {!selectedEventId && (
            <View style={styles.eventSelector}>
              <Text style={styles.selectorTitle}>Etkinlik Seç</Text>
              {upcomingEvents.length === 0 ? (
                <Text style={styles.selectorEmpty}>Yaklaşan etkinlik bulunamadı.</Text>
              ) : (
                upcomingEvents.map((e) => (
                  <TouchableOpacity
                    key={e.id}
                    onPress={() => setSelectedEventId(e.id)}
                    style={styles.selectorItem}
                    accessibilityRole="button"
                    accessibilityLabel={`${e.title} etkinliğini seç`}
                  >
                    <Ionicons name="calendar-outline" size={16} color={Colors.primaryLight} />
                    <View style={styles.selectorInfo}>
                      <Text style={styles.selectorName} numberOfLines={1}>{e.title}</Text>
                      <Text style={styles.selectorMeta}>{formatShortDate(e.date)} · {e.registeredCount} kayıt</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </SafeAreaView>

        {/* Scan Area */}
        {selectedEventId && (
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <Text style={styles.scanHint}>QR kodu çerçeve içine getirin</Text>
          </View>
        )}

        {/* Result Toast */}
        {lastResult && (
          <View style={[styles.resultToast, { backgroundColor: lastResult.success ? Colors.success : Colors.error }]}>
            <Ionicons
              name={lastResult.success ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color="#fff"
            />
            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle}>
                {lastResult.success ? 'Giriş Onaylandı' : 'Hata'}
              </Text>
              <Text style={styles.resultMsg}>{lastResult.message}</Text>
            </View>
          </View>
        )}

        {/* Bottom Panel */}
        {selectedEventId && (
          <View style={styles.bottomPanel}>
            {/* Stats Row */}
            {activeEvent && (
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{checkedIn.length}</Text>
                  <Text style={styles.statLabel}>Bu oturumda</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{activeEvent.checkedInCount}</Text>
                  <Text style={styles.statLabel}>Toplam giriş</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{activeEvent.registeredCount}</Text>
                  <Text style={styles.statLabel}>Kayıtlı</Text>
                </View>
              </View>
            )}

            {/* Recent Check-ins */}
            {checkedIn.length > 0 && (
              <View style={styles.recentList}>
                <Text style={styles.recentTitle}>Son Girişler</Text>
                {checkedIn.slice(0, 3).map((a) => (
                  <View key={a.id} style={styles.recentItem}>
                    <Avatar name={a.name} size="xs" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recentName}>{a.name}</Text>
                      <Text style={styles.recentId}>{a.studentId}</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              onPress={() => setSelectedEventId('')}
              style={styles.changeEventBtn}
              accessibilityRole="button"
              accessibilityLabel="Etkinliği değiştir"
            >
              <Ionicons name="swap-horizontal-outline" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.changeEventText}>Etkinlik Değiştir</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_BORDER = 3;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, backgroundColor: 'rgba(0,0,0,0.6)' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topCenter: { alignItems: 'center', flex: 1 },
  topTitle: { color: '#fff', fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  topSub: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs, marginTop: 2 },
  eventSelector: { backgroundColor: 'rgba(0,0,0,0.85)', margin: Spacing.base, borderRadius: BorderRadius.xl, padding: Spacing.base, gap: Spacing.sm },
  selectorTitle: { color: '#fff', fontSize: FontSize.base, fontWeight: FontWeight.semibold, marginBottom: Spacing.xs },
  selectorEmpty: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.sm, textAlign: 'center', paddingVertical: Spacing.md },
  selectorItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.15)' },
  selectorInfo: { flex: 1 },
  selectorName: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  selectorMeta: { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.xs, marginTop: 2 },
  scanArea: { alignItems: 'center', gap: Spacing.xl },
  scanFrame: { width: 220, height: 220, position: 'relative' },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: Colors.primary },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER, borderBottomRightRadius: 4 },
  scanHint: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm, textAlign: 'center' },
  resultToast: { position: 'absolute', bottom: 220, left: Spacing.base, right: Spacing.base, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: BorderRadius.xl, padding: Spacing.base },
  resultInfo: { flex: 1 },
  resultTitle: { color: '#fff', fontSize: FontSize.base, fontWeight: FontWeight.bold },
  resultMsg: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.sm, marginTop: 2 },
  bottomPanel: { backgroundColor: 'rgba(0,0,0,0.88)', borderTopLeftRadius: BorderRadius['2xl'], borderTopRightRadius: BorderRadius['2xl'], padding: Spacing.base, gap: Spacing.md },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { color: '#fff', fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.xs },
  statDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.15)' },
  recentList: { gap: Spacing.xs },
  recentTitle: { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  recentName: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  recentId: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.xs },
  changeEventBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm },
  changeEventText: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm },
  permissionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xl, padding: Spacing['2xl'] },
  permTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  permText: { fontSize: FontSize.base, textAlign: 'center', lineHeight: FontSize.base * 1.6 },
  permBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', width: '100%' },
  permBtnGrad: { paddingVertical: Spacing.base, alignItems: 'center' },
  permBtnText: { color: '#fff', fontSize: FontSize.base, fontWeight: FontWeight.semibold },
});
