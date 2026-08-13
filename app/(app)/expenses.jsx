import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MonthlySelector } from '@/components/dashboard/monthly-selector';
import { ProgressBar } from '@/components/dashboard/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { BUDGET_CATEGORIES, CATEGORY_COLORS, EXPENSE_CATEGORIES } from '@/constants/expenses';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { deleteExpense, getExpenses } from '@/services/expense';
import { confirmDelete } from '@/utils/confirm';
import { formatDate } from '@/utils/dates';
import { getErrorMessage } from '@/utils/errors';
import { formatMoney } from '@/utils/money';

const BREAKPOINT = 768;

function FilterChips({ options, selected, onSelect, allLabel = 'All' }) {
  const colors = useThemeColors();
  const items = [null, ...options];

  return (
    <View style={styles.chips}>
      {items.map((value) => {
        const isAll = value === null;
        const selectedChip = isAll ? selected === null : selected === value;
        const color = isAll ? colors.tint : CATEGORY_COLORS[value] ?? colors.tint;
        return (
          <Pressable
            key={value ?? allLabel}
            onPress={() => onSelect(value)}
            style={[
              styles.chip,
              {
                backgroundColor: selectedChip ? color : colors.backgroundElement,
                borderColor: selectedChip ? color : colors.border,
              },
            ]}>
            <Text style={[styles.chipText, { color: selectedChip ? '#FFFFFF' : colors.text }]}>
              {isAll ? allLabel : value}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function BudgetSummaryCard({ categories }) {
  const colors = useThemeColors();
  const items = categories ?? [];

  return (
    <ThemedView variant="card" style={styles.budgetCard}>
      <View style={styles.budgetHeader}>
        <ThemedText type="body" style={styles.sectionTitle}>
          Budgets
        </ThemedText>
        <Pressable onPress={() => router.push('/budgets')} hitSlop={8}>
          <Text style={[styles.budgetEdit, { color: colors.tint }]}>Set budgets</Text>
        </Pressable>
      </View>
      {items.length === 0 ? (
        <ThemedText type="small" style={{ color: colors.textSecondary }}>
          No budget data for this month.
        </ThemedText>
      ) : (
        items.map((item) => {
          const color = CATEGORY_COLORS[item.category] ?? colors.tint;
          const budgetNum = Number(item.budget) || 0;
          const spentNum = Number(item.spending) || 0;
          const usage = budgetNum > 0 ? Math.round((spentNum / budgetNum) * 100) : 0;
          return (
            <View key={item.category} style={styles.budgetRow}>
              <View style={styles.budgetRowTop}>
                <ThemedText type="small" style={styles.budgetCategory}>
                  {item.category}
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  {formatMoney(item.spending)} / {formatMoney(item.budget)}
                </ThemedText>
              </View>
              <ProgressBar progress={usage / 100} color={color} height={6} />
            </View>
          );
        })
      )}
    </ThemedView>
  );
}

function ExpenseItem({ expense, wide, deleting, onEdit, onDelete }) {
  const colors = useThemeColors();
  const color = CATEGORY_COLORS[expense.category] ?? colors.tint;

  if (wide) {
    return (
      <ThemedView variant="card" style={styles.tableRow}>
        <Text style={[styles.tableCell, styles.tableDate, { color: colors.textSecondary }]}>
          {expense.expense_date}
        </Text>
        <Text style={[styles.tableCell, styles.tableSubcategory, { color: colors.text }]}>
          {expense.subcategory}
        </Text>
        <View style={[styles.tableCell, styles.tableCategory]}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={{ color: colors.textSecondary }}>{expense.category}</Text>
        </View>
        <Text style={[styles.tableCell, styles.tableDescription, { color: colors.textSecondary }]}>
          {expense.description ?? ''}
        </Text>
        <Text style={[styles.tableCell, styles.tableAmount, { color: colors.text }]}>
          {formatMoney(expense.amount)}
        </Text>
        <View style={[styles.tableCell, styles.tableActions]}>
          <Pressable onPress={() => onEdit(expense)} style={[styles.rowButton, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.rowButtonText, { color: colors.text }]}>Edit</Text>
          </Pressable>
          <Pressable
            disabled={deleting}
            onPress={() => onDelete(expense)}
            style={[styles.rowButton, { backgroundColor: colors.error }, deleting && styles.buttonDisabled]}>
            <Text style={styles.rowButtonText}>{deleting ? '…' : 'Delete'}</Text>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView variant="card" style={styles.item}>
      <View style={styles.itemTop}>
        <View style={styles.itemTitleRow}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <ThemedText type="body" style={styles.itemType}>
            {expense.subcategory}
          </ThemedText>
        </View>
        <ThemedText type="body" style={[styles.itemAmount, { color: colors.text }]}>
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
      <View style={styles.itemActions}>
        <Pressable
          onPress={() => onEdit(expense)}
          style={[styles.itemButton, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.itemButtonText, { color: colors.text }]}>Edit</Text>
        </Pressable>
        <Pressable
          disabled={deleting}
          onPress={() => onDelete(expense)}
          style={[styles.itemButton, { backgroundColor: colors.error }, deleting && styles.buttonDisabled]}>
          <Text style={styles.itemButtonText}>{deleting ? 'Deleting…' : 'Delete'}</Text>
        </Pressable>
      </View>
    </ThemedView>
  );
}

export default function ExpensesScreen() {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const wide = width >= BREAKPOINT;

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState('0.00');
  const [categorySpending, setCategorySpending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { month, year };
      if (category) params.category = category;
      if (subcategory) params.subcategory = subcategory;
      if (q) params.q = q;
      const data = await getExpenses(params);
      setItems(data.items);
      setTotal(data.total);
      setCategorySpending(data.category_spending);
    } catch (err) {
      setError(getErrorMessage(err));
      setItems([]);
      setTotal('0.00');
      setCategorySpending([]);
    } finally {
      setLoading(false);
    }
  }, [month, year, category, subcategory, q]);

  useFocusEffect(
    useCallback(() => {
      void loadExpenses();
    }, [loadExpenses]),
  );

  const handleDelete = (expense) => {
    confirmDelete({
      title: 'Delete expense',
      message: `Delete this ${expense.subcategory} expense of ${formatMoney(expense.amount)}?`,
      onConfirm: () => {
        setDeletingId(expense.id);
        deleteExpense(expense.id)
          .then(() => loadExpenses())
          .catch((err) => setError(getErrorMessage(err)))
          .finally(() => setDeletingId(null));
      },
    });
  };

  const renderItem = ({ item }) => (
    <ExpenseItem
      expense={item}
      wide={wide}
      deleting={deletingId === item.id}
      onEdit={(expense) => router.push(`/expense-form?id=${expense.id}`)}
      onDelete={handleDelete}
    />
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.stateBox}>
          <ThemedText type="body" style={{ color: colors.error, textAlign: 'center' }}>
            {error}
          </ThemedText>
          <Pressable onPress={() => void loadExpenses()} style={[styles.retryButton, { backgroundColor: colors.tint }]}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.stateBox}>
        <ThemedText type="body" style={{ color: colors.textSecondary, textAlign: 'center' }}>
          No expenses found for {formatMonthLabel(year, month)}
          {q ? ` matching “${q}”` : ''}.
        </ThemedText>
        <Pressable onPress={() => router.push('/expense-form')} style={[styles.retryButton, { backgroundColor: colors.tint }]}>
          <Text style={styles.retryButtonText}>Add expense</Text>
        </Pressable>
      </View>
    );
  };

  const listHeader = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <ThemedText type="title">Expenses</ThemedText>
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

      <ThemedTextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Search description, category…"
        value={search}
        onChangeText={setSearch}
      />

      <FilterChips
        options={BUDGET_CATEGORIES}
        selected={category}
        onSelect={(value) => {
          setCategory(value);
          setSubcategory(null);
        }}
      />

      {category ? (
        <FilterChips
          options={subcategoriesForCategory(category)}
          selected={subcategory}
          onSelect={setSubcategory}
        />
      ) : null}

      <ThemedView variant="card" style={styles.totalCard}>
        <ThemedText type="body" style={{ color: colors.textSecondary }}>
          Total Spending
        </ThemedText>
        <ThemedText type="title" style={styles.totalValue}>
          {formatMoney(total)}
        </ThemedText>
        <ThemedText type="small" style={{ color: colors.textSecondary }}>
          {items.length} record{items.length === 1 ? '' : 's'}
        </ThemedText>
      </ThemedView>

      <BudgetSummaryCard categories={categorySpending} />

      {Platform.OS === 'web' ? (
        <Pressable onPress={() => router.push('/expense-form')} style={[styles.addButton, { backgroundColor: colors.tint }]}>
          <Text style={styles.addButtonText}>+ Add Expense</Text>
        </Pressable>
      ) : null}

      {wide && items.length > 0 ? (
        <ThemedView variant="card" style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.tableDate, { color: colors.textSecondary }]}>Date</Text>
          <Text style={[styles.tableCell, styles.tableSubcategory, { color: colors.textSecondary }]}>Subcategory</Text>
          <Text style={[styles.tableCell, styles.tableCategory, { color: colors.textSecondary }]}>Category</Text>
          <Text style={[styles.tableCell, styles.tableDescription, { color: colors.textSecondary }]}>Description</Text>
          <Text style={[styles.tableCell, styles.tableAmount, { color: colors.textSecondary }]}>Amount</Text>
          <View style={[styles.tableCell, styles.tableActions]} />
        </ThemedView>
      ) : null}

      {error && items.length > 0 ? (
        <ThemedText type="small" style={{ color: colors.error }}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        {Platform.OS !== 'web' ? (
          <Pressable
            onPress={() => router.push('/expense-form')}
            style={[styles.fab, { backgroundColor: colors.tint }]}
            accessibilityLabel="Add expense">
            <Text style={styles.fabText}>+</Text>
          </Pressable>
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

function formatMonthLabel(year, month) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function subcategoriesForCategory(category) {
  return EXPENSE_CATEGORIES[category] ?? [];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: Spacing.two,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalCard: {
    alignItems: 'center',
    padding: Spacing.four,
    gap: Spacing.one,
  },
  totalValue: {
    fontWeight: '700',
  },
  budgetCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '600',
  },
  budgetEdit: {
    fontSize: 14,
    fontWeight: '600',
  },
  budgetRow: {
    gap: Spacing.one,
  },
  budgetRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetCategory: {
    fontWeight: '600',
  },
  addButton: {
    paddingVertical: Spacing.three,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stateBox: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
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
  item: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  itemType: {
    flex: 1,
    fontWeight: '600',
  },
  itemAmount: {
    fontWeight: '700',
  },
  itemActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  itemButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  itemButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.five,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    ...Platform.select({
      web: { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)' },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  tableCell: {
    fontSize: 14,
  },
  tableDate: {
    width: 110,
  },
  tableSubcategory: {
    flex: 1.2,
    fontWeight: '600',
  },
  tableCategory: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  tableDescription: {
    flex: 1.6,
  },
  tableAmount: {
    flex: 0.8,
    textAlign: 'right',
    fontWeight: '600',
  },
  tableActions: {
    width: 140,
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'flex-end',
  },
  rowButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 6,
  },
  rowButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
