-- Add status and progress columns to generated_creatives to support incremental updates
alter table if exists public.generated_creatives
  add column if not exists status text default 'pending',
  add column if not exists progress integer default 0,
  add column if not exists progress_meta jsonb default '{}'::jsonb;

-- optional index for fast lookup by status
create index if not exists generated_creatives_status_idx
  on public.generated_creatives(status);
