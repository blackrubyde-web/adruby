-- supabase/migrations/20251224120000_ai_learning.sql
-- Table to store AI recommendation outcomes for continuous learning

create extension if not exists "uuid-ossp";

create table ai_learning (
  id uuid primary key default uuid_generate_v4(),
  campaign_id text not null,
  recommendation text not null,
  confidence integer not null,
  reason text,
  applied_action text,
  success boolean,
  created_at timestamptz not null default now()
);

-- Enable row level security (optional, can be adjusted later)
alter table ai_learning enable row level security;

-- Policy: allow service role to insert
create policy "service_role_insert" on ai_learning for insert using (true);
