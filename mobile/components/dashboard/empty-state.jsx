import { Pressable, StyleSheet, Text } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

export function EmptyState({ title, message, actionLabel, onAction }) {
  const colors = useThemeColors();

  return (
    <ThemedView variant="card" style={styles.container}>
      <ThemedText type="body" style={[styles.title, { color: colors.text }]}>
        {title}
      </ThemedText>
      {message ? (
        <ThemedText type="small" style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </ThemedText>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={[styles.button, { backgroundColor: colors.tint }]}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
  },
  button: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
