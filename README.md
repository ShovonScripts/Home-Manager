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
  <a href="https://github.com/ShovonScripts/Home-Manager"><img alt="Zustand" src="https://img.shields.io/badge/Zustand-5-999999.svg" /></a>
  <a href="https://github.com/ShovonScripts/Home-Manager"><img alt="SQLite" src="https://img.shields.io/badge/SQLite-expo--sqlite-003b57.svg" /></a>
</p>

<p align="center">
  <a href="#features">Features</a> •
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
  - [Dashboard](#dashboard)
  - [PDF reports and data export](#pdf-reports-and-data-export)
  - [WhatsApp quick-notify](#whatsapp-quick-notify)
- [Screens](#screens)
- [Tech Stack](#tech Stack)
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
- **Typed end to end.** Strict TypeScript across routes, stores, services, repositories, and domain types.
- **Shared state via Zustand.** Eight feature stores (`src/store/`) expose the same load / create / update / delete surface over their own table.
- **Accessible by default.** Roles, labels, states, and generous hit slops on interactive controls.
- **Light & dark themes** from a single typed token set, with the user's choice persisted across launches.
- **You own your data.** Settings exports the entire database as a JSON file you can save or share anywhere.

---

## Features

All twelve routes below are implemented — route, store, UI, and persistence.

| Module | Route | Capabilities |
| --- | --- | --- |
| **Dashboard** | `/` | Time-aware greeting, live member count, four live aggregate cards (this month's spending, pending groceries, unpaid bills total, pending tasks), an overdue-bills / due-today alert banner, a "Quick Add Anything" modal, quick actions, and a merged recent-activity feed across tasks, expenses, bills, and groceries. |
| **Grocery** | `/grocery` | Add / edit / complete / delete with quantity, 10 category chips, member assignment, WhatsApp quick-notify per item, inline search, live pending count, and *Clear Completed*. |
| **Expenses** | `/expenses` | Add / edit / delete with title, amount, payer, category, date, and notes. Category chips, live total, monthly summary and category-breakdown analytics, and search across title and notes. |
| **Bills** | `/bills` | Rent, utilities, internet, mobile, and subscriptions. Add / edit / delete, paid toggle, due-date tracking, `none`/`monthly`/`yearly` recurrence, outstanding / paid / overdue totals, status filter bar (all / unpaid / paid / overdue), and search by title or notes. |
| **Tasks & Chores** | `/tasks` | Add / edit / delete / complete, 4 task categories, assignee selection, optional due date, category filter bar, live count, search across title, description, and assignee, and WhatsApp quick-notify per card. |
| **Calendar & Dates** | `/calendar` | Birthdays, anniversaries, and events. Add / edit / delete, yearly-recurring flag, 3 category chips, and search by title. |
| **Reminders** | `/reminders` | Medicine and general reminders with date + time, target member, completion toggle, status filter bar (all / pending / completed), and search by title. |
| **Shared Notes** | `/notes` | Household noticeboard — add / edit / delete titled notes with free-form body, ordered by last updated, and search across title and content. |
| **Family** | `/family` | Member management with an 8-colour palette, optional WhatsApp number (with country-code hint), add / edit / remove flows, and a confirmation dialog before removal. |
| **Settings** | `/settings` | Household name, currency (৳ · $ · € · £), light / dark theme toggle, JSON backup export, and an app-info block. |
| **Finance** | `/finance` | Hub routing to Bills and Expenses, plus one-tap PDF report generation. |
| **More** | `/more` | Hub routing to Calendar, Reminders, Notes, Family, Settings, Help, and About. |
| **Data integrity** | — | WAL journaling, foreign keys enforced, transactional first-run seeds, non-destructive adoption of legacy unversioned databases, retryable startup failures. |

### Dashboard

The dashboard is fully live — nothing on it is a hardcoded label. Monthly spending,
unpaid-bill totals, pending grocery and task counts, the alert banner, and the
recent-activity feed are all derived from the Zustand stores at render time
(`src/app/index.tsx:39`–`src/app/index.tsx:71`). Cards deep-link into the relevant screen,
and the tab bar mirrors the same numbers as badges (`src/app/_layout.tsx:87`, `src/app/_layout.tsx:112`).

### PDF reports and data export

Two export paths exist, both fully wired:

- **Monthly PDF report** — `/finance` builds a styled HTML summary (spending total, unpaid
  bills, tasks completed, per-category breakdown with percentages, and the 10 most recent
  expenses), renders it with `expo-print`, and hands it to the system share sheet as a PDF
  (`src/services/pdfReportService.ts`).
- **Full JSON backup** — `/settings` dumps all twelve tables into a versioned JSON envelope,
  writes it to the cache directory, and shares it (`src/services/backupService.ts`).

### WhatsApp quick-notify

Members can store an optional WhatsApp number on their profile. When an item is assigned to a
member who has one, the card renders a **Notify** button that deep-links into a pre-filled
chat via `https://wa.me/<number>?text=...` (`src/components/tasks/TaskItemCard.tsx:45`,
`src/components/grocery/GroceryItemCard.tsx:33`).

This is deliberately **deep-link only** — Home Manager never sends anything on your behalf, so
there is no messaging backend, no credential storage, and no permission prompt. If WhatsApp
isn't installed, the action shows a confirmation notice and the record is unaffected.

> **Not implemented:** local/push notifications. `expo-notifications` is installed but
> `src/services/notificationService.ts` is a set of `console.log` stubs, so no OS
> notification is ever scheduled.

---

## Screens

| Route | Screen | Tab | Status |
| --- | --- | --- | --- |
| `/` | Dashboard | Home | Working — all values are live aggregates |
| `/tasks` | Tasks & Chores | Tasks | Working — badge shows pending count |
| `/grocery` | Grocery List | Grocery | Working |
| `/finance` | Financial Hub | Finance | Working — badge shows unpaid bills; exports PDF |
| `/more` | More Features hub | More | Working |
| `/bills` | Bills & Payments | — | Working |
| `/expenses` | Household Expenses | — | Working |
| `/calendar` | Calendar & Dates | — | Working |
| `/reminders` | Reminders & Medicine | — | Working |
| `/notes` | Shared Notes | — | Working |
| `/family` | Family Members | — | Working |
| `/settings` | Settings | — | Working |
| `/help` | How to Use App | — | **Not registered in `_layout.tsx`** — see limitations |
| `/about` | About App | — | **Not registered in `_layout.tsx`**** — see limitations |

Five tabs (Home, Tasks, Grocery, Finance, More) plus seven hidden sub-routes registered with
`href: null`, each with a `BackButton` in its header. The tab bar is safe-area aware: a fixed
52pt content area with the device's bottom inset added on top.

> `/help` and `/about` are reachable from the More hub but are **missing from the `Tabs.Screen`
> list** in `src/app/_layout.tsx`. Because `experiments.typedRoutes` is on, this is also the
> single source of the `tsc` error in `src/app/more.tsx:99`.

---

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Expo SDK 57 (`expo@~57.0.26`) |
| Runtime | React Native 0.86.3, React 19.2.3 |
| Language | TypeScript 6.0 (`strict`) |
| Navigation | Expo Router 57 — file-based routes, typed routes enabled |
| State | Zustand 5 — one store per feature module |
| Storage | `expo-sqlite` — WAL, FK-enforced, versioned migrations |
| Preferences | `@react-native-async-storage/async-storage` |
| Animation | `react-native-reanimated` 4.5.1 (`FadeInDown`, `AnimatedPressable`) |
| Haptics | `expo-haptics` — tab presses, card presses, destructive actions |
| Export | `expo-print` + `expo-sharing` — PDF reports and JSON backups |
| Files | `expo-file-system` — backup staging in the cache directory |
| Safe areas | `react-native-safe-area-context` |
| Icons | `@expo/vector-icons` (Ionicons) |
| Lint | `eslint-config-expo` 57 + ESLint 9 |
| Tests | `node:test` + `react-test-renderer` + in-memory `node:sqlite` |

Installed but **not used anywhere in `src/`**: `expo-notifications` (stubbed service),
`expo-image-picker`, `expo-image` (registered as a config plugin only), `expo-constants`,
`expo-font`. They back the roadmap items below.

> If `tsc` reports hundreds of `TS7006: implicitly has an 'any' type` errors across
> `src/store/*`, your `node_modules` predates the Zustand refactor. Run `npm ci` to sync.

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
├── assets/                   # Icon, splash, adaptive icon layers
├── docs/
│   ├── android-qa.md             # Android runtime QA preflight report
│   └── foundation-stabilization.md # Stabilization + migration report
├── src/
│   ├── app/                  # Expo Router routes — every file here is a screen
│   │   ├── _layout.tsx       # SafeArea → Theme → DatabaseGate → Tabs + badges
│   │   ├── index.tsx         # Dashboard (live aggregates, activity feed)
│   │   ├── tasks.tsx         # Tasks & Chores
│   │   ├── grocery.tsx       # Grocery List
│   │   ├── finance.tsx       # Financial Hub (Bills, Expenses, PDF export)
│   │   ├── more.tsx          # More Features hub
│   │   ├── bills.tsx         # Bills & Payments
│   │   ├── expenses.tsx      # Household Expenses
│   │   ├── calendar.tsx      # Calendar & Dates
│   │   ├── reminders.tsx     # Reminders & Medicine
│   │   ├── notes.tsx         # Shared Notes
│   │   ├── family.tsx        # Family Members
│   │   ├── settings.tsx      # Settings (incl. JSON backup)
│   │   ├── help.tsx          # How to Use App
│   │   └── about.tsx         # About App
│   ├── components/
│   │   ├── bills/            # Summary card, item card, chips, modal, empty state
│   │   ├── expenses/         # Summary card, analytics card, item card, chips, modal
│   │   ├── grocery/          # Item cards, modals, category chips, filter bar
│   │   ├── tasks/            # Item card, modal, category chip, filter bar, empty state
│   │   ├── calendar/         # Item card, modal, category chip, empty state
│   │   ├── reminders/        # Item card, modal, empty state
│   │   ├── notes/            # Item card, modal, empty state
│   │   └── common/           # AsyncState, BackButton, DatabaseGate, AnimatedPressable,
│   │                         #   QuickAddModal
│   ├── constants/            # colors, theme tokens, grocery/task/calendar/bill categories
│   ├── context/              # ThemeContext (the only remaining provider)
│   ├── services/             # Business logic + PDF report, JSON backup, notification stub
│   ├── storage/
│   │   ├── database.ts       # Connection caching, PRAGMAs, seeds, legacy column adoption
│   │   ├── migrations.ts     # Ordered, transactional migration runner
│   │   └── repositories/     # Parameterized SQL, one file per table group
│   ├── store/                # Zustand stores — one per feature module
│   ├── types/                # Domain types
│   └── utils/                # currency, date, member-resolution helpers
└── tests/                    # node:test suites + shared loader harness
```

The entry point is `expo-router/entry` (declared as `main` in `package.json`). There is no
root `App.tsx` or `index.ts` — Expo Router owns bootstrapping.

---

## Architecture

### Layered data flow

```
Screen (src/app/*.tsx)
  └─ Zustand Store (useTaskStore, useExpenseStore, …)
       └─ expo-sqlite (homemanager.db)
```

This is the current shape, and it is worth being explicit about: **the stores query SQLite
directly.** A service/repository layer exists on disk and is fully implemented, but it is
mostly bypassed — only `taskService` (from `useTaskStore.ts`) and `householdRepository`
(from `settings.tsx`) are still on a live code path. The remaining services and repositories
(`groceryService`, `expenseService`, `billService`, `calendarService`, `noteService`,
`reminderService`, `householdService`, and seven of eight repositories) have no callers in
`src/`.

The upside is that every feature store has an identical, obvious surface
(`loadData` / `add` / `update` / `delete` / `toggle`), which makes the code short and uniform.
The cost is that the "screens never touch SQL" boundary described in earlier revisions of this
document no longer holds. Migrating the remaining stores onto the service/repository layer is
on the roadmap.

### Startup sequence

1. `DatabaseGate` mounts at the app root and awaits `initializeDatabase()` **before** any
   navigation or feature screen renders.
2. The connection opens once — the in-flight promise is cached, so concurrent callers share a
   single connection, and a failed open is retryable.
3. `PRAGMA journal_mode = WAL` and `PRAGMA foreign_keys = ON` are applied.
4. Migrations run in order against `PRAGMA user_version`; each migration and its version bump
   commit together in one transaction.
5. First-run seeds (household, primary member, expense categories, task categories) commit
   transactionally, so a failure can never leave a half-built household behind.
6. A failure surfaces a visible error with a **Retry** action instead of a blank screen.
7. `RootLayoutNav` then calls `loadHousehold()` and fires the (stubbed) notification
   permission request, while the Tasks and Finance tabs pick up their badge counts from
   `useTaskStore` and `useBillStore`.

---

## Data Layer

Twelve tables, all foreign-keyed to `households` with `ON DELETE CASCADE` and indexed on
their primary access paths.

| Table | Purpose | Key columns |
| --- | --- | --- |
| `households` | Single household settings | `name`, `currency` |
| `household_members` | Members and contact details | `name`, `role`, `whatsapp`, `color` |
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
> `ALTER TABLE ... ADD COLUMN` — this is how the `whatsapp` and `color` columns were
> introduced on existing installs.

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

- **`database.test.cjs`** (9 cases) — initialization and retries, concurrent startup, failed
  opens / migrations / seeds, non-destructive adoption of legacy unversioned data,
  transactional rollback, the "database is newer than the app" guard, and member-ID +
  currency persistence through services.
- **`modals.test.cjs`** (6 cases) — draft retention across category / member / theme updates,
  member-ID persistence, currency normalization, and modal session boundaries.
- **`screens-and-contexts.test.cjs`** (24 cases) — stale-error clearing on retry, no redundant
  reloads on member churn, tab and header configuration, safe-area sizing, theme tokens, and
  accessibility props.

> **Current status: 2 passing, 37 failing.**
>
> | Suite | Pass | Fail |
> | --- | --- | --- |
> | `database.test.cjs` | 1 | 8 |
> | `modals.test.cjs` | 0 | 6 |
> | `screens-and-contexts.test.cjs` | 1 | 23 |
>
> The dominant cause is the **Zustand refactor**: the suites still `load('src/context/*Context.tsx')`
> for modules that now live in `src/store/use*Store.ts`, so they throw
> `ENOENT: no such file or directory` before reaching any assertion
> (`tests/screens-and-contexts.test.cjs:39`, `:148`, `:428`). The `database.test.cjs` failures
> are assertion-level and predate the refactor. `npm run lint` is clean; `npm run typecheck`
> has one error (see limitations).

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
- [x] Expenses with payer, categories, totals, and category breakdown
- [x] Bills with due dates, recurrence, and paid / overdue status
- [x] Tasks & chores with assignment and category filters
- [x] Calendar of birthdays, anniversaries, and events
- [x] Reminders & medicine records
- [x] Shared household notes
- [x] WhatsApp quick-notify on task and grocery assignment
- [x] Household members and settings
- [x] Versioned SQLite migrations with transactional seeds
- [x] Light / dark theming with persistence
- [x] Loading / error / retry states across data-backed screens
- [x] Animation pass — `AnimatedPressable` and staggered screen entrances
- [x] Accessibility pass on interactive controls
- [x] Haptics on tab presses, card presses, and destructive actions
- [x] Live aggregates on Dashboard, plus tab badges and an activity feed
- [x] PDF monthly report via `expo-print` + `expo-sharing`
- [x] Full JSON database export via `expo-file-system` + `expo-sharing`
- [x] Zustand migration for all eight feature stores
- [ ] **Register `/help` and `/about` in `_layout.tsx`** — fixes the only `tsc` error
- [ ] **Port the test suites to the Zustand stores** — unblocks 37 failing cases
- [ ] Route the remaining stores through the service / repository layer, or delete it
- [ ] Multi-list grocery UI (store API exists: `createList`, `setActiveList`)
- [ ] Search expenses by payer name, not just title and notes
- [ ] Wire up the month selector on the expenses summary card (currently inert)
- [ ] Editable member roles (`admin` / `member` / `child`) and `avatarUrl` via `expo-image-picker`
- [ ] Real local notifications via `expo-notifications`
- [ ] Native date and time pickers instead of raw `YYYY-MM-DD` / `HH:MM` text entry
- [ ] Recurring task rotation and chore assignment cycles
- [ ] Income tracking, budgets, and savings goals
- [ ] iOS-specific QA parity with Android
- [ ] Cloud sync, authentication, and multi-household support

---

## Contributing

1. Fork the repository and branch off `master` for your feature.
2. Never hand-edit `ios/` or `android/` — use `app.json` and config plugins.
3. Add schema changes as a new appended migration; never edit a shipped one.
4. Keep screens in `src/app/` and every other file outside it.
5. A new feature module owns a route, a store in `src/store/`, a component folder under
   `src/components/<module>/`, and — if it needs one — a service and repository.
6. Install dependencies with `npx expo install <package>` so versions stay SDK-compatible.
7. Register new tab icons and hidden sub-routes in `src/app/_layout.tsx`.
8. Run `npm run typecheck`, `npm run lint`, and `npm test` before opening a PR.

---

## Known Limitations

- **`npm test` is red — 37 of 39 cases fail.** The suites still load the deleted
  `src/context/*Context.tsx` modules after the Zustand refactor, so most fail with `ENOENT`
  before running an assertion. `database.test.cjs` also has 8 pre-existing assertion failures
  around concurrent initialization and rollback. `lint` is clean; `typecheck` has one error.
- **`npm run typecheck` reports one error.** `src/app/more.tsx:99` pushes the `'/about'` and
  `'/help'` routes, which are not registered as `Tabs.Screen` entries in `src/app/_layout.tsx`,
  so they are absent from the generated typed-route union. Both screens are otherwise
  complete and reachable at runtime.
- **`/help` and `/about` are unregistered in `_layout.tsx`,** so they have no navigator-level
  header and rely on their own in-screen back button. `about.tsx` is safe-area aware;
  `help.tsx` should be checked.
- **Most of the service and repository layer is dead code.** Only `taskService` and
  `householdRepository` have callers. Either wire the remaining seven stores through them or
  remove the unused files.
- **The dashboard uses an unverified `tabBarHeight` of 80pt** (`src/app/index.tsx:79`) for
  bottom padding instead of measured insets, so it may under- or over-pad on devices with
  tall gesture bars.
- **Reminders never notify.** They are stored and displayed in-app only;
  `src/services/notificationService.ts` is entirely `console.log` stubs.
- **WhatsApp quick-notify is user-initiated only.** It opens a pre-filled chat via `wa.me`;
  it never sends a message autonomously, and it depends on WhatsApp being installed.
- **Date and time entry is manual.** Modals accept raw `YYYY-MM-DD` and `HH:MM` strings rather
  than offering native pickers. The reminder modal validates format, but other modals are less
  strict, so malformed input is possible.
- **Grocery has no multi-list UI.** `useGroceryStore` exposes `createList`, `setActiveList`,
  and `deleteList`, but `src/app/grocery.tsx` never calls them — the seeded default list is the
  only one reachable.
- **The expenses month selector is inert.** `onMonthChange={() => {}}`
  (`src/app/expenses.tsx:95`), and there is no month filter despite the summary card exposing
  the prop.
- **Expenses cannot be searched by payer name,** only by title and notes.
- **Reminder target members are stored by display name, not ID**
  (`src/components/reminders/ReminderModal.tsx:231`), which breaks on rename and duplicates.
- **Dialogs close before their async write resolves.** A failed save on the Grocery, Expense,
  and Bill dialogs does not restore the closed draft.
- **Physical-device QA is incomplete.** Bundles compile and the data layer is partially
  regression tested, but keyboard behaviour, hardware back, VoiceOver / TalkBack, and
  force-stop durability are unverified on real hardware. See
  [`docs/android-qa.md`](docs/android-qa.md).
- **`npm audit` reports 31 advisories** in the transitive dependency tree. No forced upgrades
  have been applied because the available fixes break Expo SDK 57 compatibility.

---

## License

Released under the [MIT License](LICENSE).

## Acknowledgements

Built on top of [Expo](https://expo.dev) and [React Native](https://reactnative.dev).