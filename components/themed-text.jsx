import { StyleSheet, Text } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';

export function ThemedText({ type = 'body', style, ...rest }) {
  const colors = useThemeColors();
  const color = type === 'code' ? colors.tint : colors.text;

  return (
    <Text
      style={[
        styles.base,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'body' && styles.body,
        type === 'small' && styles.small,
        type === 'code' && styles.code,
        { color },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'system-ui',
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
  },
  code: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
});
