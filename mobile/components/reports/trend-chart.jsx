import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Dependency-free grouped bar chart built from React Native primitives
 * (renders identically on Android, iOS, and Web).
 *
 * data: [{ month, year, income, expenses }]
 */
export function TrendChart({ data = [], height = 180, maxBarWidth = 14 }) {
  const colors = useThemeColors();
  const max = Math.max(
    1,
    ...data.map((d) => Math.max(Number(d.income) || 0, Number(d.expenses) || 0)),
  );

  if (!data.length) {
    return null;
  }

  return (
    <View style={styles.chart}>
      {data.map((d) => {
        const income = Number(d.income) || 0;
        const expenses = Number(d.expenses) || 0;
        return (
          <View key={`${d.year}-${d.month}`} style={styles.column}>
            <View style={styles.group}>
              <View style={[styles.barSlot, { height, maxWidth: maxBarWidth }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max((income / max) * height, 2),
                      backgroundColor: colors.success,
                    },
                  ]}
                />
              </View>
              <View style={[styles.barSlot, { height, maxWidth: maxBarWidth }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max((expenses / max) * height, 2),
                      backgroundColor: colors.error,
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={[styles.month, { color: colors.textSecondary }]}>
              {MONTH_SHORT[d.month - 1] ?? d.month}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function TrendLegend() {
  const colors = useThemeColors();
  return (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
        <Text style={[styles.legendText, { color: colors.textSecondary }]}>Income</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
        <Text style={[styles.legendText, { color: colors.textSecondary }]}>Expenses</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
    width: '100%',
  },
  barSlot: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    maxWidth: 14,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  month: {
    fontSize: 12,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
  },
});
