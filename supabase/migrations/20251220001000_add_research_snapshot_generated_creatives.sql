-- Add research_snapshot column for creative generation context
alter table if exists public.generated_creatives
  add column if not exists research_snapshot jsonb default '[]'::jsonb;

-- ensure PostgREST picks up schema changes
select pg_notify('pgrst', 'reload schema');
