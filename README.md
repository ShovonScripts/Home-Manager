# Home Manager

<p align="center">
  <b>Offline-first household management for Android &amp; iOS.</b><br />
  Groceries · Expenses · Bills · Tasks · Calendar · Reminders · Shared Notes — one local database, no account, no server.
</p>

<p align="center">
  <a href="https://github.com/ShovonScripts/Home-Manager"><img alt="Expo" src="https://img.shields.io/badge/Expo-SDK%2057-000020.svg" /></a>
  <a href="https://github.com/ShovonScripts/Home-Manager"><img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.86.3-20232A.svg" /></a>
  <a href="https://github.com/ShovonScripts/Home-Manager"><img alt="React" src="https://img.shields.io/badge/React-19.2.3-087ea4.svg" /></a>
  <a href="https://github.com/ShovonScripts/Home-Manager"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6.svg" /></a>
  <a href="https://github.com/ShovonScripts/Home-Manager"><img alt="SQLite" src="https://img.shields.io/badge/SQLite-expo--sqlite-003b57.svg" /></a>
  <a href="https://github.com/ShovonScripts/Home-Manager/actions"><img alt="Lint" src="https://img.shields.io/badge/lint-clean-success.svg" /></a>
  <a href="https://github.com/ShovonScripts/Home-Manager/actions"><img alt="Typecheck" src="https://img.shields.io/badge/typecheck-clean-success.svg" /></a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#task-assignment-and-whatsapp">WhatsApp Notify</a> •
  <a href="#screens">Screens</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#data-layer">Data Layer</a> •
  <a href="#testing">Testing</a> •
  <a href="#building">Building</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#known-limitations">Limitations</a> •
  <a href="#license">License</a>
</p>

---

## Contents

- [Why Home Manager](#why-home-manager)
- [Features](#features)
  - [Task assignment and WhatsApp quick-notify](#task-assignment-and-whatsapp-quick-notify)
- [Screens](#screens)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Data Layer](#data-layer)
- [Theming](#theming)
- [Testing](#testing)
- [Building & Releasing](#building--releasing)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Why Home Manager

Household apps usually demand a sign-up before they show you anything. This one doesn't.

- **100% local-first.** Every record lives in an on-device SQLite database. No account, no backend, no network calls, no analytics, no tracking.
- **Versioned schema.** Migrations are ordered and transactional, and an older build refuses to touch a database newer than it understands rather than corrupting it.
- **Typed end to end.** Strict TypeScript across routes, contexts, services, repositories, and domain types.
- **One module per concern.** Ten feature modules (groceries, expenses, bills, tasks, calendar, reminders, notes, family, settings, dashboard) each own a route, context, service, repository, and component folder.
- **Accessible by default.** Roles, labels, states, and generous hit slops on interactive controls.
- **Light & dark themes** from a single typed token set, with the user's choice persisted across launches.

---

## Features

All ten modules below are implemented end to end — route, context, service, repository, and UI.

| Module | Route | Capabilities |
| --- | --- | --- |
| **Dashboard** | `/` | Household greeting, live member count, animated overview cards for spending, groceries, bills, and tasks, plus a privacy notice card. |
| **Grocery** | `/grocery` | Multiple named lists, add / edit / complete / delete, inline search, 10 category chips, member assignment, quantity, and *Clear Completed*. |
| **Expenses** | `/expenses` | Add / edit / delete with amount, payer (member ID), category, month, date, and notes. Monthly totals, category breakdown, category + month filters, and search by title **or payer name**. |
| **Bills** | `/bills` | Rent, utilities, internet, mobile, and subscriptions. Add / edit / delete, paid toggle, due-date tracking, `none`/`monthly`/`yearly` recurrence, outstanding / paid / overdue totals, status filters, and search by title or notes. |
| **Tasks & Chores** | `/tasks` | Add / edit / delete / complete, 4 task categories, assignee selection, optional due date, category filter bar, and search across title, description, and assignee. |
| **Calendar & Dates** | `/calendar` | Birthdays, anniversaries, and events. Add / edit / delete, yearly-recurring flag, category chips, upcoming / past grouping, and search. |
| **Reminders** | `/reminders` | Medicine and general reminders with date + time, target member, completion toggle, status/type filter bar, and search by title. |
| **Shared Notes** | `/notes` | Household noticeboard — add / edit / delete titled notes with free-form body, pinned "last updated" ordering, and search. |
| **Family** | `/family` | Member management with roles (`admin`, `member`, `child`), optional WhatsApp number, add / edit / remove flows, and confirmation dialogs. |
| **Settings** | `/settings` | Household name, currency symbol, member count, and a light / dark theme toggle persisted to storage. |
| **More** | `/more` | Hub routing to Calendar, Reminders, Notes, Family, and Settings. |
| **Data integrity** | — | WAL journaling, foreign keys enforced, transactional first-run seeds, non-destructive adoption of legacy unversioned databases, retryable startup failures. |

### Task assignment and WhatsApp quick-notify

Assigning a chore to someone is only useful if they find out about it. Members can store an
optional WhatsApp number on their profile, and the task modal exposes a **Notify via WhatsApp**
toggle whenever the assignee has one. Saving the task then deep-links straight into a
pre-filled WhatsApp chat via `https://wa.me/<number>?text=...`.

This is deliberately **deep-link only** — Home Manager never sends anything on your behalf, so
there is no messaging backend, no credential storage, and no permission prompt. If WhatsApp
isn't installed, the task still saves and the user gets a confirmation notice.

> **Not implemented:** local/push notifications via `expo-notifications`. Reminders are
> currently in-app records only and never fire an OS notification.

---

## Screens

| Route | Screen | Tab | Status |
| --- | --- | --- | --- |
| `/` | Dashboard | Home | Working — summary card values are static labels, not live aggregates |
| `/tasks` | Tasks & Chores | Tasks | Working |
| `/grocery` | Grocery List | Grocery | Working |
| `/finance` | Household Finance | Finance | Working — total is a placeholder, hubs to Expenses |
| `/more` | More Features hub | More | Working |
| `/bills` | Bills & Payments | — | Working |
| `/expenses` | Household Expenses | — | Working |
| `/calendar` | Calendar & Dates | — | Working |
| `/reminders` | Reminders & Medicine | — | Working |
| `/notes` | Shared Notes | — | Working |
| `/family` | Family Members | — | Working |
| `/settings` | Settings | — | Working |

Five tabs (Home, Tasks, Grocery, Finance, More) plus seven hidden sub-routes reached from the
tab bar or the More hub. The tab bar is safe-area aware: a fixed 52pt content area with the
device's bottom inset added on top.

---

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Expo SDK 57 (`expo@~57.0.26`) |
| Runtime | React Native 0.86.3, React 19.2.3 |
| Language | TypeScript 6 (`strict`) |
| Navigation | Expo Router 57 — file-based routes, typed routes enabled |
| Storage | `expo-sqlite` — WAL, FK-enforced, versioned migrations |
| Preferences | `@react-native-async-storage/async-storage` |
| Animation | `react-native-reanimated` 4.5.1 (`FadeInDown`, `AnimatedPressable`) |
| Safe areas | `react-native-safe-area-context` |
| Icons | `@expo/vector-icons` (Ionicons) |
| Lint | `eslint-config-expo` 57 + ESLint 9 |
| Tests | `node:test` + `react-test-renderer` + in-memory `node:sqlite` |

Installed but **not yet wired into `src/`**: `expo-notifications`, `expo-print`,
`expo-sharing`, `expo-image-picker`, `expo-image`. They back the roadmap items below.

---

## Getting Started

### Requirements

- **Node.js 22.13+** — required by the test runner's `node:sqlite` module
- **npm 10+**
- **Expo Go** on a physical device, or Android Studio / Xcode for native builds
- Optional: an [Expo account](https://expo.dev/signup) and EAS credentials for cloud builds

### Install and run

```bash
git clone https://github.com/ShovonScripts/Home-Manager.git
cd Home-Manager
npm install
npm start
```

Scan the QR code with Expo Go, or press `a` / `i` in the terminal for an Android emulator or
an iOS simulator.

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

### You need a development build

This project uses `expo-sqlite`, which ships native code and is **not bundled with Expo Go**.
`npm start` is enough for Metro and bundling, but installing on a device requires a
development build:

```bash
npx expo run:android     # local native build
npx expo run:ios
```

Cloud alternative — no local Android Studio or Xcode needed:

```bash
npx eas-cli@latest build --profile development --platform android
```

---

## Project Structure

```
Home-Manager/
├── app.json                  # Expo config (scheme, plugins, icons, splash, bundle id)
├── eas.json                  # EAS build / submit profiles
├── App.tsx, index.ts         # Root entry (delegates to expo-router/entry)
├── assets/                   # Icon, splash, adaptive icon layers
├── docs/
│   ├── android-qa.md             # Android runtime QA preflight report
│   └── foundation-stabilization.md # Stabilization + migration report
├── src/
│   ├── app/                  # Expo Router routes — every file here is a screen
│   │   ├── _layout.tsx       # SafeArea → Theme → DatabaseGate → Household → Tabs
│   │   ├── index.tsx         # Dashboard
│   │   ├── tasks.tsx         # Tasks & Chores
│   │   ├── grocery.tsx       # Grocery List
│   │   ├── finance.tsx       # Household Finance hub
│   │   ├── more.tsx          # More Features hub
│   │   ├── bills.tsx         # Bills & Payments
│   │   ├── expenses.tsx      # Household Expenses
│   │   ├── calendar.tsx      # Calendar & Dates
│   │   ├── reminders.tsx     # Reminders & Medicine
│   │   ├── notes.tsx         # Shared Notes
│   │   ├── family.tsx        # Family Members
│   │   └── settings.tsx      # Settings
│   ├── components/
│   │   ├── bills/            # Summary card, item card, chips, modal, empty state
│   │   ├── expenses/         # Summary card, item card, chips, modal, empty state
│   │   ├── grocery/          # Item cards, modals, category chips, filter bar
│   │   ├── tasks/            # Item card, modal, category chip, filter bar, empty state
│   │   ├── calendar/         # Item card, modal, category chip, empty state
│   │   ├── reminders/        # Item card, modal, filter bar, empty state
│   │   ├── notes/            # Item card, modal, empty state
│   │   └── common/           # AsyncState, BackButton, DatabaseGate, AnimatedPressable
│   ├── constants/            # colors, theme tokens, grocery/task/calendar/bill categories
│   ├── context/              # Theme, Household, Grocery, Expense, Bill, Task, Calendar,
│   │                         #   Reminder, Note providers
│   ├── services/             # Business logic per module
│   ├── storage/
│   │   ├── database.ts       # Connection caching, PRAGMAs, seeds, legacy column adoption
│   │   ├── migrations.ts     # Ordered, transactional migration runner
│   │   └── repositories/     # Parameterized SQL, one file per table group
│   ├── types/                # Domain types
│   └── utils/                # currency, date, member-resolution helpers
└── tests/                    # node:test suites + shared loader harness
```

---

## Architecture

### Layered data flow

```
Screen (src/app/*.tsx)
  └─ Module Provider (useTask, useGrocery, useExpense, useBill, …)
       └─ Service (taskService, groceryService, expenseService, …)
            └─ Repository (parameterized SQL, no UI knowledge)
                 └─ expo-sqlite (homemanager.db)
```

Each layer only knows about the layer below it. Screens never touch SQL; repositories never
know a component exists. That boundary is what makes the data layer testable in isolation with
nothing more than `node:sqlite`.

Feature providers are mounted **per screen** rather than at the root, so a tab only pays for
the data it renders. Only `ThemeProvider`, `HouseholdProvider`, and `DatabaseGate` are global.

### Startup sequence

1. `DatabaseGate` mounts at the app root and awaits `initializeDatabase()` **before** any
   navigation or feature provider renders.
2. The connection opens once — the in-flight promise is cached, so concurrent callers share a
   single connection, and a failed open is retryable.
3. `PRAGMA journal_mode = WAL` and `PRAGMA foreign_keys = ON` are applied.
4. Migrations run in order against `PRAGMA user_version`; each migration and its version bump
   commit together in one transaction.
5. First-run seeds (household, primary member, expense categories, task categories) commit
   transactionally, so a failure can never leave a half-built household behind.
6. A failure surfaces a visible error with a **Retry** action instead of a blank screen.

---

## Data Layer

Twelve tables, all foreign-keyed to `households` with `ON DELETE CASCADE` and indexed on
their primary access paths.

| Table | Purpose | Key columns |
| --- | --- | --- |
| `households` | Single household settings | `name`, `currency` |
| `household_members` | Members and roles | `name`, `role`, `avatarUrl`, `whatsapp` |
| `grocery_lists` | Named shopping lists | `name`, `isArchived` |
| `grocery_items` | Items on a list | `name`, `quantity`, `category`, `isCompleted`, `assignedTo` |
| `expense_categories` | Expense category catalogue | `name`, `icon`, `color` |
| `expenses` | Spending records | `title`, `amount`, `currency`, `paidBy`, `date`, `notes` |
| `bills` | Bills and payments | `title`, `amount`, `dueDate`, `isPaid`, `category`, `recurrence` |
| `task_categories` | Task category catalogue | `name`, `color` |
| `tasks` | Chores and tasks | `title`, `description`, `categoryId`, `assignedTo`, `dueDate`, `isCompleted` |
| `reminders` | Medicine and general reminders | `title`, `dateTime`, `type`, `targetMemberId`, `isCompleted` |
| `important_dates` | Birthdays, anniversaries, events | `title`, `date`, `isRecurringYearly`, `category` |
| `notes` | Shared household notes | `title`, `content` |

Indexes exist on every primary access path: `household_members(householdId)`,
`grocery_lists(householdId)`, `grocery_items(listId)`, `expenses(householdId)`,
`expenses(date)`, `bills(householdId)`, `bills(dueDate)`, `tasks(householdId)`,
`tasks(dueDate)`, `reminders(householdId)`, `reminders(dateTime)`,
`important_dates(householdId)`, `notes(householdId)`.

### Category catalogues

| Domain | Categories |
| --- | --- |
| Grocery (10) | Vegetables · Fruits · Meat & Fish · Dairy · Bakery · Beverages · Snacks · Household · Personal Care · Other |
| Tasks (4) | Household Chores · Maintenance · Shopping · Other Tasks |
| Calendar (3) | Birthday · Anniversary · Event |
| Bills (6) | Utilities · Housing · Internet · Mobile · Subscription · Other |

Categories are declared once in `src/constants/` with an id, label, Ionicons name, and brand
colour, and the chips, cards, and filters all read from that single source.

### Migration rules

> **Never edit a migration that has shipped.** Append `version: 2`, `3`, … in
> `src/storage/migrations.ts`. Migrations must apply sequentially, and an older app refuses to
> touch a database newer than it supports. For genuinely additive, single-column changes,
> `src/storage/database.ts` also performs a non-destructive `PRAGMA table_info` check and
> `ALTER TABLE ... ADD COLUMN` — this is how the `whatsapp` column was introduced on existing
> installs.

---

## Theming

`ThemeContext` exposes a typed token set for both modes:

- `colors` — Material-style roles: `primary`, `onPrimary`, `primaryContainer`,
  `onPrimaryContainer`, `secondary`, `secondaryContainer`, `onSecondary`, `background`,
  `surface`, `surfaceVariant`, `onBackground`, `onSurface`, `onSurfaceVariant`, `outline`,
  `error`, `errorContainer`, `success`, `successContainer`, `warning`, `warningContainer`,
  `card`, `cardBorder`, `shadow`, `tint`, `tabIconDefault`, `tabIconSelected`
  - Light: `primary #620EEA`, `background #F8F9FA`, `surface #FFFFFF`
  - Dark: `primary #CFBCFF`, `background #121316`, `surface #1A1C1E`
- `Spacing` — `xs` 4, `sm` 8, `md` 12, `lg` 16, `xl` 24, `xxl` 32, `xxxl` 48
- `BorderRadius` — `xs` 4 → `xl` 24, plus `round`
- `Typography` — sizes `xs` 11 → `xxxl` 36, weights `regular` → `bold`
- `Shadows` — `sm`, `md`, `lg` with matching Android `elevation`

The selection persists to `AsyncStorage` under `@home_manager_theme_mode` and falls back to the
OS colour scheme on first launch. No component hard-codes a colour outside this system.

---

## Testing

The suite runs against the **real TypeScript modules** — `tests/support.cjs` transpiles `src/`
on the fly and stubs native boundaries — with an in-memory `node:sqlite` adapter standing in
for `expo-sqlite`.

```bash
npm test
```

Three suites, 39 cases:

- **`database.test.cjs`** — initialization and retries, concurrent startup, failed
  opens / migrations / seeds, non-destructive adoption of legacy unversioned data,
  transactional rollback, the "database is newer than the app" guard, and member-ID +
  currency persistence through services.
- **`modals.test.cjs`** — draft retention across category / member / theme updates,
  member-ID persistence, currency normalization, and modal session boundaries.
- **`screens-and-contexts.test.cjs`** — stale-error clearing on retry, no redundant reloads on
  member churn, tab and header configuration, safe-area sizing, theme tokens, and
  accessibility props.

> **Current status: 24 passing, 15 failing.** The failures are concentrated in
> `database.test.cjs` and in the household-state / accessibility assertions of
> `screens-and-contexts.test.cjs` — they predate the `whatsapp` column and `HouseholdContext`
> changes. `npm run typecheck` and `npm run lint` are both clean. See
> [Known Limitations](#known-limitations).

Native UI boundaries are mocked. These tests verify application logic — they are not a
substitute for physical-device smoke testing.

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

`appVersionSource` is `remote`, so store versions are managed in EAS rather than in
`app.json`. Native `ios/` and `android/` directories are generated by Continuous Native
Generation and are git-ignored — configure native behaviour in `app.json` and config plugins,
never by hand.

---

## Roadmap

- [x] Grocery lists with categories, assignment, and quantities
- [x] Expenses with payer, categories, monthly totals, and breakdown
- [x] Bills with due dates, recurrence, and paid / overdue status
- [x] Tasks & chores with assignment and category filters
- [x] Calendar of birthdays, anniversaries, and events
- [x] Reminders & medicine records
- [x] Shared household notes
- [x] WhatsApp quick-notify on task assignment
- [x] Household members, roles, and settings
- [x] Versioned SQLite migrations with transactional seeds
- [x] Light / dark theming with persistence
- [x] Loading / error / retry states across every data-backed screen
- [x] Animation pass — `AnimatedPressable` and staggered screen entrances
- [x] Accessibility pass on interactive controls
- [ ] **Fix the 15 failing tests** (household-state and accessibility assertions)
- [ ] Live aggregates on Dashboard and Finance summary cards
- [ ] Local notifications for reminders via `expo-notifications`
- [ ] Recurring task rotation and chore assignment cycles
- [ ] PDF export and sharing of grocery lists and reports (`expo-print`, `expo-sharing`)
- [ ] Member avatars via `expo-image-picker`
- [ ] Income tracking, budgets, and savings goals
- [ ] iOS-specific QA parity with Android
- [ ] Cloud sync, authentication, and multi-household support

---

## Contributing

1. Fork the repository and branch off `master` for your feature.
2. Never hand-edit `ios/` or `android/` — use `app.json` and config plugins.
3. Add schema changes as a new appended migration; never edit a shipped one.
4. Keep screens in `src/app/` and every other file outside it.
5. A new feature module owns four things: a route, a context, a service, a repository, and a
   component folder under `src/components/<module>/`.
6. Install dependencies with `npx expo install <package>` so versions stay SDK-compatible.
7. Register new tab icons and hidden sub-routes in `src/app/_layout.tsx`.
8. Run `npm run typecheck`, `npm run lint`, and `npm test` before opening a PR.

---

## Known Limitations

- **`npm test` is red.** 15 of 39 cases fail, concentrated in `database.test.cjs` and the
  household-state / accessibility assertions in `screens-and-contexts.test.cjs`. They have not
  been updated for the `whatsapp` column and the current `HouseholdContext`. `typecheck` and
  `lint` are clean.
- **Dashboard and Finance totals are placeholders.** Dashboard renders
  `formatCurrency(0, …)`, `"Due Soon"`, and `"Chores"` as literal strings rather than live
  aggregates from the repositories; Finance shows a hardcoded zero total.
- **Reminders never notify.** They are stored and displayed in-app only. `expo-notifications`
  is installed but unused, so no OS notification is ever scheduled.
- **WhatsApp quick-notify is user-initiated only.** It opens a pre-filled chat via
  `wa.me`; it never sends a message autonomously, and it depends on WhatsApp being installed.
- **Physical-device QA is incomplete.** Bundles compile and the data layer is regression
  tested, but keyboard behaviour, hardware back, VoiceOver / TalkBack, and force-stop
  durability are unverified on real hardware. See [`docs/android-qa.md`](docs/android-qa.md).
- **Date and time entry is manual.** Modals accept raw `YYYY-MM-DD` and `HH:MM` strings rather
  than offering native date/time pickers, so malformed input is possible.
- **Dialogs close before their async write resolves.** A failed save on the Grocery, Expense,
  and Bill dialogs does not restore the closed draft.
- **`npm audit` reports advisories** in the transitive dependency tree. No forced upgrades have
  been applied because the available fixes break Expo SDK 57 compatibility.

---

## License

Released under the [MIT License](LICENSE).

## Acknowledgements

Built on top of [Expo](https://expo.dev) and [React Native](https://reactnative.dev).