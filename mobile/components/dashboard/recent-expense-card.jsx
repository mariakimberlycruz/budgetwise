import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORY_COLORS } from '@/constants/expenses';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { formatDate } from '@/utils/dates';
import { formatMoney } from '@/utils/money';

export function RecentExpenseCard({ expense, onPress }) {
  const colors = useThemeColors();
  const color = CATEGORY_COLORS[expense.category] ?? colors.tint;

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <ThemedView variant="card" style={styles.card}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <View style={styles.info}>
          <View style={styles.topRow}>
            <ThemedText type="body" style={styles.subcategory}>
              {expense.subcategory}
            </ThemedText>
            <ThemedText type="body" style={styles.amount}>
              {formatMoney(expense.amount)}
            </ThemedText>
          </View>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            {expense.category} · {formatDate(expense.expense_date)}
          </ThemedText>
          {expense.description ? (
            <ThemedText type="small" style={{ color: colors.textSecondary }} numberOfLines={1}>
              {expense.description}
            </ThemedText>
          ) : null}
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  subcategory: {
    flex: 1,
    fontWeight: '600',
  },
  amount: {
    fontWeight: '700',
  },
});
