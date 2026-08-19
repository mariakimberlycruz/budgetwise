# BudgetWise Mobile

React Native (Expo) + JavaScript + Expo Router client for BudgetWise. Runs on Android, iOS, and Web from one codebase (React Native Web).

See the [root README](../README.md) for full setup and run instructions.

## Quick start

```bash
npm install
npx expo start        # dev server (scan QR with Expo Go)
npm run web           # web only
npm run android       # Android emulator/device
npm run ios           # iOS simulator (macOS only)
npm test              # Jest unit tests
```

## Navigation

`components/nav/app-shell.jsx` wraps every primary screen (dashboard, income, expenses, budgets, savings, bills, reports, financial health, settings) and renders:

- **Phones** (< 768px) — a bottom tab bar (`bottom-tab-bar.jsx`) with Dashboard/Expenses/Budgets/Savings plus a "More" sheet for the rest.
- **Tablet / web / desktop** (≥ 768px) — a persistent left sidebar (`sidebar-nav.jsx`) listing every screen, with an account/logout footer.

`hooks/use-nav-layout.js` exposes the content width actually available (window width minus the sidebar, when shown), so each screen's existing responsive grid/table logic (`useNavLayout()` in place of `useWindowDimensions()`) lays out correctly instead of the sidebar eating into a `useWindowDimensions()`-based breakpoint. Icons are drawn from plain `View`s (`components/nav/nav-icon.jsx`) — no icon font/SVG dependency.

## Error handling

- **API responses** — the backend wraps every response in `{success, message, data}`; `services/api-client.js`'s response interceptor (`unwrapEnvelope`) unwraps it so every existing service call (`const { data } = await apiClient.get(...)`) keeps working unchanged.
- **User-facing messages** — `utils/errors.js`'s `getErrorMessage(error)` maps any failure to one safe sentence: a timed-out request, no network connection, an expired session (401 → also triggers global sign-out via `setUnauthorizedHandler`), no permission (403), not found (404), a validation message straight from the backend (422), or a generic message for 5xx — raw exception text/stack traces are never shown.
- **Loading / empty / error states** — each list screen shows a spinner while loading, an empty-state message (or `components/dashboard/empty-state.jsx`) when there's nothing to show, and an inline error with a **Try again** button on failure; forms disable their submit button and show a spinner while saving.

## Tests

`npm test` runs the Jest suite (`jest-expo` preset): pure business logic (`utils/__tests__/money.test.js` — including floating-point-safe currency formatting, `budget-alerts.test.js`, `validators.test.js`), the API envelope unwrapping (`services/__tests__/api-client.test.js`), authentication state transitions (`context/__tests__/AuthContext.test.jsx`), and one core component with real logic (`components/dashboard/__tests__/progress-bar.test.jsx`). Trivial presentational components are intentionally not covered.

## Authentication

The app ships with registration, login, logout, and persistent sessions:

- **Token storage** — JWT access token is stored with `expo-secure-store` on Android/iOS and `localStorage` on web (`utils/token-storage.js`).
- **API client** — `axios` instance that automatically attaches the bearer token and clears the session on `401` (`services/api-client.js`).
- **Session state** — `context/AuthContext.jsx` restores the session on launch, exposes `signIn`, `signUp`, `signOut`, `user`, and `isAuthenticated`.
- **Route protection** — `Stack.Protected` in `app/_layout.jsx` guards the `(app)` group (authenticated) and the `(auth)` group (logged out).

### Routes

| Route | Access | Screen |
| ----- | ------ | ------ |
| `/login` | Public | Sign in |
| `/register` | Public | Create account |
| `/` (dashboard) | Authenticated only | Month dashboard: income, expenses, budgets, remaining, recent expenses |
| `/income` | Authenticated only | Income list, month filter, monthly total |
| `/income-form` | Authenticated only | Add / edit income (modal) |
| `/expenses` | Authenticated only | Expense list, search, category/subcategory filters, monthly total |
| `/expense-form` | Authenticated only | Add / edit expense (modal) |
| `/budgets` | Authenticated only | Set monthly budgets for Needs / Savings / Wants |
| `/savings` | Authenticated only | Savings goals with progress bars |
| `/savings-goal-form` | Authenticated only | Create / edit a goal (modal) |
| `/savings-contribution` | Authenticated only | Add a contribution to a goal (modal) |
| `/settings` | Authenticated only | Profile (name, email) + preferences (currency, budget %, theme) + logout |

## Dashboard

The home screen combines income, budgets, and expenses for the selected month, all calculated on the backend (`GET /api/v1/dashboard?month=&year=`):

- **Summary cards** — Monthly Income, Total Expenses, Remaining Money.
- **Budget cards** — Needs / Savings / Wants with `spent / budget`, remaining, and usage % (progress bar); tap **Edit** to set amounts.
- **Recent Expenses** — latest records, tap to edit.
- **Monthly selector** — `‹ August 2026 ›` recomputes everything for that month.
- **Responsive** — single-column cards on phones; multi-column grid on wider screens/web.

## Income

Authenticated users can record and manage income (Salary, Freelance, Business, Allowance, Bonus, Commission, Other).

- View income grouped by month with a monthly total (Philippine Peso, `₱`).
- Add, edit, and delete income records with a delete confirmation.
- Month navigation (`‹ August 2026 ›`) filters the list client-side via `?month=&year=` query params.
- Loading, empty, and error states with retry.
- Amounts are decimal strings from the API; display uses `Intl.NumberFormat('en-PH')`.

## Expenses

Authenticated users can record and manage expenses across the 50/30/20 buckets.

- **Categories** — Needs (Rent, Electricity, Water, Internet, Food, Transportation, Medical, Insurance, Other), Savings (Emergency Fund, Bank Savings, Investment, Retirement, Other), Wants (Shopping, Entertainment, Gaming, Restaurant, Travel, Movies, Hobbies, Other).
- Add / edit / delete with confirmation (floating action button on Android/iOS; an add button on web).
- **Search** the description/category (`q` param), **filter** by category and subcategory, and switch **month**.
- **Total spending** for the current filters and a per-category **spending vs budget** summary.
- On desktop-width windows the list switches to a table layout; on narrow screens it uses cards.

## Budgets

Set a monthly budget amount for each of Needs / Savings / Wants. The screen shows current spending, usage %, and remaining for the selected month; spending is computed automatically from expenses.

## Savings Goals

Authenticated users can create savings goals and track progress toward them.

- Each goal has a **name**, **target amount**, **current amount**, and **target date**.
- Cards show **Current**, **Target**, **Remaining**, **Progress %**, a progress bar, and the target date — remaining and percentage are computed on the backend.
- **Contribute** adds an amount to the goal's current balance; **Edit** updates the goal; **Delete** removes it with a confirmation.
- Responsive card **grid** — 1 column on phones, multi-column on tablets/web. Floating action button on Android/iOS, an "Add goal" button on web.
- Loading, empty, and error states with retry.

## Profile & Settings

Authenticated users manage their profile and app preferences on the **Settings** screen (dashboard pill):

- **Profile** — edit and save your name and email (`PUT /api/v1/auth/me`); a duplicate email returns a friendly error.
- **Currency** — choose the display currency (default **Philippine Peso ₱**); the active currency is applied app-wide via `SettingsContext` → `configureMoney` (`utils/money.js`).
- **Default budget percentages** — Needs / Savings / Wants defaults of 50 / 30 / 20; the form and the API reject values that don't add up to 100%.
- **Theme** — **Light**, **Dark**, or **System**; saved per user on the backend and applied instantly (`app/_layout.jsx` `ThemeProvider` + `useColorScheme`).
- **Logout** — clears the token and returns to the login screen.
- **Responsive** — single-column (stacked) sections on Android/iOS; the two cards sit side by side on wide/web layouts (`useWindowDimensions` ≥ 900px).

## Reusable dashboard components

`components/dashboard/` provides the shared building blocks: `SummaryCard`, `BudgetCard`, `ProgressBar`, `RecentExpenseCard`, `MonthlySelector`, and `EmptyState`.

## Environment

Copy `.env.example` to `.env` and adjust if needed:

```bash
EXPO_PUBLIC_API_PORT=8000
# EXPO_PUBLIC_API_URL=http://192.168.1.50:8000  # set for physical devices
```

`EXPO_PUBLIC_API_URL` is optional. When empty, the app auto-detects the backend host:

| Target             | Resolved base URL          |
| ------------------ | -------------------------- |
| Android emulator   | `http://10.0.2.2:8000`     |
| iOS simulator      | `http://localhost:8000`    |
| Web                | `http://localhost:8000`    |
| Physical device    | `http://<LAN IP>:8000` (from Expo host) |

## Structure

```
app/          Expo Router routes (login, register, dashboard, income, expenses, budgets, savings, settings)
components/   Reusable UI components (+ components/dashboard/ shared widgets)
constants/    Theme, spacing, income + expense categories, settings (currencies, themes, defaults)
context/      React context (AuthContext, AppContext/API status, SettingsContext)
hooks/        Custom hooks (color scheme, theme)
services/     API client (axios), auth/health/income/expense/budget/dashboard/savings/settings services
types/        Shared JSDoc type definitions
utils/        Platform-aware helpers (API base URL, token storage, errors, money, dates, confirm)
```

No API URLs are hardcoded in components; the base URL comes from `utils/api-config.js` (`API_BASE_URL`).
