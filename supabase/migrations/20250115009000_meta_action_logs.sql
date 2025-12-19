create table if not exists public.meta_action_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles(id) on delete cascade,
  campaign_id text not null,
  action text not null,
  params jsonb,
  response jsonb,
  success boolean default false,
  error_message text,
  created_at timestamptz default now()
);

create index if not exists meta_action_logs_user_id_idx on public.meta_action_logs (user_id);
create index if not exists meta_action_logs_campaign_id_idx on public.meta_action_logs (campaign_id);

alter table public.meta_action_logs enable row level security;

create policy "meta_action_logs_read_own"
  on public.meta_action_logs
  for select
  using (auth.uid() = user_id);

create policy "meta_action_logs_insert_own"
  on public.meta_action_logs
  for insert
  with check (auth.uid() = user_id);
