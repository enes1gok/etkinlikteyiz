import React, { useState } from 'react';
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

export default function RegisterScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', studentId: '', password: '', confirmPassword: '' });
  const [selectedCommunity, setSelectedCommunity] = useState(MOCK_COMMUNITIES[0].id);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: keyof typeof form) => (val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'İsim gerekli.';
    if (!form.email.includes('@')) e.email = 'Geçerli bir e-posta girin.';
    if (!form.studentId) e.studentId = 'Öğrenci numarası gerekli.';
    if (form.password.length < 6) e.password = 'Şifre en az 6 karakter olmalı.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Şifreler eşleşmiyor.';
    setErrors(e);
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
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.text }]}>Hesap Oluştur</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Topluluğuna katıl, etkinliklere dahil ol
          </Text>

          <View style={styles.form}>
            <Input label="Ad Soyad" value={form.name} onChangeText={set('name')} leftIcon="person-outline" placeholder="Ahmet Yılmaz" error={errors.name} />
            <Input label="Kurumsal E-posta" value={form.email} onChangeText={set('email')} leftIcon="mail-outline" keyboardType="email-address" autoCapitalize="none" placeholder="ad.soyad@universite.edu.tr" error={errors.email} />
            <Input label="Öğrenci Numarası" value={form.studentId} onChangeText={set('studentId')} leftIcon="card-outline" keyboardType="numeric" placeholder="150XXXXXX" error={errors.studentId} />
            <Input label="Şifre" value={form.password} onChangeText={set('password')} isPassword leftIcon="lock-closed-outline" placeholder="••••••••" error={errors.password} />
            <Input label="Şifre Tekrar" value={form.confirmPassword} onChangeText={set('confirmPassword')} isPassword leftIcon="lock-closed-outline" placeholder="••••••••" error={errors.confirmPassword} />

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

            <Button label="Kayıt Ol" onPress={handleRegister} loading={isLoading} fullWidth size="lg" />
          </View>

          <View style={styles.loginRow}>
            <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm }}>Zaten hesabın var mı?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: Colors.primaryLight, fontSize: FontSize.sm, fontWeight: FontWeight.semibold }}>{' '}Giriş Yap</Text>
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
  communitySection: { gap: Spacing.sm },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  communityItem: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg, borderWidth: 1.5, padding: Spacing.md, gap: Spacing.md },
  communityInfo: { flex: 1, gap: 3 },
  communityName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  communityMeta: { fontSize: FontSize.xs },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.xl },
});
