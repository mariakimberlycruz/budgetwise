"""Expense categories.

Expenses are split into the three 50/30/20 budget categories, each with a
fixed set of subcategories.
"""

BUDGET_CATEGORIES: tuple[str, ...] = ("Needs", "Savings", "Wants")

RECURRING_FREQUENCIES: tuple[str, ...] = ("monthly", "weekly", "yearly")

EXPENSE_CATEGORIES: dict[str, list[str]] = {
    "Needs": [
        "Rent",
        "Electricity",
        "Water",
        "Internet",
        "Food",
        "Transportation",
        "Medical",
        "Insurance",
        "Other",
    ],
    "Savings": [
        "Emergency Fund",
        "Bank Savings",
        "Investment",
        "Retirement",
        "Other",
    ],
    "Wants": [
        "Shopping",
        "Entertainment",
        "Gaming",
        "Restaurant",
        "Travel",
        "Movies",
        "Hobbies",
        "Other",
    ],
}
