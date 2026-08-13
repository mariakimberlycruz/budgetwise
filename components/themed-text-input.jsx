import { StyleSheet, TextInput } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

export function ThemedTextInput({ style, ...rest }) {
  const colors = useThemeColors();

  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      style={[
        styles.input,
        {
          backgroundColor: colors.backgroundElement,
          color: colors.text,
          borderColor: colors.border,
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
});
