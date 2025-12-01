-- Create table to store scraped ads per research job
create table if not exists public.ad_research_ads (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null,
  ad_library_id text,
  page_id text,
  page_name text,
  primary_text text,
  headline text,
  description text,
  image_url text,
  video_url text,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

-- Index for quicker lookups by job
create index if not exists idx_ad_research_ads_job_id
  on public.ad_research_ads (job_id);

-- Enable Row Level Security
alter table public.ad_research_ads enable row level security;

-- Allow full access for service role (used by Netlify functions)
create policy "Allow all for service role"
  on public.ad_research_ads
  for all
  to service_role
  using (true)
  with check (true);
