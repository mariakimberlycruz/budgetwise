import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MonthlySelector } from '@/components/dashboard/monthly-selector';
import { ProgressBar } from '@/components/dashboard/progress-bar';
import { AlertList } from '@/components/alerts/alert-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { BUDGET_CATEGORIES, CATEGORY_COLORS } from '@/constants/expenses';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { getBudgets, setBudget } from '@/services/budget';
import { buildBudgetAlerts } from '@/utils/budget-alerts';
import { getErrorMessage } from '@/utils/errors';
import { formatMoney } from '@/utils/money';

export default function BudgetsScreen() {
  const colors = useThemeColors();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [amounts, setAmounts] = useState({ Needs: '', Savings: '', Wants: '' });
  const [spending, setSpending] = useState({ Needs: '0.00', Savings: '0.00', Wants: '0.00' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [alertItems, setAlertItems] = useState([]);

  const loadBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBudgets({ month, year });
      const next = { Needs: '', Savings: '', Wants: '' };
      const nextSpending = { Needs: '0.00', Savings: '0.00', Wants: '0.00' };
      for (const item of data.items) {
        next[item.category] = item.budget;
        nextSpending[item.category] = item.spending;
      }
      setAmounts(next);
      setSpending(nextSpending);
      setAlertItems(data.items ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useFocusEffect(
    useCallback(() => {
      void loadBudgets();
    }, [loadBudgets]),
  );

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      for (const category of BUDGET_CATEGORIES) {
        const raw = amounts[category].trim();
        const value = raw === '' ? 0 : Number(raw);
        if (Number.isNaN(value) || value < 0) {
          throw new Error('Budget amounts must be zero or a positive number.');
        }
        await setBudget({ category, amount: value, month, year });
      }
      setSaved(true);
      await loadBudgets();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const usageFor = (category) => {
    const budget = Number(amounts[category]) || 0;
    const spent = Number(spending[category]) || 0;
    return budget > 0 ? Math.round((spent / budget) * 100) : 0;
  };

  const alerts = buildBudgetAlerts(alertItems);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title">Budgets</ThemedText>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.textSecondary }]}>Back</Text>
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

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <AlertList alerts={alerts} style={styles.alerts} />

            {BUDGET_CATEGORIES.map((category) => {
              const color = CATEGORY_COLORS[category] ?? colors.tint;
              return (
                <ThemedView key={category} variant="card" style={styles.budgetCard}>
                  <View style={styles.budgetTop}>
                    <View style={styles.budgetTitle}>
                      <View style={[styles.dot, { backgroundColor: color }]} />
                      <ThemedText type="body" style={styles.budgetCategory}>
                        {category}
                      </ThemedText>
                    </View>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Spent {formatMoney(spending[category])} · Used {usageFor(category)}%
                    </ThemedText>
                  </View>
                  <ProgressBar progress={usageFor(category) / 100} color={color} height={6} />
                  <View style={styles.inputRow}>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Monthly budget (₱)
                    </ThemedText>
                    <ThemedTextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      inputMode="decimal"
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      value={amounts[category]}
                      onChangeText={(value) => setAmounts((prev) => ({ ...prev, [category]: value }))}
                      style={styles.input}
                    />
                  </View>
                  <ThemedText type="small" style={{ color: colors.textSecondary }}>
                    Remaining: {formatMoney((Number(amounts[category]) || 0) - (Number(spending[category]) || 0))}
                  </ThemedText>
                </ThemedView>
              );
            })}

            {error ? (
              <ThemedText type="small" style={{ color: colors.error }}>
                {error}
              </ThemedText>
            ) : null}
            {saved ? (
              <ThemedText type="small" style={{ color: colors.success }}>
                Budgets saved.
              </ThemedText>
            ) : null}

            <Pressable
              disabled={saving}
              onPress={() => void handleSave()}
              style={[styles.saveButton, { backgroundColor: colors.tint }, saving && styles.buttonDisabled]}>
              <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save budgets'}</Text>
            </Pressable>
          </ScrollView>
        )}
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
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  backButton: {
    padding: Spacing.two,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  stateBox: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
  },
  form: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
  alerts: {
    paddingBottom: Spacing.one,
  },
  budgetCard: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  budgetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  budgetCategory: {
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
  },
  saveButton: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
