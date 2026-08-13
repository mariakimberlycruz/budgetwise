import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { deleteIncome, getIncomes } from '@/services/income';
import { confirmDelete } from '@/utils/confirm';
import { formatDate, formatMonthYear } from '@/utils/dates';
import { getErrorMessage } from '@/utils/errors';
import { formatMoney } from '@/utils/money';

function MonthNavigator({ year, month, onChange }) {
  const colors = useThemeColors();

  const changeMonth = (delta) => {
    onChange(year + Math.floor((month - 1 + delta) / 12), ((month - 1 + delta + 12) % 12) + 1);
  };

  return (
    <View style={styles.monthRow}>
      <Pressable
        onPress={() => changeMonth(-1)}
        style={[styles.monthButton, { backgroundColor: colors.backgroundElement }]}
        accessibilityLabel="Previous month">
        <Text style={[styles.monthButtonText, { color: colors.text }]}>‹</Text>
      </Pressable>
      <ThemedText type="subtitle" style={styles.monthLabel}>
        {formatMonthYear(year, month)}
      </ThemedText>
      <Pressable
        onPress={() => changeMonth(1)}
        style={[styles.monthButton, { backgroundColor: colors.backgroundElement }]}
        accessibilityLabel="Next month">
        <Text style={[styles.monthButtonText, { color: colors.text }]}>›</Text>
      </Pressable>
    </View>
  );
}

function IncomeItem({ income, deleting, onEdit, onDelete }) {
  const colors = useThemeColors();

  return (
    <ThemedView variant="card" style={styles.item}>
      <View style={styles.itemTop}>
        <ThemedText type="body" style={styles.itemType}>
          {income.income_type}
        </ThemedText>
        <ThemedText type="body" style={[styles.itemAmount, { color: colors.success }]}>
          {formatMoney(income.amount)}
        </ThemedText>
      </View>
      <ThemedText type="small" style={{ color: colors.textSecondary }}>
        {formatDate(income.income_date)}
      </ThemedText>
      {income.description ? (
        <ThemedText type="small" style={{ color: colors.textSecondary }}>
          {income.description}
        </ThemedText>
      ) : null}
      <View style={styles.itemActions}>
        <Pressable
          onPress={() => onEdit(income)}
          style={[styles.itemButton, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.itemButtonText, { color: colors.text }]}>Edit</Text>
        </Pressable>
        <Pressable
          disabled={deleting}
          onPress={() => onDelete(income)}
          style={[styles.itemButton, { backgroundColor: colors.error }, deleting && styles.buttonDisabled]}>
          <Text style={styles.itemButtonText}>{deleting ? 'Deleting…' : 'Delete'}</Text>
        </Pressable>
      </View>
    </ThemedView>
  );
}

export default function IncomeScreen() {
  const colors = useThemeColors();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState('0.00');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadIncomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIncomes({ month, year });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(getErrorMessage(err));
      setItems([]);
      setTotal('0.00');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useFocusEffect(
    useCallback(() => {
      void loadIncomes();
    }, [loadIncomes]),
  );

  const handleDelete = (income) => {
    confirmDelete({
      title: 'Delete income',
      message: `Delete this ${income.income_type} of ${formatMoney(income.amount)}?`,
      onConfirm: () => {
        setDeletingId(income.id);
        deleteIncome(income.id)
          .then(() => loadIncomes())
          .catch((err) => setError(getErrorMessage(err)))
          .finally(() => setDeletingId(null));
      },
    });
  };

  const renderItem = ({ item }) => (
    <IncomeItem
      income={item}
      deleting={deletingId === item.id}
      onEdit={(income) => router.push(`/income-form?id=${income.id}`)}
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
          <Pressable
            onPress={() => void loadIncomes()}
            style={[styles.retryButton, { backgroundColor: colors.tint }]}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.stateBox}>
        <ThemedText type="body" style={{ color: colors.textSecondary, textAlign: 'center' }}>
          No income records found for {formatMonthYear(year, month)}.
        </ThemedText>
      </View>
    );
  };

  const listHeader = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <ThemedText type="title">Income</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.textSecondary }]}>Back</Text>
        </Pressable>
      </View>

      <MonthNavigator
        year={year}
        month={month}
        onChange={(newYear, newMonth) => {
          setYear(newYear);
          setMonth(newMonth);
        }}
      />

      <ThemedView variant="card" style={styles.totalCard}>
        <ThemedText type="body" style={{ color: colors.textSecondary }}>
          Total Income
        </ThemedText>
        <ThemedText type="title" style={{ color: colors.success }}>
          {formatMoney(total)}
        </ThemedText>
        <ThemedText type="small" style={{ color: colors.textSecondary }}>
          {items.length} record{items.length === 1 ? '' : 's'}
        </ThemedText>
      </ThemedView>

      <Pressable
        onPress={() => router.push('/income-form')}
        style={[styles.addButton, { backgroundColor: colors.tint }]}>
        <Text style={styles.addButtonText}>+ Add Income</Text>
      </Pressable>

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
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    paddingBottom: Spacing.five,
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
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonText: {
    fontSize: 22,
    lineHeight: 24,
  },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
  },
  totalCard: {
    alignItems: 'center',
    padding: Spacing.four,
    gap: Spacing.one,
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
});
