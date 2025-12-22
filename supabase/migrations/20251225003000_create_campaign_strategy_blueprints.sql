create table if not exists public.campaign_strategy_blueprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  creative_ids text[] not null,
  strategy jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaign_strategy_blueprints enable row level security;

create policy "campaign_strategy_blueprints_select_own"
  on public.campaign_strategy_blueprints
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "campaign_strategy_blueprints_insert_own"
  on public.campaign_strategy_blueprints
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "campaign_strategy_blueprints_update_own"
  on public.campaign_strategy_blueprints
  for update
  to authenticated
  using (auth.uid() = user_id);
