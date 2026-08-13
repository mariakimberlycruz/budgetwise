import { StyleSheet, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';

export function ProgressBar({ progress = 0, color, height = 8 }) {
  const colors = useThemeColors();
  const clamped = Math.max(0, Math.min(1, Number(progress) || 0));

  return (
    <View style={[styles.track, { backgroundColor: colors.backgroundElement, height }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped * 100}%`,
            backgroundColor: color ?? colors.tint,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 999,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 999,
  },
});
