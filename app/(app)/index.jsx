import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BudgetCard } from '@/components/dashboard/budget-card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { MonthlySelector } from '@/components/dashboard/monthly-selector';
import { RecentExpenseCard } from '@/components/dashboard/recent-expense-card';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORY_COLORS } from '@/constants/expenses';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/use-theme';
import { getDashboard } from '@/services/dashboard';
import { getErrorMessage } from '@/utils/errors';
import { formatMoney } from '@/utils/money';

const COLUMN_BREAKPOINT = 900;
const TWO_COL_BREAKPOINT = 560;

function gridColumns(width) {
  if (width >= COLUMN_BREAKPOINT) {
    return 3;
  }
  if (width >= TWO_COL_BREAKPOINT) {
    return 2;
  }
  return 1;
}

export default function DashboardScreen() {
  const colors = useThemeColors();
  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signingOut, setSigningOut] = useState(false);

  const columns = gridColumns(width);
  const cardWidth = `${100 / columns}%`;

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboard({ month, year });
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  const navItems = [
    { label: 'Income', route: '/income' },
    { label: 'Expenses', route: '/expenses' },
    { label: 'Budgets', route: '/budgets' },
    { label: 'Savings', route: '/savings' },
    { label: 'Bills', route: '/bills' },
    { label: 'Reports', route: '/reports' },
    { label: 'Health', route: '/financial-health' },
    { label: 'Settings', route: '/settings' },
  ];

  const renderSummaryGrid = () => (
    <View style={styles.grid}>
      <View style={[styles.gridItem, { width: cardWidth }]}>
        <SummaryCard
          title="Monthly Income"
          value={formatMoney(data?.monthly_income)}
          color={colors.success}
          subtitle="Income this month"
        />
      </View>
      <View style={[styles.gridItem, { width: cardWidth }]}>
        <SummaryCard
          title="Total Expenses"
          value={formatMoney(data?.total_expenses)}
          color={colors.error}
          subtitle="Spent this month"
        />
      </View>
      <View style={[styles.gridItem, { width: cardWidth }]}>
        <SummaryCard
          title="Remaining Money"
          value={formatMoney(data?.remaining_money)}
          subtitle="Income minus expenses"
        />
      </View>
    </View>
  );

  const renderBudgetsGrid = () => {
    const budgets = data?.budgets ?? [];
    if (budgets.length === 0) {
      return null;
    }
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Budgets</ThemedText>
          <Pressable onPress={() => router.push('/budgets')} hitSlop={8}>
            <Text style={[styles.link, { color: colors.tint }]}>Edit</Text>
          </Pressable>
        </View>
        <View style={styles.grid}>
          {budgets.map((item) => (
            <View key={item.category} style={[styles.gridItem, { width: cardWidth }]}>
              <BudgetCard
                category={item.category}
                budget={item.budget}
                spent={item.spent}
                remaining={item.remaining}
                usagePercent={item.usage_percent}
                color={CATEGORY_COLORS[item.category]}
                onPress={() => router.push('/budgets')}
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderRecentExpenses = () => {
    const recent = data?.recent_expenses ?? [];
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Recent Expenses</ThemedText>
          <Pressable onPress={() => router.push('/expenses')} hitSlop={8}>
            <Text style={[styles.link, { color: colors.tint }]}>View all</Text>
          </Pressable>
        </View>
        {recent.length === 0 ? (
          <EmptyState
            title="No expenses yet"
            message="Add your first expense to start tracking your spending."
            actionLabel="Add expense"
            onAction={() => router.push('/expense-form')}
          />
        ) : (
          <View style={styles.list}>
            {recent.map((expense) => (
              <RecentExpenseCard
                key={expense.id}
                expense={expense}
                onPress={() => router.push(`/expense-form?id=${expense.id}`)}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <ThemedText type="title">BudgetWise</ThemedText>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                {user ? `Welcome, ${user.name.split(' ')[0]}` : 'Welcome back'}
              </ThemedText>
            </View>
            <Pressable
              disabled={signingOut}
              onPress={() => void handleSignOut()}
              style={[styles.signOut, { backgroundColor: colors.error }, signingOut && styles.buttonDisabled]}>
              <Text style={styles.signOutText}>{signingOut ? '…' : 'Sign out'}</Text>
            </Pressable>
          </View>

          <MonthlySelector
            year={year}
            month={month}
            onChange={(newYear, newMonth) => {
              setYear(newYear);
              setMonth(newMonth);
            }}
          />

          <View style={styles.navRow}>
            {navItems.map((item) => (
              <Pressable
                key={item.route}
                onPress={() => router.push(item.route)}
                style={[styles.navPill, { backgroundColor: colors.backgroundElement }]}>
                <Text style={[styles.navPillText, { color: colors.text }]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          {loading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          ) : error ? (
            <View style={styles.stateBox}>
              <ThemedText type="body" style={{ color: colors.error, textAlign: 'center' }}>
                {error}
              </ThemedText>
              <Pressable
                onPress={() => void loadDashboard()}
                style={[styles.retryButton, { backgroundColor: colors.tint }]}>
                <Text style={styles.retryButtonText}>Try again</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {renderSummaryGrid()}
              {renderBudgetsGrid()}
              {renderRecentExpenses()}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
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
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signOut: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  navRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  navPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  navPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.two,
  },
  gridItem: {
    paddingHorizontal: Spacing.two,
    marginBottom: Spacing.four,
  },
  section: {
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    gap: Spacing.two,
  },
  stateBox: {
    alignItems: 'center',
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
});
