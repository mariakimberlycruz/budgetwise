import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppShell } from '@/components/nav/app-shell';
import { MonthlySelector } from '@/components/dashboard/monthly-selector';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { BudgetVsActual } from '@/components/reports/budget-vs-actual';
import { CategoryBreakdown } from '@/components/reports/category-breakdown';
import { SavingsProgress } from '@/components/reports/savings-progress';
import { SectionCard } from '@/components/reports/section-card';
import { TrendChart, TrendLegend } from '@/components/reports/trend-chart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useNavLayout } from '@/hooks/use-nav-layout';
import { useThemeColors } from '@/hooks/use-theme';
import { getMonthlyReport } from '@/services/reports';
import { getErrorMessage } from '@/utils/errors';
import { formatMoney } from '@/utils/money';

const THREE_COL_BREAKPOINT = 900;
const TWO_COL_BREAKPOINT = 560;

function gridColumns(width) {
  if (width >= THREE_COL_BREAKPOINT) {
    return 3;
  }
  if (width >= TWO_COL_BREAKPOINT) {
    return 2;
  }
  return 1;
}

export default function ReportsScreen() {
  const colors = useThemeColors();
  const { width } = useNavLayout();
  const wide = width >= THREE_COL_BREAKPOINT;

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const columns = gridColumns(width);
  const cardWidth = `${100 / columns}%`;

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const report = await getMonthlyReport({ month, year });
      setData(report);
    } catch (err) {
      setError(getErrorMessage(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useFocusEffect(
    useCallback(() => {
      void loadReport();
    }, [loadReport]),
  );

  return (
    <AppShell>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ThemedText type="title" style={styles.title}>
            Reports
          </ThemedText>

          <MonthlySelector
          year={year}
          month={month}
          onChange={(newYear, newMonth) => {
            setYear(newYear);
            setMonth(newMonth);
          }}
        />

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : error || !data ? (
          <View style={styles.stateBox}>
            <ThemedText type="body" style={{ color: colors.error, textAlign: 'center' }}>
              {error ?? 'Unable to load report.'}
            </ThemedText>
            <Pressable
              onPress={() => void loadReport()}
              style={[styles.retryButton, { backgroundColor: colors.tint }]}>
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Monthly financial report
            </ThemedText>

            <View style={styles.summaryRow}>
              <View style={{ width: cardWidth, marginBottom: Spacing.three }}>
                <SummaryCard
                  title="Total income"
                  value={formatMoney(data.total_income)}
                  color={colors.success}
                />
              </View>
              <View style={{ width: cardWidth, marginBottom: Spacing.three }}>
                <SummaryCard
                  title="Total expenses"
                  value={formatMoney(data.total_expenses)}
                  color={colors.error}
                />
              </View>
              <View style={{ width: cardWidth, marginBottom: Spacing.three }}>
                <SummaryCard
                  title="Remaining money"
                  value={formatMoney(data.total_remaining_money)}
                />
              </View>
            </View>

            <View style={wide ? styles.sideBySide : styles.stacked}>
              <SectionCard title="Budget vs actual" subtitle="Compare budgets to spending">
                <BudgetVsActual items={data.budget_items ?? []} />
              </SectionCard>

              <SectionCard
                title="Spending breakdown"
                subtitle="Where this month's expenses went">
                <CategoryBreakdown
                  items={data.spending_by_category ?? []}
                  total={data.total_expenses}
                />
              </SectionCard>
            </View>

            <SectionCard title="Savings progress" subtitle="Budget and goal progress">
              <SavingsProgress
                budget={data.savings_budget}
                actual={data.savings_actual}
                remaining={data.savings_remaining}
                goals={data.savings_goals ?? []}
              />
            </SectionCard>

            <SectionCard
              title="Monthly trend"
              subtitle="Income vs expenses over the last 6 months">
              <TrendChart data={data.trend ?? []} />
              <TrendLegend />
            </SectionCard>
          </ScrollView>
          )}
        </SafeAreaView>
      </ThemedView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  title: {
    marginBottom: Spacing.three,
  },
  stateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.three,
  },
  retryButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    gap: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  sideBySide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  stacked: {
    gap: Spacing.three,
  },
});

