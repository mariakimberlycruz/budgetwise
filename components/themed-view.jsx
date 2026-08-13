import { StyleSheet, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';

export function ThemedView({ variant = 'default', style, ...rest }) {
  const colors = useThemeColors();
  const backgroundColor =
    variant === 'element'
      ? colors.backgroundElement
      : variant === 'card'
        ? colors.backgroundSelected
        : colors.background;

  return <View style={[{ backgroundColor }, variant !== 'default' && styles.rounded, style]} {...rest} />;
}

const styles = StyleSheet.create({
  rounded: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128, 128, 128, 0.25)',
  },
});
