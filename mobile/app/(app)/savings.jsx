import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/dashboard/empty-state';
import { ProgressBar } from '@/components/dashboard/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { deleteSavingsGoal, getSavingsGoals } from '@/services/savings';
import { confirmDelete } from '@/utils/confirm';
import { formatDate } from '@/utils/dates';
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

function SavingsGoalCard({ goal, deleting, onContribute, onEdit, onDelete }) {
  const colors = useThemeColors();
  const progress = goal.progress_percent;

  return (
    <ThemedView variant="card" style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText type="body" style={styles.goalName}>
          {goal.name}
        </ThemedText>
        <ThemedText type="small" style={{ color: colors.textSecondary }}>
          Target {formatDate(goal.target_date)}
        </ThemedText>
      </View>

      <ProgressBar progress={progress / 100} color={colors.success} height={10} />

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            Current
          </ThemedText>
          <ThemedText type="body" style={styles.statValue}>
            {formatMoney(goal.current_amount)}
          </ThemedText>
        </View>
        <View style={styles.stat}>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            Target
          </ThemedText>
          <ThemedText type="body" style={styles.statValue}>
            {formatMoney(goal.target_amount)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            Remaining
          </ThemedText>
          <ThemedText type="body" style={styles.statValue}>
            {formatMoney(goal.remaining)}
          </ThemedText>
        </View>
        <View style={styles.stat}>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            Progress
          </ThemedText>
          <ThemedText type="body" style={[styles.statValue, { color: colors.success }]}>
            {progress}%
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Pressable
          onPress={() => onContribute(goal)}
          style={[styles.actionButton, { backgroundColor: colors.tint }]}>
          <Text style={styles.actionButtonText}>Contribute</Text>
        </Pressable>
        <Pressable
          onPress={() => onEdit(goal)}
          style={[styles.actionButton, styles.secondaryButton, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Edit</Text>
        </Pressable>
        <Pressable
          disabled={deleting}
          onPress={() => onDelete(goal)}
          style={[styles.actionButton, styles.secondaryButton, { backgroundColor: colors.backgroundElement, borderColor: colors.border }, deleting && styles.buttonDisabled]}>
          <Text style={[styles.actionButtonText, { color: colors.error }]}>Delete</Text>
        </Pressable>
      </View>
    </ThemedView>
  );
}

export default function SavingsScreen() {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const columns = gridColumns(width);
  const cardWidth = `${100 / columns}%`;

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSavingsGoals();
      setGoals(result.items ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadGoals();
    }, [loadGoals]),
  );

  const handleDelete = (goal) => {
    confirmDelete({
      title: 'Delete savings goal',
      message: `Delete "${goal.name}"? This cannot be undone.`,
      onConfirm: () => {
        setDeletingId(goal.id);
        setError(null);
        deleteSavingsGoal(goal.id)
          .then(() => loadGoals())
          .catch((err) => setError(getErrorMessage(err)))
          .finally(() => setDeletingId(null));
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <ThemedText type="title">Savings Goals</ThemedText>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Track progress toward your goals
              </ThemedText>
            </View>
            {Platform.OS === 'web' ? (
              <Pressable
                onPress={() => router.push('/savings-goal-form')}
                style={[styles.addButton, { backgroundColor: colors.tint }]}>
                <Text style={styles.addButtonText}>+ Add goal</Text>
              </Pressable>
            ) : null}
          </View>

          {loading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          ) : error && goals.length === 0 ? (
            <View style={styles.stateBox}>
              <ThemedText type="body" style={{ color: colors.error, textAlign: 'center' }}>
                {error}
              </ThemedText>
              <Pressable
                onPress={() => void loadGoals()}
                style={[styles.retryButton, { backgroundColor: colors.tint }]}>
                <Text style={styles.retryButtonText}>Try again</Text>
              </Pressable>
            </View>
          ) : goals.length === 0 ? (
            <EmptyState
              title="No savings goals yet"
              message="Create your first goal and start saving toward it."
              actionLabel="Create goal"
              onAction={() => router.push('/savings-goal-form')}
            />
          ) : (
            <>
              {error ? (
                <ThemedText type="small" style={{ color: colors.error }}>
                  {error}
                </ThemedText>
              ) : null}
              <View style={styles.grid}>
                {goals.map((goal) => (
                  <View key={goal.id} style={[styles.gridItem, { width: cardWidth }]}>
                    <SavingsGoalCard
                      goal={goal}
                      deleting={deletingId === goal.id}
                      onContribute={(item) => router.push(`/savings-contribution?id=${item.id}`)}
                      onEdit={(item) => router.push(`/savings-goal-form?id=${item.id}`)}
                      onDelete={handleDelete}
                    />
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>

        {Platform.OS !== 'web' ? (
          <Pressable
            onPress={() => router.push('/savings-goal-form')}
            style={[styles.fab, { backgroundColor: colors.tint }]}
            accessibilityLabel="Add savings goal">
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
  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.two,
  },
  gridItem: {
    paddingHorizontal: Spacing.two,
    marginBottom: Spacing.four,
  },
  card: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  goalName: {
    fontWeight: '600',
    flexShrink: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  stat: {
    flex: 1,
    gap: Spacing.one,
  },
  statValue: {
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
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
