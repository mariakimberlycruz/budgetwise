import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/dashboard/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { formatMoney } from '@/utils/money';

export function BudgetCard({ category, budget, spent, remaining, usagePercent, color, onPress }) {
  const colors = useThemeColors();
  const amountLabel = category === 'Savings' ? 'Saved' : 'Spent';
  const remainingLabel = category === 'Savings' ? 'Saved' : 'Spent';

  return (
    <ThemedView variant="card" style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={[styles.dot, { backgroundColor: color ?? colors.tint }]} />
          <ThemedText type="body" style={styles.category}>
            {category}
          </ThemedText>
        </View>
        {onPress ? (
          <Pressable onPress={onPress} hitSlop={8}>
            <Text style={[styles.edit, { color: colors.tint }]}>Edit</Text>
          </Pressable>
        ) : null}
      </View>

      <ThemedText type="body" style={styles.amounts}>
        <ThemedText style={{ fontWeight: '700', color: colors.text }}>{formatMoney(spent)}</ThemedText>
        <ThemedText style={{ color: colors.textSecondary }}> / {formatMoney(budget)}</ThemedText>
      </ThemedText>

      <ProgressBar progress={(Number(usagePercent) || 0) / 100} color={color ?? colors.tint} />

      <View style={styles.bottomRow}>
        <ThemedText type="small" style={{ color: colors.textSecondary }}>
          {remainingLabel}:{' '}
          <Text style={{ color: colors.text }}>{formatMoney(remaining)}</Text>
        </ThemedText>
        <ThemedText type="small" style={{ color: colors.textSecondary }}>
          {amountLabel}: {usagePercent}%
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    gap: Spacing.two,
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  category: {
    fontWeight: '600',
  },
  edit: {
    fontSize: 14,
    fontWeight: '600',
  },
  amounts: {
    fontSize: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
