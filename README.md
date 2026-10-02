# Home Manager

<p align="center">
  A cross-platform household management app — groceries, expenses, bills, tasks, reminders, and shared notes — built with Expo, React Native, and TypeScript.
</p>

<p align="center">
  <a href="https://github.com/ShovonScripts/Home-Manager"><img alt="Expo" src="https://img.shields.io/badge/Expo-SDK%2057-000020.svg" /></a>
  <a href="https://github.com/ShovonScripts/Home-Manager"><img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.86.3-20232A.svg" /></a>
  <a href="https://github.com/ShovonScripts/Home-Manager"><img alt="React" src="https://img.shields.io/badge/React-19.2.3-087ea4.svg" /></a>
  <a href="https://github.com/ShovonScripts/Home-Manager"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6.svg" /></a>
  <a href="https://github.com/ShovonScripts/Home-Manager"><img alt="SQLite" src="https://img.shields.io/badge/SQLite-expo--sqlite-003b57.svg" /></a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#screens">Screens</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#testing">Testing</a> •
  <a href="#building">Building</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#license">License</a>
</p>

---

## About

**Home Manager** is an offline-first household operations app. Everything a family
tracks day to day — what's on the grocery list, where the money went, which bills are
due, who owes what chore — lives in one place on the device.

- **100% local-first.** Data lives in an on-device SQLite database. No account, no
  server, no network calls, no tracking.
- **Versioned schema.** Migrations are transactional, sequential, and refuse to run
  against a newer database than the app understands.
- **Typed end to end.** Strict TypeScript across routes, contexts, services, and
  repositories.
- **Accessible by default.** Roles, labels, states, and hit slops on interactive
  controls.
- **Light & dark themes** driven by a single token set, with the user's choice
  persisted.

---

## Features

### Implemented

| Module | Capabilities |
| --- | --- |
| **Dashboard** | Household greeting, member count, and summary cards for spending, groceries, bills due, and tasks today. |
| **Grocery** | Active shopping list with add / edit / complete / delete, inline search, category filters (10 categories), member assignment, quantity, and *Clear Completed*. |
| **Expenses** | Add / edit / delete expenses with amount, payer (member ID), category, month, date, and notes. Monthly totals, category breakdown, category and month filters, and search by title or payer. |
| **Bills** | Track rent, utilities, internet, mobile, and subscriptions. Add / edit / delete, paid toggle, due-date tracking, recurring flag, outstanding / paid / overdue totals, status filters, and search by title or notes. |
| **Family** | Household member management with roles (`admin`, `member`, `child`), add / remove flows, and confirmation dialogs. |
| **Settings** | Household name, currency, and member count; light / dark theme toggle persisted to storage. |
| **Navigation** | Five-tab bottom navigator (Home, Tasks, Grocery, Finance, More) plus hidden sub-routes, with safe-area–aware tab bar sizing. |
| **Data integrity** | WAL journaling, foreign keys enforced, transactional first-run seeds, non-destructive schema adoption, retryable startup failures. |

### Placeholder routes

These screens exist with their tables, types, navigation, and theming in place, but
render a "coming in a future phase" card until implemented: **Tasks & Chores**,
**Calendar & Important Dates**, **Reminders & Medicine**, **Shared Notes**.

---

## Screens

| Route | Screen | Status |
| --- | --- | --- |
| `/` | Dashboard | Working (summary values are placeholders) |
| `/tasks` | Family Tasks & Chores | Placeholder |
| `/grocery` | Grocery List | Working |
| `/finance` | Household Finance | Working (totals are placeholders) |
| `/more` | More Features hub | Working |
| `/bills` | Bills & Payments | Working |
| `/expenses` | Household Expenses | Working |
| `/calendar` | Calendar & Dates | Placeholder |
| `/reminders` | Reminders & Medicine | Placeholder |
| `/notes` | Shared Notes | Placeholder |
| `/family` | Family Members | Working |
| `/settings` | Settings | Working |

---

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Expo SDK 57 (`expo@57.0.26`) |
| Runtime | React Native 0.86.3, React 19.2.3 |
| Language | TypeScript 6 (`strict`) |
| Navigation | Expo Router 57 (file-based routes + typed routes) |
| Storage | `expo-sqlite` (WAL, FK-enforced, versioned migrations) |
| Preferences | `@react-native-async-storage/async-storage` |
| Animation | `react-native-reanimated` 4.5.1 |
| Safe areas | `react-native-safe-area-context` |
| Icons | `@expo/vector-icons` (Ionicons) |
| Lint | `eslint-config-expo` 57 |
| Tests | `node:test` + `react-test-renderer` + `node:sqlite` |

Installed but not yet wired into `src/`: `expo-notifications`, `expo-print`,
`expo-sharing`, `expo-image-picker`, `expo-image`. These back the planned modules
below and are already listed as config plugins where required.

---

## Getting Started

### Requirements

- **Node.js 22.13+** (Expo SDK 57 minimum) — required for the test runner's
  `node:sqlite`
- **npm 10+**
- **Expo Go** on a physical device, or Android Studio / Xcode for native builds
- Optional: an [Expo account](https://expo.dev/signup) + EAS credentials for cloud builds

### Install and run

```bash
git clone https://github.com/ShovonScripts/Home-Manager.git
cd Home-Manager
npm install
npm start
```

Then scan the QR code with Expo Go, or press `a` / `i` in the terminal for an
Android emulator or iOS simulator.

### Available scripts

```bash
npm start        # Start the Expo dev server (Metro)
npm run android  # Start and open on Android
npm run ios      # Start and open on iOS
npm run web      # Start in a browser
npm run lint     # ESLint via expo lint
npm run typecheck # tsc --noEmit
npm test         # node:test regression suite
```

### Development build needed?

This project uses `expo-sqlite`, which contains native code and **is not included in
Expo Go**. To run on a device you need a development build:

```bash
npx expo run:android   # or: npx expo run:ios
```

Cloud alternative (no local Android Studio / Xcode required):

```bash
npx eas-cli@latest build --profile development --platform android
```

---

## Project Structure

```
Home-Manager/
├── app.json                  # Expo config (name, scheme, plugins, icons, splash)
├── eas.json                  # EAS build/submit profiles
├── App.tsx, index.ts         # Root entry (Expo Router)
├── assets/                   # Icons, splash, adaptive icon layers
├── docs/
│   ├── android-qa.md             # Android runtime QA preflight report
│   └── foundation-stabilization.md # Stabilization + migration report
├── src/
│   ├── app/                  # Expo Router routes — every file is a screen
│   │   ├── _layout.tsx       # Root layout: providers + tab navigator
│   │   ├── index.tsx         # Dashboard
│   │   ├── tasks.tsx  grocery.tsx  finance.tsx  more.tsx
│   │   ├── bills.tsx  expenses.tsx
│   │   ├── calendar.tsx  reminders.tsx  notes.tsx
│   │   └── family.tsx  settings.tsx
│   ├── components/
│   │   ├── bills/            # Summary card, item card, chips, modal, empty state
│   │   ├── expenses/         # Summary card, item card, chips, modal, empty state
│   │   ├── grocery/          # Item cards, modals, category chips, filter bar
│   │   └── common/           # AsyncState, BackButton, DatabaseGate
│   ├── constants/            # colors, theme tokens, category catalogues
│   ├── context/              # Theme, Household, Grocery, Expense, Bill providers
│   ├── services/             # Business logic per module
│   ├── storage/
│   │   ├── database.ts       # Connection caching, PRAGMAs, transactional seeds
│   │   ├── migrations.ts     # Ordered, transactional migration runner
│   │   └── repositories/     # SQL per table (household, grocery, expense, bill)
│   ├── types/                # Domain types
│   └── utils/                # currency, date, member resolution helpers
└── tests/                    # node:test suites + shared loader harness
```

---

## Architecture

### Layered data flow

```
Screen (src/app)
  └─ Context / Provider (useGrocery, useExpense, useBill, useHousehold, useTheme)
       └─ Service (groceryService, expenseService, billService, householdService)
            └─ Repository (raw parameterized SQL)
                 └─ expo-sqlite (homemanager.db)
```

Each layer only knows about the one below it, which keeps screens free of SQL and
makes the data layer testable in isolation.

### Startup sequence

1. `DatabaseGate` mounts at the app root and calls `initializeDatabase()` **before**
   any navigation or feature provider renders.
2. The connection opens once — the in-flight promise is cached, so concurrent callers
   share a single connection and failed opens are retryable.
3. `PRAGMA journal_mode = WAL` and `PRAGMA foreign_keys = ON` are applied.
4. Migrations run in order against `PRAGMA user_version`; each migration and its
   version bump commit in a single transaction.
5. First-run seeds (household, primary member, expense categories, task categories)
   commit transactionally, so a failure can never leave a partial household.
6. A failure surfaces a visible error with a **Retry** action instead of a blank screen.

### Database schema

11 tables, all foreign-keyed to `households` with `ON DELETE CASCADE` and indexed on
their primary access paths:

`households` · `household_members` · `grocery_lists` · `grocery_items` ·
`expense_categories` · `expenses` · `bills` · `task_categories` · `tasks` ·
`reminders` · `important_dates` · `notes`

> **Migration rule:** never edit a migration that has shipped. Append version `2`,
> `3`, … in `src/storage/migrations.ts`. Migrations must apply sequentially, and an
> older app refuses to touch a database newer than it supports.

### Theming

`ThemeContext` exposes a typed token set (`colors`, `Spacing`, `BorderRadius`,
`Typography`, `Shadows`) for both light and dark modes. The selection is persisted to
`AsyncStorage` under `@home_manager_theme_mode` and falls back to the OS color scheme
on first launch. No component hard-codes a color outside this system.

---

## Testing

The suite runs on the **real TypeScript modules** — `tests/support.cjs` transpiles
`src/` on the fly and substitutes native boundaries — with an **in-memory
`node:sqlite`** adapter standing in for `expo-sqlite`.

```bash
npm test
```

Three suites cover:

- **`database.test.cjs`** — initialization and retries, concurrent startup, failed
  opens / migrations / seeds, non-destructive adoption of legacy unversioned data,
  transactional rollback, and the "database is newer than the app" guard.
- **`modals.test.cjs`** — draft retention across category / member / theme updates,
  member-ID persistence, currency normalization, and modal session boundaries.
- **`screens-and-contexts.test.cjs`** — stale-error clearing on retry, no redundant
  reloads on member churn, tab and header configuration, safe-area sizing
  (0 / 24 / 34 / 48), theme tokens, and accessibility props.

> Native UI boundaries are mocked. These tests verify application logic — they are not
> a substitute for physical-device smoke testing.

Before opening a pull request:

```bash
npm run typecheck && npm run lint && npm test
```

---

## Building & Releasing

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile production --platform all
npx eas-cli@latest submit --profile production
```

| Profile | Type | Distribution |
| --- | --- | --- |
| `development` | Development client | Internal |
| `preview` | Release build | Internal |
| `production` | Release build (Android App Bundle) | Store |

Native `ios/` and `android/` directories are generated by Continuous Native
Generation and are git-ignored — configure native behavior in `app.json` and config
plugins, never by hand.

---

## Roadmap

- [x] Grocery lists, expenses, and bills modules
- [x] Household members, roles, and settings
- [x] Versioned SQLite migrations with transactional seeds
- [x] Light / dark theming with persistence
- [x] Loading / error / retry states across every data-backed screen
- [x] Accessibility pass on interactive controls
- [ ] Tasks & chores with assignment and rotation
- [ ] Calendar with birthdays, anniversaries, and recurring events
- [ ] Medicine and general reminders via `expo-notifications`
- [ ] Shared household notes
- [ ] PDF export and sharing of grocery lists and reports (`expo-print`, `expo-sharing`)
- [ ] Member avatars via `expo-image-picker`
- [ ] Income, budgets, and savings goals
- [ ] Cloud sync, authentication, and multi-household support

---

## Contributing

1. Fork the repository and create a feature branch.
2. Never hand-edit `ios/` or `android/` — use `app.json` and config plugins.
3. Add schema changes as a new appended migration, never by editing a shipped one.
4. Keep screens in `src/app/` and everything else outside it.
5. Install new dependencies with `npx expo install <package>` so versions stay
   SDK-compatible.
6. Run `npm run typecheck`, `npm run lint`, and `npm test` before opening a PR.

---

## Known Limitations

- Physical-device QA has not yet been completed — bundles compile and the regression
  suite passes, but keyboard, hardware back, VoiceOver/TalkBack, and force-stop
  durability are unverified on real hardware. See [`docs/android-qa.md`](docs/android-qa.md).
- Dashboard and Finance summary values are placeholders, not live aggregates.
- Grocery, Expense, and Bill dialogs close before their async write resolves, so a
  failed save does not restore that closed draft.
- `npm audit` reports outstanding advisories in the transitive dependency tree; no
  forced upgrades have been applied because available fixes would break Expo SDK 57
  compatibility.

---

## License

Released under the [MIT License](LICENSE).

## Acknowledgements

Built on top of [Expo](https://expo.dev) and [React Native](https://reactnative.dev).