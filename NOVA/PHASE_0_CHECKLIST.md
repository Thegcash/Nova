# ✅ Phase 0 — Verification Checklist

**Goal:** Ensure database schema, storage buckets, and environment variables are ready before building features.

---

## 🎯 Tasks

### 1. ✅ Verify Environment Variables

Copy `env.example` to `.env.local` and fill in:

```bash
cp env.example .env.local
```

**Required:**
- `SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_SERVICE_ROLE` — Service role key (Dashboard → Settings → API)
- `OPENAI_API_KEY` — OpenAI API key ([platform.openai.com](https://platform.openai.com/api-keys))

**Optional:**
- `SLACK_WEBHOOK_EXPERIMENTS` — Slack webhook for notifications
- `NEXT_PUBLIC_BASE_URL` — Base URL for exports (defaults to `http://localhost:3000`)

---

### 2. ✅ Run Database Migrations

**Action: You need to do this manually in Supabase Dashboard**

1. Go to [Supabase Dashboard](https://app.supabase.com) → Your Project → **SQL Editor**
2. Create new query
3. Paste contents of `migrations/002_experiments.sql`
4. Click **Run**
5. Repeat for `migrations/003_seed_demo_data.sql`

**What gets created:**

**Tables:**
- `exposures_daily` — Daily policy/unit snapshots (270 sample rows)
- `losses` — Claims data (36 sample claims)
- `guardrail_hits` — Violations (10 sample hits)
- `rate_plans` — Versioned pricing params (1 base plan)
- `experiments` — Backtest results (initially empty)

**Views:**
- `vw_policy_performance` — Monthly policy performance rollup

**Indexes & RLS:**
- Tenant-scoped row-level security on all tables
- Indexes for fast lookups by tenant, date, unit, policy

---

### 3. ✅ Create Storage Bucket

**Action: You need to do this manually in Supabase Dashboard**

1. Go to **Storage** tab
2. Click **Create a new bucket**
3. Bucket name: `filings`
4. **Public bucket:** ✅ Enabled (for demo; we'll sign links later)
5. Click **Create bucket**

**Alternative: Use script (after .env.local is set up):**

```bash
npx tsx scripts/create-bucket.ts
```

---

### 4. ✅ Verify Setup

Run the verification script:

```bash
npx tsx scripts/verify-setup.ts
```

**Expected output:**

```
🔍 Phase 0 — Verification

📋 Checking environment variables...
  ✅ SUPABASE_URL — OK
  ✅ SUPABASE_SERVICE_ROLE — OK
  ✅ OPENAI_API_KEY — OK
  ⚠️  SLACK_WEBHOOK_EXPERIMENTS — Optional, not set

🔌 Connecting to Supabase...

📊 Checking tables...
  ✅ exposures_daily — OK
  ✅ losses — OK
  ✅ guardrail_hits — OK
  ✅ rate_plans — OK
  ✅ experiments — OK

👁️  Checking views...
  ✅ vw_policy_performance — OK

🗄️  Checking storage buckets...
  ✅ filings — OK

📦 Checking for sample data...
  ✅ 270 exposures found for demo tenant
  ✅ 1 rate plans found for demo tenant

============================================================
✅ VERIFICATION PASSED

All required tables, views, and storage are ready.
Proceed to Phase 1 — Rating Engine
```

---

### 5. ✅ Test Database Connection

Quick manual test in Supabase SQL Editor:

```sql
-- Check demo tenant data
SELECT 
  'exposures' as table_name, 
  count(*) as rows 
FROM exposures_daily 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'

UNION ALL

SELECT 
  'losses', 
  count(*) 
FROM losses 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'

UNION ALL

SELECT 
  'rate_plans', 
  count(*) 
FROM rate_plans 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';
```

**Expected:**
```
table_name  | rows
------------|-----
exposures   | 270
losses      | 36
rate_plans  | 1
```

---

## 🚨 Troubleshooting

### "Missing SUPABASE_URL"
- Copy `env.example` to `.env.local`
- Fill in values from Supabase Dashboard → Settings → API

### "Table 'exposures_daily' does not exist"
- Run `migrations/002_experiments.sql` in Supabase SQL Editor

### "No exposures found for demo tenant"
- Run `migrations/003_seed_demo_data.sql` in Supabase SQL Editor

### "Bucket 'filings' not found"
- Create manually: Supabase Dashboard → Storage → Create bucket: `filings`
- Or run: `npx tsx scripts/create-bucket.ts`

---

## ✅ Phase 0 Complete

Once verification passes, you're ready for **Phase 1 — Rating Engine**.

**Next step:**
```bash
# Proceed to Phase 1
# Follow PHASE_1_RATING_ENGINE.md
```


