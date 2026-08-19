// Single source of truth for the primary app destinations, shared by the
// bottom tab bar (phones) and the sidebar (tablet/web/desktop).
export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', route: '/', icon: 'home' },
  { key: 'income', label: 'Income', route: '/income', icon: 'income' },
  { key: 'expenses', label: 'Expenses', route: '/expenses', icon: 'expenses' },
  { key: 'budgets', label: 'Budgets', route: '/budgets', icon: 'budgets' },
  { key: 'savings', label: 'Savings', route: '/savings', icon: 'savings' },
  { key: 'bills', label: 'Bills', route: '/bills', icon: 'bills' },
  { key: 'reports', label: 'Reports', route: '/reports', icon: 'reports' },
  { key: 'health', label: 'Health', route: '/financial-health', icon: 'health' },
  { key: 'settings', label: 'Settings', route: '/settings', icon: 'settings' },
];

// A phone bottom bar only has room for ~5 touch-friendly targets, so the
// remaining destinations live behind the "More" sheet.
export const PRIMARY_TAB_KEYS = ['dashboard', 'expenses', 'budgets', 'savings'];
export const MORE_ITEM_KEYS = ['income', 'bills', 'reports', 'health', 'settings'];

export const NAV_ITEMS_BY_KEY = Object.fromEntries(NAV_ITEMS.map((item) => [item.key, item]));
