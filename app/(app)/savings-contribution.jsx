import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar } from '@/components/dashboard/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { addContribution, getSavingsGoal } from '@/services/savings';
import { getErrorMessage } from '@/utils/errors';
import { formatMoney } from '@/utils/money';

export default function SavingsContributionScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams();
  const goalId = params?.id ? Number(params.id) : null;

  const [goal, setGoal] = useState(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const result = await getSavingsGoal(goalId);
        if (!cancelled) {
          setGoal(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [goalId]);

  const handleSubmit = async () => {
    const trimmed = amount.trim();
    if (!trimmed || !/^\d+(\.\d{1,2})?$/.test(trimmed)) {
      setError('Amount must be a number with up to 2 decimal places.');
      return;
    }
    if (Number(trimmed) <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await addContribution(goalId, Number(trimmed));
      router.back();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Add Contribution</ThemedText>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: colors.textSecondary }]}>Close</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ThemedText type="body" style={{ color: colors.textSecondary }}>
              Loading…
            </ThemedText>
          </View>
        ) : goal ? (
          <View style={styles.form}>
            <View style={styles.summary}>
              <ThemedText type="body" style={styles.goalName}>
                {goal.name}
              </ThemedText>
              <ProgressBar progress={goal.progress_percent / 100} color={colors.success} height={10} />
              <View style={styles.statsRow}>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  Current {formatMoney(goal.current_amount)} / {formatMoney(goal.target_amount)}
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.success }}>
                  {goal.progress_percent}%
                </ThemedText>
              </View>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Remaining {formatMoney(goal.remaining)}
              </ThemedText>
            </View>

            <View style={styles.field}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Contribution amount (₱)
              </ThemedText>
              <ThemedTextInput
                autoCapitalize="none"
                autoCorrect={false}
                inputMode="decimal"
                keyboardType="decimal-pad"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
            </View>

            {error ? (
              <ThemedText type="small" style={{ color: colors.error }}>
                {error}
              </ThemedText>
            ) : null}

            <Pressable
              disabled={saving}
              onPress={() => void handleSubmit()}
              style={[styles.saveButton, { backgroundColor: colors.tint }, saving && styles.buttonDisabled]}>
              <Text style={styles.saveButtonText}>{saving ? 'Adding…' : 'Add contribution'}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.center}>
            <ThemedText type="body" style={{ color: colors.error, textAlign: 'center' }}>
              {error ?? 'Goal not found.'}
            </ThemedText>
          </View>
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
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  closeButton: {
    padding: Spacing.two,
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: Spacing.three,
  },
  summary: {
    gap: Spacing.two,
  },
  goalName: {
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  field: {
    gap: Spacing.two,
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
