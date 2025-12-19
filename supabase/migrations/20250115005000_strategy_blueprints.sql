create table if not exists public.strategy_blueprints (
  id text primary key,
  title text not null,
  category text,
  raw_content_markdown text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.generated_creatives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles(id) on delete cascade,
  blueprint_id text references public.strategy_blueprints(id) on delete set null,
  inputs jsonb,
  outputs jsonb,
  score double precision,
  saved boolean default false,
  created_at timestamptz default now()
);

create index if not exists generated_creatives_user_id_idx
  on public.generated_creatives(user_id);

create index if not exists generated_creatives_blueprint_id_idx
  on public.generated_creatives(blueprint_id);

alter table public.strategy_blueprints enable row level security;
alter table public.generated_creatives enable row level security;

create policy "strategy_blueprints_select"
  on public.strategy_blueprints
  for select
  to authenticated
  using (true);

create policy "generated_creatives_select_own"
  on public.generated_creatives
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "generated_creatives_insert_own"
  on public.generated_creatives
  for insert
  to authenticated
  with check (user_id = auth.uid());
