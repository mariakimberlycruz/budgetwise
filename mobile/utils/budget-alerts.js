import { formatMoney } from '@/utils/money';

/**
 * Percentage of a budget already used (0-100+).
 */
export function budgetUsagePercent(budget, spending) {
  const b = Number(budget) || 0;
  const s = Number(spending) || 0;
  if (b <= 0) {
    return 0;
  }
  return (s / b) * 100;
}

/**
 * Build in-app alerts from a budget summary's `items`.
 *
 * items: [{ category, budget, spending, remaining }]
 *
 * Alert rules:
 *   75% used                       -> normal warning
 *   90% used                       -> high warning
 *   100% used                      -> critical
 *   above 100%                     -> over budget (critical)
 *   Savings target reached (>=100%) -> success
 */
export function buildBudgetAlerts(items = []) {
  const alerts = [];
  for (const item of items) {
    const budget = Number(item.budget) || 0;
    const spending = Number(item.spending) || 0;
    if (budget <= 0 || spending <= 0) {
      continue;
    }
    const usage = (spending / budget) * 100;
    const rounded = Math.round(usage);
    const category = item.category;

    if (category === 'Savings') {
      if (usage >= 100) {
        alerts.push({
          id: `savings-${category}`,
          type: 'success',
          title: 'Savings target reached',
          message: 'You reached your savings target.',
        });
      }
      continue;
    }

    if (usage > 100) {
      alerts.push({
        id: `over-${category}`,
        type: 'critical',
        title: 'Over budget',
        message: `You exceeded your ${category} budget by ${formatMoney(spending - budget)}.`,
      });
    } else if (usage >= 100) {
      alerts.push({
        id: `critical-${category}`,
        type: 'critical',
        title: 'Budget reached',
        message: `You reached your ${category} budget.`,
      });
    } else if (usage >= 90) {
      alerts.push({
        id: `warning-${category}`,
        type: 'warning',
        title: 'High budget usage',
        message: `You have used ${rounded}% of your ${category} budget.`,
      });
    } else if (usage >= 75) {
      alerts.push({
        id: `normal-${category}`,
        type: 'normal',
        title: 'Budget usage',
        message: `You have used ${rounded}% of your ${category} budget.`,
      });
    }
  }
  return alerts;
}
