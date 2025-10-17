# Nova 2.0 — Rate Experiment Sandbox

End-to-end pricing experiment workflow: **NL change → backtest → results → deploy to staging → export filing**.

---

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required:
- `SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_SERVICE_ROLE` — Service role key (admin access)
- `OPENAI_API_KEY` — OpenAI API key for LLM parser & narrator

Optional:
- `SLACK_WEBHOOK_EXPERIMENTS` — Slack webhook for notifications

### 2. Database Migration

Run the migration script in Supabase SQL Editor:

```sql
-- Open Supabase Dashboard → SQL Editor → New Query
-- Paste contents of migrations/002_experiments.sql
-- Run
```

This creates:
- `exposures_daily` — Daily policy/unit snapshots
- `losses` — Claims data
- `rate_plans` — Versioned rating parameters
- `experiments` — Backtest results
- `vw_policy_performance` — Performance rollup view
- RLS policies for tenant isolation

### 3. Storage Bucket

Create a `filings` bucket in Supabase Storage:

1. Go to Supabase Dashboard → Storage
2. Create new bucket: `filings`
3. Set public access: **Enabled**

Or run this helper in your app:

```ts
import { ensureBucket } from "@/lib/storage";
await ensureBucket();
```

### 4. Install Dependencies

```bash
npm install @supabase/supabase-js
```

(Ensure Next.js, React, Tailwind already installed)

---

## Usage

### 1. Access UI

Navigate to:

```
http://localhost:3000/experiments
```

### 2. Create New Experiment

1. Click **"New experiment"** button
2. Enter natural-language pricing change, e.g.:
   - "Increase base rate by 7% for fleets with ≥3 guardrail hits in last 30 days"
   - "Add 5% surcharge for high-risk units (risk score ≥ 0.8)"
   - "Cap discounts at 10% for fleets smaller than 5 units"
3. Set backtest date range (default: last 90 days)
4. Click **"Run Backtest"**

### 3. View Results

Results include:
- **KPIs:** Δ Premium, Δ Loss Ratio, Affected Policies/Units, Book Coverage
- **Segments:** By Product, Fleet Size, Risk Decile, Geography
- **Winners/Losers:** Top 10 policies with largest premium changes
- **Side Effects:** Guardrail hit rate changes
- **Audit:** Param diff (from → to)

### 4. Deploy to Staging

Click **"Deploy to Staging"** to create a new `rate_plan` with `status='staging'`.

### 5. Export Filing

Click **"Export Filing"** to generate:
- `summary.md` — Actuarial report (2-3 pages)
- `params.csv` — Parameter changes
- `kpis.csv` — Portfolio KPIs
- `segments.csv` — Segment breakdown
- `winners.csv` / `losers.csv` — Top movers

All files uploaded to Supabase Storage: `filings/{tenant_id}/{experiment_id}/*`

---

## Architecture

### API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/llm/parse-pricing-change` | POST | Parse NL instruction → SQL + param patch |
| `/api/experiments/run-backtest` | POST | Execute backtest, save results |
| `/api/experiments/deploy-staging` | POST | Create staging rate plan |
| `/api/experiments/export-filing` | POST | Generate filing documents |
| `/api/experiments` | GET | List all experiments |
| `/api/experiments/[id]` | GET | Fetch single experiment |

### Key Components

- **Rating Engine** (`src/rating/engine.ts`) — Pure pricing function
- **Backtest Worker** (`src/workers/backtest.ts`) — Compute metrics & segments
- **LLM Prompts** (`prompts/*.prmpt`) — Parser & narrator instructions
- **Storage Helper** (`src/lib/storage.ts`) — Upload to Supabase Storage
- **UI** (`app/experiments/page.tsx`) — Legora/Attio-style interface

### Data Flow

```
User NL Input
  ↓
LLM Parser (OpenAI GPT-4)
  ↓
{ cohort_sql, param_patch, confidence }
  ↓
Backtest Worker
  ├─ Materialize cohort (run SQL)
  ├─ Pull exposures & losses
  ├─ Quote base vs candidate
  ├─ Compute segments
  └─ Fairness checks
  ↓
Save to experiments.results (JSONB)
  ↓
Display Results UI
  ↓
Deploy / Export
```

---

## Sample Data

To test, you need:
- **Exposures:** `exposures_daily` table with historical snapshots
- **Losses:** `losses` table with claims
- **Guardrails:** `guardrail_hits` table (optional, for side-effect checks)

Example seed script:

```sql
-- Insert sample exposures
INSERT INTO exposures_daily (tenant_id, dt, policy_id, unit_id, product, risk_vars, written_premium, earned_premium, exposure)
VALUES
  ('00000000-0000-0000-0000-000000000001', '2025-07-01', gen_random_uuid(), gen_random_uuid(), 'AUTO', '{"fleet_size": 3, "risk_score": 0.65}', 450, 37.5, 1),
  ('00000000-0000-0000-0000-000000000001', '2025-07-02', gen_random_uuid(), gen_random_uuid(), 'ROBOT', '{"fleet_size": 10, "risk_score": 0.82}', 980, 81.67, 1);

-- Insert sample losses
INSERT INTO losses (tenant_id, policy_id, unit_id, dt, incurred, paid)
VALUES
  ('00000000-0000-0000-0000-000000000001', (SELECT policy_id FROM exposures_daily LIMIT 1), (SELECT unit_id FROM exposures_daily LIMIT 1), '2025-07-15', 120, 50);
```

---

## Troubleshoats

### "Cohort query failed"
- Check `cohort_sql` syntax (must select `unit_id`)
- Ensure `tenant_id` placeholder replaced: `:tenant_id`

### "No experiments shown"
- Verify Supabase connection
- Check RLS policies (tenant_id must match)

### "LLM parser returns low confidence"
- Input too vague → use guided form
- Or adjust prompt in `prompts/parser.prmpt`

### "Export filing failed"
- Ensure `filings` bucket exists and is public
- Check `OPENAI_API_KEY` for narrator summary

---

## Next Steps

- [ ] Add time-series charts (LR over time, delta histogram)
- [ ] Implement A/B testing (50/50 split)
- [ ] Regulatory filing templates (SERFF, ISO)
- [ ] Slack notifications on backtest completion
- [ ] Multi-tenant auth (JWT extraction)

---

**Built with:** Next.js 14, Supabase, Tailwind CSS, OpenAI GPT-4  
**Design:** Legora/Attio-inspired clean data UI  
**Status:** ✅ MVP Complete (staging only)


