import { StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ALERT_COLORS, ALERT_ICONS, ALERT_LABELS } from '@/constants/alerts';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

/**
 * A single reusable in-app alert banner.
 *
 * type: one of 'normal' | 'warning' | 'critical' | 'success'
 * title: short headline (optional)
 * message: body text (optional)
 */
export function AlertBanner({ type = 'normal', title, message, style }) {
  const colors = useThemeColors();
  const color = ALERT_COLORS[type] ?? ALERT_COLORS.normal;

  return (
    <ThemedView
      variant="card"
      style={[styles.banner, { borderLeftColor: color, borderLeftWidth: 4 }, style]}
      accessibilityRole={type === 'critical' ? 'alert' : 'text'}>
      <View style={styles.headerRow}>
        {ALERT_ICONS[type] ? <Text style={styles.icon}>{ALERT_ICONS[type]}</Text> : null}
        <View style={[styles.badge, { backgroundColor: `${color}1A` }]}>
          <Text style={[styles.badgeText, { color }]}>{ALERT_LABELS[type] ?? type}</Text>
        </View>
      </View>
      {title ? (
        <ThemedText type="body" style={styles.title}>
          {title}
        </ThemedText>
      ) : null}
      {message ? (
        <ThemedText type="small" style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: Spacing.three,
    gap: Spacing.two,
    borderLeftWidth: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  icon: {
    fontSize: 20,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontWeight: '600',
  },
  message: {
    lineHeight: 18,
  },
});
