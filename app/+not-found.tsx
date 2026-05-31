import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Colors } from '../src/theme/colors';
import { FontSize, FontWeight } from '../src/theme/typography';
import { Spacing } from '../src/theme/spacing';

export default function NotFoundScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <>
      <Stack.Screen options={{ title: 'Sayfa Bulunamadı' }} />
      <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.bg : Colors.light.bg }]}>
        <Text style={[styles.title, { color: theme.text }]}>404</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Bu sayfa mevcut değil.</Text>
        <Link href="/(tabs)" style={{ color: Colors.primaryLight, marginTop: Spacing.xl }}>
          Ana Sayfaya Dön
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.base },
  title: { fontSize: FontSize['4xl'], fontWeight: FontWeight.extrabold },
  subtitle: { fontSize: FontSize.base, marginTop: Spacing.sm },
});
