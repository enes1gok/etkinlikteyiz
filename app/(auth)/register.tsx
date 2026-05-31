import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Colors } from '../../src/theme/colors';
import { FontSize, FontWeight } from '../../src/theme/typography';
import { BorderRadius, Spacing } from '../../src/theme/spacing';
import { MOCK_COMMUNITIES } from '../../src/utils/mockData';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormField = 'name' | 'email' | 'studentId' | 'password' | 'confirmPassword';

export default function RegisterScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { register, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedCommunity, setSelectedCommunity] = useState(MOCK_COMMUNITIES[0].id);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormField, string>>>({});

  // Clear store error when user edits any field
  useEffect(() => {
    if (error) clearError();
  }, [form.email, form.password]); // eslint-disable-line react-hooks/exhaustive-deps

  const setField = (field: FormField) => (val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const validate = (): boolean => {
    const e: Partial<Record<FormField, string>> = {};
    if (!form.name.trim()) e.name = 'İsim gerekli.';
    if (!EMAIL_REGEX.test(form.email.trim())) e.email = 'Geçerli bir e-posta adresi girin.';
    if (!form.studentId.trim()) e.studentId = 'Öğrenci numarası gerekli.';
    if (form.password.length < 6) e.password = 'Şifre en az 6 karakter olmalı.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Şifreler eşleşmiyor.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    const ok = await register({ ...form, communityId: selectedCommunity });
    if (ok) router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? Colors.dark.bg : Colors.light.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Geri dön"
          >
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.text }]}>Hesap Oluştur</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Topluluğuna katıl, etkinliklere dahil ol
          </Text>

          <View style={styles.form}>
            {/* Auth error banner */}
            {error && (
              <View style={[styles.errorBanner, { backgroundColor: Colors.errorMuted, borderColor: `${Colors.error}40` }]}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                <Text style={[styles.errorBannerText, { color: Colors.error }]}>{error}</Text>
              </View>
            )}

            <Input
              label="Ad Soyad"
              value={form.name}
              onChangeText={setField('name')}
              leftIcon="person-outline"
              placeholder="Ahmet Yılmaz"
              error={fieldErrors.name}
              autoComplete="name"
            />
            <Input
              label="Kurumsal E-posta"
              value={form.email}
              onChangeText={setField('email')}
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="ad.soyad@universite.edu.tr"
              error={fieldErrors.email}
            />
            <Input
              label="Öğrenci Numarası"
              value={form.studentId}
              onChangeText={setField('studentId')}
              leftIcon="card-outline"
              keyboardType="numeric"
              placeholder="150XXXXXX"
              error={fieldErrors.studentId}
            />
            <Input
              label="Şifre"
              value={form.password}
              onChangeText={setField('password')}
              isPassword
              leftIcon="lock-closed-outline"
              autoComplete="new-password"
              placeholder="••••••••"
              error={fieldErrors.password}
            />
            <Input
              label="Şifre Tekrar"
              value={form.confirmPassword}
              onChangeText={setField('confirmPassword')}
              isPassword
              leftIcon="lock-closed-outline"
              placeholder="••••••••"
              error={fieldErrors.confirmPassword}
            />

            <View style={styles.communitySection}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Topluluk Seç</Text>
              {MOCK_COMMUNITIES.map((c) => {
                const selected = selectedCommunity === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setSelectedCommunity(c.id)}
                    style={[
                      styles.communityItem,
                      {
                        backgroundColor: selected
                          ? Colors.primaryMuted
                          : isDark ? Colors.dark.card : Colors.light.card,
                        borderColor: selected ? Colors.primary : theme.border,
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${c.name}, ${c.memberCount} üye`}
                  >
                    <View style={styles.communityInfo}>
                      <Text style={[styles.communityName, { color: theme.text }]}>{c.name}</Text>
                      <Text style={[styles.communityMeta, { color: theme.textSecondary }]}>
                        {c.memberCount} üye · {c.eventCount} etkinlik
                      </Text>
                    </View>
                    {selected && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              label="Kayıt Ol"
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              size="lg"
            />
          </View>

          <View style={styles.loginRow}>
            <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm }}>Zaten hesabın var mı?</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Giriş yap sayfasına dön"
            >
              <Text style={{ color: Colors.primaryLight, fontSize: FontSize.sm, fontWeight: FontWeight.semibold }}>
                {' '}Giriş Yap
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.base, paddingBottom: Spacing['4xl'] },
  back: { marginBottom: Spacing.xl, width: 40 },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, letterSpacing: -0.3, marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.base, marginBottom: Spacing.xl },
  form: { gap: Spacing.md },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  errorBannerText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  communitySection: { gap: Spacing.sm },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  communityItem: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg, borderWidth: 1.5, padding: Spacing.md, gap: Spacing.md },
  communityInfo: { flex: 1, gap: 3 },
  communityName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  communityMeta: { fontSize: FontSize.xs },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.xl },
});
