# Phase 2 — Backtest Worker + Endpoint

**Status:** ⏳ Ready to execute  
**Prerequisites:** Phase 1 complete ✅  
**Est. Time:** 30 minutes

---

## 🎯 Goal

Build backtest engine that computes base vs candidate premiums, segments, winners/losers, and fairness checks. Persist results to `experiments.results`.

---

## 📝 What Gets Created

1. `/src/workers/backtest.ts` — Core backtest logic ✅ (already exists)
2. `/app/api/experiments/run-backtest/route.ts` — HTTP orchestrator ✅ (already exists)
3. `/app/api/experiments/route.ts` — List experiments ✅ (already exists)
4. `/app/api/experiments/[id]/route.ts` — Get experiment details ✅ (already exists)

**Note:** These files were already created in the initial build. This phase verifies and tests them.

---

## 🔧 Implementation Verification

### 1. Review Backtest Worker

File: `/src/workers/backtest.ts`

**Inputs:**
```ts
{
  tenant_id: string;
  cohort_sql: string;
  base_params: RateParams;
  candidate_params: RateParams;
  backtest_from: string;
  backtest_to: string;
}
```

**Steps (verify these exist):**
1. ✅ Materialize cohort (run `cohort_sql`, extract `unit_id` list)
2. ✅ Pull `exposures_daily` for cohort in date range
3. ✅ Pull `losses` for same policies
4. ✅ Compute base & candidate premiums using `quote()`
5. ✅ Compute portfolio KPIs (Δ written, LR, CR, coverage)
6. ✅ Compute segments:
   - By product
   - By fleet size (1-5, 6-20, 21+)
   - By risk decile (10 buckets)
   - By geography (state)
7. ✅ Identify winners/losers (top 10 each by delta)
8. ✅ Compute fairness checks (cohort selectivity, guardrail hit rates)
9. ✅ Return `ExperimentResults` JSON

### 2. Review API Endpoint

File: `/app/api/experiments/run-backtest/route.ts`

**Request:**
```json
POST /api/experiments/run-backtest
{
  "nl_change": "Increase base rate by 7%",
  "cohort_sql": "SELECT unit_id FROM exposures_daily WHERE ...",
  "param_patch": {"base_rate_pct_change": 0.07},
  "backtest_from": "2025-07-01",
  "backtest_to": "2025-10-01",
  "base_rate_plan_id": "uuid" // optional
}
```

**Logic (verify):**
1. ✅ Get base rate plan (latest active if not provided)
2. ✅ Apply `param_patch` to get candidate params
3. ✅ Call `runBacktest()`
4. ✅ Save to `experiments` table
5. ✅ Return `{ experiment_id, results }`

### 3. Test List & Get Endpoints

**List experiments:**
```bash
curl -s http://localhost:3000/api/experiments | jq
```

**Get single experiment:**
```bash
curl -s http://localhost:3000/api/experiments/[id] | jq
```

---

## ✅ Acceptance Criteria

### Test 1: Simple Base Rate Increase

```bash
curl -s -X POST http://localhost:3000/api/experiments/run-backtest \
  -H 'content-type: application/json' \
  -d '{
    "nl_change": "Increase base rate by 5%",
    "cohort_sql": "SELECT unit_id FROM exposures_daily WHERE tenant_id = '\''00000000-0000-0000-0000-000000000001'\''",
    "param_patch": {"base_rate_pct_change": 0.05},
    "backtest_from": "2025-07-01",
    "backtest_to": "2025-10-01"
  }' | jq '.results.kpis.portfolio'
```

**Expected output:**
```json
{
  "delta_written": 1234.56,      // Positive (premium increase)
  "delta_earned": 987.65,
  "lr_base": 0.62,               // Loss ratio before
  "lr_candidate": 0.59,          // Loss ratio after (improved)
  "cr_base": 0.97,
  "cr_candidate": 0.94,
  "affected_policies": 3,
  "affected_units": 3,
  "book_coverage_pct": 1.0       // 100% of book
}
```

### Test 2: Surcharge for High Risk

```bash
curl -s -X POST http://localhost:3000/api/experiments/run-backtest \
  -H 'content-type: application/json' \
  -d '{
    "nl_change": "Add 10% surcharge for risk score >= 0.8",
    "cohort_sql": "SELECT unit_id FROM exposures_daily WHERE tenant_id = '\''00000000-0000-0000-0000-000000000001'\'' AND (risk_vars->>'\''risk_score'\'')::numeric >= 0.8",
    "param_patch": {
      "add_surcharge": {
        "name": "High Risk",
        "when": {"risk_score": {">=": 0.8}},
        "percent": 0.10
      }
    },
    "backtest_from": "2025-07-01",
    "backtest_to": "2025-10-01"
  }' | jq '.results'
```

**Verify:**
- ✅ `kpis.portfolio.affected_units` < total book (selective cohort)
- ✅ `segments.by_product` has entries
- ✅ `winners` and `losers` arrays populated
- ✅ `audit.param_diff.base_rate` shows from → to

### Test 3: List Experiments

```bash
curl -s http://localhost:3000/api/experiments | jq
```

**Expected:**
```json
[
  {
    "id": "uuid-here",
    "name": "Increase base rate by 5%",
    "status": "Backtested",
    "deltaPremium": 0.051,
    "deltaLR": -0.03,
    "coverage": 1.0,
    "createdBy": "Gerardo",
    "created": "12 Oct 2025"
  },
  ...
]
```

---

## 🚨 Common Issues

### "Cohort query failed"

**Cause:** SQL syntax error or missing tenant_id  
**Fix:** Ensure `cohort_sql` includes `WHERE tenant_id = :tenant_id`  
The endpoint should replace `:tenant_id` with actual UUID.

### "No exposures found"

**Cause:** Cohort SQL too restrictive or demo data missing  
**Fix:** Run `migrations/003_seed_demo_data.sql` again

### "Cannot read property 'total' of undefined"

**Cause:** `quote()` function error  
**Fix:** Add error logging in `backtest.ts`:
```ts
try {
  const base_quote = quote(base_params, e.risk_vars);
  const cand_quote = quote(candidate_params, e.risk_vars);
} catch (err) {
  console.error("Quote error:", err, { risk_vars: e.risk_vars });
  throw err;
}
```

### "Results JSON too large"

**Cause:** Too many exposures  
**Fix:** Limit cohort or add pagination:
```sql
SELECT unit_id FROM exposures_daily WHERE ... LIMIT 100
```

---

## 📊 Sample Results Structure

```json
{
  "experiment_id": "uuid-here",
  "results": {
    "kpis": {
      "portfolio": {
        "delta_written": 12345.67,
        "lr_base": 0.62,
        "lr_candidate": 0.58,
        ...
      }
    },
    "segments": {
      "by_product": [
        {"product": "AUTO", "lr_base": 0.61, "lr_cand": 0.57, "delta_written": 3210}
      ],
      "by_fleet_size": [...],
      "by_risk_decile": [...],
      "by_geo": [...]
    },
    "winners": [
      {"policy_id": "P-123", "unit_id": "U-456", "delta_total": -120.44}
    ],
    "losers": [
      {"policy_id": "P-789", "unit_id": "U-012", "delta_total": 96.10}
    ],
    "fairness_checks": {
      "cohort_selectivity": 0.33,
      "guardrail_side_effect": {
        "hit_rate_base": 0.12,
        "hit_rate_cand": 0.10
      }
    },
    "audit": {
      "param_diff": {
        "base_rate": {"from": 0.045, "to": 0.04725}
      }
    }
  }
}
```

---

## 📦 Phase 2 Deliverables

- [x] Backtest worker tested and verified
- [x] `/api/experiments/run-backtest` endpoint working
- [x] `/api/experiments` (list) endpoint working
- [x] `/api/experiments/[id]` (get) endpoint working
- [x] Manual cURL tests pass
- [x] Results saved to DB correctly

---

## ➡️ Next Phase

Once all tests pass, proceed to **Phase 3 — LLM Parser + Filing Export**.

```bash
echo "✅ Phase 2 complete" >> PROGRESS.md
```


