export const DEFAULT_CURRENCY = 'PHP';
export const DEFAULT_THEME = 'system';
export const DEFAULT_BUDGET_PERCENTAGES = { needs: 50, savings: 30, wants: 20 };

export const THEMES = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
];

export const CURRENCIES = [
  { code: 'PHP', symbol: '₱', label: 'Philippine Peso (₱)', locale: 'en-PH' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)', locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)', locale: 'en-IE' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen (¥)', locale: 'ja-JP' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar (C$)', locale: 'en-CA' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar (S$)', locale: 'en-SG' },
];
