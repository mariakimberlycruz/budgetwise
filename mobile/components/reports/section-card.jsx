import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

/**
 * A titled card wrapper used to group a report section.
 */
export function SectionCard({ title, subtitle, children, style }) {
  const colors = useThemeColors();

  return (
    <ThemedView variant="card" style={[styles.card, style]}>
      <View style={styles.heading}>
        <ThemedText type="body" style={styles.title}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    gap: Spacing.three,
    flex: 1,
  },
  heading: {
    gap: Spacing.one,
  },
  title: {
    fontWeight: '700',
  },
});
