import { validateBudgetPercentages } from '@/utils/validators';

describe('validateBudgetPercentages', () => {
  it('accepts the standard 50/30/20 split', () => {
    expect(validateBudgetPercentages({ needs: 50, savings: 30, wants: 20 })).toBeNull();
  });

  it('accepts a custom split that still totals 100', () => {
    expect(validateBudgetPercentages({ needs: 40, savings: 40, wants: 20 })).toBeNull();
  });

  it('rejects a split that does not total 100', () => {
    expect(validateBudgetPercentages({ needs: 50, savings: 30, wants: 30 })).toMatch(/100/);
  });

  it('rejects non-integer percentages', () => {
    expect(validateBudgetPercentages({ needs: 50.5, savings: 30, wants: 19.5 })).toMatch(/whole numbers/);
  });

  it('rejects NaN input (e.g. an empty form field)', () => {
    expect(validateBudgetPercentages({ needs: NaN, savings: 30, wants: 20 })).toMatch(/whole numbers/);
  });
});
