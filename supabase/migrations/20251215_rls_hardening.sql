-- Ensure RLS enabled
alter table public.user_profiles enable row level security;
alter table public.credits enable row level security;
alter table public.affiliate_referrals enable row level security;

-- Users can read their own profile
create policy "user_profiles_select_own"
  on public.user_profiles
  for select
  using (auth.uid() = id);

-- Users can update limited fields on their own profile
create policy "user_profiles_update_own"
  on public.user_profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Prevent direct writes to subscription/payment flags from client
revoke update (payment_verified, onboarding_completed, stripe_customer_id, trial_status, trial_expires_at)
on public.user_profiles from authenticated, anon;

-- Credits table: user reads own row, no direct updates
create policy "credits_select_own"
  on public.credits
  for select
  using (auth.uid() = user_id);

revoke update on public.credits from authenticated, anon;

-- Affiliate referrals: user can read own referral status
create policy "affiliate_referrals_select"
  on public.affiliate_referrals
  for select
  using (auth.uid() = referred_user_id);

-- Service role exceptions (handled by Netlify functions) remain unrestricted.
