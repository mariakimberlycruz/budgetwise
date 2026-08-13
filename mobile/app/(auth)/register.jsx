import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/use-theme';
import { getErrorMessage } from '@/utils/errors';

export default function RegisterScreen() {
  const colors = useThemeColors();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signUp(name.trim(), email.trim().toLowerCase(), password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.hero}>
          <ThemedText type="title">Create account</ThemedText>
          <ThemedText type="subtitle" style={{ color: colors.textSecondary }}>
            Start tracking your finances today
          </ThemedText>
        </View>

        <View style={styles.form}>
          <ThemedTextInput
            autoCapitalize="words"
            autoCorrect={false}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <ThemedTextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <ThemedTextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <ThemedTextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Confirm password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {error ? (
            <ThemedText type="small" style={{ color: colors.error }}>
              {error}
            </ThemedText>
          ) : null}

          <Pressable
            disabled={submitting}
            onPress={() => void handleRegister()}
            style={[styles.button, { backgroundColor: colors.tint }, submitting && styles.buttonDisabled]}>
            <Text style={styles.buttonText}>{submitting ? 'Creating account…' : 'Create account'}</Text>
          </Pressable>

          <View style={styles.footer}>
            <ThemedText type="body" style={{ color: colors.textSecondary }}>
              Already have an account?{' '}
            </ThemedText>
            <Link href="/login" style={{ color: colors.tint }}>
              <ThemedText type="body" style={{ color: colors.tint }}>
                Sign in
              </ThemedText>
            </Link>
          </View>
        </View>
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
    paddingVertical: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  form: {
    alignSelf: 'stretch',
    gap: Spacing.three,
  },
  button: {
    marginTop: Spacing.two,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
