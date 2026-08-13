import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { BUDGET_CATEGORIES, CATEGORY_COLORS } from '@/constants/expenses';
import {
  FREQUENCY_DUE_HINTS,
  FREQUENCY_DUE_PLACEHOLDERS,
  FREQUENCY_LABELS,
  RECURRING_FREQUENCIES,
} from '@/constants/recurring';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import {
  createRecurringExpense,
  getRecurringExpense,
  updateRecurringExpense,
} from '@/services/recurring';
import { isValidISODate, todayISO } from '@/utils/dates';
import { getErrorMessage } from '@/utils/errors';

export default function BillFormScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams();
  const billId = params?.id ? Number(params.id) : null;
  const isEditing = billId !== null;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(BUDGET_CATEGORIES[0]);
  const [frequency, setFrequency] = useState(RECURRING_FREQUENCIES[0]);
  const [dueDay, setDueDay] = useState('');
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState('');
  const [active, setActive] = useState(true);
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
        const bill = await getRecurringExpense(billId);
        if (!cancelled) {
          setName(bill.name);
          setAmount(bill.amount);
          setCategory(bill.category);
          setFrequency(bill.frequency);
          setDueDay(String(bill.due_day));
          setStartDate(bill.start_date);
          setEndDate(bill.end_date ?? '');
          setActive(bill.active);
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
  }, [billId, isEditing]);

  const validate = () => {
    if (!name.trim()) {
      return 'Please enter a bill name.';
    }
    if (!amount.trim() || !/^\d+(\.\d{1,2})?$/.test(amount.trim())) {
      return 'Amount must be a number with up to 2 decimal places.';
    }
    if (Number(amount) <= 0) {
      return 'Amount must be greater than zero.';
    }
    const day = Number(dueDay);
    const maxDay = frequency === 'weekly' ? 7 : 31;
    if (!Number.isInteger(day) || day < 1 || day > maxDay) {
      return `Due day must be a whole number between 1 and ${maxDay}.`;
    }
    if (!isValidISODate(startDate)) {
      return 'Please enter a valid start date in YYYY-MM-DD format.';
    }
    if (endDate.trim()) {
      if (!isValidISODate(endDate)) {
        return 'Please enter a valid end date in YYYY-MM-DD format.';
      }
      if (endDate < startDate) {
        return 'End date must be on or after the start date.';
      }
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
      amount: Number(amount.trim()),
      category,
      frequency,
      due_day: Number(dueDay),
      start_date: startDate,
      end_date: endDate.trim() ? endDate : null,
      active,
    };
    try {
      if (isEditing) {
        await updateRecurringExpense(billId, payload);
      } else {
        await createRecurringExpense(payload);
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
          <ThemedText type="subtitle">{isEditing ? 'Edit Bill' : 'New Bill'}</ThemedText>
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
                placeholder="e.g. Rent"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Amount (₱)
              </ThemedText>
              <ThemedTextInput
                autoCapitalize="none"
                autoCorrect={false}
                inputMode="decimal"
                keyboardType="decimal-pad"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Category
              </ThemedText>
              <View style={styles.chips}>
                {BUDGET_CATEGORIES.map((value) => {
                  const selected = category === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => setCategory(value)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected ? CATEGORY_COLORS[value] : colors.backgroundElement,
                          borderColor: selected ? CATEGORY_COLORS[value] : colors.border,
                        },
                      ]}>
                      <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.text }]}>
                        {value}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.field}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Frequency
              </ThemedText>
              <View style={styles.chips}>
                {RECURRING_FREQUENCIES.map((value) => {
                  const selected = frequency === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => setFrequency(value)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected ? colors.tint : colors.backgroundElement,
                          borderColor: selected ? colors.tint : colors.border,
                        },
                      ]}>
                      <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.text }]}>
                        {FREQUENCY_LABELS[value]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.field}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Due day {frequency === 'weekly' ? '(weekday)' : '(day of period)'}
              </ThemedText>
              <ThemedTextInput
                autoCapitalize="none"
                autoCorrect={false}
                inputMode="numeric"
                keyboardType="number-pad"
                placeholder={FREQUENCY_DUE_PLACEHOLDERS[frequency]}
                value={dueDay}
                onChangeText={setDueDay}
              />
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                {FREQUENCY_DUE_HINTS[frequency]}
              </ThemedText>
            </View>

            <View style={styles.field}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Start date (YYYY-MM-DD)
              </ThemedText>
              <ThemedTextInput
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="2026-01-01"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                End date (YYYY-MM-DD, optional)
              </ThemedText>
              <ThemedTextInput
                autoCapitalize="none"
                autoCorrect={false}
                placeholder=""
                value={endDate}
                onChangeText={setEndDate}
              />
              <Pressable onPress={() => setEndDate('')} style={styles.clearButton}>
                <Text style={[styles.clearText, { color: colors.tint }]}>Clear end date</Text>
              </Pressable>
            </View>

            <View style={styles.field}>
              <View style={styles.activeRow}>
                <ThemedText type="body">Active</ThemedText>
                <Switch
                  value={active}
                  onValueChange={setActive}
                  trackColor={{ true: colors.tint, false: colors.backgroundElement }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Inactive bills are kept but not counted as upcoming or overdue.
              </ThemedText>
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
  clearButton: {
    alignSelf: 'flex-start',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
