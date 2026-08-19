import { createContext, useContext } from 'react';

// Provided by AppShell so any screen can lay out grids/columns against the
// width actually available for content (i.e. window width minus the
// sidebar, when the sidebar is shown) instead of the raw window width.
export const NavLayoutContext = createContext({
  width: 0,
  fullWidth: 0,
  isSidebar: false,
});

export function useNavLayout() {
  return useContext(NavLayoutContext);
}
