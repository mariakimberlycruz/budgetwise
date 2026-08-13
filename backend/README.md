# BudgetWise API

FastAPI + SQLAlchemy + Pydantic backend for BudgetWise. Runs locally with a SQLite database (no server needed for the database — it is a file).

See the [root README](../README.md) for full setup and run instructions.

## Quick start

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux

pip install -r requirements.txt
cp .env.example .env            # (Windows: copy .env.example .env)

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Interactive docs: http://localhost:8000/docs
- Health check: http://localhost:8000/api/v1/health

## Authentication

JWT-based auth with bcrypt password hashing.

| Endpoint | Method | Auth | Description |
| -------- | ------ | ---- | ----------- |
| `/api/v1/auth/register` | POST | No | Create a user (name, email, password) |
| `/api/v1/auth/login` | POST | No | Exchange email + password for an access token |
| `/api/v1/auth/me` | GET | Bearer | Get the currently logged-in user |

Register:

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"secret123"}'
```

Login (returns a JWT access token):

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret123"}'
```

Call a protected endpoint with the token:

```bash
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Environment variables (see `.env`):

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `JWT_SECRET_KEY` | (none) | Secret used to sign JWT access tokens |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token lifetime |

The `users` table is created automatically on startup (SQLAlchemy `create_all` in the app lifespan). No manual migration is required for development.

## Income management

Every income endpoint requires `Authorization: Bearer <ACCESS_TOKEN>` and is scoped to the logged-in user.

| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/api/v1/income` | GET | List income (optionally `?month=8&year=2026`), returns `items`, `total`, `count` |
| `/api/v1/income` | POST | Create income |
| `/api/v1/income/{id}` | GET | Get one income record |
| `/api/v1/income/{id}` | PUT | Update an income record |
| `/api/v1/income/{id}` | DELETE | Delete an income record |

Create income:

```bash
curl -X POST http://localhost:8000/api/v1/income \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"amount":25000,"income_type":"Salary","description":"Monthly salary","income_date":"2026-08-01"}'
```

List income for a specific month (total is computed as a decimal sum):

```bash
curl "http://localhost:8000/api/v1/income?month=8&year=2026" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Validation: `amount` must be numeric and greater than zero, `income_type` is required (max 50 chars), `income_date` must be a valid date, `description` is optional (max 500 chars). Amounts are stored as `NUMERIC(12,2)` and returned as exact decimal strings.

Authorization: a user can only read/update/delete their own records. Accessing another user's income returns `404 Not Found`.

## Expense management

Every expense endpoint requires `Authorization: Bearer <ACCESS_TOKEN>` and is scoped to the logged-in user.

| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/api/v1/expenses` | GET | List expenses with filters (month, year, category, subcategory, `q` search) |
| `/api/v1/expenses` | POST | Create an expense |
| `/api/v1/expenses/{id}` | GET | Get one expense |
| `/api/v1/expenses/{id}` | PUT | Update an expense |
| `/api/v1/expenses/{id}` | DELETE | Delete an expense |

Create expense:

```bash
curl -X POST http://localhost:8000/api/v1/expenses \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"amount":2000,"category":"Needs","subcategory":"Food","description":"Groceries","expense_date":"2026-08-10"}'
```

List with filters (returns `items`, `total`, `count`, and `category_spending` with spending vs budget per category):

```bash
curl "http://localhost:8000/api/v1/expenses?month=8&year=2026&category=Needs&q=grocery" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Validation: `amount` must be numeric and > 0, `category` must be `Needs`, `Savings`, or `Wants`, `subcategory` must belong to that category (see `app/models/category.py`), `expense_date` must be a valid date, `description` is optional (max 500 chars).

Authorization: a user can only read/update/delete their own expenses. Accessing another user's expense returns `404 Not Found`.

## Budgets

Monthly budget amounts for the three 50/30/20 categories (Needs / Savings / Wants).

| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/api/v1/budgets?month=8&year=2026` | GET | Per-category `budget`, `spending`, `remaining`, plus totals |
| `/api/v1/budgets` | PUT | Upsert a budget: `{"category", "amount", "month", "year"}` |

```bash
curl -X PUT http://localhost:8000/api/v1/budgets \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"category":"Needs","amount":15000,"month":8,"year":2026}'
```

Spending is computed from the `expenses` table, so adding/editing/deleting an expense automatically updates category spending and remaining. The `budgets` table is unique per user + category + month + year.

## Dashboard

| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/api/v1/dashboard?month=8&year=2026` | GET | Server-side month summary |

Returns `monthly_income`, `total_expenses`, `remaining_money` (income − expenses), `budgets[]` (per category `budget`, `spent`, `remaining`, `usage_percent`), and `recent_expenses[]`. All calculations live on the backend.

## Savings goals

Every savings-goal endpoint requires `Authorization: Bearer <ACCESS_TOKEN>` and is scoped to the logged-in user.

| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/api/v1/savings-goals` | GET | List goals ordered by target date |
| `/api/v1/savings-goals` | POST | Create a goal |
| `/api/v1/savings-goals/{id}` | GET | Get one goal |
| `/api/v1/savings-goals/{id}` | PUT | Update a goal |
| `/api/v1/savings-goals/{id}` | DELETE | Delete a goal |
| `/api/v1/savings-goals/{id}/contributions` | POST | Add a contribution to a goal |

Create goal:

```bash
curl -X POST http://localhost:8000/api/v1/savings-goals \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Emergency Fund","target_amount":50000,"current_amount":20000,"target_date":"2026-12-31"}'
```

Add a contribution (adds `amount` to `current_amount` and recomputes progress):

```bash
curl -X POST http://localhost:8000/api/v1/savings-goals/1/contributions \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"amount":5000}'
```

Each goal returns `target_amount`, `current_amount`, `remaining` (target − current, floored at 0), and `progress_percent` (0–100), all computed on the backend. Amounts are stored as `NUMERIC(12,2)` and returned as exact decimal strings.

Validation: `name` is required (1–120 chars), `target_amount` must be > 0, `current_amount` must be ≥ 0, `target_date` must be a valid date, and contribution `amount` must be > 0.

Authorization: a user can only read/update/delete their own goals. Accessing another user's goal returns `404 Not Found`.

## Structure

```
app/
├── api/          Routers, dependencies (routes/health.py, auth.py, income.py, expense.py, budget.py, dashboard.py, savings_goal.py, deps.py)
├── core/         Settings (config.py), security (JWT + password hashing)
├── db/           Engine, session factory, get_db dependency (session.py)
├── models/       SQLAlchemy ORM models (Base, User, Income, Expense, Budget, SavingsGoal, category.py)
├── repositories/ Data access layer (user.py, income.py, expense.py, budget.py, savings_goal.py)
├── schemas/      Pydantic request/response models
├── services/     Business logic layer (health.py, auth.py, income.py, expense.py, budget.py, dashboard.py, savings_goal.py)
└── main.py       FastAPI app, CORS, lifespan
```
