import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEventsStore } from '../../src/store/eventsStore';
import { useAuthStore } from '../../src/store/authStore';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Colors } from '../../src/theme/colors';
import { FontSize, FontWeight } from '../../src/theme/typography';
import { BorderRadius, Spacing } from '../../src/theme/spacing';
import { EventCategory } from '../../src/types';
import { getEventCategoryLabel } from '../../src/utils/helpers';

const CATEGORIES: EventCategory[] = [
  'workshop', 'seminar', 'social', 'competition', 'trip', 'meetup', 'conference', 'other',
];

const CATEGORY_ICONS: Record<EventCategory, keyof typeof Ionicons.glyphMap> = {
  workshop: 'hammer-outline',
  seminar: 'mic-outline',
  social: 'people-outline',
  competition: 'trophy-outline',
  trip: 'airplane-outline',
  meetup: 'cafe-outline',
  conference: 'business-outline',
  other: 'calendar-outline',
};

type FormField = 'title' | 'description' | 'location' | 'locationDetail' | 'date' | 'startTime' | 'endTime' | 'maxCapacity';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

export default function CreateEventScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { createEvent, isLoading } = useEventsStore();
  const { user, community } = useAuthStore();

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    locationDetail: '',
    date: '',
    startTime: '',
    endTime: '',
    maxCapacity: '',
  });
  const [category, setCategory] = useState<EventCategory>('workshop');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormField, string>>>({});

  const setField = useCallback((field: FormField) => (val: string) =>
    setForm((prev) => ({ ...prev, [field]: val })), []);

  const validate = (): boolean => {
    const e: Partial<Record<FormField, string>> = {};
    if (!form.title.trim()) e.title = 'Etkinlik başlığı gerekli.';
    if (!form.description.trim()) e.description = 'Açıklama gerekli.';
    if (!form.location.trim()) e.location = 'Konum gerekli.';
    if (!DATE_REGEX.test(form.date)) e.date = 'Tarih formatı: YYYY-AA-GG';
    if (!TIME_REGEX.test(form.startTime)) e.startTime = 'Saat formatı: SS:DD';
    if (!TIME_REGEX.test(form.endTime)) e.endTime = 'Saat formatı: SS:DD';
    if (!form.maxCapacity || isNaN(Number(form.maxCapacity)) || Number(form.maxCapacity) < 1) {
      e.maxCapacity = 'Geçerli bir kapasite girin (en az 1).';
    }
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate() || !user || !community) return;

    try {
      const newEvent = await createEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        locationDetail: form.locationDetail.trim(),
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        maxCapacity: Number(form.maxCapacity),
        category,
        communityId: community.id,
        communityName: community.name,
        organizerId: user.id,
        status: 'upcoming',
        tags: [],
        isRegistrationOpen: true,
      });

      Alert.alert('Etkinlik Oluşturuldu!', `"${newEvent.title}" başarıyla oluşturuldu.`, [
        { text: 'Etkinliği Gör', onPress: () => router.replace(`/events/${newEvent.id}`) },
        { text: 'Ana Sayfa', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch {
      Alert.alert('Hata', 'Etkinlik oluşturulamadı. Lütfen tekrar deneyin.');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? Colors.dark.bg : Colors.light.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="İptal et ve geri dön"
          >
            <Ionicons name="close" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: theme.text }]}>Etkinlik Oluştur</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.stepLabel, { color: theme.textMuted }]}>TEMEL BİLGİLER</Text>

          <Input
            label="Etkinlik Başlığı"
            value={form.title}
            onChangeText={setField('title')}
            leftIcon="text-outline"
            placeholder="Örn: Python ile Veri Analizi"
            error={fieldErrors.title}
          />
          <Input
            label="Açıklama"
            value={form.description}
            onChangeText={setField('description')}
            leftIcon="document-text-outline"
            placeholder="Etkinliği detaylı açıklayın..."
            multiline
            numberOfLines={4}
            error={fieldErrors.description}
            style={{ height: 100, textAlignVertical: 'top' }}
          />
          <Input
            label="Konum"
            value={form.location}
            onChangeText={setField('location')}
            leftIcon="location-outline"
            placeholder="Örn: Taşkışla A-101"
            error={fieldErrors.location}
          />
          <Input
            label="Konum Detayı (opsiyonel)"
            value={form.locationDetail}
            onChangeText={setField('locationDetail')}
            leftIcon="map-outline"
            placeholder="Ek konum bilgisi"
          />

          <Text style={[styles.stepLabel, { color: theme.textMuted, marginTop: Spacing.md }]}>TARİH & SAAT</Text>

          <Input
            label="Tarih"
            value={form.date}
            onChangeText={setField('date')}
            leftIcon="calendar-outline"
            placeholder="2024-06-15"
            error={fieldErrors.date}
          />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Başlangıç"
                value={form.startTime}
                onChangeText={setField('startTime')}
                leftIcon="time-outline"
                placeholder="14:00"
                error={fieldErrors.startTime}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Bitiş"
                value={form.endTime}
                onChangeText={setField('endTime')}
                leftIcon="time-outline"
                placeholder="17:00"
                error={fieldErrors.endTime}
              />
            </View>
          </View>

          <Input
            label="Maksimum Kapasite"
            value={form.maxCapacity}
            onChangeText={setField('maxCapacity')}
            leftIcon="people-outline"
            placeholder="50"
            keyboardType="numeric"
            error={fieldErrors.maxCapacity}
          />

          <Text style={[styles.stepLabel, { color: theme.textMuted, marginTop: Spacing.md }]}>KATEGORİ</Text>

          <View style={styles.categories}>
            {CATEGORIES.map((cat) => {
              const selected = category === cat;
              const color = Colors.eventCategoryColors[cat];
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: selected ? `${color}22` : isDark ? Colors.dark.card : Colors.light.card,
                      borderColor: selected ? color : theme.border,
                      borderWidth: selected ? 1.5 : 1,
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={getEventCategoryLabel(cat)}
                >
                  <Ionicons name={CATEGORY_ICONS[cat]} size={18} color={selected ? color : theme.textSecondary} />
                  <Text style={[styles.categoryLabel, { color: selected ? color : theme.textSecondary }]}>
                    {getEventCategoryLabel(cat)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            label="Etkinlik Oluştur"
            onPress={handleCreate}
            loading={isLoading}
            fullWidth
            size="lg"
            style={{ marginTop: Spacing.md }}
            leftIcon={<Ionicons name="add-circle-outline" size={20} color="#fff" />}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  scroll: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  stepLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, letterSpacing: 1, textTransform: 'uppercase', marginBottom: -Spacing.xs },
  row: { flexDirection: 'row', gap: Spacing.sm },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  categoryItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  categoryLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
});
