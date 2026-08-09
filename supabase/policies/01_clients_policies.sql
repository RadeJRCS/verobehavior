-- =============================================================================
-- clients table RLS policies — APPLIED, currently live in database
-- =============================================================================
-- This records a policy that already exists and is active on the live
-- Supabase project. It is a RECORD, not a script meant to be re-run blindly:
-- `create policy` has no IF NOT EXISTS in Postgres, so running this against
-- the live database (which already has this policy) will error with
-- "policy already exists". Keep that in mind before pasting this anywhere.
-- =============================================================================

-- APPLIED — currently live in database
create policy "Users read own client rows"
  on clients
  for select
  to authenticated
  using (owner_id = (select auth.uid()));
