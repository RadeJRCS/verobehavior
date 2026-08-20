# supabase/ — what this is

A written snapshot of the current database state (tables, RLS policies), plus
a draft proposal for RLS policies not yet applied. Everything here is
documentation and review material — **nothing in this folder is executed
automatically** by this repo, its build, or its deploy pipeline. Nothing runs
against the live database unless a human deliberately copies SQL from here
into the Supabase SQL editor (or a migration tool) and runs it on purpose.

## Folder structure

```
supabase/
  schema/
    01_clients.sql          APPLIED  — reconstruction of the clients table
    02_existing_tables.sql  DOCS     — column inventory only, not DDL
  policies/
    01_clients_policies.sql APPLIED  — the one known live policy on clients
    02_PROPOSED_rls.sql     PROPOSED — draft policies, NOT applied
  NOTES.md                  this file
```

## APPLIED vs PROPOSED

**APPLIED** = describes something that already exists and is live in the
Supabase project today:
- `schema/01_clients.sql` — the `clients` table (columns, indexes, RLS
  enabled). Written from the table description you provided, not exported
  from the database, so treat it as a best-effort reconstruction, not a
  guaranteed-exact copy.
- `policies/01_clients_policies.sql` — the "Users read own client rows"
  SELECT policy, exact text as given.

**PROPOSED** = draft only, has not been run against anything:
- `policies/02_PROPOSED_rls.sql` — SELECT (ownership-gated) and INSERT
  (anon, where genuinely needed) policies for `sessions`, `tests`,
  `test_results`, `backlog`. Read the warning at the top of that file before
  anything else — applying it without first checking the existing unknown
  policies on those tables could be a no-op or worse.

**DOCS-only, not schema, not policy** = `schema/02_existing_tables.sql`. We
(this session) did not create `sessions`/`tests`/`test_results`/`backlog`,
so their real column types/defaults/constraints aren't reliably known here.
That file lists only what the application code touches, explicitly to avoid
inventing a schema that could silently diverge from reality.

## How to export the full DDL from Supabase

To make `schema/02_existing_tables.sql` complete and authoritative (real
types, defaults, constraints, foreign keys, existing RLS policy text), pull
the real definitions from Supabase directly. Any of these work:

1. **Dashboard, easiest:** Project → Database → Tables → open a table → the
   "..." menu (or the table's detail view) shows its definition. Project →
   Database → Policies lists every RLS policy with its exact `USING`/`WITH
   CHECK` text per table.
2. **Dashboard SQL editor:** run `select * from pg_policies where schemaname
   = 'public';` to dump every existing policy's exact text in one query —
   this is the fastest way to resolve the "NEEDS VERIFICATION" notes below.
3. **Supabase CLI** (if/when linked to the project): `supabase db dump
   --schema public -f schema.sql` produces a full `pg_dump`-style DDL file.
4. **Table Editor → Database → Schema Visualizer** gives a visual ER diagram
   plus per-table definitions.

Once you have real output from any of the above, replace the column-inventory
comments in `schema/02_existing_tables.sql` with the actual `CREATE TABLE`
statements.

## Required console change: auth email templates (2026-08-20)

`app/auth/callback/route.ts` verifies `token_hash` + `type` via
`verifyOtp()` — it does **not** rely on Supabase's own hosted `/verify`
redirect chain. For this to work, the **"Confirm signup"** and **"Reset
Password"** templates (Authentication → Email Templates in the dashboard)
must link directly to this route with those params, not use the default
`{{ .ConfirmationURL }}` variable:

- Confirm signup: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email`
- Reset Password: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery`

**Why this matters:** `{{ .ConfirmationURL }}` points at Supabase's own
`/auth/v1/verify` endpoint first. That endpoint verifies the token
server-side (so the account *does* get confirmed) and then 303-redirects
to `redirect_to` — but diagnosed 2026-08-20 against a live test signup,
that redirect carried no `code` param at all, so `exchangeCodeForSession()`
in the old version of this route was never reached, `create_client_if_missing()`
never ran, and the user landed on `/login` with no `clients` row despite a
successfully confirmed account. Linking directly to this route with
`token_hash`+`type` skips that hop entirely and is the flow Supabase's own
SSR docs recommend.

## Open questions for senior review

1. **Real `auth.uid()` RLS (Option 2) vs. keep the current helper-based
   isolation.** Today, isolation is enforced in application code
   (`lib/auth/getOwnedKeys.ts` + per-route `.eq()`/`.in()` filtering), not by
   RLS matching `auth.uid()`. This is proven working end-to-end (`GET
   /api/sessions?key=<not-owned>` returns 403). The question is whether to
   also add DB-level enforcement (this file's proposal) as defense-in-depth,
   and whether that's worth the migration work below.
2. **The 2 existing policies on `sessions`** — exact text unknown from this
   repo. Need to confirm whether they're permissive for `anon` (suspected,
   since the app currently reads/writes this table entirely through the
   anon key and it works). This directly gates whether
   `policies/02_PROPOSED_rls.sql` can be applied as-is or needs the old
   policies dropped/rewritten first (see the warning at the top of that
   file). Worth checking `tests`/`test_results`/`backlog` for the same thing
   while at it — their policy text isn't known either.
3. **POST/PATCH/DELETE on `/api/tests` and `/api/backlog` have no ownership
   check.** Only the GET routes were brought into scope for the per-owner
   access work so far. A signed-in user can currently create/modify/delete
   tests or backlog items for any `client_key`, not just their own.
4. **Anon client vs. authenticated client per route** — see the per-table
   notes in `policies/02_PROPOSED_rls.sql` for exactly which route files
   would need to move from `lib/supabase.ts` / local `getSupabase()` to
   `lib/supabase/server.ts` for the proposed SELECT policies to have any
   effect. Not done in this step by design.
5. **Naming:** the test-results route was renamed from
   `app/api/tests-results/` (plural, matched by nothing) to
   `app/api/test-results/` (singular, matches the snippet, dashboard, and
   docs) as part of the per-owner access work. Worth a sanity check that
   nothing external still points at the old plural path.
6. **`app/api/geo/route.ts` is dead code** — near-duplicate of
   `/api/geo-audit`, nothing in the codebase calls it. Candidate for
   deletion, unrelated to auth/RLS.
7. **Infra housekeeping, unrelated to auth:** `next/font` migration (fonts
   currently load via a Google Fonts CSS `@import` in `globals.css`, not
   `next/font`), the local Node version (v21.7.3) vs. `@supabase/*`'s
   `>=22.0.0` engine requirement, and `npm audit` currently reporting 4 high
   severity vulnerabilities. None of these are blocking, all flagged
   previously, none acted on yet.
