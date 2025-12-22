create table if not exists public.campaign_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  creative_ids text[] not null,
  strategy_blueprint_id uuid references public.campaign_strategy_blueprints(id) on delete set null,
  campaign_spec jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaign_drafts enable row level security;

create policy "campaign_drafts_select_own"
  on public.campaign_drafts
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "campaign_drafts_insert_own"
  on public.campaign_drafts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "campaign_drafts_update_own"
  on public.campaign_drafts
  for update
  to authenticated
  using (auth.uid() = user_id);
