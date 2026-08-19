/**
 * Validates a Needs/Savings/Wants budget split. Mirrors the backend's rule
 * (SettingsUpdate in app/schemas/settings.py): each must be a whole number
 * and the three must add up to exactly 100.
 *
 * Returns an error message string, or null when the split is valid.
 */
export function validateBudgetPercentages({ needs, savings, wants }) {
  if (!Number.isInteger(needs) || !Number.isInteger(savings) || !Number.isInteger(wants)) {
    return 'Budget percentages must be whole numbers.';
  }
  if (needs + savings + wants !== 100) {
    return 'Budget percentages must add up to 100%.';
  }
  return null;
}
