import { useColorScheme as _useColorScheme } from 'react-native';
import { Colors } from '../theme/colors';

export function useColorScheme() {
  const scheme = _useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  return { isDark, theme, scheme };
}
