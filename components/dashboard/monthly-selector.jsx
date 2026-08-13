import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColors } from '@/hooks/use-theme';
import { formatMonthYear } from '@/utils/dates';

export function MonthlySelector({ year, month, onChange }) {
  const colors = useThemeColors();

  const changeMonth = (delta) => {
    onChange(year + Math.floor((month - 1 + delta) / 12), ((month - 1 + delta + 12) % 12) + 1);
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => changeMonth(-1)}
        style={[styles.button, { backgroundColor: colors.backgroundElement }]}
        accessibilityLabel="Previous month">
        <Text style={[styles.buttonText, { color: colors.text }]}>‹</Text>
      </Pressable>
      <ThemedText type="subtitle" style={styles.label}>
        {formatMonthYear(year, month)}
      </ThemedText>
      <Pressable
        onPress={() => changeMonth(1)}
        style={[styles.button, { backgroundColor: colors.backgroundElement }]}
        accessibilityLabel="Next month">
        <Text style={[styles.buttonText, { color: colors.text }]}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 22,
    lineHeight: 24,
  },
  label: {
    flex: 1,
    textAlign: 'center',
  },
});
