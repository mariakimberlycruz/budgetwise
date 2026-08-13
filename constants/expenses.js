export const EXPENSE_CATEGORIES = {
  Needs: [
    'Rent',
    'Electricity',
    'Water',
    'Internet',
    'Food',
    'Transportation',
    'Medical',
    'Insurance',
    'Other',
  ],
  Savings: ['Emergency Fund', 'Bank Savings', 'Investment', 'Retirement', 'Other'],
  Wants: [
    'Shopping',
    'Entertainment',
    'Gaming',
    'Restaurant',
    'Travel',
    'Movies',
    'Hobbies',
    'Other',
  ],
};

export const BUDGET_CATEGORIES = ['Needs', 'Savings', 'Wants'];

export const CATEGORY_COLORS = {
  Needs: '#0EA5E9',
  Savings: '#16A34A',
  Wants: '#F59E0B',
};

export function subcategoriesFor(category) {
  return EXPENSE_CATEGORIES[category] ?? [];
}
