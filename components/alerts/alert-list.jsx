import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { AlertBanner } from '@/components/alerts/alert-banner';
import { ALERT_ORDER } from '@/constants/alerts';
import { Spacing } from '@/constants/theme';

const BREAKPOINT = 768;

function compareSeverity(a, b) {
  return (ALERT_ORDER[a.type] ?? 99) - (ALERT_ORDER[b.type] ?? 99);
}

/**
 * Renders a list of in-app alerts.
 *
 * - Mobile (Android/iOS): stacked full-width banners.
 * - Web/wide: responsive wrapping grid so multiple alerts share a row.
 *
 * alerts: [{ id?, type, title, message }]
 */
export function AlertList({ alerts = [], style }) {
  const { width } = useWindowDimensions();
  const wide = width >= BREAKPOINT;

  if (!alerts || alerts.length === 0) {
    return null;
  }

  const sorted = [...alerts].sort(compareSeverity);

  return (
    <View style={[styles.container, wide && styles.wide, style]}>
      {sorted.map((alert) => (
        <AlertBanner
          key={alert.id ?? alert.title}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          style={wide ? styles.wideItem : null}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  wide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  wideItem: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 240,
  },
});
