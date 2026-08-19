import { buildBudgetAlerts, budgetUsagePercent } from '@/utils/budget-alerts';

describe('budgetUsagePercent', () => {
  it('computes percent used', () => {
    expect(budgetUsagePercent(200, 50)).toBe(25);
  });

  it('returns 0 when budget is zero or negative (avoids divide-by-zero)', () => {
    expect(budgetUsagePercent(0, 50)).toBe(0);
    expect(budgetUsagePercent(-10, 50)).toBe(0);
  });
});

describe('buildBudgetAlerts', () => {
  it('produces no alert below the 75% threshold', () => {
    const alerts = buildBudgetAlerts([{ category: 'Needs', budget: 1000, spending: 700 }]);
    expect(alerts).toHaveLength(0);
  });

  it('flags a normal warning at 75%-89%', () => {
    const alerts = buildBudgetAlerts([{ category: 'Needs', budget: 1000, spending: 800 }]);
    expect(alerts).toEqual([
      expect.objectContaining({ type: 'normal', id: 'normal-Needs' }),
    ]);
  });

  it('flags a high-usage warning at 90%-99%', () => {
    const alerts = buildBudgetAlerts([{ category: 'Wants', budget: 1000, spending: 950 }]);
    expect(alerts[0]).toMatchObject({ type: 'warning', id: 'warning-Wants' });
  });

  it('flags critical exactly at 100%', () => {
    const alerts = buildBudgetAlerts([{ category: 'Needs', budget: 500, spending: 500 }]);
    expect(alerts[0]).toMatchObject({ type: 'critical', id: 'critical-Needs' });
  });

  it('flags over-budget above 100% and includes the overage amount', () => {
    const alerts = buildBudgetAlerts([{ category: 'Wants', budget: 100, spending: 150 }]);
    expect(alerts[0]).toMatchObject({ type: 'critical', id: 'over-Wants' });
    expect(alerts[0].message).toContain('₱50.00');
  });

  it('treats Savings differently: success only once the target is reached', () => {
    const under = buildBudgetAlerts([{ category: 'Savings', budget: 1000, spending: 500 }]);
    expect(under).toHaveLength(0);

    const reached = buildBudgetAlerts([{ category: 'Savings', budget: 1000, spending: 1000 }]);
    expect(reached[0]).toMatchObject({ type: 'success', id: 'savings-Savings' });
  });

  it('ignores categories with no budget or no spending', () => {
    const alerts = buildBudgetAlerts([
      { category: 'Needs', budget: 0, spending: 0 },
      { category: 'Wants', budget: 500, spending: 0 },
    ]);
    expect(alerts).toHaveLength(0);
  });

  it('defaults to an empty list when no items are given', () => {
    expect(buildBudgetAlerts()).toEqual([]);
  });
});
