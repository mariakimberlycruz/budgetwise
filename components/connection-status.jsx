import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { useApp } from '@/context/AppContext';

function StatusPill({ status }) {
  const colors = useThemeColors();

  const config = {
    checking: { label: 'Checking…', color: colors.textSecondary, backgroundColor: colors.backgroundElement },
    online: { label: 'Online', color: colors.success, backgroundColor: colors.backgroundElement },
    offline: { label: 'Offline', color: colors.error, backgroundColor: colors.backgroundElement },
  };

  const { label, color, backgroundColor } = config[status];

  return (
    <View style={[styles.pill, { backgroundColor }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

export function ConnectionStatus() {
  const colors = useThemeColors();
  const { apiBaseUrl, apiStatus, health, refreshHealth } = useApp();

  return (
    <ThemedView variant="card" style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="subtitle">API Connection</ThemedText>
        <StatusPill status={apiStatus} />
      </View>

      <View style={styles.row}>
        <ThemedText type="small" style={{ color: colors.textSecondary }}>
          Base URL
        </ThemedText>
        <ThemedText type="code" numberOfLines={1}>
          {apiBaseUrl}
        </ThemedText>
      </View>

      {health ? (
        <>
          <View style={styles.row}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Service
            </ThemedText>
            <ThemedText type="body">{health.service}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Version
            </ThemedText>
            <ThemedText type="body">{health.version}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Database
            </ThemedText>
            <ThemedText type="body">{health.database}</ThemedText>
          </View>
        </>
      ) : (
        <ThemedText type="small" style={{ color: colors.textSecondary }}>
          {apiStatus === 'offline'
            ? 'Could not reach the API. Make sure the backend is running and the base URL is correct.'
            : 'Contacting the API…'}
        </ThemedText>
      )}

      <Pressable
        onPress={() => void refreshHealth()}
        style={[styles.button, { backgroundColor: colors.tint }]}>
        <Text style={styles.buttonText}>Re-check connection</Text>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    alignSelf: 'stretch',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
