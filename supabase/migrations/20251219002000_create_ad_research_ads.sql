create table if not exists public.ad_research_ads (
  id uuid primary key default gen_random_uuid(),
  job_id text,
  ad_library_id text,
  page_id text,
  page_name text,
  primary_text text,
  headline text,
  description text,
  image_url text,
  video_url text,
  raw_payload jsonb,
  created_at timestamptz default now()
);

create index if not exists ad_research_ads_created_at_idx
  on public.ad_research_ads (created_at desc);

create index if not exists ad_research_ads_job_id_idx
  on public.ad_research_ads (job_id);

create index if not exists ad_research_ads_library_id_idx
  on public.ad_research_ads (ad_library_id);

alter table public.ad_research_ads enable row level security;
