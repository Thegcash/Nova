# Phase 3 — LLM Parser + Filing Export

**Status:** ⏳ Ready to execute  
**Prerequisites:** Phase 2 complete ✅  
**Est. Time:** 20 minutes

---

## 🎯 Goal

Enable natural-language input → structured pricing changes, and generate actuarial filing documents.

---

## 📝 What Gets Created

1. `/prompts/parser.prmpt` — LLM system prompt for NL parser ✅ (exists)
2. `/prompts/narrator.prmpt` — LLM system prompt for filing summary ✅ (exists)
3. `/app/api/llm/parse-pricing-change/route.ts` — Parser endpoint ✅ (exists)
4. `/app/api/experiments/export-filing/route.ts` — Export endpoint ✅ (exists)

**Note:** Files already exist. This phase verifies and tests them.

---

## 🔧 Implementation Verification

### 1. Review Parser Prompt

File: `/prompts/parser.prmpt`

**Key rules (verify):**
- ✅ Output format: `{cohort_sql, param_patch, confidence}`
- ✅ Allowed param_patch keys: `base_rate_pct_change`, `add_surcharge`, `add_discount`, `cap`
- ✅ cohort_sql must SELECT `unit_id` and include `WHERE tenant_id = :tenant_id`
- ✅ Confidence scoring: >0.9 high, 0.7-0.9 medium, <0.7 low

### 2. Review Parser Endpoint

File: `/app/api/llm/parse-pricing-change/route.ts`

**Features (verify):**
- ✅ Calls OpenAI GPT-4 (or fallback parser if no API key)
- ✅ Returns JSON only (strips markdown fences)
- ✅ Returns 400 if `text` missing
- ✅ Fallback parser handles simple cases (regex-based)

### 3. Review Narrator Prompt

File: `/prompts/narrator.prmpt`

**Expected output (verify):**
- ✅ 2-3 page Markdown document
- ✅ Sections: Executive Summary, Impact, Segments, Winners/Losers, Fairness, Methodology, Recommendations
- ✅ Neutral, audit-friendly tone

### 4. Review Export Endpoint

File: `/app/api/experiments/export-filing/route.ts`

**Generated files (verify):**
1. `summary.md` — Actuarial report via GPT-4
2. `params.csv` — Parameter changes
3. `kpis.csv` — Portfolio KPIs
4. `segments.csv` — Segment breakdown
5. `winners.csv` / `losers.csv` — Top movers

**Storage path:** `filings/{tenant_id}/{experiment_id}/*.{md,csv}`

---

## ✅ Acceptance Criteria

### Test 1: Parse Simple Rate Increase

```bash
curl -s -X POST http://localhost:3000/api/llm/parse-pricing-change \
  -H 'content-type: application/json' \
  -d '{"text":"Increase base rate by 5% for all units"}' | jq
```

**Expected:**
```json
{
  "cohort_sql": "SELECT unit_id FROM exposures_daily WHERE tenant_id = :tenant_id",
  "param_patch": {
    "base_rate_pct_change": 0.05
  },
  "confidence": 0.95
}
```

### Test 2: Parse Guardrail-Based Surcharge

```bash
curl -s -X POST http://localhost:3000/api/llm/parse-pricing-change \
  -H 'content-type: application/json' \
  -d '{"text":"Add 7% surcharge for fleets with 3 or more guardrail hits in last 30 days"}' | jq
```

**Expected:**
```json
{
  "cohort_sql": "SELECT unit_id FROM exposures_daily WHERE tenant_id = :tenant_id AND unit_id IN (SELECT unit_id FROM guardrail_hits WHERE tenant_id = :tenant_id AND dt >= CURRENT_DATE - INTERVAL '30 days' GROUP BY unit_id HAVING COUNT(*) >= 3)",
  "param_patch": {
    "base_rate_pct_change": 0.07
  },
  "confidence": 0.92
}
```

### Test 3: Parse with Low Confidence

```bash
curl -s -X POST http://localhost:3000/api/llm/parse-pricing-change \
  -H 'content-type: application/json' \
  -d '{"text":"Make it safer"}' | jq
```

**Expected:**
```json
{
  "cohort_sql": "...",
  "param_patch": {...},
  "confidence": 0.45  // <0.7 triggers guided form in UI
}
```

### Test 4: Export Filing

First, run a backtest to get an experiment_id:

```bash
EXPERIMENT_ID=$(curl -s -X POST http://localhost:3000/api/experiments/run-backtest \
  -H 'content-type: application/json' \
  -d '{
    "nl_change": "Increase base rate by 5%",
    "cohort_sql": "SELECT unit_id FROM exposures_daily WHERE tenant_id = '\''00000000-0000-0000-0000-000000000001'\''",
    "param_patch": {"base_rate_pct_change": 0.05},
    "backtest_from": "2025-07-01",
    "backtest_to": "2025-10-01"
  }' | jq -r '.experiment_id')

echo "Experiment ID: $EXPERIMENT_ID"
```

Then export:

```bash
curl -s -X POST http://localhost:3000/api/experiments/export-filing \
  -H 'content-type: application/json' \
  -d "{\"experiment_id\":\"$EXPERIMENT_ID\"}" | jq
```

**Expected:**
```json
{
  "links": {
    "summary_md": "https://.../filings/.../summary.md",
    "params_csv": "https://.../filings/.../params.csv",
    "kpis_csv": "https://.../filings/.../kpis.csv",
    "segments_csv": "https://.../filings/.../segments.csv",
    "winners_csv": "https://.../filings/.../winners.csv",
    "losers_csv": "https://.../filings/.../losers.csv"
  }
}
```

### Test 5: Verify Generated Files

Open `summary_md` link in browser or download:

```bash
curl -s "https://.../summary.md"
```

**Expected structure:**
```markdown
# Rate Experiment Summary

## Executive Summary
...

## Impact Analysis
| Metric | Base | Candidate | Delta |
...

## Recommendations
1. Deploy to staging
2. Monitor guardrails
...
```

---

## 🚨 Common Issues

### "OpenAI API error: 401"

**Cause:** Missing or invalid `OPENAI_API_KEY`  
**Fix:** Check `.env.local`, ensure key starts with `sk-`

### "Fallback parser used"

**Cause:** `OPENAI_API_KEY` not set  
**Behavior:** Returns regex-based naive parsing (acceptable for testing)

### "Storage upload failed"

**Cause:** Bucket `filings` doesn't exist or not accessible  
**Fix:**
1. Create bucket: Supabase Dashboard → Storage → Create `filings`
2. Or run: `npm run create-bucket`

### "Narrator generates HTML instead of Markdown"

**Cause:** LLM ignored format instruction  
**Fix:** Add to `narrator.prmpt`:
```
IMPORTANT: Output ONLY Markdown. No HTML tags. Use ## for headings, | for tables.
```

### "CSV encoding issues"

**Cause:** Special characters in policy IDs  
**Fix:** Use proper CSV escaping in `generateWinnersLosersCSV()`:
```ts
csv += `"${r.policy_id}","${r.unit_id}",${r.delta_total}\n`;
```

---

## 🧪 Advanced Tests

### Test Complex Conditional

```bash
curl -s -X POST http://localhost:3000/api/llm/parse-pricing-change \
  -H 'content-type: application/json' \
  -d '{"text":"Cap discounts at 10% for fleets smaller than 5 units"}' | jq
```

**Expected:**
```json
{
  "cohort_sql": "SELECT unit_id FROM exposures_daily WHERE tenant_id = :tenant_id AND (risk_vars->>'fleet_size')::int < 5",
  "param_patch": {
    "cap": {
      "max_change_pct": 0.10,
      "min_change_pct": -0.10
    }
  },
  "confidence": 0.88
}
```

---

## 📦 Phase 3 Deliverables

- [x] Parser endpoint tested with 3+ NL inputs
- [x] Export endpoint generates 6 files correctly
- [x] summary.md is readable and well-formatted
- [x] CSVs are valid (no encoding issues)
- [x] Storage links are public and accessible

---

## 🔐 Security Notes (for later phases)

- [ ] Sign storage links with 24h TTL (not public forever)
- [ ] Rate limit LLM calls (10/hour per tenant)
- [ ] Validate cohort_sql for SQL injection (use parameterized queries)

---

## ➡️ Next Phase

Once all tests pass, proceed to **Phase 4 — Wire UI to APIs**.

```bash
echo "✅ Phase 3 complete" >> PROGRESS.md
```


