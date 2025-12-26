# Supabase Migrations - AdRuby

## Quick Start

### Option 1: Supabase CLI (Recommended)
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option 2: Manual SQL Execution
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Copy & paste each migration file in order:
   - `001_create_generated_creatives.sql`
   - `002_create_meta_insights_daily.sql`
4. Click **Run** for each

---

## Migrations

### 001_create_generated_creatives.sql
**Purpose:** Stores AI-generated ad creatives

**Tables:**
- `generated_creatives` - Main table for ad creatives

**Features:**
- ✅ UUID primary key
- ✅ User relationship with CASCADE delete
- ✅ JSONB fields for flexible data
- ✅ Timestamps (created_at, updated_at)
- ✅ Performance indexes
- ✅ RLS policies (users can only access their own data)
- ✅ Auto-update trigger for updated_at

**Columns:**
- `id` - UUID primary key
- `user_id` - References auth.users
- `thumbnail` - Image URL
- `outputs` - JSONB (AI generation results)
- `inputs` - JSONB (generation parameters)
- `saved` - Boolean (library vs temp)
- `metrics` - JSONB (performance data)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### 002_create_meta_insights_daily.sql
**Purpose:** Stores daily Meta Ads performance metrics

**Tables:**
- `meta_insights_daily` - Daily insights from Meta Ads API

**Features:**
- ✅ UUID primary key
- ✅ User relationship with CASCADE delete
- ✅ Date-based partitioning ready
- ✅ Unique constraint (no duplicates)
- ✅ Performance indexes
- ✅ RLS policies
- ✅ Auto-update trigger

**Columns:**
- `id` - UUID primary key
- `user_id` - References auth.users
- `ad_account_id` - Meta Ad Account ID
- `campaign_id` - Meta Campaign ID
- `adset_id` - Meta AdSet ID
- `ad_id` - Meta Ad ID
- `date` - DATE (for daily aggregation)
- `impressions` - Integer
- `clicks` - Integer
- `spend` - Numeric(10,2)
- `revenue` - Numeric(10,2)
- `conversions` - Integer
- `ctr` - Numeric(5,2) - Click-through rate
- `cpc` - Numeric(10,2) - Cost per click
- `cpm` - Numeric(10,2) - Cost per mille
- `roas` - Numeric(10,2) - Return on ad spend
- `raw_data` - JSONB (full API response)
- `created_at` - Timestamp
- `updated_at` - Timestamp

---

## Security (RLS)

All tables have **Row Level Security** enabled with policies:
- ✅ Users can **SELECT** only their own data
- ✅ Users can **INSERT** only with their own user_id
- ✅ Users can **UPDATE** only their own data
- ✅ Users can **DELETE** only their own data

**Service role** has full access for backend operations.

---

## Verification

After running migrations, verify in Supabase Dashboard:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('generated_creatives', 'meta_insights_daily');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('generated_creatives', 'meta_insights_daily');

-- Check policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('generated_creatives', 'meta_insights_daily');
```

Expected output:
- 2 tables found
- `rowsecurity = true` for both
- 4 policies per table (SELECT, INSERT, UPDATE, DELETE)

---

## Troubleshooting

**Error: "relation already exists"**
- Tables already created ✅
- Re-run is safe (IF NOT EXISTS)

**Error: "policy already exists"**
- Policies already created ✅
- Re-run is safe (IF NOT EXISTS check in DO block)

**Error: "permission denied"**
- Run as **postgres** role or **service_role**
- Check Supabase project permissions

**RLS blocking access in app?**
- Verify user is authenticated
- Check `auth.uid()` matches `user_id`
- Test with service_role key (bypasses RLS)

---

## Next Steps

1. ✅ Run migrations
2. ✅ Verify tables exist
3. ✅ Test Creative Library (should no longer show 400 error)
4. ✅ Test Overview Page (meta_insights_daily warning should disappear)
5. 🔄 Set up Meta Ads sync (optional - populates meta_insights_daily)

---

## Storage Buckets

The app also needs these Supabase Storage buckets:

```sql
-- Create buckets (run in SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('creative-renders', 'creative-renders', true),
    ('creative-inputs', 'creative-inputs', true)
ON CONFLICT (id) DO NOTHING;

-- Set bucket policies (public read)
CREATE POLICY "Public read for creative-renders"
ON storage.objects FOR SELECT
USING (bucket_id = 'creative-renders');

CREATE POLICY "Authenticated upload for creative-renders"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'creative-renders' AND auth.role() = 'authenticated');
```

---

**Status:** Ready to deploy! 🚀
