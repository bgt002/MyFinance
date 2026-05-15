# MyFinances — Work Log

Personal session handoff. Not for git. Read top-to-bottom to catch up.

---

## Where we are (2026-05-14)

Started linking the backend. **Accounts** are now persisted in local SQLite; everything else still reads from `src/data/dummy.ts`.

### Strategic calls made this session

- SQLite-only is fine to ship to both App Store and Play Store — no backend is required and "no data collected" is the cleanest privacy nutrition label / Data Safety form.
- But for a **public, paid launch**, cloud auth + opt-in cloud backup needs to land before launch — otherwise device loss = total data loss = 1-star reviews on a finance app.
- Order: SQLite now → ship/TestFlight → cloud auth+sync **before** public launch (not "much later").

### Backend direction (confirmed; deferred to user-testing phase)

**Replacing Supabase with a custom Postgres stack.** Motivation is skill development — the user wants the moving parts exposed, not hidden by a BaaS. **No code yet; everything stays local SQLite during development.**

Trigger to start building: **when ready to have users test the app** (e.g., TestFlight / Play Internal Testing). Not "much later" — testers will be entering data they don't want to lose between builds, and multi-tester / multi-device requires identity.

Confirmed stack:
- **Postgres**: Neon (free tier, branching DBs)
- **API**: Hono in TypeScript, hosted on Fly.io or Render
- **ORM/migrations**: Drizzle (SQL-shaped, TS-first)
- **Auth**: Better-Auth (config-driven, exposes session/provider mechanics; supports Sign in with Apple)
- **Sync**: hand-rolled in `src/sync/` calling the Hono API; last-write-wins by `updated_at` for v1

Open prerequisites when we resume:
- Decide monorepo (`/server` folder) vs sibling repo (`MyFinances-api`)
- Create Neon + Fly.io (or Render) accounts
- Skim Drizzle quickstart
- Decide what syncs over the wire (everything vs. accounts + summaries only)

### Why no dummy-seed on first install

User wants real data only. Fresh install opens to an empty Accounts screen. Add an account via the FAB; it persists. Do **not** seed `initialAccounts` into the DB for any future domain either (same rule will apply to transactions, goals, etc.).

---

## What's persisted vs. still dummy

| Domain | Storage | Notes |
|---|---|---|
| Accounts | SQLite (`accounts` table) | Real. CRUD wired through `useAccounts()`. |
| Transactions | `src/data/dummy.ts` | Next likely slice. |
| Goals | `src/data/dummy.ts` | |
| Dashboard summary (net worth, income, expenses) | `src/data/dummy.ts` | Will need recompute-from-accounts+transactions once both are real. |
| Spending analysis / Charts | `src/data/dummy.ts` | |

---

## Files added this session

- `src/db/client.ts` — singleton `getDb()` opens `myfinances.db`, runs migrations once.
- `src/db/migrations/index.ts` — `PRAGMA user_version` runner. WAL + foreign_keys on.
- `src/db/migrations/001_accounts.ts` — accounts table with sync-ready columns (`created_at`, `updated_at`, soft `deleted_at`).
- `src/db/repositories/accountsRepo.ts` — `listAccounts`, `getAccount`, `createAccount`, `updateAccount`, `deleteAccount` (soft).
- `src/hooks/useAccounts.ts` — accounts list + `addAccount` / `editAccount` / `removeAccount`.
- `src/utils/uuid.ts` — client-generated UUID v4 (sync-ready).
- `src/utils/relativeTime.ts` — derives "Just now / 2h ago / Updated MMM DD" from epoch ms.
- `src/components/sections/EditAccountModal.tsx` — full edit form (name, note, balance / creditLimit+owed, countInAsset, hideBalance).
- `src/components/sections/UpdateBalanceModal.tsx` — single-input quick balance editor; for credit cards mirrors `balance` into `owed`.

## Files modified

- `app/_layout.tsx` — eagerly calls `getDb()` on mount so migrations run before screens query.
- `src/components/sections/AccountsSection.tsx` — replaced `useState(initialAccounts)` with `useAccounts()`; wraps `BankLogo` in a 48px slot at size 36 so logos are visually balanced with icon-bubble rows; tracks `editingAccount` + `balanceAccount` and wires both modals to `useAccounts().editAccount`.
- `src/components/sections/AccountActionsSheet.tsx` — added `onEdit` + `onUpdateBalance` props; Edit Account and Update Balance rows now fire them.
- `src/components/sections/LogSection.tsx` — `AddTransactionModal` account picker now reads real accounts (old TODO resolved).

---

## Open follow-ups in the Accounts slice

- `AccountActionsSheet` → **View Details** — still no-ops to `onClose()`. User wants to decide what this screen contains before building it.
- Not editable in `EditAccountModal` v1: type, kind, category, icon, logoSlug. Changing those is effectively re-creating the account; flag if/when needed.
- Form-field helpers (`FieldGroup`, `TextFieldRow`, `NumericFieldRow`, `ToggleFieldRow`, `FieldDivider`) are duplicated between `AddAccountModal` and `EditAccountModal`. Easy extract to `src/components/ui/` later.

---

## Test plan (run before resuming)

1. `npm run ios` (or `android`).
2. Accounts tab opens **empty** — confirms dummy data is gone.
3. FAB → add a Debit Card with a bank logo. Confirm the logo looks proportional to the icon-bubble accounts (not oversized).
4. Add a Credit Card to exercise the credit-card branch (Owed / Credit Limit).
5. Tap an account → **Edit Account** → change name + balance → Save. Row updates immediately and after relaunch.
6. Tap an account → **Update Balance** → type new amount → Save. Same persistence check. Try with the credit card too.
7. Tap an account → **Delete** → confirm. Relaunch. Stays gone.
8. Log tab → tap a spend category → AddTransactionModal account picker lists the accounts you created.

---

## Likely next slice

Two natural directions:
- **View Details screen for accounts** — once the user decides what info goes there. Probably account-level transaction history, balance trend, edit/delete shortcuts.
- **Transactions** — natural next domain since `LogSection` depends on it. Once both accounts and transactions are real the dashboard can compute net worth from data instead of `dashboardSummary`.
- **DRY the form-field primitives** — small refactor, low risk, removes ~150 lines of duplication.

---

## Architecture invariants to preserve

- All SQLite reads/writes go through `src/db/repositories/`.
- Screens consume via hooks in `src/hooks/`, never direct DB.
- Every syncable row has client UUID + `created_at` + `updated_at` + soft `deleted_at`.
- Sync logic (when added) lives in `src/sync/`, separate from local CRUD.
- Migrations are append-only; bump version in the new file and add to the array in `src/db/migrations/index.ts`.
