import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppShell } from '@/components/nav/app-shell';
import { SectionCard } from '@/components/reports/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { CURRENCIES, THEMES } from '@/constants/settings';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useNavLayout } from '@/hooks/use-nav-layout';
import { useThemeColors } from '@/hooks/use-theme';
import { updateProfile } from '@/services/settings';
import { getErrorMessage } from '@/utils/errors';
import { validateBudgetPercentages } from '@/utils/validators';

const WIDE_BREAKPOINT = 900;

function OptionRow({ label, selected, onPress, colors }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.optionRow,
        { backgroundColor: colors.backgroundElement, borderColor: selected ? colors.tint : colors.border },
      ]}>
      <Text style={[styles.optionLabel, { color: colors.text }]}>{label}</Text>
      {selected ? <Text style={[styles.optionCheck, { color: colors.tint }]}>✓</Text> : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { width } = useNavLayout();
  const wide = width >= WIDE_BREAKPOINT;
  const { user, signOut, refreshUser } = useAuth();
  const { settings, updateSettings } = useSettings();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileErr, setProfileErr] = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currency, setCurrency] = useState(settings.currency);
  const [needsPct, setNeedsPct] = useState(String(settings.budget_needs));
  const [savingsPct, setSavingsPct] = useState(String(settings.budget_savings));
  const [wantsPct, setWantsPct] = useState(String(settings.budget_wants));
  const [theme, setTheme] = useState(settings.theme);
  const [settingsErr, setSettingsErr] = useState(null);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const [prevSettings, setPrevSettings] = useState(settings);
  if (prevSettings !== settings) {
    setPrevSettings(settings);
    setCurrency(settings.currency);
    setNeedsPct(String(settings.budget_needs));
    setSavingsPct(String(settings.budget_savings));
    setWantsPct(String(settings.budget_wants));
    setTheme(settings.theme);
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setProfileErr('Name is required.');
      return;
    }
    setSavingProfile(true);
    setProfileErr(null);
    setProfileSaved(false);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      await refreshUser();
      setProfileSaved(true);
    } catch (err) {
      setProfileErr(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSettings = async () => {
    const needs = Number(needsPct);
    const savings = Number(savingsPct);
    const wants = Number(wantsPct);
    const validationError = validateBudgetPercentages({ needs, savings, wants });
    if (validationError) {
      setSettingsErr(validationError);
      return;
    }
    setSavingSettings(true);
    setSettingsErr(null);
    setSettingsSaved(false);
    try {
      await updateSettings({
        currency,
        budget_needs: needs,
        budget_savings: savings,
        budget_wants: wants,
        theme,
      });
      setSettingsSaved(true);
    } catch (err) {
      setSettingsErr(getErrorMessage(err));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogout = async () => {
    setSigningOut(true);
    await signOut();
  };

  return (
    <AppShell>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ThemedText type="title" style={styles.title}>
            Settings
          </ThemedText>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={wide ? styles.sideBySide : styles.stacked}>
            <SectionCard title="Profile" style={styles.flex}>
              <View style={styles.field}>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  Name
                </ThemedText>
                <ThemedTextInput
                  autoCapitalize="words"
                  placeholder="Your name"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <View style={styles.field}>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  Email
                </ThemedText>
                <ThemedTextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {profileErr ? (
                <ThemedText type="small" style={{ color: colors.error }}>
                  {profileErr}
                </ThemedText>
              ) : null}
              {profileSaved ? (
                <ThemedText type="small" style={{ color: colors.success }}>
                  Profile updated.
                </ThemedText>
              ) : null}

              <Pressable
                disabled={savingProfile}
                onPress={() => void handleSaveProfile()}
                style={[
                  styles.button,
                  { backgroundColor: colors.tint },
                  savingProfile && styles.buttonDisabled,
                ]}>
                <Text style={styles.buttonText}>{savingProfile ? 'Saving…' : 'Save profile'}</Text>
              </Pressable>
            </SectionCard>

            <SectionCard title="Preferences" style={styles.flex}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Currency
              </ThemedText>
              <View style={styles.optionList}>
                {CURRENCIES.map((c) => (
                  <OptionRow
                    key={c.code}
                    label={c.label}
                    selected={currency === c.code}
                    onPress={() => setCurrency(c.code)}
                    colors={colors}
                  />
                ))}
              </View>


              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Default budget (% of total)
              </ThemedText>
              <View style={styles.pctRow}>
                <View style={styles.pctField}>
                  <ThemedText type="small" style={{ color: colors.textSecondary }}>
                    Needs
                  </ThemedText>
                  <ThemedTextInput
                    inputMode="numeric"
                    keyboardType="number-pad"
                    value={needsPct}
                    onChangeText={setNeedsPct}
                    style={styles.input}
                  />
                </View>
                <View style={styles.pctField}>
                  <ThemedText type="small" style={{ color: colors.textSecondary }}>
                    Savings
                  </ThemedText>
                  <ThemedTextInput
                    inputMode="numeric"
                    keyboardType="number-pad"
                    value={savingsPct}
                    onChangeText={setSavingsPct}
                    style={styles.input}
                  />
                </View>
                <View style={styles.pctField}>
                  <ThemedText type="small" style={{ color: colors.textSecondary }}>
                    Wants
                  </ThemedText>
                  <ThemedTextInput
                    inputMode="numeric"
                    keyboardType="number-pad"
                    value={wantsPct}
                    onChangeText={setWantsPct}
                    style={styles.input}
                  />
                </View>
              </View>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                The three percentages must add up to 100%.
              </ThemedText>

              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Theme
              </ThemedText>
              <View style={styles.optionList}>
                {THEMES.map((t) => (
                  <OptionRow
                    key={t.key}
                    label={t.label}
                    selected={theme === t.key}
                    onPress={() => setTheme(t.key)}
                    colors={colors}
                  />
                ))}
              </View>

              {settingsErr ? (
                <ThemedText type="small" style={{ color: colors.error }}>
                  {settingsErr}
                </ThemedText>
              ) : null}
              {settingsSaved ? (
                <ThemedText type="small" style={{ color: colors.success }}>
                  Settings saved.
                </ThemedText>
              ) : null}

              <Pressable
                disabled={savingSettings}
                onPress={() => void handleSaveSettings()}
                style={[
                  styles.button,
                  { backgroundColor: colors.tint },
                  savingSettings && styles.buttonDisabled,
                ]}>
                <Text style={styles.buttonText}>{savingSettings ? 'Saving…' : 'Save settings'}</Text>
              </Pressable>
            </SectionCard>
          </View>

          <Pressable
            disabled={signingOut}
            onPress={() => void handleLogout()}
            style={[styles.logoutButton, signingOut && styles.buttonDisabled]}>
            {signingOut ? (
              <ActivityIndicator color={colors.error} />
            ) : (
              <Text style={[styles.logoutText, { color: colors.error }]}>Log out</Text>
            )}
          </Pressable>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </AppShell>
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
  title: {
    marginBottom: Spacing.three,
  },
  content: {
    gap: Spacing.three,
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
  flex: {
    flex: 1,
    minWidth: 300,
  },
  field: {
    gap: Spacing.one,
  },
  optionList: {
    gap: Spacing.two,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionCheck: {
    fontSize: 16,
    fontWeight: '700',
  },
  pctRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pctField: {
    flex: 1,
    gap: Spacing.one,
  },
  input: {
    textAlign: 'center',
  },
  button: {
    marginTop: Spacing.one,
    paddingVertical: Spacing.three,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: Spacing.three,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(220, 38, 38, 0.5)',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

