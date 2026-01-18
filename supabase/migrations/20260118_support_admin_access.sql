-- Add admin access policy for support_requests

-- Allow admins to read all support requests
create policy if not exists "support_requests_admin_read" 
  on public.support_requests
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles 
      where user_profiles.id = auth.uid() 
      and user_profiles.role = 'admin'
    )
  );

-- Allow admins to update all support requests
create policy if not exists "support_requests_admin_update"
  on public.support_requests
  for update
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles 
      where user_profiles.id = auth.uid() 
      and user_profiles.role = 'admin'
    )
  );

-- Add updated_at column if missing
alter table public.support_requests 
  add column if not exists updated_at timestamptz;
