create table if not exists public.ad_research_selections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles(id) on delete cascade,
  name text,
  selection_ids jsonb,
  created_at timestamptz default now()
);

create index if not exists ad_research_selections_user_id_idx
  on public.ad_research_selections(user_id);

alter table public.ad_research_selections enable row level security;

create policy "ad_research_selections_select_own"
  on public.ad_research_selections
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "ad_research_selections_insert_own"
  on public.ad_research_selections
  for insert
  to authenticated
  with check (user_id = auth.uid());
