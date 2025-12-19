create table if not exists public.meta_strategy_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  strategy_id text references public.strategy_blueprints(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists meta_strategy_assignments_unique
  on public.meta_strategy_assignments(user_id, entity_type, entity_id);

alter table public.meta_strategy_assignments enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'meta_strategy_assignments'
      AND policyname = 'meta_strategy_assignments_select_own'
  ) THEN
    CREATE POLICY "meta_strategy_assignments_select_own"
      ON public.meta_strategy_assignments
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'meta_strategy_assignments'
      AND policyname = 'meta_strategy_assignments_insert_own'
  ) THEN
    CREATE POLICY "meta_strategy_assignments_insert_own"
      ON public.meta_strategy_assignments
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'meta_strategy_assignments'
      AND policyname = 'meta_strategy_assignments_update_own'
  ) THEN
    CREATE POLICY "meta_strategy_assignments_update_own"
      ON public.meta_strategy_assignments
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'meta_strategy_assignments'
      AND policyname = 'meta_strategy_assignments_delete_own'
  ) THEN
    CREATE POLICY "meta_strategy_assignments_delete_own"
      ON public.meta_strategy_assignments
      FOR DELETE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;
