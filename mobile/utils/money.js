import { CURRENCIES } from '@/constants/settings';

let active = { code: 'PHP', symbol: '₱', locale: 'en-PH' };

/**
 * Set the active currency used by formatMoney app-wide.
 * Called by SettingsContext so the whole app formats in the chosen currency.
 */
export function configureMoney({ code = 'PHP', symbol, locale } = {}) {
  const known = CURRENCIES.find((c) => c.code === code);
  active = {
    code,
    symbol: symbol ?? known?.symbol ?? code,
    locale: locale ?? known?.locale ?? 'en-PH',
  };
}

export function formatMoney(value) {
  const amount = Number(value);
  const safe = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(active.locale, { style: 'currency', currency: active.code }).format(safe);
  } catch {
    return `${active.symbol}${safe.toFixed(2)}`;
  }
}

