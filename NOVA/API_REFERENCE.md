# Nova 2.0 — API Reference

Complete documentation for all Rate Experiment Sandbox API endpoints.

---

## Authentication

All endpoints use **server-side Supabase client** with service role key. Tenant isolation enforced via `tenant_id` extraction (currently hardcoded for demo).

**Headers:**
```
Content-Type: application/json
```

---

## Endpoints

### 1. Parse Pricing Change

Parse natural-language instruction into structured pricing change.

**Endpoint:** `POST /api/llm/parse-pricing-change`

**Request:**
```json
{
  "text": "Increase base rate by 7% for fleets with ≥3 guardrail hits in last 30d",
  "product": "AUTO" // optional
}
```

**Response:**
```json
{
  "cohort_sql": "SELECT unit_id FROM exposures_daily WHERE tenant_id = :tenant_id AND ...",
  "param_patch": {
    "base_rate_pct_change": 0.07
  },
  "confidence": 0.95
}
```

**Param Patch Keys:**
- `base_rate_pct_change` (number): Percentage change to base rate
- `add_surcharge` (object): `{ name, when, percent }`
- `add_discount` (object): `{ name, when, percent }`
- `cap` (object): `{ max_change_pct, min_change_pct }`

**Confidence Levels:**
- `>= 0.9` — High confidence, proceed automatically
- `0.7 - 0.9` — Medium confidence, show preview
- `< 0.7` — Low confidence, use guided form

**Errors:**
- `400` — Missing or invalid `text` field
- `500` — LLM API error

---

### 2. Run Backtest

Execute pricing backtest on historical data.

**Endpoint:** `POST /api/experiments/run-backtest`

**Request:**
```json
{
  "nl_change": "Increase base rate by 7% for high-risk fleets",
  "cohort_sql": "SELECT unit_id FROM exposures_daily WHERE ...",
  "param_patch": { "base_rate_pct_change": 0.07 },
  "backtest_from": "2025-07-01",
  "backtest_to": "2025-10-01",
  "base_rate_plan_id": "uuid-here" // optional, uses latest active if omitted
}
```

**Response:**
```json
{
  "experiment_id": "uuid-here",
  "results": {
    "kpis": {
      "portfolio": {
        "delta_written": 12345.67,
        "delta_earned": 8901.23,
        "lr_base": 0.62,
        "lr_candidate": 0.58,
        "cr_base": 0.97,
        "cr_candidate": 0.93,
        "affected_policies": 142,
        "affected_units": 1187,
        "book_coverage_pct": 0.36
      }
    },
    "segments": {
      "by_product": [...],
      "by_fleet_size": [...],
      "by_risk_decile": [...],
      "by_geo": [...]
    },
    "winners": [...],
    "losers": [...],
    "fairness_checks": {...},
    "audit": {...}
  }
}
```

**Backtest Logic:**
1. Materialize cohort (run `cohort_sql`)
2. Pull `exposures_daily` for cohort in date range
3. Pull `losses` for same policies
4. Quote base vs candidate premiums using rating engine
5. Compute segments, winners/losers, fairness checks
6. Save to `experiments` table

**Errors:**
- `400` — Missing required fields
- `404` — Base rate plan not found
- `500` — Backtest execution error

---

### 3. Deploy to Staging

Create staging rate plan with candidate params.

**Endpoint:** `POST /api/experiments/deploy-staging`

**Request:**
```json
{
  "experiment_id": "uuid-here"
}
```

**Response:**
```json
{
  "rate_plan_id": "uuid-here",
  "status": "staging",
  "params": {
    "base_rate": 0.04815,
    "caps": {...}
  }
}
```

**Logic:**
1. Fetch experiment + base rate plan
2. Apply `param_patch` to base params
3. Create new `rate_plan` with `status='staging'`

**Errors:**
- `400` — Missing `experiment_id`
- `404` — Experiment or base plan not found
- `500` — Rate plan creation error

---

### 4. Export Filing

Generate actuarial filing documents.

**Endpoint:** `POST /api/experiments/export-filing`

**Request:**
```json
{
  "experiment_id": "uuid-here"
}
```

**Response:**
```json
{
  "links": {
    "summary_md": "https://...supabase.co/storage/v1/object/public/filings/...",
    "params_csv": "https://...",
    "kpis_csv": "https://...",
    "segments_csv": "https://...",
    "winners_csv": "https://...",
    "losers_csv": "https://..."
  }
}
```

**Generated Files:**

1. **summary.md** — 2-3 page actuarial report (via GPT-4)
   - Executive summary
   - Impact analysis
   - Segments
   - Winners/losers
   - Fairness checks
   - Methodology

2. **params.csv** — Parameter changes
   ```csv
   Parameter,From,To
   base_rate,0.045,0.04815
   ```

3. **kpis.csv** — Portfolio KPIs
   ```csv
   Metric,Value
   Delta Written,12345.67
   LR Base,0.62
   ...
   ```

4. **segments.csv** — Segment breakdown
5. **winners.csv** / **losers.csv** — Top movers

**Storage Path:**
```
filings/{tenant_id}/{experiment_id}/*.{md,csv}
```

**Errors:**
- `400` — Missing `experiment_id`
- `404` — Experiment not found
- `500` — File generation or upload error

---

### 5. List Experiments

Fetch all experiments for tenant.

**Endpoint:** `GET /api/experiments`

**Response:**
```json
[
  {
    "id": "uuid-here",
    "name": "Increase base rate 7% for high-risk fleets",
    "status": "Backtested",
    "deltaPremium": 0.032,
    "deltaLR": -0.04,
    "coverage": 0.36,
    "createdBy": "Gerardo",
    "created": "12 Oct 2025"
  },
  ...
]
```

**Sorting:** Most recent first  
**Limit:** 50 experiments

---

### 6. Get Experiment

Fetch single experiment with full results.

**Endpoint:** `GET /api/experiments/[id]`

**Response:**
```json
{
  "experiment": {
    "id": "uuid-here",
    "tenant_id": "uuid-here",
    "rate_plan_id": "uuid-here",
    "nl_change": "Increase base rate by 7%",
    "cohort_sql": "SELECT ...",
    "param_patch": {...},
    "backtest_from": "2025-07-01",
    "backtest_to": "2025-10-01",
    "results": {...},
    "status": "completed",
    "created_by": "uuid-here",
    "created_at": "2025-10-12T10:30:00Z"
  },
  "results": {
    "kpis": {...},
    "segments": {...},
    "winners": [...],
    "losers": [...],
    "fairness_checks": {...},
    "audit": {...}
  }
}
```

**Errors:**
- `404` — Experiment not found

---

## Data Schemas

### ExperimentResults

```typescript
type ExperimentResults = {
  kpis: {
    portfolio: {
      delta_written: number;
      delta_earned: number;
      lr_base: number;
      lr_candidate: number;
      cr_base: number;
      cr_candidate: number;
      affected_policies: number;
      affected_units: number;
      book_coverage_pct: number;
    };
  };
  segments: {
    by_product: { product: string; lr_base: number; lr_cand: number; delta_written: number }[];
    by_fleet_size: { bucket: string; delta_cr: number }[];
    by_risk_decile: { decile: number; delta_lr: number }[];
    by_geo: { state: string; delta_written: number }[];
  };
  winners: { policy_id: string; unit_id: string; delta_total: number }[];
  losers: { policy_id: string; unit_id: string; delta_total: number }[];
  fairness_checks: {
    cohort_selectivity: number;
    guardrail_side_effect: { hit_rate_base: number; hit_rate_cand: number };
  };
  charts: { lr_over_time: any[]; delta_histogram: any[] };
  audit: { param_diff: { base_rate: { from: number; to: number } } };
};
```

### RateParams

```typescript
type RateParams = {
  base_rate: number;
  surcharges?: { name: string; when: Record<string, any>; percent: number }[];
  discounts?: { name: string; when: Record<string, any>; percent: number }[];
  caps?: { max_change_pct?: number; min_change_pct?: number };
};
```

**Example:**
```json
{
  "base_rate": 0.045,
  "surcharges": [
    {
      "name": "High Risk Surcharge",
      "when": { "risk_score": { ">=": 0.8 } },
      "percent": 0.10
    }
  ],
  "caps": {
    "max_change_pct": 0.25,
    "min_change_pct": -0.15
  }
}
```

---

## Rate Limiting

None currently. Consider implementing:
- Per-tenant rate limits (e.g., 10 backtests/hour)
- LLM token usage tracking

---

## Webhooks (Future)

**Backtest Complete:**
```json
POST {slack_webhook_url}
{
  "text": "✅ Backtest complete: +$12,345 premium, -4.0pp LR",
  "experiment_id": "uuid-here",
  "results_url": "https://app.nova.com/experiments/uuid-here"
}
```

---

## Error Handling

All endpoints return standard error format:

```json
{
  "error": "Human-readable error message"
}
```

**HTTP Status Codes:**
- `200` — Success
- `400` — Bad request (missing/invalid params)
- `404` — Resource not found
- `500` — Internal server error

---

## Testing

### cURL Examples

**1. Parse Pricing Change:**
```bash
curl -X POST http://localhost:3000/api/llm/parse-pricing-change \
  -H "Content-Type: application/json" \
  -d '{"text":"Increase base rate by 5%"}'
```

**2. Run Backtest:**
```bash
curl -X POST http://localhost:3000/api/experiments/run-backtest \
  -H "Content-Type: application/json" \
  -d '{
    "nl_change":"Test experiment",
    "cohort_sql":"SELECT unit_id FROM exposures_daily WHERE tenant_id = :tenant_id",
    "param_patch":{"base_rate_pct_change":0.05},
    "backtest_from":"2025-07-01",
    "backtest_to":"2025-10-01"
  }'
```

**3. List Experiments:**
```bash
curl http://localhost:3000/api/experiments
```

---

**Updated:** Oct 12, 2025  
**Version:** 2.0.0


