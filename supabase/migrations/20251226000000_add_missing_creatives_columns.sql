-- Add missing columns to generated_creatives table to match frontend usage
alter table if exists public.generated_creatives
  add column if not exists thumbnail text,
  add column if not exists metrics jsonb default '{}'::jsonb;

-- Add index on metrics if needed (optional, but good for filtering if we query deep)
-- For now just columns are enough to fix the 400 error.
