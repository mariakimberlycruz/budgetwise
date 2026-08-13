/**
 * Shared API shapes (documentation only — JavaScript is untyped at runtime).
 */

/**
 * @typedef {Object} HealthResponse
 * @property {'ok'} status
 * @property {string} service
 * @property {string} version
 * @property {string} environment
 * @property {'connected' | 'error'} database
 * @property {string} timestamp
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} name
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} access_token
 * @property {string} token_type
 */

/**
 * @typedef {Object} IncomeItem
 * @property {number} id
 * @property {number} user_id
 * @property {string} amount
 * @property {string} income_type
 * @property {string | null} description
 * @property {string} income_date
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} IncomeListResponse
 * @property {IncomeItem[]} items
 * @property {string} total
 * @property {number} count
 * @property {number | null} month
 * @property {number | null} year
 */

/**
 * @typedef {Object} ExpenseItem
 * @property {number} id
 * @property {number} user_id
 * @property {string} amount
 * @property {'Needs' | 'Savings' | 'Wants'} category
 * @property {string} subcategory
 * @property {string | null} description
 * @property {string} expense_date
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} CategorySpending
 * @property {'Needs' | 'Savings' | 'Wants'} category
 * @property {string} spending
 * @property {string | null} budget
 * @property {string | null} remaining
 */

/**
 * @typedef {Object} ExpenseListResponse
 * @property {ExpenseItem[]} items
 * @property {string} total
 * @property {number} count
 * @property {number | null} month
 * @property {number | null} year
 * @property {string | null} category
 * @property {string | null} subcategory
 * @property {string | null} q
 * @property {CategorySpending[]} category_spending
 */

/**
 * @typedef {Object} BudgetSummaryItem
 * @property {'Needs' | 'Savings' | 'Wants'} category
 * @property {string} budget
 * @property {string} spending
 * @property {string} remaining
 */

/**
 * @typedef {Object} BudgetSummaryResponse
 * @property {number} month
 * @property {number} year
 * @property {string} total_budget
 * @property {string} total_spending
 * @property {string} total_remaining
 * @property {BudgetSummaryItem[]} items
 */

/**
 * @typedef {Object} DashboardBudget
 * @property {'Needs' | 'Savings' | 'Wants'} category
 * @property {string} budget
 * @property {string} spent
 * @property {string} remaining
 * @property {number} usage_percent
 */

/**
 * @typedef {Object} DashboardRecentExpense
 * @property {number} id
 * @property {string} amount
 * @property {'Needs' | 'Savings' | 'Wants'} category
 * @property {string} subcategory
 * @property {string | null} description
 * @property {string} expense_date
 */

/**
 * @typedef {Object} DashboardResponse
 * @property {number} month
 * @property {number} year
 * @property {string} monthly_income
 * @property {string} total_expenses
 * @property {string} remaining_money
 * @property {DashboardBudget[]} budgets
 * @property {DashboardRecentExpense[]} recent_expenses
 */

/**
 * @typedef {Object} SavingsGoal
 * @property {number} id
 * @property {number} user_id
 * @property {string} name
 * @property {string} target_amount
 * @property {string} current_amount
 * @property {string} remaining
 * @property {number} progress_percent
 * @property {string} target_date
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} SavingsGoalListResponse
 * @property {SavingsGoal[]} items
 * @property {number} count
 */

/**
 * @typedef {Object} RecurringExpense
 * @property {number} id
 * @property {number} user_id
 * @property {string} name
 * @property {string} amount
 * @property {'Needs' | 'Savings' | 'Wants'} category
 * @property {'monthly' | 'weekly' | 'yearly'} frequency
 * @property {number} due_day
 * @property {string} start_date
 * @property {string | null} end_date
 * @property {boolean} active
 * @property {string | null} next_due_date
 * @property {boolean} overdue
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} RecurringExpenseListResponse
 * @property {RecurringExpense[]} items
 * @property {number} count
 * @property {number} overdue_count
 * @property {number} upcoming_count
 */

export {};
