import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotificationsStore } from '../../src/store/notificationsStore';
import { useAuthStore } from '../../src/store/authStore';
import { NotificationItem } from '../../src/components/notifications/NotificationItem';
import { Button } from '../../src/components/ui/Button';
import { Colors } from '../../src/theme/colors';
import { FontSize, FontWeight } from '../../src/theme/typography';
import { Spacing } from '../../src/theme/spacing';

export default function NotificationsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { user } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationsStore();

  useEffect(() => {
    if (user) fetchNotifications(user.id);
  }, [user]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? Colors.dark.bg : Colors.light.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Bildirimler</Text>
          {unreadCount > 0 && (
            <Text style={[styles.subtitle, { color: Colors.primary }]}>
              {unreadCount} okunmamış
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
            <Text style={{ color: Colors.primaryLight, fontSize: FontSize.sm, fontWeight: FontWeight.medium }}>
              Tümünü oku
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => {
              markAsRead(item.id);
              if (item.eventId) router.push(`/events/${item.eventId}`);
            }}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={52} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Bildirim Yok</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Etkinlik güncellemeleri ve hatırlatmalar burada görünecek.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: Spacing.base },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, letterSpacing: -0.3 },
  subtitle: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginTop: 2 },
  markAllBtn: { paddingVertical: Spacing.xs },
  list: { padding: Spacing.base, paddingTop: 0, paddingBottom: Spacing['3xl'] },
  empty: { alignItems: 'center', paddingVertical: Spacing['4xl'], gap: Spacing.md, paddingHorizontal: Spacing['2xl'] },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  emptyText: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: FontSize.sm * 1.6 },
});
