# Android QA — blocked runtime / preflight report

Date: 2026-10-02

**Outcome: physical Android QA is BLOCKED; automated preflight checks PASS.**
This is not a native runtime, persistence, or release sign-off. The user selected
“Stop with a blocked-QA report” after the environment blocker was reported.

## Environment

- Expo SDK: **57**, installed `expo@57.0.26`; no SDK or dependency changes.
- React Native: `0.86.3`; React: `19.2.3`; Expo SQLite: `57.0.3`.
- Host: Linux x86-64 sandbox; Node `22.22.3`.
- Android device/emulator used: **none — no Android runtime accessible**.
- Android version: **not available**.
- No Android SDK, `adb`, Java, emulator executable, AVD, `/dev/kvm`, or USB device
  interface was found. The official SDK repository connectivity probe failed with
  `curl` exit 35 / `SSL_ERROR_SYSCALL`; no SDK was installed.

## Inspection and launch attempt

Read the foundation report, database initializer, migrations, all contexts,
services and repositories, and current routes/layout. Reviewed the existing modal
save, date, keyboard, and close behavior without changing it.

Ran `git status`, `npx tsc --noEmit`, `npm run lint`, and all existing tests before
any changes. The previous stabilization work remains intact and uncommitted.

Attempted:

```sh
CI=1 npx expo start --android --host lan --port 8081 --max-workers 2
```

Metro started, but Android launch exited **1** before the application ran:

```text
Failed to resolve the Android SDK path.
Default install location not found: /home/user/Android/Sdk.
Error: spawn adb ENOENT
```

The process exited; no development server was left running. No web preview was
used as a substitute for Android testing.

## Tests performed / coverage limits

All device-only checks below remain **not run**, not passed:

| Major area | Android runtime result |
| --- | --- |
| Startup, splash, household seeds, provider initialization, repeated launches | Not run — target unavailable |
| Home rendering and intended navigation; placeholder statistics retained | Not run — target unavailable |
| Grocery add/edit/complete/search/category/delete/clear-completed and member references | Not run — target unavailable |
| Expenses add/edit/totals/search/category/month/delete/draft/date behavior | Not run — target unavailable |
| Bills add/edit/paid status/filters/search/delete/dates/notes/header | Not run — target unavailable |
| Family add/remove/member-reference behavior | Not run — target unavailable |
| Navigation across five tabs and existing child/placeholder routes | Not run — target unavailable |
| Light/dark switching and visual readability | Not run — target unavailable |
| Grocery/Expense/Bill/Family keyboards, scrolling, save access and dismissal | Not run — target unavailable |
| Persistence after close/reopen, force stop and subsequent edits | Not run — target unavailable |
| Android hardware back: keyboard, modal, child screens and root | Not run — target unavailable |
| Native error/retry behavior and open-form retention | Not run — target unavailable |
| Typing, scrolling, repeated navigation and freeze/crash performance | Not run — target unavailable |
| Application Metro/logcat warnings, SQLite errors and unhandled rejections | Not run — app never launched on Android |

The **39 existing regression tests** passed twice during this pass. They exercise
real TypeScript/React logic with mocked native UI boundaries and an **in-memory
Node SQLite adapter**, including initialization/retry, non-destructive legacy
schema adoption, member IDs/fallbacks, draft retention, context recovery, header/tab
configuration, theme tokens and accessibility. They do **not** establish native
keyboard/back behavior, actual screen appearance or force-stop durability.

Expected test-only Node SQLite experimental and React test-renderer deprecation
notices were observed; no warnings were blindly suppressed.

## Bugs found / fixes

- **Environment blocker:** missing Android SDK/ADB prevents launch. This is not a
  confirmed application bug; no application fix was made.
- **New application bugs confirmed:** none. With no Android execution, this is not
  evidence that the application is bug-free.
- **Application files changed:** none. All 84 existing non-ignored files matched
  the recorded baseline hashes after validation.
- **Only addition this phase:** `docs/android-qa.md` (this report).
- **Risk level:** no runtime change; documentation only.

## Bugs not fixed / intentional carry-forward

No newly confirmed Android bug was left unfixed. Previously documented limits
remain unchanged: Grocery/Expense/Bill dialogs close before asynchronous writes
finish, and dependency advisories remain as recorded in the foundation report.
Neither was newly verified on a device here.

Home/Finance totals and unfinished modules remain intentional placeholders, not
features to implement in this phase. No date picker, redesign, new package,
optimization refactor or warning suppression was introduced.

## Final validation

Required commands were rerun after inspection and the launch attempt:

```text
TypeScript:          PASS — npx tsc --noEmit, exit 0, 0 errors
Lint:                PASS — npm run lint, exit 0, 0 errors / 0 warnings
Tests:               PASS — npm test, exit 0, 39 passed / 0 failed / 0 skipped
Android:             Export PASS (exit 0); device/emulator launch BLOCKED (exit 1)
Persistence:         Native close/reopen/force-stop NOT VERIFIED
                     In-memory legacy-record preservation regression PASS
Git diff --check:    PASS — exit 0
```

Android production export command:

```sh
CI=1 EXPO_OFFLINE=1 npx expo export --platform android --max-workers 2 --output-dir /home/user/.cache/home-manager-android-qa-export
```

Export produced a roughly 3.3 MB Hermes bundle from 1,390 modules. This is JavaScript
bundle compilation, **not an APK build or an Android runtime test**. Artifacts and
raw validation logs are outside Git in the sandbox cache.

`git status` was inspected again. Existing stabilization changes were preserved;
no commit/push was made. Database code, filename `homemanager.db`, migration history,
record IDs and legacy fallback logic are unchanged. No production database was
opened, reset, deleted or overwritten, and no SQL was executed against user data.

**Stopped at the user's request.** Physical QA remains blocked pending an
Android-enabled environment or device evidence. No next development phase or new
business module was started.
