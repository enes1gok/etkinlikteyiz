import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEventsStore } from '../../src/store/eventsStore';
import { EventCard } from '../../src/components/events/EventCard';
import { Event, EventStatus } from '../../src/types';
import { Colors } from '../../src/theme/colors';
import { FontSize, FontWeight } from '../../src/theme/typography';
import { BorderRadius, Spacing } from '../../src/theme/spacing';
import { useDebounce } from '../../src/hooks/useDebounce';

type FilterTab = 'all' | EventStatus;

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'upcoming', label: 'Yaklaşan' },
  { key: 'ongoing', label: 'Devam Eden' },
  { key: 'completed', label: 'Tamamlanan' },
];

export default function EventsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { events, fetchEvents, isLoading } = useEventsStore();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return events.filter((e) => {
      const matchStatus = filter === 'all' || e.status === filter;
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.communityName.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [events, filter, debouncedSearch]);

  const handleCreateEvent = useCallback(() => router.push('/events/create'), []);
  const clearSearch = useCallback(() => setSearchInput(''), []);

  const renderItem = useCallback(
    ({ item }: { item: Event }) => (
      <EventCard event={item} onPress={() => router.push(`/events/${item.id}`)} />
    ),
    []
  );

  const keyExtractor = useCallback((item: Event) => item.id, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? Colors.dark.bg : Colors.light.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Etkinlikler</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {isLoading ? 'Yükleniyor...' : `${filtered.length} etkinlik`}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCreateEvent}
          style={[styles.createBtn, { backgroundColor: Colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Yeni etkinlik oluştur"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="add" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchBox, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={18} color={theme.textMuted} />
        <TextInput
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Etkinlik veya topluluk ara..."
          placeholderTextColor={theme.textMuted}
          style={[styles.searchInput, { color: theme.text }]}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Etkinlik ara"
        />
        {searchInput.length > 0 && (
          <TouchableOpacity
            onPress={clearSearch}
            accessibilityRole="button"
            accessibilityLabel="Aramayı temizle"
          >
            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterTab,
                active
                  ? { backgroundColor: Colors.primary }
                  : { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border, borderWidth: 1 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={f.label}
            >
              <Text style={[styles.filterText, { color: active ? '#fff' : theme.textSecondary }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        removeClippedSubviews
        maxToRenderPerBatch={8}
        windowSize={10}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              {debouncedSearch ? `"${debouncedSearch}" için sonuç bulunamadı` : 'Etkinlik bulunamadı'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.base, paddingBottom: Spacing.sm },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, letterSpacing: -0.3 },
  subtitle: { fontSize: FontSize.sm },
  createBtn: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginHorizontal: Spacing.base, borderRadius: BorderRadius.lg, borderWidth: 1, paddingHorizontal: Spacing.md, height: 48 },
  searchInput: { flex: 1, fontSize: FontSize.base, height: '100%' },
  filters: { flexDirection: 'row', gap: Spacing.xs, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  filterTab: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: BorderRadius.full },
  filterText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  list: { padding: Spacing.base, paddingTop: 0, paddingBottom: Spacing['3xl'] },
  empty: { alignItems: 'center', paddingVertical: Spacing['4xl'], gap: Spacing.md },
  emptyText: { fontSize: FontSize.base, textAlign: 'center' },
});
