import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';
import { Colors } from '../src/theme/colors';
import { ErrorBoundary } from '../src/components/ui/ErrorBoundary';

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const bg = isDark ? Colors.dark.bg : Colors.light.bg;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: bg },
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="events/[id]"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="events/create"
            options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
          />
          <Stack.Screen
            name="scanner/index"
            options={{ animation: 'fade', presentation: 'fullScreenModal' }}
          />
        </Stack>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
