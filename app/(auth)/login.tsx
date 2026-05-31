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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Colors } from '../../src/theme/colors';
import { FontSize, FontWeight } from '../../src/theme/typography';
import { BorderRadius, Spacing } from '../../src/theme/spacing';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Clear store error when user starts typing
  useEffect(() => {
    if (error) clearError();
  }, [email, password]); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = (): boolean => {
    const e: typeof fieldErrors = {};
    if (!EMAIL_REGEX.test(email.trim())) {
      e.email = 'Geçerli bir e-posta adresi girin.';
    }
    if (password.length < 4) {
      e.password = 'Şifre en az 4 karakter olmalı.';
    }
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    const ok = await login(email.trim(), password);
    if (ok) router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? Colors.dark.bg : Colors.light.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <LinearGradient
            colors={[Colors.primaryDark, Colors.secondary, `${Colors.primary}00`]}
            style={styles.heroBg}
          />

          <View style={styles.logoSection}>
            <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.logoBox}>
              <Ionicons name="people" size={32} color="#fff" />
            </LinearGradient>
            <Text style={[styles.appName, { color: theme.text }]}>UniComm</Text>
            <Text style={[styles.appTagline, { color: theme.textSecondary }]}>
              Toplulukların etkinlik platformu
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Hoş Geldiniz</Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              Devam etmek için giriş yapın
            </Text>

            {/* Auth error banner */}
            {error && (
              <View style={[styles.errorBanner, { backgroundColor: Colors.errorMuted, borderColor: `${Colors.error}40` }]}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                <Text style={[styles.errorBannerText, { color: Colors.error }]}>{error}</Text>
              </View>
            )}

            <View style={styles.form}>
              <Input
                label="Kurumsal E-posta"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                leftIcon="mail-outline"
                error={fieldErrors.email}
                placeholder="ad.soyad@universite.edu.tr"
              />
              <Input
                label="Şifre"
                value={password}
                onChangeText={setPassword}
                isPassword
                autoComplete="password"
                leftIcon="lock-closed-outline"
                error={fieldErrors.password}
                placeholder="••••••••"
              />

              <TouchableOpacity
                style={styles.forgot}
                accessibilityRole="button"
                accessibilityLabel="Şifremi unuttum"
              >
                <Text style={{ color: Colors.primaryLight, fontSize: FontSize.sm, fontWeight: FontWeight.medium }}>
                  Şifremi unuttum
                </Text>
              </TouchableOpacity>

              <Button
                label="Giriş Yap"
                onPress={handleLogin}
                loading={isLoading}
                fullWidth
                size="lg"
              />
            </View>
          </View>

          <View style={styles.registerRow}>
            <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm }}>
              Hesabın yok mu?
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              accessibilityRole="button"
              accessibilityLabel="Kayıt ol sayfasına git"
            >
              <Text style={{ color: Colors.primaryLight, fontSize: FontSize.sm, fontWeight: FontWeight.semibold }}>
                {' '}Kayıt Ol
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
  scroll: {
    flexGrow: 1,
    padding: Spacing.base,
    paddingBottom: Spacing['4xl'],
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    opacity: 0.15,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
    gap: Spacing.sm,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extrabold,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: FontSize.sm,
  },
  card: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    padding: Spacing.xl,
    gap: Spacing.base,
  },
  cardTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  cardSubtitle: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
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
  form: {
    gap: Spacing.md,
  },
  forgot: {
    alignSelf: 'flex-end',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
});
