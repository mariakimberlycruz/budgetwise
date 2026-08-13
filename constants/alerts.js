/**
 * In-app budget alert metadata.
 *
 * Types map to severity levels based on budget usage:
 *   normal   -> 75% used
 *   warning  -> 90% used
 *   critical -> 100% used / above 100% (over budget)
 *   success  -> positive confirmation (e.g. savings target reached)
 */

export const ALERT_TYPES = ['normal', 'warning', 'critical', 'success'];

export const ALERT_LABELS = {
  normal: 'Notice',
  warning: 'Warning',
  critical: 'Critical',
  success: 'Success',
};

export const ALERT_ICONS = {
  normal: 'ℹ️',
  warning: '⚠️',
  critical: '⛔',
  success: '✅',
};

export const ALERT_COLORS = {
  normal: '#0EA5E9',
  warning: '#F59E0B',
  critical: '#DC2626',
  success: '#16A34A',
};

// Lower number renders first (most urgent at top).
export const ALERT_ORDER = {
  critical: 0,
  warning: 1,
  normal: 2,
  success: 3,
};
