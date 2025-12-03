-- Strategy blueprints (idempotent create)
create table if not exists public.strategy_blueprints (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  name text not null,
  industry text not null default 'generic',
  primary_goal text not null default 'sales',
  blueprint_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists strategy_blueprints_industry_goal_idx
  on public.strategy_blueprints (industry, primary_goal);

-- Ad strategies table (create if missing)
create table if not exists public.ad_strategies (
  id uuid default gen_random_uuid() primary key,
  ad_variant_id uuid not null references public.ad_variants (id) on delete cascade,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  blueprint_key text,
  answers jsonb,
  selected_strategy jsonb not null,
  matching_score integer,
  confidence_level text,
  ai_analysis jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ad_strategies_ad_variant_idx
  on public.ad_strategies (ad_variant_id);

-- If ad_strategies already exists, ensure required columns exist
do $$ begin
  begin alter table public.ad_strategies add column blueprint_key text; exception when duplicate_column then null; end;
  begin alter table public.ad_strategies add column answers jsonb; exception when duplicate_column then null; end;
  begin alter table public.ad_strategies add column selected_strategy jsonb; exception when duplicate_column then null; end;
  begin alter table public.ad_strategies add column matching_score integer; exception when duplicate_column then null; end;
  begin alter table public.ad_strategies add column confidence_level text; exception when duplicate_column then null; end;
  begin alter table public.ad_strategies add column ai_analysis jsonb; exception when duplicate_column then null; end;
end $$;

-- Meta ads setups table (create if missing)
create table if not exists public.meta_ads_setups (
  id uuid default gen_random_uuid() primary key,
  ad_strategy_id uuid not null references public.ad_strategies (id) on delete cascade,
  campaign_config jsonb not null,
  adsets_config jsonb not null,
  ads_config jsonb not null,
  recommendations jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meta_ads_setups_strategy_idx
  on public.meta_ads_setups (ad_strategy_id);
