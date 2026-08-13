import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORY_COLORS } from '@/constants/expenses';
import { FREQUENCY_LABELS } from '@/constants/recurring';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import {
  deleteRecurringExpense,
  getRecurringExpenses,
  updateRecurringExpense,
} from '@/services/recurring';
import { confirmDelete } from '@/utils/confirm';
import { formatDate } from '@/utils/dates';
import { getErrorMessage } from '@/utils/errors';
import { formatMoney } from '@/utils/money';

const BREAKPOINT = 768;

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'overdue', label: 'Overdue' },
];

function filterBills(bills, tab) {
  if (tab === 'upcoming') {
    return bills.filter((bill) => bill.active && !bill.overdue && bill.next_due_date);
  }
  if (tab === 'overdue') {
    return bills.filter((bill) => bill.overdue);
  }
  return bills;
}

function dueLabel(bill, colors) {
  if (bill.overdue) {
    return 'Overdue';
  }
  if (!bill.active) {
    return 'Inactive';
  }
  if (!bill.next_due_date) {
    return 'Ended';
  }
  return `Due ${formatDate(bill.next_due_date)}`;
}

function statusColor(bill, colors) {
  if (bill.overdue) {
    return colors.error;
  }
  if (!bill.active || !bill.next_due_date) {
    return colors.textSecondary;
  }
  return colors.success;
}

function BillCard({ bill, toggling, onToggle, onEdit, onDelete }) {
  const colors = useThemeColors();
  const color = CATEGORY_COLORS[bill.category] ?? colors.tint;

  return (
    <ThemedView variant="card" style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitleRow}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <View style={styles.cardTitleText}>
            <ThemedText type="body" style={styles.billName}>
              {bill.name}
            </ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              {bill.category} · {FREQUENCY_LABELS[bill.frequency]}
            </ThemedText>
          </View>
        </View>
        <ThemedText type="body" style={styles.amount}>
          {formatMoney(bill.amount)}
        </ThemedText>
      </View>

      <View style={styles.cardBottom}>
        <View style={styles.cardDue}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor(bill, colors)}1A` }]}>
            <Text style={[styles.statusText, { color: statusColor(bill, colors) }]}>
              {dueLabel(bill, colors)}
            </Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
              {bill.active ? 'Active' : 'Inactive'}
            </Text>
            <Switch
              value={bill.active}
              onValueChange={() => onToggle(bill)}
              disabled={toggling}
              trackColor={{ true: colors.tint, false: colors.backgroundElement }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Pressable
            onPress={() => onEdit(bill)}
            style={[styles.rowButton, { backgroundColor: colors.backgroundElement }]}>
            <Text style={{ color: colors.text }}>Edit</Text>
          </Pressable>
          <Pressable
            disabled={toggling}
            onPress={() => onDelete(bill)}
            style={[styles.rowButton, { backgroundColor: colors.backgroundElement }]}>
            <Text style={{ color: colors.error }}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

function BillTableRow({ bill, toggling, onToggle, onEdit, onDelete }) {
  const colors = useThemeColors();
  const color = CATEGORY_COLORS[bill.category] ?? colors.tint;

  return (
    <ThemedView variant="card" style={styles.tableRow}>
      <View style={[styles.tableCell, styles.tableName]}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={{ color: colors.text }}>{bill.name}</Text>
      </View>
      <Text style={[styles.tableCell, styles.tableCategory, { color: colors.textSecondary }]}>
        {bill.category}
      </Text>
      <Text style={[styles.tableCell, styles.tableAmount, { color: colors.text }]}>
        {formatMoney(bill.amount)}
      </Text>
      <Text style={[styles.tableCell, styles.tableFrequency, { color: colors.textSecondary }]}>
        {FREQUENCY_LABELS[bill.frequency]}
      </Text>
      <Text style={[styles.tableCell, styles.tableDue, { color: statusColor(bill, colors) }]}>
        {dueLabel(bill, colors)}
      </Text>
      <View style={[styles.tableCell, styles.tableActions]}>
        <Switch
          value={bill.active}
          onValueChange={() => onToggle(bill)}
          disabled={toggling}
          trackColor={{ true: colors.tint, false: colors.backgroundElement }}
          thumbColor="#FFFFFF"
        />
        <Pressable
          onPress={() => onEdit(bill)}
          style={[styles.rowButton, { backgroundColor: colors.backgroundElement }]}>
          <Text style={{ color: colors.text }}>Edit</Text>
        </Pressable>
        <Pressable
          disabled={toggling}
          onPress={() => onDelete(bill)}
          style={[styles.rowButton, { backgroundColor: colors.backgroundElement }]}>
          <Text style={{ color: colors.error }}>Delete</Text>
        </Pressable>
      </View>
    </ThemedView>
  );
}

export default function BillsScreen() {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const wide = width >= BREAKPOINT;

  const [bills, setBills] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const loadBills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRecurringExpenses();
      setBills(result.items ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadBills();
    }, [loadBills]),
  );

  const handleToggle = async (bill) => {
    setTogglingId(bill.id);
    setError(null);
    try {
      await updateRecurringExpense(bill.id, {
        name: bill.name,
        amount: Number(bill.amount),
        category: bill.category,
        frequency: bill.frequency,
        due_day: bill.due_day,
        start_date: bill.start_date,
        end_date: bill.end_date,
        active: !bill.active,
      });
      await loadBills();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = (bill) => {
    confirmDelete({
      title: 'Delete bill',
      message: `Delete "${bill.name}"? This cannot be undone.`,
      onConfirm: () => {
        setTogglingId(bill.id);
        setError(null);
        deleteRecurringExpense(bill.id)
          .then(() => loadBills())
          .catch((err) => setError(getErrorMessage(err)))
          .finally(() => setTogglingId(null));
      },
    });
  };

  const visible = filterBills(bills, tab);
  const counts = {
    all: bills.length,
    upcoming: bills.filter((b) => b.active && !b.overdue && b.next_due_date).length,
    overdue: bills.filter((b) => b.overdue).length,
  };

  const renderItem = ({ item }) => {
    const toggling = togglingId === item.id;
    if (wide) {
      return (
        <BillTableRow
          bill={item}
          toggling={toggling}
          onToggle={handleToggle}
          onEdit={(bill) => router.push(`/bill-form?id=${bill.id}`)}
          onDelete={handleDelete}
        />
      );
    }
    return (
      <BillCard
        bill={item}
        toggling={toggling}
        onToggle={handleToggle}
        onEdit={(bill) => router.push(`/bill-form?id=${bill.id}`)}
        onDelete={handleDelete}
      />
    );
  };

  const listHeader = (
    <View style={styles.headerBlock}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title">Bills</ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            Upcoming and overdue recurring expenses
          </ThemedText>
        </View>
        {Platform.OS === 'web' ? (
          <Pressable
            onPress={() => router.push('/bill-form')}
            style={[styles.addButton, { backgroundColor: colors.tint }]}>
            <Text style={styles.addButtonText}>+ Add bill</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.tabs}>
        {TABS.map((item) => {
          const selected = tab === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setTab(item.key)}
              style={[
                styles.tab,
                {
                  backgroundColor: selected ? colors.tint : colors.backgroundElement,
                  borderColor: selected ? colors.tint : colors.border,
                },
              ]}>
              <Text style={[styles.tabText, { color: selected ? '#FFFFFF' : colors.text }]}>
                {item.label} ({counts[item.key]})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {wide ? (
        <ThemedView variant="card" style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.tableName, { color: colors.textSecondary }]}>Name</Text>
          <Text style={[styles.tableCell, styles.tableCategory, { color: colors.textSecondary }]}>Category</Text>
          <Text style={[styles.tableCell, styles.tableAmount, { color: colors.textSecondary }]}>Amount</Text>
          <Text style={[styles.tableCell, styles.tableFrequency, { color: colors.textSecondary }]}>Frequency</Text>
          <Text style={[styles.tableCell, styles.tableDue, { color: colors.textSecondary }]}>Due</Text>
          <View style={[styles.tableCell, styles.tableActions]} />
        </ThemedView>
      ) : null}

      {error && bills.length > 0 ? (
        <ThemedText type="small" style={{ color: colors.error }}>
          {error}
        </ThemedText>
      ) : null}
    </View>
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
            onPress={() => void loadBills()}
            style={[styles.retryButton, { backgroundColor: colors.tint }]}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    if (tab !== 'all' && visible.length === 0) {
      return (
        <View style={styles.stateBox}>
          <ThemedText type="body" style={{ color: colors.textSecondary, textAlign: 'center' }}>
            No {tab} bills.
          </ThemedText>
        </View>
      );
    }
    return (
      <View style={styles.stateBox}>
        <ThemedText type="body" style={{ color: colors.textSecondary, textAlign: 'center' }}>
          No bills yet.
        </ThemedText>
        <Pressable
          onPress={() => router.push('/bill-form')}
          style={[styles.retryButton, { backgroundColor: colors.tint }]}>
          <Text style={styles.retryButtonText}>Add your first bill</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={visible}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        {Platform.OS !== 'web' ? (
          <Pressable
            onPress={() => router.push('/bill-form')}
            style={[styles.fab, { backgroundColor: colors.tint }]}
            accessibilityLabel="Add bill">
            <Text style={styles.fabText}>+</Text>
          </Pressable>
        ) : null}
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
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  headerBlock: {
    marginBottom: Spacing.two,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tab: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    flexShrink: 1,
  },
  cardTitleText: {
    gap: Spacing.one,
  },
  billName: {
    fontWeight: '600',
  },
  amount: {
    fontWeight: '600',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardDue: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rowButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 8,
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
  tableName: {
    flex: 2.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  tableCategory: {
    flex: 1,
  },
  tableAmount: {
    flex: 1,
    fontWeight: '600',
  },
  tableFrequency: {
    flex: 1,
  },
  tableDue: {
    flex: 1.2,
    fontWeight: '600',
  },
  tableActions: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    justifyContent: 'flex-end',
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
});
