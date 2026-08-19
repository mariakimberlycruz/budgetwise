import { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { BottomTabBar } from '@/components/nav/bottom-tab-bar';
import { SidebarNav, SIDEBAR_WIDTH } from '@/components/nav/sidebar-nav';
import { Breakpoints } from '@/constants/theme';
import { NavLayoutContext } from '@/hooks/use-nav-layout';

// Persistent navigation chrome shared by every primary screen: a bottom tab
// bar on phones, a sidebar from tablet width up. Screens keep their own
// SafeAreaView/ScrollView/business logic untouched — this only wraps the
// existing screen output and exposes the resulting content width via
// useNavLayout() so grids/tables can respond to the space actually left
// over once the sidebar is accounted for.
export function AppShell({ children }) {
  const { width } = useWindowDimensions();
  const isSidebar = width >= Breakpoints.tablet;

  const layout = useMemo(
    () => ({
      width: isSidebar ? width - SIDEBAR_WIDTH : width,
      fullWidth: width,
      isSidebar,
    }),
    [width, isSidebar],
  );

  return (
    <NavLayoutContext.Provider value={layout}>
      {isSidebar ? (
        <View style={styles.rowRoot}>
          <SidebarNav />
          <View style={styles.content}>{children}</View>
        </View>
      ) : (
        <View style={styles.columnRoot}>
          <View style={styles.content}>{children}</View>
          <BottomTabBar />
        </View>
      )}
    </NavLayoutContext.Provider>
  );
}

const styles = StyleSheet.create({
  rowRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  columnRoot: {
    flex: 1,
    flexDirection: 'column',
  },
  content: {
    flex: 1,
  },
});
