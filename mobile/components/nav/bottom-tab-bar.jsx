import { router, usePathname } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NavIcon } from '@/components/nav/nav-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MORE_ITEM_KEYS, NAV_ITEMS_BY_KEY, PRIMARY_TAB_KEYS } from '@/constants/navigation';
import { Radius, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

// Touch-friendly bottom navigation for phones. Only the top few
// destinations get a permanent tab; the rest live behind "More".
export function BottomTabBar() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = MORE_ITEM_KEYS.some((key) => NAV_ITEMS_BY_KEY[key].route === pathname);

  const go = (route) => {
    setMoreOpen(false);
    router.push(route);
  };

  return (
    <>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, Spacing.two),
          },
        ]}>
        {PRIMARY_TAB_KEYS.map((key) => {
          const item = NAV_ITEMS_BY_KEY[key];
          const active = pathname === item.route;
          const color = active ? colors.tint : colors.textSecondary;
          return (
            <Pressable
              key={key}
              onPress={() => go(item.route)}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
              hitSlop={4}>
              <NavIcon name={item.icon} size={22} color={color} />
              <Text style={[styles.tabLabel, { color }]}>{item.label}</Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={() => setMoreOpen(true)}
          style={styles.tab}
          accessibilityRole="button"
          accessibilityLabel="More"
          accessibilityState={{ selected: moreActive }}
          hitSlop={4}>
          <NavIcon name="more" size={22} color={moreActive || moreOpen ? colors.tint : colors.textSecondary} />
          <Text style={[styles.tabLabel, { color: moreActive || moreOpen ? colors.tint : colors.textSecondary }]}>
            More
          </Text>
        </Pressable>
      </View>

      <Modal visible={moreOpen} transparent animationType="fade" onRequestClose={() => setMoreOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMoreOpen(false)} accessibilityLabel="Close menu" />
        <ThemedView
          variant="default"
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, Spacing.four), borderColor: colors.border },
          ]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <ThemedText type="subtitle" style={styles.sheetTitle}>
            More
          </ThemedText>
          {MORE_ITEM_KEYS.map((key) => {
            const item = NAV_ITEMS_BY_KEY[key];
            const active = pathname === item.route;
            return (
              <Pressable
                key={key}
                onPress={() => go(item.route)}
                style={[styles.sheetRow, active && { backgroundColor: colors.backgroundElement }]}>
                <NavIcon name={item.icon} size={20} color={active ? colors.tint : colors.text} />
                <Text style={[styles.sheetLabel, { color: active ? colors.tint : colors.text }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: Spacing.one,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.one,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.three,
  },
  sheetTitle: {
    marginBottom: Spacing.two,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.sm,
  },
  sheetLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
