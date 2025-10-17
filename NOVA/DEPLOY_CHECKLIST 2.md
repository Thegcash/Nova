# Nova 2.0 — Staging Deploy Checklist

## ✅ Pre-Deploy Verification

### 1. Environment Variables (Vercel)

Go to Vercel → Project → Settings → Environment Variables

**Required:**
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGci...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_BASE_URL=https://your-vercel-domain.vercel.app
```

**Optional:**
```bash
SLACK_WEBHOOK_EXPERIMENTS=https://hooks.slack.com/services/...
SUPABASE_ANON_KEY=eyJhbGci...
FILING_TTL_SECONDS=86400
RATE_LIMIT_LLM_PER_HOUR=10
RATE_LIMIT_BACKTESTS_PER_HOUR=20
```

**Public (for client-side):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

### 2. Supabase Setup (Production Project)

#### A. Create Production Project
- Go to [Supabase Dashboard](https://app.supabase.com)
- Create new project (or use existing staging project)
- Wait for provisioning (~2 minutes)

#### B. Run Migrations (SQL Editor)

Execute in order:
1. `migrations/002_experiments.sql`
2. `migrations/003_seed_demo_data.sql` (or import real data)
3. `migrations/004_cohort.sql`
4. `migrations/005_observability_rls.sql`
5. `migrations/006_rate_limit.sql`

#### C. Create Storage Bucket

1. Go to **Storage** tab
2. Create bucket: `filings`
3. **Public bucket:** ❌ **Disabled** (private, use signed URLs)

#### D. Verify Data

```sql
select 'exposures' as table_name, count(*) as rows from exposures_daily
union all select 'losses', count(*) from losses
union all select 'rate_plans', count(*) from rate_plans
union all select 'experiments', count(*) from experiments;
```

**Expected:** At least 1 rate_plan, some exposures/losses

---

### 3. Vercel Build Configuration

**Settings → General:**
- **Framework Preset:** Next.js
- **Root Directory:** `./` (or `NOVA` if monorepo)
- **Build Command:** `next build`
- **Install Command:** `npm install`
- **Output Directory:** `.next` (default)
- **Node Version:** 18.x or 20.x

---

## 🚀 Deploy Process

### 1. Connect GitHub Repo (Recommended)

1. Vercel Dashboard → **Add New Project**
2. Import Git Repository → Select your repo
3. Configure Project:
   - Set environment variables (see above)
   - Click **Deploy**
4. Wait ~2-3 minutes for build
5. Visit deployed URL

### 2. Or Deploy via CLI

```bash
npm install -g vercel
vercel login
vercel --prod=false  # staging deploy
```

Follow prompts, set environment variables when asked.

---

## ✅ Post-Deploy Smoke Tests

### 1. Health Check

```bash
curl https://your-domain.vercel.app/api/filings/ttl
```

**Expected:** `{"ttl_seconds": 86400}`

### 2. List Experiments

```bash
curl https://your-domain.vercel.app/api/experiments
```

**Expected:** JSON array (empty or with experiments)

### 3. Run Demo Script (Against Staging)

```bash
# Get rate_plan_id from staging Supabase
# select id from rate_plans limit 1;

NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app \
RATE_PLAN_ID=<uuid> \
npm run demo
```

**Expected:** Full flow completes, exports generated

### 4. Test Rate Limiting

```bash
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app \
RATE_PLAN_ID=<uuid> \
npm run ratelimit:smoke
```

**Expected:** 
- LLM parses: 10 succeed, 11th returns 429
- Backtests: 20 succeed, 21st returns 429

### 5. Manual UI Test

1. Open `https://your-domain.vercel.app/experiments`
2. Click "New experiment"
3. Paste: "Increase base rate 7% for fleets with ≥3 guardrail hits in last 30d"
4. Run backtest → View results → Deploy → Export
5. Verify toast notifications work
6. Download export files from signed URLs

---

## 🔒 Security Checklist

- [x] `.env.local` not committed to Git
- [x] Storage bucket `filings` is **Private** (not public)
- [x] Signed URLs expire after 24h (configurable via `FILING_TTL_SECONDS`)
- [x] RLS enabled on all tables
- [x] Service role key only used server-side (never client-side)
- [x] Rate limiting active (10 LLM/hr, 20 backtests/hr per tenant)

---

## 📊 Monitoring (First 24h)

### Vercel Logs

1. Vercel Dashboard → Project → **Logs**
2. Watch for errors, slow functions
3. Check function duration (should be <10s for backtests)

### Supabase Metrics

1. Supabase Dashboard → **Database** → Query Performance
2. Monitor slow queries (exposures_daily, losses)
3. Check RLS overhead (minimal for service role)

### Experiment Logs

Query in Supabase SQL Editor:

```sql
-- Slowest backtests
SELECT experiment_id, ms
FROM experiment_logs
WHERE step = 'backtest/done'
  AND ts >= now() - interval '24 hours'
ORDER BY ms DESC
LIMIT 10;

-- Error rate (if step = api/run-backtest/end has detail->>'ok' = false)
SELECT count(*) as errors
FROM experiment_logs
WHERE step = 'api/run-backtest/end'
  AND (detail->>'ok')::boolean = false
  AND ts >= now() - interval '24 hours';
```

---

## 🔄 Rollback Plan

If critical issues discovered:

### Option 1: Vercel Rollback

1. Vercel Dashboard → **Deployments**
2. Find previous working deployment
3. Click **⋯** → **Promote to Production**

### Option 2: Revert Git Commit

```bash
git revert HEAD
git push origin main
```

Vercel auto-deploys the reverted version.

---

## 🎯 Production Promotion Checklist

Before promoting staging → production:

- [ ] Run smoke tests against staging (all pass)
- [ ] Review Supabase logs (no critical errors)
- [ ] Review Vercel logs (no 500s)
- [ ] Test rate limiting works (429s after quota)
- [ ] Verify signed URLs expire correctly (check after 24h)
- [ ] Test Slack notifications (if configured)
- [ ] Review experiment logs (all steps completing)
- [ ] Manual UI test complete (full flow)
- [ ] Demo script runs successfully
- [ ] Internal team trained on UI

**Once complete:**
```bash
vercel --prod  # promote to production
```

Or in Vercel Dashboard: Promote staging deployment to production.

---

## 📞 Support Contacts

**Supabase Issues:**
- Docs: [supabase.com/docs](https://supabase.com/docs)
- Support: support@supabase.com

**Vercel Issues:**
- Docs: [vercel.com/docs](https://vercel.com/docs)
- Support: support@vercel.com

**OpenAI API Issues:**
- Docs: [platform.openai.com/docs](https://platform.openai.com/docs)
- Support: help.openai.com

---

## 🎉 Deploy Complete!

**Your Nova 2.0 Rate Experiment Sandbox is live!**

Share the URL with your team:
```
https://your-domain.vercel.app/experiments
```

**Next steps:**
1. Train actuarial team on UI
2. Monitor first week of usage
3. Gather feedback for v2.1
4. Plan advanced features (charts, A/B testing, SERFF filing)

**🚀 Congratulations on shipping a production-grade pricing OS!**


