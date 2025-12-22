alter table public.user_profiles
  add column if not exists avatar_url text,
  add column if not exists settings jsonb default '{}'::jsonb;

select pg_notify('pgrst', 'reload schema');
