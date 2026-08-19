# BudgetWise

Personal budgeting application — a single React Native codebase (Expo + React Native Web) targeting **Android, iOS, and Web**, backed by a local **FastAPI + SQLAlchemy** REST API.

> **Current status:** authentication (registration, login, logout, JWT sessions, protected routes), income management, expense management (search + category/subcategory/month filters), monthly 50/30/20 budgets, a month-focused **dashboard**, **savings goals** (targets, contributions, progress tracking), recurring bills, reports, financial health, and **profile & settings** (editable profile, currency, default budget percentages, Light/Dark/System theme, logout) are implemented. A responsive nav shell (bottom tabs on phones, a sidebar from tablet width up) covers every primary screen. Every API response — success or error — uses a consistent `{success, message, data}` envelope with proper 400/401/403/404/409/422/500 status codes, and the frontend maps every failure (network, timeout, unauthorized, validation, server) to a safe, user-facing message. Everything is per-user and combined on the dashboard. Backend (pytest) and frontend (Jest) test suites cover the core business rules.

---

## Tech stack

**Frontend (`mobile/`)**
- React Native + Expo (SDK 57)
- JavaScript (JSX), no TypeScript
- Expo Router (file-based navigation)
- React Native Web (one codebase for Android / iOS / Web)

**Backend (`backend/`)**
- FastAPI
- SQLAlchemy 2 (ORM)
- Pydantic / pydantic-settings
- JWT access tokens (`PyJWT`)
- Password hashing with bcrypt (`pwdlib`)
- SQLite local database (development)

---

## Folder structure

```
budgetwise/
├── mobile/                      # Expo / React Native app
│   ├── app/                     # Expo Router routes (_layout.jsx, (auth)/, (app)/)
│   ├── components/              # Reusable UI components (+ components/dashboard/)
│   ├── constants/               # Theme, spacing, income + expense categories
│   ├── context/                 # React context (AuthContext, AppContext/API status, SettingsContext)
│   ├── hooks/                   # Custom hooks (color scheme, theme)
│   ├── services/                # Axios API client + auth/health/income/expense/budget/dashboard/savings/settings services
│   ├── types/                   # Shared JSDoc type definitions
│   ├── utils/                   # API base URL, token storage, error helpers, money/date/confirm utils
│   ├── assets/                  # Icons, splash, images
│   ├── package.json
│   └── app.json
│
└── backend/                     # FastAPI backend
    ├── app/
    │   ├── api/                 # Routers (routes/health.py, auth.py, income.py, expense.py, budget.py, dashboard.py, savings_goal.py, settings.py), deps.py
    │   ├── core/                # Settings (config.py), security (JWT + hashing)
    │   ├── db/                  # Engine, session (session.py)
    │   ├── models/              # SQLAlchemy ORM models (Base, User, Income, Expense, Budget, SavingsGoal, UserSettings, category.py)
    │   ├── repositories/        # Data access layer (user.py, income.py, expense.py, budget.py, savings_goal.py, settings.py)
    │   ├── schemas/             # Pydantic schemas
    │   ├── services/            # Business logic layer (auth.py, income.py, expense.py, budget.py, dashboard.py, savings_goal.py, settings.py)
    │   └── main.py              # FastAPI app, CORS, lifespan
    ├── requirements.txt
    ├── .env
    └── README.md
```

---

## Prerequisites

| Tool | Version | Check |
| ---- | ------- | ----- |
| Node.js | 18+ (LTS recommended) | `node --version` |
| npm | 9+ | `npm --version` |
| Python | 3.13+ | `python --version` |
| Expo Go | latest | install on your device from the app store |

No separate database server is required — SQLite is file-based.

---

## 1. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows (PowerShell: .venv\Scripts\Activate.ps1)
# source .venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Create local environment config
cp .env.example .env            # Windows (cmd): copy .env.example .env

# Start the API (auto-reload enabled for development)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The SQLite file `budgetwise.db` is created automatically on first start (tables are created in the app lifespan).

### Verify the backend

- Health check: `http://localhost:8000/api/v1/health`
  - Expected: `{"status":"ok","service":"BudgetWise API","version":"0.1.0","environment":"development","database":"connected",...}`
- Interactive API docs (Swagger UI): `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### Backend `.env` example

```
APP_NAME=BudgetWise API
APP_VERSION=0.1.0
ENVIRONMENT=development
DATABASE_URL=sqlite:///./budgetwise.db
CORS_ORIGINS=*
API_V1_PREFIX=/api/v1
```

`CORS_ORIGINS` is a comma-separated list of allowed origins, or `*` for all. For development use `*`; for a stricter setup use the Expo web dev ports, e.g. `http://localhost:8081`.

### Authentication

The API exposes JWT-based auth:

- `POST /api/v1/auth/register` — body: `{"name", "email", "password"}`
- `POST /api/v1/auth/login` — body: `{"email", "password"}` → returns `{"access_token", "token_type"}`
- `GET /api/v1/auth/me` — requires `Authorization: Bearer <token>`

The `users` table (id, name, email, password_hash, created_at, updated_at) is created automatically on startup. Passwords are hashed with bcrypt; tokens are signed HS256 JWTs.

### Income

Authenticated income records, scoped to the logged-in user (`Authorization: Bearer <token>` required):

- `POST /api/v1/income` — body: `{"amount", "income_type", "income_date", "description"?}`
- `GET /api/v1/income?month=8&year=2026` — monthly list; returns `items`, `total`, `count`
- `GET /api/v1/income/{id}` — one record (404 if it belongs to another user)
- `PUT /api/v1/income/{id}` — update
- `DELETE /api/v1/income/{id}` — delete

`amount` must be greater than zero and is stored as `NUMERIC(12,2)` (returned as an exact decimal string). The `income` table (user_id FK, amount, income_type, description, income_date, created_at, updated_at) is created automatically on startup.

### Expenses

Authenticated expense records, scoped to the logged-in user:

- `POST /api/v1/expenses` — body: `{"amount", "category", "subcategory", "expense_date", "description"?}`
- `GET /api/v1/expenses?month=8&year=2026&category=Needs&subcategory=Food&q=grocery` — filters month, year, category, subcategory, and text search `q`; returns `items`, `total`, `count`, and `category_spending` (per-category spending vs budget)
- `GET /api/v1/expenses/{id}` — one record (404 if it belongs to another user)
- `PUT /api/v1/expenses/{id}` — update
- `DELETE /api/v1/expenses/{id}` — delete

Expense categories are the 50/30/20 buckets — **Needs** (Rent, Electricity, Water, Internet, Food, Transportation, Medical, Insurance, Other), **Savings** (Emergency Fund, Bank Savings, Investment, Retirement, Other), **Wants** (Shopping, Entertainment, Gaming, Restaurant, Travel, Movies, Hobbies, Other). `amount` must be > 0; `category` must be one of the three buckets; `subcategory` must belong to the selected category. The `expenses` table is created automatically on startup.

### Budgets

Monthly budget amounts per 50/30/20 category (Needs / Savings / Wants):

- `GET /api/v1/budgets?month=8&year=2026` — returns per-category `budget`, `spending`, `remaining`, plus totals
- `PUT /api/v1/budgets` — body: `{"category", "amount", "month", "year"}` (upsert)

Spending is computed from the `expenses` table, so recording/editing/deleting an expense automatically updates category spending and remaining. The `budgets` table (unique per user + category + month + year) is created automatically on startup.

### Dashboard

- `GET /api/v1/dashboard?month=8&year=2026` — server-side calculation combining the selected month:
  - `monthly_income` (sum of income), `total_expenses`, `remaining_money` (income − expenses)
  - `budgets[]` — per category: `budget`, `spent`, `remaining`, `usage_percent`
  - `recent_expenses[]` — the user's most recent expenses

All dashboard calculations are done on the backend; the frontend only formats and displays them.

### Savings goals

Authenticated savings goals, scoped to the logged-in user:

- `POST /api/v1/savings-goals` — body: `{"name", "target_amount", "current_amount"?=0, "target_date"}`
- `GET /api/v1/savings-goals` — all goals ordered by target date; each returns `target_amount`, `current_amount`, `remaining`, and `progress_percent`
- `GET /api/v1/savings-goals/{id}` — one goal (404 if it belongs to another user)
- `PUT /api/v1/savings-goals/{id}` — update
- `DELETE /api/v1/savings-goals/{id}` — delete
- `POST /api/v1/savings-goals/{id}/contributions` — body: `{"amount"}`; adds to `current_amount` and recomputes remaining/progress

`name` is required (1–120 chars), `target_amount` must be > 0, `current_amount` must be ≥ 0, `target_date` must be a valid date, and contribution `amount` must be > 0. `remaining` and `progress_percent` are computed on the backend. The `savings_goals` table is created automatically on startup.

### Profile & settings

Authenticated profile and per-user settings:

- `GET /api/v1/auth/me` — the logged-in user's `name` and `email` (already covered under Authentication)
- `PUT /api/v1/auth/me` — body: `{"name"?, "email"?}`; updates the profile. Changing to an email already used by another account returns `409 Conflict`
- `GET /api/v1/settings` — returns `currency`, `budget_needs`, `budget_savings`, `budget_wants`, `theme` (creates defaults on first access)
- `PUT /api/v1/settings` — body: `{"currency", "budget_needs", "budget_savings", "budget_wants", "theme"}`

Defaults: currency `PHP` (Philippine Peso), budget percentages `50 / 30 / 20` (Needs / Savings / Wants), theme `system`. The budget percentages must add up to **100** (each 0–100) and `theme` must be one of `light`, `dark`, or `system` — otherwise the API returns `422`. The `user_settings` table (one row per user, unique on `user_id`) is created automatically on startup.

---

## 2. Mobile setup

```bash
cd mobile

# Install dependencies
npm install

# Start the Expo dev server
npx expo start
```

### Run on each platform

```bash
npm run web       # Web (opens http://localhost:8081)
npm run android   # Android emulator (or scan QR with Expo Go)
npm run ios       # iOS simulator — macOS only (or scan QR with Expo Go)
```

- **Expo Go (recommended for quick testing):** install Expo Go, scan the QR code shown by `npx expo start`.
- **Emulator:** press `a` in the terminal to open on the Android emulator (with Expo Go installed) or `w` for web.
- **iOS:** requires macOS (Xcode + iOS Simulator).

### Mobile `.env` example

```
EXPO_PUBLIC_API_PORT=8000
# EXPO_PUBLIC_API_URL=http://192.168.1.50:8000   # set only if auto-detection fails
```

---

## 3. How `API_BASE_URL` is resolved

`localhost` does **not** mean the same machine on a physical phone, so the app resolves the backend address automatically in `mobile/utils/api-config.js`:

| Priority | Source | Example |
| -------- | ------ | ------- |
| 1 | `EXPO_PUBLIC_API_URL` env var | `http://192.168.1.50:8000` |
| 2 | Expo dev server host (from `Constants.expoConfig.hostUri`) | `http://192.168.1.50:8000` on a phone |
| 3 | Platform fallback | Android emulator → `http://10.0.2.2:8000`, otherwise → `http://localhost:8000` |

Port comes from `EXPO_PUBLIC_API_PORT` (default `8000`).

> **Physical device:** the phone and computer must be on the same network, and the backend must be started with `--host 0.0.0.0` (as above) so it is reachable over the LAN. If auto-detection fails, set `EXPO_PUBLIC_API_URL` explicitly.

---

## 4. Verifying everything end to end

1. Start the backend → see **Section 1** and confirm `http://localhost:8000/api/v1/health` returns `"status":"ok"`.
2. Start the mobile app → see **Section 2**.
3. The app opens the **Sign in** screen (unauthenticated users are redirected there).
4. Create an account via **Create account**, or use the API examples above.
5. After signing in you land on the **Dashboard** for the current month:
   - **Monthly Income**, **Total Expenses**, and **Remaining Money** summary cards.
   - **Budgets** cards for Needs / Savings / Wants showing `spent / budget`, remaining, and usage % with progress bars (tap **Edit** to set monthly budget amounts).
   - **Recent Expenses** list (tap an entry to edit it; **View all** opens the Expenses screen).
   - Month navigation (`‹ August 2026 ›`) recomputes the whole dashboard for that month.
6. Use the **Income**, **Expenses**, and **Budgets** pills to add records; **Savings** opens your savings goals (create a goal, then use **Contribute** to track progress). Returning to the dashboard refreshes the numbers.
7. Tap **Settings** (dashboard pill) to open the Profile & Settings screen:
   - **Profile** — edit your name and email, then **Save profile**.
   - **Preferences** — pick the **Currency** (default Philippine Peso ₱), set **Default budget** percentages (must add up to 100%), and choose a **Theme** (Light / Dark / System), then **Save settings**. The theme and currency apply app-wide immediately.
   - **Log out** — clears the session and returns to the login screen.
8. Press **Sign out** — you return to the login screen, and the session token is cleared.
9. If the dashboard shows an error:
   - Confirm uvicorn is running (`--host 0.0.0.0`).
   - Confirm the resolved base URL is correct for your target.
   - On a physical device, confirm both devices share a network and the firewall allows port 8000.
   - Otherwise set `EXPO_PUBLIC_API_URL` in `mobile/.env`.

### Useful commands

| Command | Purpose |
| ------- | ------- |
| `cd mobile && npm run web` | Run web app |
| `cd mobile && npm run android` | Run Android app |
| `cd mobile && npm run ios` | Run iOS app (macOS only) |
| `cd mobile && npm run lint` | ESLint |
| `cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` | Run API |
| `curl http://localhost:8000/api/v1/health` | Health check |
| `curl "http://localhost:8000/api/v1/dashboard?month=8&year=2026" -H "Authorization: Bearer <token>"` | Dashboard calculation |
