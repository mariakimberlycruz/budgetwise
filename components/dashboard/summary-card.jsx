import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

export function SummaryCard({ title, value, subtitle, color, style }) {
  const colors = useThemeColors();

  return (
    <ThemedView variant="card" style={[styles.card, style]}>
      <ThemedText type="small" style={{ color: colors.textSecondary }}>
        {title}
      </ThemedText>
      <ThemedText type="subtitle" style={[styles.value, { color: color ?? colors.text }]}>
        {value}
      </ThemedText>
      {subtitle ? (
        <ThemedText type="small" style={{ color: colors.textSecondary }}>
          {subtitle}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    gap: Spacing.two,
    flex: 1,
  },
  value: {
    fontWeight: '700',
  },
});
