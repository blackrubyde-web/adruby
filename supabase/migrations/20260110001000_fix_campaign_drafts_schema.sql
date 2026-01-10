-- FIX: Change strategy_blueprint_id from UUID to TEXT
-- This migration fixes the schema mismatch between DB (UUID) and UI (TEXT)

-- Drop existing foreign key constraint
alter table public.campaign_drafts 
  drop constraint if exists campaign_drafts_strategy_blueprint_id_fkey;

-- Change column type from UUID to TEXT
alter table public.campaign_drafts 
  alter column strategy_blueprint_id type text using strategy_blueprint_id::text;

-- Add new foreign key constraint pointing to strategy_blueprints (TEXT id)
alter table public.campaign_drafts 
  add constraint campaign_drafts_strategy_blueprint_id_fkey 
  foreign key (strategy_blueprint_id) 
  references public.strategy_blueprints(id) 
  on delete set null;
