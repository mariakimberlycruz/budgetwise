import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MonthlySelector } from '@/components/dashboard/monthly-selector';
import { ProgressBar } from '@/components/dashboard/progress-bar';
import { SectionCard } from '@/components/reports/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { getFinancialHealth } from '@/services/financial-health';
import { getErrorMessage } from '@/utils/errors';

const WIDE_BREAKPOINT = 900;

const TONE_META = {
  good: { icon: '✓', color: '#16A34A' },
  warning: { icon: '⚠', color: '#F59E0B' },
  info: { icon: 'ℹ', color: '#64748B' },
};

const COMPONENT_LABELS = [
  { key: 'needs', label: 'Needs usage' },
  { key: 'wants', label: 'Wants usage' },
  { key: 'savings', label: 'Savings progress' },
  { key: 'budget', label: 'Budget health' },
];

function ScoreHero({ score, status, statusColor }) {
  const colors = useThemeColors();
  return (
    <SectionCard title="Financial Health Score" style={styles.heroCard}>
      <View style={styles.scoreRow}>
        <Text style={[styles.scoreNumber, { color: statusColor }]}>{score}</Text>
        <Text style={[styles.scoreTotal, { color: colors.textSecondary }]}>/ 100</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}1A` }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
      </View>
      <ProgressBar progress={(Number(score) || 0) / 100} color={statusColor} height={10} />
      <ThemedText type="small" style={{ color: colors.textSecondary }}>
        Score is calculated by the backend from your budget usage, savings progress and
        overall budget health.
      </ThemedText>
    </SectionCard>
  );
}

function ReasonsCard({ reasons = [] }) {
  const colors = useThemeColors();
  return (
    <SectionCard title="Reasons" subtitle="What affects your score this month" style={styles.flex}>
      <View style={styles.reasons}>
        {reasons.map((reason, index) => {
          const meta = TONE_META[reason.tone] ?? TONE_META.info;
          return (
            <View key={`${index}-${reason.text}`} style={styles.reasonRow}>
              <Text style={[styles.reasonIcon, { color: meta.color }]}>{meta.icon}</Text>
              <Text style={[styles.reasonText, { color: colors.text }]}>{reason.text}</Text>
            </View>
          );
        })}
      </View>
    </SectionCard>
  );
}

function ComponentsCard({ components = {} }) {
  const colors = useThemeColors();
  const max = Math.max(
    1,
    ...COMPONENT_LABELS.map((c) => (Number(components[c.key]) || 0)),
  );
  return (
    <SectionCard
      title="Score breakdown"
      subtitle="Points earned in each area (max 100)">
      <View style={styles.components}>
        {COMPONENT_LABELS.map((comp) => {
          const value = Number(components[comp.key]) || 0;
          return (
            <View key={comp.key} style={styles.componentRow}>
              <Text style={[styles.componentLabel, { color: colors.text }]}>{comp.label}</Text>
              <View style={[styles.track, { backgroundColor: colors.backgroundElement }]}>
                <View
                  style={[
                    styles.fill,
                    { width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: colors.tint },
                  ]}
                />
              </View>
              <Text style={[styles.componentValue, { color: colors.textSecondary }]}>{value}</Text>
            </View>
          );
        })}
      </View>
    </SectionCard>
  );
}

export default function FinancialHealthScreen() {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const health = await getFinancialHealth({ month, year });
      setData(health);
    } catch (err) {
      setError(getErrorMessage(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useFocusEffect(
    useCallback(() => {
      void loadHealth();
    }, [loadHealth]),
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title">Financial Health</ThemedText>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
            <Text style={[styles.backText, { color: colors.textSecondary }]}>Back</Text>
          </Pressable>
        </View>

        <MonthlySelector
          year={year}
          month={month}
          onChange={(newYear, newMonth) => {
            setYear(newYear);
            setMonth(newMonth);
          }}
        />

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : error || !data ? (
          <View style={styles.stateBox}>
            <ThemedText type="body" style={{ color: colors.error, textAlign: 'center' }}>
              {error ?? 'Unable to load your financial health score.'}
            </ThemedText>
            <Pressable
              onPress={() => void loadHealth()}
              style={[styles.retryButton, { backgroundColor: colors.tint }]}>
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={wide ? styles.sideBySide : styles.stacked}>
              <ScoreHero
                score={data.score}
                status={data.status}
                statusColor={data.status_color ?? colors.tint}
              />
              <ReasonsCard reasons={data.reasons ?? []} />
            </View>

            <ComponentsCard components={data.components ?? {}} />
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
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  backButton: {
    padding: Spacing.two,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  stateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  content: {
    gap: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  sideBySide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  stacked: {
    gap: Spacing.three,
  },
  heroCard: {
    minWidth: 280,
  },
  flex: {
    flex: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
  },
  scoreNumber: {
    fontSize: 64,
    lineHeight: 72,
    fontWeight: '800',
  },
  scoreTotal: {
    fontSize: 20,
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  reasons: {
    gap: Spacing.two,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  reasonIcon: {
    fontSize: 16,
    lineHeight: 22,
    width: 20,
    textAlign: 'center',
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  components: {
    gap: Spacing.two,
  },
  componentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  componentLabel: {
    width: 150,
    fontSize: 13,
    fontWeight: '600',
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  componentValue: {
    width: 28,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
  },
});

