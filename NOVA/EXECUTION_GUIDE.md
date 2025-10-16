# 🚀 Nova 2.0 — Master Execution Guide

**Complete build order for Rate Experiment Sandbox**

---

## 📋 Overview

This guide walks through **7 phases** to build a complete pricing experiment platform:

1. **Phase 0** — Verify schema, seeds, buckets ✅
2. **Phase 1** — Rating engine + `/api/rating/quote` (15 min)
3. **Phase 2** — Backtest worker + `/api/experiments/*` (30 min)
4. **Phase 3** — LLM parser + Filing export (20 min)
5. **Phase 4** — Wire UI to APIs (20 min)
6. **Phase 5** — QA + demo script + perf guardrails (25 min)
7. **Phase 6** — Observability + Slack + RLS tests (30 min)
8. **Phase 7** — Staging deploy checklist (30 min)

**Total time:** ~2.5 hours

---

## 🎯 Before You Start

### Prerequisites

- [x] Node.js 18+ installed
- [x] Supabase account created
- [x] OpenAI API key obtained
- [x] Slack workspace (optional)
- [x] Git repo initialized

### Initial Setup

```bash
cd NOVA
npm install
cp env.example .env.local
# Fill in .env.local with your keys
```

---

## 📍 Execution Order

### Phase 0 — Verification ✅

**Goal:** Ensure DB + storage + envs ready

**Steps:**
1. ✅ Copy `env.example` → `.env.local`
2. ✅ Run migrations in Supabase SQL Editor:
   - `migrations/002_experiments.sql`
   - `migrations/003_seed_demo_data.sql`
3. ✅ Create `filings` storage bucket (public for now)
4. ✅ Run verification script:
   ```bash
   npm run verify
   ```

**Expected output:**
```
✅ VERIFICATION PASSED
All required tables, views, and storage are ready.
Proceed to Phase 1 — Rating Engine
```

**Full docs:** `PHASE_0_CHECKLIST.md`

---

### Phase 1 — Rating Engine

**Goal:** Build deterministic pricing function + HTTP endpoint

**Steps:**
1. Review `/src/rating/engine.ts` (already exists)
2. Create `/app/api/rating/quote/route.ts` with Zod validation
3. Add unit tests: `/src/rating/engine.test.ts`
4. Manual test with cURL:
   ```bash
   curl -X POST http://localhost:3000/api/rating/quote \
     -H 'content-type: application/json' \
     -d '{"params":{"base_rate":0.045},"risk_vars":{"exposure":1}}'
   ```

**Acceptance:** Unit tests pass + cURL returns `{premium_components, total}`

**Full docs:** `PHASE_1_RATING_ENGINE.md`

---

### Phase 2 — Backtest Worker

**Goal:** Compute base vs candidate results, persist to DB

**Steps:**
1. Review `/src/workers/backtest.ts` (already exists)
2. Review `/app/api/experiments/run-backtest/route.ts` (already exists)
3. Test with cURL:
   ```bash
   curl -X POST http://localhost:3000/api/experiments/run-backtest \
     -H 'content-type: application/json' \
     -d '{
       "nl_change":"Test",
       "cohort_sql":"SELECT unit_id FROM exposures_daily WHERE tenant_id = '\''00000000-0000-0000-0000-000000000001'\''",
       "param_patch":{"base_rate_pct_change":0.05},
       "backtest_from":"2025-07-01",
       "backtest_to":"2025-10-01"
     }'
   ```

**Acceptance:** Returns `{experiment_id, results}` with full KPIs/segments

**Full docs:** `PHASE_2_BACKTEST.md`

---

### Phase 3 — LLM Parser + Filing Export

**Goal:** NL → structured changes + generate actuarial docs

**Steps:**
1. Review `/prompts/parser.prmpt` and `/prompts/narrator.prmpt` (already exist)
2. Review `/app/api/llm/parse-pricing-change/route.ts` (already exists)
3. Review `/app/api/experiments/export-filing/route.ts` (already exists)
4. Test parser:
   ```bash
   curl -X POST http://localhost:3000/api/llm/parse-pricing-change \
     -H 'content-type: application/json' \
     -d '{"text":"Increase base rate by 5%"}'
   ```

**Acceptance:** Parser returns `{cohort_sql, param_patch, confidence}`, export generates 6 files

**Full docs:** `PHASE_3_LLM.md`

---

### Phase 4 — Wire UI to APIs

**Goal:** Replace mocks with real fetch() calls

**Steps:**
1. Review `/app/experiments/page.tsx` (already wired)
2. Manual UI test:
   - Navigate to `/experiments`
   - Click "New experiment"
   - Run backtest
   - View results
   - Deploy + Export

**Acceptance:** End-to-end flow works without mocks

**Full docs:** `PHASE_4_UI_WIRING.md`

---

### Phase 5 — QA + Demo + Perf Guardrails

**Goal:** Smoke tests + input validation + demo script

**Steps:**
1. Create `/tests/smoke.test.ts` (3 canned experiments)
2. Create `/src/lib/validation.ts` (date range, param patch, cohort SQL)
3. Add 30s timeout to backtest
4. Create `/tests/demo-script.md`
5. Rehearse demo (5 minutes)

**Acceptance:** Smoke tests pass, demo runs smoothly

**Full docs:** `PHASE_5_QA.md`

---

### Phase 6 — Observability + Slack + RLS

**Goal:** Logging + notifications + security tests

**Steps:**
1. Create `migrations/004_experiment_logs.sql`
2. Add step logging to backtest worker
3. Create `/src/lib/slack.ts` for notifications
4. Create `/tests/rls.test.ts` (tenant isolation)
5. **Outside Cursor:** Create Slack webhook, add to `.env.local`

**Acceptance:** Logs captured, Slack notified, RLS tests pass

**Full docs:** `PHASE_6_OBSERVABILITY.md`

---

### Phase 7 — Staging Deploy Checklist

**Goal:** Rate limiting + signed URLs + deployment docs

**Steps:**
1. Create `/src/middleware/rateLimiter.ts` (10 LLM/hour, 20 backtests/hour)
2. Update `/src/lib/storage.ts` for signed URLs (24h TTL)
3. Create `/src/lib/env.ts` for startup validation
4. Create `/docs/DEPLOYMENT.md`
5. **Outside Cursor:** Set bucket to private in Supabase

**Acceptance:** Rate limiting works, signed URLs generated, ready for Vercel deploy

**Full docs:** `PHASE_7_STAGING.md`

---

## 🎬 Demo Script (5 minutes)

1. **Navigate:** `http://localhost:3000/experiments`
2. **New Experiment:** "Increase base rate by 7% for fleets with ≥3 guardrail hits in last 30d"
3. **Set Dates:** 2025-07-01 to 2025-10-01
4. **Run Backtest:** Wait 5-10s
5. **Review Results:** KPIs, Segments, Winners/Losers, Audit
6. **Deploy to Staging:** Click button → Toast
7. **Export Filing:** Click button → Toast with links

---

## ✅ Progress Tracker

Create `PROGRESS.md` to track completion:

```bash
touch PROGRESS.md

# After each phase:
echo "✅ Phase 0 complete" >> PROGRESS.md
echo "✅ Phase 1 complete" >> PROGRESS.md
# ... etc
```

---

## 🚨 Troubleshooting

### "npm run verify fails"

**Cause:** Missing env vars or DB not ready  
**Fix:** Check `.env.local`, run migrations

### "Backtest returns empty results"

**Cause:** No demo data in DB  
**Fix:** Run `migrations/003_seed_demo_data.sql`

### "LLM parser returns low confidence"

**Cause:** Input too vague  
**Expected:** Confidence < 0.7 triggers guided form (future enhancement)

### "Export links broken"

**Cause:** Bucket doesn't exist or not accessible  
**Fix:** Run `npm run create-bucket`

---

## 📊 Key Metrics

After completion:
- ✅ **15 API endpoints** built
- ✅ **6 tables** + 1 view
- ✅ **3 LLM prompts**
- ✅ **~270 exposures** seeded
- ✅ **Smoke tests** passing
- ✅ **Demo ready**

---

## 🎯 What You've Built

A complete **Pricing OS** for commercial insurance:

1. **Natural Language → Pricing Changes**
   - Parse "Increase base rate by 7% for high-risk fleets"
   - Generate cohort SQL + param patch

2. **Historical Backtesting**
   - Run on 30-365 days of data
   - Compute KPIs, segments, winners/losers
   - Fairness checks (guardrail side effects)

3. **Results Analysis**
   - 6 tabs: Overview, Segments, Winners, Losers, Side Effects, Audit
   - Beautiful Legora/Attio UI

4. **Deploy to Staging**
   - One-click deploy candidate params
   - Status tracking (draft → staging → active)

5. **Export Filing**
   - 2-3 page actuarial report (GPT-4 generated)
   - 5 CSVs (params, KPIs, segments, winners, losers)

6. **Observability**
   - Step-by-step logs
   - Slack notifications
   - Performance monitoring

7. **Production-Ready**
   - Rate limiting
   - Signed URLs
   - RLS tenant isolation
   - Input validation

---

## 🚀 Next Steps

### Immediate (Post-Phase 7)

- [ ] Deploy to Vercel staging
- [ ] Run smoke tests in staging
- [ ] Train internal team on UI
- [ ] Get feedback from actuaries

### Short-term (Week 1-2)

- [ ] Add charts (LR over time, delta histogram)
- [ ] Implement guided form for low-confidence parses
- [ ] Add A/B testing (50/50 split)
- [ ] Build regulatory filing templates (SERFF, ISO)

### Medium-term (Month 1-3)

- [ ] Multi-tenant auth (JWT extraction)
- [ ] Redis-based rate limiting (vs in-memory)
- [ ] Alerting (PagerDuty/Datadog)
- [ ] Advanced segmentation (custom dimensions)

### Long-term (Quarter 1-2)

- [ ] Real-time quoting API for external systems
- [ ] Automated A/B test winner promotion
- [ ] Integration with policy admin systems
- [ ] Mobile app (React Native)

---

## 📚 Documentation Index

- `EXECUTION_GUIDE.md` — This file (master guide)
- `PHASE_0_CHECKLIST.md` — Verification steps
- `PHASE_1_RATING_ENGINE.md` — Pricing function
- `PHASE_2_BACKTEST.md` — Backtest worker
- `PHASE_3_LLM.md` — Parser + export
- `PHASE_4_UI_WIRING.md` — Frontend integration
- `PHASE_5_QA.md` — Testing + demo
- `PHASE_6_OBSERVABILITY.md` — Logging + notifications
- `PHASE_7_STAGING.md` — Deploy prep
- `README_EXPERIMENTS.md` — Full architecture docs
- `API_REFERENCE.md` — Endpoint specs
- `QUICKSTART.md` — 5-minute setup

---

## 🎊 Congratulations!

You've built a production-ready **Pricing Experiment Sandbox** from scratch.

**What makes this special:**

- ✅ **LLM-powered** — Natural language → pricing changes
- ✅ **Actuarial-grade** — Proper segmentation, fairness checks
- ✅ **Beautiful UX** — Legora/Attio-inspired clean design
- ✅ **Type-safe** — Full TypeScript with error handling
- ✅ **Observable** — Logs, metrics, notifications
- ✅ **Secure** — RLS, rate limiting, signed URLs
- ✅ **Well-documented** — 10+ guides

**Time to ship! 🚀**

```bash
vercel --prod
```


