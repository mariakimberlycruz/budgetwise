import { router, usePathname } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NavIcon } from '@/components/nav/nav-icon';
import { ThemedText } from '@/components/themed-text';
import { NAV_ITEMS } from '@/constants/navigation';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/use-theme';

export const SIDEBAR_WIDTH = 232;

// Persistent left-hand navigation for tablet/web/desktop widths — the
// "responsive sidebar" that replaces the phone bottom tab bar once there's
// enough horizontal room for it.
export function SidebarNav() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: colors.backgroundElement,
          borderRightColor: colors.border,
          paddingTop: insets.top + Spacing.four,
          paddingBottom: insets.bottom + Spacing.three,
        },
      ]}>
      <View style={styles.brand}>
        <View style={[styles.brandMark, { backgroundColor: colors.tint }]}>
          <Text style={styles.brandMarkText}>₱</Text>
        </View>
        <ThemedText type="subtitle" numberOfLines={1}>
          BudgetWise
        </ThemedText>
      </View>

      <ScrollView style={styles.nav} contentContainerStyle={styles.navContent} showsVerticalScrollIndicator={false}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.route;
          return (
            <View key={item.key}>
              {item.key === 'settings' ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
              <Pressable
                onPress={() => router.push(item.route)}
                style={({ hovered, pressed }) => [
                  styles.item,
                  (active || hovered || pressed) && {
                    backgroundColor: active ? colors.backgroundSelected : colors.background,
                  },
                ]}
                accessibilityRole="link"
                accessibilityState={{ selected: active }}>
                <NavIcon name={item.icon} size={20} color={active ? colors.tint : colors.textSecondary} />
                <Text
                  style={[
                    styles.itemLabel,
                    { color: active ? colors.tint : colors.text, fontWeight: active ? '700' : '600' },
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.userRow}>
          <View style={[styles.avatar, { backgroundColor: colors.backgroundSelected }]}>
            <Text style={[styles.avatarText, { color: colors.text }]}>
              {(user?.name?.trim()?.charAt(0) || '?').toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <ThemedText type="small" numberOfLines={1} style={styles.userName}>
              {user?.name ?? 'Account'}
            </ThemedText>
            <ThemedText type="small" numberOfLines={1} style={{ color: colors.textSecondary }}>
              {user?.email ?? ''}
            </ThemedText>
          </View>
        </View>
        <Pressable onPress={() => void signOut()} style={styles.logout} hitSlop={4}>
          <Text style={[styles.logoutText, { color: colors.error }]}>Log out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: SIDEBAR_WIDTH,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  nav: {
    flex: 1,
  },
  navContent: {
    gap: Spacing.one,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.two,
    marginHorizontal: Spacing.two,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
  },
  itemLabel: {
    fontSize: 14,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontWeight: '600',
  },
  logout: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
