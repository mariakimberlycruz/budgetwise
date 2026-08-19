import { configureMoney, formatMoney } from '@/utils/money';

describe('formatMoney', () => {
  afterEach(() => {
    configureMoney({ code: 'PHP' });
  });

  it('formats a plain number in the default PHP currency', () => {
    expect(formatMoney(1234.5)).toBe('₱1,234.50');
  });

  it('formats a string amount (as returned by the API) correctly', () => {
    expect(formatMoney('1000.00')).toBe('₱1,000.00');
  });

  it('does not lose cents to floating point rounding', () => {
    // 0.1 + 0.2 famously != 0.3 in floating point; formatMoney must still
    // render exactly two decimal places rather than a long float tail.
    expect(formatMoney(0.1 + 0.2)).toBe('₱0.30');
    expect(formatMoney(19.9 + 0.1)).toBe('₱20.00');
  });

  it('treats null/undefined/NaN as zero instead of crashing or showing NaN', () => {
    expect(formatMoney(null)).toBe('₱0.00');
    expect(formatMoney(undefined)).toBe('₱0.00');
    expect(formatMoney('not-a-number')).toBe('₱0.00');
  });

  it('formats negative amounts', () => {
    expect(formatMoney(-50)).toBe('-₱50.00');
  });

  it('switches currency when configureMoney is called (e.g. from SettingsContext)', () => {
    configureMoney({ code: 'USD' });
    expect(formatMoney(10)).toBe('$10.00');
  });
});
