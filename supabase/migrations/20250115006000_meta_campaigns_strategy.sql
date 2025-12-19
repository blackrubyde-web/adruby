alter table if exists public.meta_campaigns
  add column if not exists strategy_id text references public.strategy_blueprints(id);

create index if not exists meta_campaigns_strategy_id_idx
  on public.meta_campaigns(strategy_id);
