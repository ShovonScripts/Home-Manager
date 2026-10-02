# Home Manager — foundation stabilization report

Date: 2026-10-02

Scope: stabilize the existing Grocery, Expenses, Bills, Family/Household, navigation,
and theme foundation only. No app redesign and no new business modules.

## 1. Files modified or added

40 existing files modified; 11 files added. Complete inventory:

### App layout and existing screens

- **Modified** `src/app/_layout.tsx`
- **Modified** `src/app/bills.tsx`
- **Modified** `src/app/expenses.tsx`
- **Modified** `src/app/family.tsx`
- **Modified** `src/app/finance.tsx`
- **Modified** `src/app/grocery.tsx`
- **Modified** `src/app/index.tsx`
- **Modified** `src/app/more.tsx`
- **Modified** `src/app/settings.tsx`

### Existing feature components

- **Modified** `src/components/bills/BillCategoryChip.tsx`
- **Modified** `src/components/bills/BillItemCard.tsx`
- **Modified** `src/components/bills/BillModal.tsx`
- **Modified** `src/components/bills/BillSummaryCard.tsx`
- **Modified** `src/components/expenses/ExpenseCategoryChip.tsx`
- **Modified** `src/components/expenses/ExpenseItemCard.tsx`
- **Modified** `src/components/expenses/ExpenseItemModal.tsx`
- **Modified** `src/components/expenses/ExpenseSummaryCard.tsx`
- **Modified** `src/components/grocery/AddGroceryItemModal.tsx`
- **Modified** `src/components/grocery/GroceryCategoryChip.tsx`
- **Modified** `src/components/grocery/GroceryFilterBar.tsx`
- **Modified** `src/components/grocery/GroceryItemCard.tsx`
- **Modified** `src/components/grocery/GroceryItemModal.tsx`

### Reusable foundation components

- **Added** `src/components/common/AsyncState.tsx`
- **Added** `src/components/common/BackButton.tsx`
- **Added** `src/components/common/DatabaseGate.tsx`

### Existing contexts and services

- **Modified** `src/context/BillContext.tsx`
- **Modified** `src/context/ExpenseContext.tsx`
- **Modified** `src/context/GroceryContext.tsx`
- **Modified** `src/context/HouseholdContext.tsx`
- **Modified** `src/services/billService.ts`
- **Modified** `src/services/expenseService.ts`
- **Modified** `src/services/groceryService.ts`
- **Modified** `src/services/householdService.ts`

### Database and repositories

- **Modified** `src/storage/database.ts`
- **Added** `src/storage/migrations.ts`
- **Modified** `src/storage/repositories/billRepository.ts`
- **Modified** `src/storage/repositories/expenseRepository.ts`
- **Modified** `src/storage/repositories/groceryRepository.ts`
- **Modified** `src/storage/repositories/householdRepository.ts`

### Theme, types, and utilities

- **Modified** `src/constants/theme.ts`
- **Modified** `src/types/index.ts`
- **Modified** `src/utils/currency.ts`
- **Added** `src/utils/members.ts`

### Validation, dependencies, and documentation

- **Added** `docs/foundation-stabilization.md`
- **Added** `eslint.config.js`
- **Modified** `package-lock.json`
- **Modified** `package.json`
- **Added** `tests/database.test.cjs`
- **Added** `tests/modals.test.cjs`
- **Added** `tests/screens-and-contexts.test.cjs`
- **Added** `tests/support.cjs`

## 2. Bugs fixed

- Audited every `?` occurrence in `src/`. The checked-in currency defaults already
  contained `৳`; no blanket replacement was made. Household, expense, and bill reads,
  new writes, and formatted amounts now normalize the known legacy `?` currency
  placeholder to `৳`. Empty/missing currency also uses the existing taka default;
  other currencies are preserved.
- Expense payer and grocery assignee selections now save member IDs, not names.
  The older, currently unused add-grocery modal was corrected too.
- Expense form initialization now runs only when opening the modal or changing the
  edited record ID. Category/member array changes, equivalent edit-object replacements,
  theme updates, and ordinary rerenders no longer replace a draft. Grocery/Bill modals
  use the same session-boundary pattern.
- Expense search still supports payer names after ID-based storage.
- SQLite NULL grocery assignments are exposed as the existing optional/unassigned value.
- Expense edits now persist their currency value consistently with expense inserts.
- Removed the Home development status notice and its unused styles. No replacement
  statistics were introduced; the existing dashboard structure is preserved.
- Household member creation no longer announces success or clears the family form
  when the database write fails.
- Corrected dark-mode foregrounds on primary buttons/FABs, completed/paid text, and
  the bills summary divider using existing theme tokens. The palette is unchanged.
- Fixed the pre-existing clean-install failure: aligned React DOM to React 19.2.3,
  synchronized the stale lockfile, and added development-only lint/test tooling.
  Existing locked package versions were preserved except the incompatible React DOM
  19.3.0 entry, which is now 19.2.3. Expo/Router/RN/React versions are unchanged.

## 3. Architecture changes

- `DatabaseGate` eagerly initializes SQLite at the application root before mounting
  `HouseholdProvider`, navigation, or feature providers. Startup failures have a
  visible error and Retry action.
- Database opening and initialization each cache their in-flight promise. Concurrent
  callers share one connection and one successful setup; failed opens/setup are retriable.
  A failed migration/seed reuses the already-open connection rather than opening it twice.
- `getDatabase()` defensively awaits initialization, including for repository calls made
  outside the normal application startup path.
- Removed startup initialization from `HouseholdService`; household loading is no
  longer responsible for global database setup.
- Feature load callbacks depend on the household ID rather than the entire household
  object. Member/name/theme updates do not trigger unrelated feature reloads.
- Reusable `LoadingState`, `ErrorState`, and `BackButton` components reuse existing
  theme/spacing tokens. Feature modals remain mounted outside conditional loading/error
  content so those transitions do not discard an open draft.

## 4. Database changes

- Database filename remains **`homemanager.db`**.
- Version 1 is the **unchanged current schema**: same tables, columns, defaults,
  foreign keys, and indexes. Existing placeholder tables are retained, not implemented
  as new features.
- Added `PRAGMA user_version` tracking and an ordered migration runner.
- WAL and foreign-key configuration are preserved and occur before transactions.
- Existing first-run household, primary member, expense category, and task category
  seeds are preserved. Seeding is now transactional so a failure cannot leave a partial
  household that suppresses a subsequent seed retry.
- No destructive startup SQL, table rebuild, filename change, bulk rewrite, reset,
  record deletion, or unnecessary column migration was introduced. Existing
  user-initiated delete/clear actions are unchanged.

## 5. Data migration strategy

| Database state | Startup behavior |
| --- | --- |
| Fresh or legacy `user_version = 0` | Apply baseline `CREATE ... IF NOT EXISTS` statements; atomically set version 1. Existing objects/records are preserved. |
| `user_version = 1` | Skip baseline DDL; preserve records and existing seed behavior. |
| Future supported versions | Append migrations 2, 3, etc. Each migration and its version update commit together in a transaction. |
| Version newer than this app supports | Block startup with an update-app message; never downgrade or modify user records. |
| Migration or seed failure | Roll back that transaction and expose Retry. Do not delete or replace data. |

Do not modify a migration after it has shipped. Add future schema changes sequentially
in `src/storage/migrations.ts`; concise implementation comments explain this rule.

Legacy member names are **not** bulk-converted to IDs: matching by name is ambiguous
when names are duplicated. Currency corruption is normalized on read/display and
explicit writes, not by automatically modifying existing stored records.

## 6. Member ID behavior

- Add Expense defaults to the first available member's **ID**. With no member available,
  it cannot silently invent or store a `Primary User` payer string.
- Selecting a payer/assignee stores `member.id`; grocery unassigned values remain optional.
- Cards and modal labels first resolve a stored value by member ID, then display the
  stored string if there is no ID match. Unknown/deleted-member IDs and legacy names
  remain visible rather than disappearing.
- Editing a legacy record without reselecting its payer/assignee preserves that stored
  value. Explicitly choosing a member writes the chosen ID.
- New household member IDs use one timestamp plus a base-36 random suffix derived
  with `slice(2, 10)`: `member-${timestamp}-${randomSuffix}`. Touched ID generators use `slice()`,
  not deprecated `substr()`.

## 7. Loading/error behavior

- Loading shows an `ActivityIndicator` and **Loading...** text.
- Errors show an error icon, the actual error message (or a fallback), and **Retry**.
- Applied to Grocery, Expenses, Bills, Family, and household-dependent Home, Finance,
  and Settings screens, plus database startup.
- Retry re-queries the relevant data. If household loading failed or no household is
  available, it retries household loading too; it no longer leaves a permanent spinner.
- Load errors clear when a new load starts and when it succeeds. A missing household
  is an actionable error rather than a silent empty success.
- Database retries do not automatically repeat failed inserts/deletes; avoiding
  unintended duplicate writes is deliberate.

## 8. Navigation changes

- Chosen approach: **one native navigation header** for both Bills and Expenses.
- Removed Bills' duplicate custom header; both hidden routes now have a shared explicit
  back button. Back uses navigation history, with Finance as the direct-entry fallback.
- Bottom navigation remains **Home / Tasks / Grocery / Finance / More**.
  Bills and Expenses remain `href: null`, not bottom tabs.
- Tab bar sizing uses `useSafeAreaInsets()`: bottom padding is `max(insets.bottom, 8)`
  and height is `52 + bottomPadding`. The original 60-point height is retained on
  zero-inset devices; gesture/home-indicator space is reserved when present.

## 9. Accessibility changes

- Added useful labels and button roles to deletion controls, FABs, modal close/save
  controls, search clear buttons, back navigation, and existing navigation/menu rows.
- Bill paid/unpaid and grocery completion controls expose checkbox roles and checked state.
- Settings' dark-mode switch exposes its switch role, label, and checked state.
- Member/role choices expose radio checked state; category/status/month choices expose
  selected state. The family add button exposes busy/disabled state while saving.
- Small icon-only controls have hit slop where appropriate. Error messages expose alert
  semantics and loading/error text has basic live-region support.
- This is an incremental accessibility pass, not a full VoiceOver/TalkBack certification.

## 10. TypeScript and other validation results

| Check | Result |
| --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` | Exit 0; clean install succeeds without legacy-peer-deps or force. |
| **`npx tsc --noEmit`** | **Exit 0 — 0 errors. TypeScript strict remains enabled.** |
| `CI=1 EXPO_OFFLINE=1 npx expo lint` | Exit 0; 0 lint errors and 0 lint warnings. |
| `npm test` | Exit 0; **39 tests passed**, no failed/skipped tests. |
| Android and iOS production bundle export | Exit 0 for both platforms. |
| Version-1 versus original schema comparison | Exact match of SQLite table/index definitions, defaults, and foreign keys. |
| `git diff --check` | Pass. |

Regression coverage includes real in-memory SQLite transactions/records, concurrent
startup, failed opens/migrations/seeds and retries, legacy data preservation, member ID
persistence, currency normalization, modal session behavior and draft retention during
context/theme/load-state updates, real provider retry propagation, navigation options,
safe-area sizing (0/24/34/48), theme tokens, and accessibility props.

Android/iOS export command:

```sh
CI=1 EXPO_OFFLINE=1 npx expo export --platform android --platform ios --max-workers 2 --output-dir /home/user/.cache/home-manager-native-export
```

Export artifacts were kept outside Git. Tests require Node 22.13+ (the Expo SDK 57
minimum); this run used Node 22.22.3. The test-only Node SQLite adapter emits an
experimental warning, and React's test renderer emits its deprecation warning; neither
is a TypeScript/test failure or an app runtime dependency change. Native UI boundaries
are mocked in component tests; these are not physical-device test results.

## 11. Remaining known issues / limits

1. **Physical-device smoke testing is still needed.** Android/iOS bundles compile and
   the regression tests pass, but this sandbox did not run the app on an actual phone.
   Check iPhone home indicators, Android gesture/button navigation, keyboard/modal
   interactions, VoiceOver/TalkBack, and native Expo SQLite against a backup of an
   existing installation. Web-specific SQLite runtime setup was not validated.
2. **Existing Home/Finance summary values are placeholders.** They were intentionally
   left unchanged rather than inventing statistics or implementing dashboard integration.
3. **Legacy names remain legacy strings until explicit reselection.** Unresolved member
   references display the stored value. This is the requested safe compatibility behavior,
   not a destructive or name-guessing migration.
4. **Existing Grocery/Expense/Bill save-close timing remains unchanged.** Those forms
   still close before their asynchronous write completes. Write errors are now exposed
   by the screen's error state, but a failed save does not retain that closed dialog's
   draft. This existing workflow was not rewritten as part of the requested load/reset pass.
5. **Dependency audit remains nonzero:** `npm audit` reports 16 advisories (12 moderate,
   4 high, 0 critical). Some proposed automatic fixes would replace Expo 57 with an
   incompatible older SDK; no forced fix or broad framework upgrade was applied.

For a device smoke test: open each existing module, add/edit an expense and grocery
assignment, verify the selected member name and underlying stored ID, reopen/cancel
forms, switch theme, exercise paid/completed controls and navigation, restart the app,
and verify all pre-existing records are still present. Keep a backup; do not reset the
installation to test this upgrade.

**Stopped after stabilization.** Tasks, Calendar, Reminders, Notes, Income, Budget,
cloud sync, authentication, notifications, and AI features were not implemented.
