import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { createSavingsGoal, getSavingsGoal, updateSavingsGoal } from '@/services/savings';
import { isValidISODate, todayISO } from '@/utils/dates';
import { getErrorMessage } from '@/utils/errors';

function isAmount(value) {
  return /^\d+(\.\d{1,2})?$/.test(value.trim());
}

export default function SavingsGoalFormScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams();
  const goalId = params?.id ? Number(params.id) : null;
  const isEditing = goalId !== null;

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState(todayISO());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const goal = await getSavingsGoal(goalId);
        if (!cancelled) {
          setName(goal.name);
          setTargetAmount(goal.target_amount);
          setCurrentAmount(goal.current_amount);
          setTargetDate(goal.target_date);
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
  }, [goalId, isEditing]);

  const validate = () => {
    if (!name.trim()) {
      return 'Please enter a goal name.';
    }
    if (!targetAmount.trim() || !isAmount(targetAmount)) {
      return 'Target must be a number with up to 2 decimal places.';
    }
    if (Number(targetAmount) <= 0) {
      return 'Target must be greater than zero.';
    }
    if (currentAmount.trim()) {
      if (!isAmount(currentAmount)) {
        return 'Current must be a number with up to 2 decimal places.';
      }
      if (Number(currentAmount) < 0) {
        return 'Current amount cannot be negative.';
      }
    }
    if (!isValidISODate(targetDate)) {
      return 'Please enter a valid target date in YYYY-MM-DD format.';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSaving(true);
    const payload = {
      name: name.trim(),
      target_amount: Number(targetAmount.trim()),
      current_amount: currentAmount.trim() ? Number(currentAmount.trim()) : 0,
      target_date: targetDate,
    };
    try {
      if (isEditing) {
        await updateSavingsGoal(goalId, payload);
      } else {
        await createSavingsGoal(payload);
      }
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
          <ThemedText type="subtitle">{isEditing ? 'Edit Goal' : 'New Savings Goal'}</ThemedText>
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
        ) : (
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <View style={styles.field}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Name
              </ThemedText>
              <ThemedTextInput
                autoCapitalize="sentences"
                placeholder="e.g. Emergency Fund"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Target amount (₱)
              </ThemedText>
              <ThemedTextInput
                autoCapitalize="none"
                autoCorrect={false}
                inputMode="decimal"
                keyboardType="decimal-pad"
                placeholder="0.00"
                value={targetAmount}
                onChangeText={setTargetAmount}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Current amount (₱) {isEditing ? '' : '(optional)'}
              </ThemedText>
              <ThemedTextInput
                autoCapitalize="none"
                autoCorrect={false}
                inputMode="decimal"
                keyboardType="decimal-pad"
                placeholder="0.00"
                value={currentAmount}
                onChangeText={setCurrentAmount}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Target date (YYYY-MM-DD)
              </ThemedText>
              <ThemedTextInput
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="2026-12-31"
                value={targetDate}
                onChangeText={setTargetDate}
              />
              <Pressable onPress={() => setTargetDate(todayISO())} style={styles.todayButton}>
                <Text style={[styles.todayText, { color: colors.tint }]}>Today</Text>
              </Pressable>
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
              <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save'}</Text>
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
    paddingBottom: Spacing.five,
  },
  field: {
    gap: Spacing.two,
  },
  todayButton: {
    alignSelf: 'flex-start',
    paddingTop: Spacing.one,
  },
  todayText: {
    fontSize: 14,
    fontWeight: '600',
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
