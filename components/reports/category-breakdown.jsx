import { StyleSheet, Text, View } from 'react-native';

import { CATEGORY_COLORS } from '@/constants/expenses';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { formatMoney } from '@/utils/money';

/**
 * Share of total spending across budget categories (stacked bar + rows).
 *
 * items: [{ category, amount, percent }]
 */
export function CategoryBreakdown({ items = [], total = 0 }) {
  const colors = useThemeColors();
  const denom = Number(total) > 0 ? Number(total) : 1;
  const hasSpending = items.some((i) => Number(i.amount) > 0);

  if (!hasSpending) {
    return (
      <Text style={{ color: colors.textSecondary }}>
        No spending recorded for this month yet.
      </Text>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.stack, { backgroundColor: colors.backgroundElement }]}>
        {items.map((item) => {
          const amount = Number(item.amount) || 0;
          if (amount <= 0) {
            return null;
          }
          return (
            <View
              key={item.category}
              style={[
                styles.stackSeg,
                {
                  width: `${(amount / denom) * 100}%`,
                  backgroundColor: CATEGORY_COLORS[item.category] ?? colors.tint,
                },
              ]}
            />
          );
        })}
      </View>

      {items.map((item) => {
        const amount = Number(item.amount) || 0;
        const percent = Number(item.percent) || 0;
        if (amount <= 0) {
          return null;
        }
        const color = CATEGORY_COLORS[item.category] ?? colors.tint;
        return (
          <View key={item.category} style={styles.row}>
            <View style={styles.labelCol}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={{ color: colors.text }}>{item.category}</Text>
            </View>
            <View style={[styles.track, { backgroundColor: colors.backgroundElement }]}>
              <View
                style={[styles.fill, { width: `${Math.min(100, percent)}%`, backgroundColor: color }]}
              />
            </View>
            <Text style={[styles.percent, { color: colors.textSecondary }]}>{percent}%</Text>
            <Text style={[styles.amount, { color: colors.text }]}>{formatMoney(amount)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
  stack: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
  },
  stackSeg: {
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  labelCol: {
    width: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
  percent: {
    width: 38,
    textAlign: 'right',
    fontSize: 13,
  },
  amount: {
    minWidth: 92,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
  },
});
