import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { INCOME_TYPES } from '@/constants/income';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { createIncome, getIncome, updateIncome } from '@/services/income';
import { isValidISODate, todayISO } from '@/utils/dates';
import { getErrorMessage } from '@/utils/errors';

export default function IncomeFormScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams();
  const incomeId = params?.id ? Number(params.id) : null;
  const isEditing = incomeId !== null;

  const [amount, setAmount] = useState('');
  const [incomeType, setIncomeType] = useState('');
  const [description, setDescription] = useState('');
  const [incomeDate, setIncomeDate] = useState(todayISO());
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
        const income = await getIncome(incomeId);
        if (!cancelled) {
          setAmount(income.amount);
          setIncomeType(income.income_type);
          setDescription(income.description ?? '');
          setIncomeDate(income.income_date);
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
  }, [incomeId, isEditing]);

  const validate = () => {
    const trimmedAmount = amount.trim();
    if (!trimmedAmount) {
      return 'Please enter an amount.';
    }
    if (!/^\d+(\.\d{1,2})?$/.test(trimmedAmount)) {
      return 'Amount must be a number with up to 2 decimal places.';
    }
    if (Number(trimmedAmount) <= 0) {
      return 'Amount must be greater than zero.';
    }
    if (!incomeType) {
      return 'Please choose an income type.';
    }
    if (!isValidISODate(incomeDate)) {
      return 'Please enter a valid date in YYYY-MM-DD format.';
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
      amount: Number(amount.trim()),
      income_type: incomeType,
      description: description.trim() || null,
      income_date: incomeDate,
    };
    try {
      if (isEditing) {
        await updateIncome(incomeId, payload);
      } else {
        await createIncome(payload);
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
          <ThemedText type="subtitle">{isEditing ? 'Edit Income' : 'Add Income'}</ThemedText>
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
                Income type
              </ThemedText>
              <View style={styles.chips}>
                {INCOME_TYPES.map((type) => {
                  const selected = incomeType === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => setIncomeType(type)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected ? colors.tint : colors.backgroundElement,
                          borderColor: selected ? colors.tint : colors.border,
                        },
                      ]}>
                      <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.text }]}>
                        {type}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.field}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Date (YYYY-MM-DD)
              </ThemedText>
              <ThemedTextInput
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="2026-08-01"
                value={incomeDate}
                onChangeText={setIncomeDate}
              />
              <Pressable onPress={() => setIncomeDate(todayISO())} style={styles.todayButton}>
                <Text style={[styles.todayText, { color: colors.tint }]}>Today</Text>
              </Pressable>
            </View>

            <View style={styles.field}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Description (optional)
              </ThemedText>
              <ThemedTextInput
                autoCapitalize="sentences"
                placeholder="e.g. Monthly salary"
                value={description}
                onChangeText={setDescription}
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
