import { StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/dashboard/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { CATEGORY_COLORS } from '@/constants/expenses';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { formatMoney } from '@/utils/money';

/**
 * Savings progress: the Savings budget's monthly usage plus each savings goal's
 * overall progress.
 */
export function SavingsProgress({ budget, actual, remaining, goals = [] }) {
  const colors = useThemeColors();
  const b = Number(budget) || 0;
  const a = Number(actual) || 0;
  const savingsColor = CATEGORY_COLORS.Savings ?? colors.success;
  const percent = b > 0 ? Math.round((a / b) * 100) : 0;
  const progress = b > 0 ? Math.min(a / b, 1) : 0;

  return (
    <View style={styles.wrap}>
      <ThemedText type="small" style={{ color: colors.textSecondary }}>
        Savings budget
      </ThemedText>
      <View style={styles.amountRow}>
        <ThemedText type="body" style={styles.amounts}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{formatMoney(a)}</Text>
          <Text style={{ color: colors.textSecondary }}> / {formatMoney(b)}</Text>
        </ThemedText>
        <ThemedText type="small" style={{ color: colors.textSecondary }}>
          {percent}%
        </ThemedText>
      </View>
      <ProgressBar progress={progress} color={savingsColor} />
      <ThemedText type="small" style={{ color: colors.textSecondary }}>
        Remaining:{' '}
        <Text style={{ color: colors.text }}>{formatMoney(remaining)}</Text>
      </ThemedText>

      {goals.length > 0 ? (
        <View style={styles.goals}>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            Savings goals
          </ThemedText>
          {goals.map((goal) => {
            const gp = Number(goal.progress_percent) || 0;
            return (
              <View key={goal.id} style={styles.goal}>
                <View style={styles.goalTop}>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>{goal.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {formatMoney(goal.current_amount)} / {formatMoney(goal.target_amount)}
                  </Text>
                </View>
                <ProgressBar progress={gp / 100} color={savingsColor} height={6} />
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amounts: {
    fontSize: 18,
  },
  goals: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  goal: {
    gap: Spacing.one,
  },
  goalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
