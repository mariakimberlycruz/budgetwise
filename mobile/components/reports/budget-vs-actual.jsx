import { StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CATEGORY_COLORS } from '@/constants/expenses';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { formatMoney } from '@/utils/money';

/**
 * Budget vs. actual comparison with horizontal bars.
 *
 * items: [{ category, budget, actual, remaining, usage_percent }]
 */
export function BudgetVsActual({ items = [] }) {
  const colors = useThemeColors();
  const max = Math.max(
    1,
    ...items.map((i) => Math.max(Number(i.budget) || 0, Number(i.actual) || 0)),
  );

  return (
    <View style={styles.list}>
      {items.map((item) => {
        const color = CATEGORY_COLORS[item.category] ?? colors.tint;
        const budget = Number(item.budget) || 0;
        const actual = Number(item.actual) || 0;
        const remaining = Number(item.remaining) || 0;
        const usage = Number(item.usage_percent) || 0;
        return (
          <View key={item.category} style={styles.item}>
            <View style={styles.topRow}>
              <View style={styles.titleRow}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <ThemedText type="body" style={styles.category}>
                  {item.category}
                </ThemedText>
              </View>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Used {usage}%
              </ThemedText>
            </View>
            <BarRow
              label="Budget"
              value={budget}
              pct={max ? (budget / max) * 100 : 0}
              color={colors.textSecondary}
            />
            <BarRow label="Actual" value={actual} pct={max ? (actual / max) * 100 : 0} color={color} />
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Remaining:{' '}
              <Text style={{ color: colors.text }}>{formatMoney(remaining)}</Text>
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

function BarRow({ label, value, pct, color }) {
  const colors = useThemeColors();
  const width = `${Math.max(0, Math.min(100, pct))}%`;
  return (
    <View style={styles.barRow}>
      <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.track, { backgroundColor: colors.backgroundElement }]}>
        <View style={[styles.fill, { width, backgroundColor: color }]} />
      </View>
      <Text style={[styles.barValue, { color: colors.text }]}>{formatMoney(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
  item: {
    gap: Spacing.two,
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
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  category: {
    fontWeight: '600',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  barLabel: {
    width: 52,
    fontSize: 12,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  barValue: {
    minWidth: 90,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
  },
});
