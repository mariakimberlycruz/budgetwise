import { Colors } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

export function useThemeColors() {
  const { colorScheme } = useSettings();
  return colorScheme === 'dark' ? Colors.dark : Colors.light;
}

