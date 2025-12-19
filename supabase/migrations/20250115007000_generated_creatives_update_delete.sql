-- Allow authenticated users to update/delete their own generated creatives
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'generated_creatives'
      AND policyname = 'generated_creatives_update_own'
  ) THEN
    CREATE POLICY "generated_creatives_update_own"
      ON public.generated_creatives
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'generated_creatives'
      AND policyname = 'generated_creatives_delete_own'
  ) THEN
    CREATE POLICY "generated_creatives_delete_own"
      ON public.generated_creatives
      FOR DELETE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;
