-- Adds subscription-related fields to user_profiles. Adjust table name if your profile table differs.
alter table public.user_profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text,
  add column if not exists trial_ends_at timestamptz;
