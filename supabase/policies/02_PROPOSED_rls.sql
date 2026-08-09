-- =============================================================================
-- PROPOSED — NOT APPLIED. Pending senior review before execution.
-- =============================================================================
-- Nothing in this file has been run against the database. It is a draft for
-- review: what RLS policies on sessions, tests, test_results, and backlog
-- would need to look like to make auth.uid() the real security boundary,
-- instead of (or in addition to) the current application-level filtering
-- done in lib/auth/getOwnedKeys.ts.
--
-- CRITICAL PRE-REQUISITE, read before applying any of this:
-- sessions (and possibly tests/test_results/backlog) already has RLS
-- policies whose exact text is NOT known here (see NEEDS VERIFICATION notes
-- in supabase/schema/02_existing_tables.sql). Postgres RLS policies of the
-- same command type (e.g. multiple SELECT policies) are combined with OR,
-- not AND. If an existing policy already permits anon (or authenticated)
-- to read every row, simply ADDING the restrictive policies below will NOT
-- tighten anything — the old permissive policy still applies and still
-- allows full access. The existing policies must be inspected, and likely
-- dropped or rewritten, alongside applying anything proposed here. This is
-- exactly why this step is proposal-only and needs senior review, not a
-- copy-paste.
--
-- Scope of what's proposed below: SELECT (ownership-gated, authenticated)
-- and INSERT (anon, where the snippet genuinely needs it) for each table.
-- UPDATE/DELETE policies are NOT covered here — today's PATCH/DELETE routes
-- for tests and backlog have no ownership check at the application level
-- either (see supabase/NOTES.md open questions), so proposing DB-level
-- policies for operations the app doesn't yet gate consistently would be
-- premature.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- sessions
-- -----------------------------------------------------------------------------

-- PROPOSED: an authenticated user may only read sessions whose client_key
-- they own, via clients.owner_id, and only for active clients.
create policy "Owners read their own sessions"
  on sessions
  for select
  to authenticated
  using (
    client_key in (
      select client_key from clients
      where owner_id = (select auth.uid())
        and is_active = true
    )
  );

-- PROPOSED: the tracking snippet writes analysis results from anonymous
-- site visitors (no Supabase session exists at that point) via
-- POST /api/analyze. This must stay permissive for anon, or the snippet
-- stops recording sessions on every client site.
create policy "Anon can insert sessions (snippet writes)"
  on sessions
  for insert
  to anon
  with check (true);

-- For the SELECT policy above to actually restrict anything, these routes
-- would need to move off the anon client (lib/supabase.ts / local
-- getSupabase()) onto the authenticated client (lib/supabase/server.ts):
--   - app/api/sessions/route.ts   (GET)
--   - app/api/patterns/route.ts   (GET — also reads the sessions table)
-- POST /api/analyze must keep using the anon client — do not migrate it.


-- -----------------------------------------------------------------------------
-- tests
-- -----------------------------------------------------------------------------

create policy "Owners read their own tests"
  on tests
  for select
  to authenticated
  using (
    client_key in (
      select client_key from clients
      where owner_id = (select auth.uid())
        and is_active = true
    )
  );

-- The snippet does not insert into `tests` — it only reads active tests
-- (GET /api/tests). Test rows are created by the dashboard ("Launch A/B
-- Test") and the public /demo page, and both currently go through
-- app/api/tests/route.ts POST, which still uses the anon client today (not
-- migrated as part of Step 3). This policy is proposed to match that
-- current reality, not because anon insert is fundamentally required here
-- the way it is for sessions/test_results.
create policy "Anon can insert tests (write route not yet migrated)"
  on tests
  for insert
  to anon
  with check (true);

-- For the SELECT policy above to have effect:
--   - app/api/tests/route.ts (GET) — only its authenticated branch. The
--     route is dual-purpose (see Step 3); the anonymous/snippet branch
--     (status=active, no session) must keep using the anon client
--     unconditionally, or A/B tests stop being delivered to client sites.
--
-- Once app/api/tests/route.ts POST is migrated to the authenticated
-- client, the anon INSERT policy above could be dropped in favor of an
-- authenticated + ownership-checked one.


-- -----------------------------------------------------------------------------
-- test_results
-- -----------------------------------------------------------------------------

-- test_results rows carry test_id but not client_key directly, so ownership
-- is resolved by joining through tests — same linkage app/api/test-results
-- /route.ts (GET) already does in application code.
create policy "Owners read their own test results"
  on test_results
  for select
  to authenticated
  using (
    test_id in (
      select id from tests
      where client_key in (
        select client_key from clients
        where owner_id = (select auth.uid())
          and is_active = true
      )
    )
  );

-- The snippet writes variant views/conversions for anonymous site visitors
-- via POST /api/test-results. Must stay open for anon.
create policy "Anon can insert test results (snippet writes)"
  on test_results
  for insert
  to anon
  with check (true);

-- For the SELECT policy above to have effect:
--   - app/api/test-results/route.ts (GET only).
-- POST /api/test-results must keep using the anon client — do not migrate.


-- -----------------------------------------------------------------------------
-- backlog
-- -----------------------------------------------------------------------------

create policy "Owners read their own backlog items"
  on backlog
  for select
  to authenticated
  using (
    client_key in (
      select client_key from clients
      where owner_id = (select auth.uid())
        and is_active = true
    )
  );

-- The snippet never writes to backlog. Items are created by the dashboard's
-- POST /api/backlog, which still uses the anon client today (not migrated).
-- Proposed to match current behavior; could be tightened to
-- authenticated-only once that route is migrated.
create policy "Anon can insert backlog items (write route not yet migrated)"
  on backlog
  for insert
  to anon
  with check (true);

-- For the SELECT policy above to have effect:
--   - app/api/backlog/route.ts (GET)
