-- =============================================================================
-- clients — reconstruction of existing table state
-- =============================================================================
-- This table already exists in the live Supabase project. It was created
-- manually through the Supabase console, not via a migration file. This SQL
-- is a best-effort RECONSTRUCTION of that table for documentation and
-- disaster-recovery purposes (e.g. recreating it in a fresh/local project),
-- written to be idempotent so running it against the live database (which
-- already has this table) is a safe no-op.
--
-- This file is NOT executed automatically by anything in this repo or its
-- deploy pipeline. Nothing runs it unless a human deliberately pastes it
-- into the Supabase SQL editor.
--
-- Column list and constraints per the brief given for this table:
--   id uuid PK, client_key text unique not null,
--   owner_id uuid -> auth.users(id) on delete set null,
--   company_name text, created_at timestamptz default now(),
--   is_active boolean default true.
-- Indexes on client_key and owner_id. RLS is enabled on this table live.
-- =============================================================================

create table if not exists clients (
  -- Assuming the standard Supabase default (gen_random_uuid(), via the
  -- pgcrypto/pgcrypto-equivalent built into Postgres 13+) for the uuid PK
  -- default. Not independently confirmed against the live table — verify
  -- when the full DDL is exported (see supabase/NOTES.md).
  id uuid primary key default gen_random_uuid(),
  client_key text not null unique,
  owner_id uuid references auth.users(id) on delete set null,
  company_name text,
  created_at timestamptz not null default now(),
  is_active boolean not null default true
);

create index if not exists idx_clients_client_key on clients (client_key);
create index if not exists idx_clients_owner_id on clients (owner_id);

-- RLS is already enabled live on this table. Included here for completeness
-- of the reconstruction — re-running this on a table that already has RLS
-- enabled is a safe no-op.
alter table clients enable row level security;
