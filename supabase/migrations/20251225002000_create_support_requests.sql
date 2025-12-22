create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

alter table public.support_requests enable row level security;

create policy "support_requests_insert"
  on public.support_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id or user_id is null);

create policy "support_requests_select_own"
  on public.support_requests
  for select
  to authenticated
  using (auth.uid() = user_id);
