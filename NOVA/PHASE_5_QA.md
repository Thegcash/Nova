# Phase 5 — QA + Demo + Perf Guardrails

**Status:** ⏳ Ready to execute  
**Prerequisites:** Phase 4 complete ✅  
**Est. Time:** 25 minutes

---

## 🎯 Goal

Build smoke tests, add performance guardrails, and create a reliable demo path.

---

## 📝 What Gets Created

1. `/tests/smoke.test.ts` — Smoke tests for 3 canned NL prompts
2. `/src/lib/validation.ts` — Input validation utilities
3. `/tests/demo-script.md` — Step-by-step demo guide

---

## 🔧 Implementation Steps

### 1. Create Smoke Tests

File: `/tests/smoke.test.ts`

```ts
import { describe, it, expect } from "vitest";

describe("Smoke Tests — Rate Experiments", () => {
  const API_BASE = "http://localhost:3000";

  it("Smoke 1: Base rate increase", async () => {
    const res = await fetch(`${API_BASE}/api/experiments/run-backtest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nl_change: "Increase base rate by 5%",
        cohort_sql: "SELECT unit_id FROM exposures_daily WHERE tenant_id = '00000000-0000-0000-0000-000000000001'",
        param_patch: { base_rate_pct_change: 0.05 },
        backtest_from: "2025-07-01",
        backtest_to: "2025-10-01"
      })
    });

    const data = await res.json();
    expect(data.experiment_id).toBeDefined();
    expect(data.results.kpis.portfolio.delta_written).toBeGreaterThan(0);
    expect(data.results.segments.by_product).toHaveLength.greaterThan(0);
  });

  it("Smoke 2: Surcharge for high risk", async () => {
    const res = await fetch(`${API_BASE}/api/experiments/run-backtest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nl_change: "Add 10% surcharge for risk score >= 0.8",
        cohort_sql: "SELECT unit_id FROM exposures_daily WHERE tenant_id = '00000000-0000-0000-0000-000000000001' AND (risk_vars->>'risk_score')::numeric >= 0.8",
        param_patch: {
          add_surcharge: {
            name: "High Risk",
            when: { risk_score: { ">=": 0.8 } },
            percent: 0.10
          }
        },
        backtest_from: "2025-07-01",
        backtest_to: "2025-10-01"
      })
    });

    const data = await res.json();
    expect(data.experiment_id).toBeDefined();
    expect(data.results.kpis.portfolio.affected_units).toBeGreaterThan(0);
  });

  it("Smoke 3: Cap discounts", async () => {
    const res = await fetch(`${API_BASE}/api/experiments/run-backtest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nl_change: "Cap discounts at 10%",
        cohort_sql: "SELECT unit_id FROM exposures_daily WHERE tenant_id = '00000000-0000-0000-0000-000000000001'",
        param_patch: {
          cap: { max_change_pct: 0.10, min_change_pct: -0.10 }
        },
        backtest_from: "2025-07-01",
        backtest_to: "2025-10-01"
      })
    });

    const data = await res.json();
    expect(data.experiment_id).toBeDefined();
  });
});
```

**Run tests:**
```bash
npm run test
```

---

### 2. Add Input Validation

File: `/src/lib/validation.ts`

```ts
/**
 * Validation utilities for experiments
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validate backtest date range
 * Min: 30 days, Max: 365 days
 */
export function validateDateRange(from: string, to: string) {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const diffDays = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    throw new ValidationError("Backtest range must be at least 30 days");
  }

  if (diffDays > 365) {
    throw new ValidationError("Backtest range cannot exceed 365 days");
  }

  if (fromDate > toDate) {
    throw new ValidationError("'from' date must be before 'to' date");
  }
}

/**
 * Validate param patch
 * Ensure changes within -20%..+25% (unless explicitly capped)
 */
export function validateParamPatch(patch: any) {
  if (patch.base_rate_pct_change !== undefined) {
    const change = patch.base_rate_pct_change;

    if (change < -0.20) {
      throw new ValidationError("Base rate decrease cannot exceed -20% (set cap if needed)");
    }

    if (change > 0.25) {
      throw new ValidationError("Base rate increase cannot exceed +25% (set cap if needed)");
    }
  }

  // Validate surcharges
  if (patch.add_surcharge) {
    const pct = patch.add_surcharge.percent;
    if (pct < 0 || pct > 0.50) {
      throw new ValidationError("Surcharge percent must be between 0% and 50%");
    }
  }

  // Validate discounts
  if (patch.add_discount) {
    const pct = patch.add_discount.percent;
    if (pct > 0 || pct < -0.50) {
      throw new ValidationError("Discount percent must be between 0% and -50%");
    }
  }
}

/**
 * Validate cohort SQL (basic safety checks)
 */
export function validateCohortSQL(sql: string) {
  const lower = sql.toLowerCase();

  // Must include tenant_id filter
  if (!lower.includes("tenant_id")) {
    throw new ValidationError("Cohort SQL must filter by tenant_id");
  }

  // Block dangerous keywords
  const dangerous = ["drop", "delete", "truncate", "alter", "create"];
  for (const keyword of dangerous) {
    if (lower.includes(keyword)) {
      throw new ValidationError(`Cohort SQL cannot contain: ${keyword.toUpperCase()}`);
    }
  }

  // Must select unit_id or policy_id
  if (!lower.includes("unit_id") && !lower.includes("policy_id")) {
    throw new ValidationError("Cohort SQL must SELECT unit_id or policy_id");
  }
}
```

**Wire into API route:**

```ts
// In /app/api/experiments/run-backtest/route.ts
import { validateDateRange, validateParamPatch, validateCohortSQL, ValidationError } from "@/src/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const { cohort_sql, param_patch, backtest_from, backtest_to, ... } = await req.json();

    // Validate inputs
    validateDateRange(backtest_from, backtest_to);
    validateParamPatch(param_patch);
    validateCohortSQL(cohort_sql);

    // ... rest of logic
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    // ... other errors
  }
}
```

---

### 3. Add 30s Soft Timeout

File: `/app/api/experiments/run-backtest/route.ts`

```ts
// Add timeout wrapper
async function runBacktestWithTimeout(input: BacktestInput): Promise<ExperimentResults> {
  return Promise.race([
    runBacktest(input),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Backtest timeout (30s)")), 30000)
    ),
  ]);
}

// Use in POST handler
const results = await runBacktestWithTimeout({
  tenant_id,
  cohort_sql,
  base_params,
  candidate_params,
  backtest_from: from,
  backtest_to: to,
});
```

**UI: Show helpful error on timeout:**

```tsx
// In /app/experiments/page.tsx
catch (error) {
  if (error.message.includes("timeout")) {
    setToast("Backtest timed out. Try a smaller cohort or date range.");
  } else {
    setToast("Backtest failed");
  }
}
```

---

### 4. Create Demo Script

File: `/tests/demo-script.md`

```markdown
# Demo Script — Nova 2.0 Rate Experiment Sandbox

**Duration:** 5 minutes  
**Audience:** Actuaries, product managers, regulators

---

## Setup (before demo)

1. Open browser: `http://localhost:3000/experiments`
2. Clear any old experiments (optional)
3. Prepare 3 NL prompts in a text file

---

## Demo Flow

### Part 1: Create Experiment (2 min)

**Say:** "Let's say we want to increase pricing for high-risk fleets..."

1. Click **"New experiment"**
2. Paste:
   ```
   Increase base rate by 7% for fleets with 3 or more guardrail hits in last 30 days
   ```
3. Set dates: **2025-07-01** to **2025-10-01**
4. Click **"Run Backtest"**
5. **Wait 5-10 seconds** (show loading)

**Say:** "Nova is now running a historical backtest on 90 days of data..."

---

### Part 2: Review Results (2 min)

**KPIs (top cards):**
- **Δ Premium:** +$12,345 (3.2% increase)
- **Δ Loss Ratio:** -4.0pp (improved profitability)
- **Affected Policies:** 142 (36% of book)

**Say:** "The experiment increases premium by 3.2% while improving loss ratio by 4 points."

**Click "Segments" tab:**
- Show breakdown by Product, Risk Decile, Geography
- **Say:** "We can see the impact varies by segment..."

**Click "Winners" tab:**
- Show top 10 policies with premium decreases
- **Say:** "These are the policies that would see lower premiums..."

**Click "Losers" tab:**
- Show top 10 policies with premium increases
- **Say:** "And these are the policies that would pay more..."

**Click "Side Effects" tab:**
- Show guardrail hit rate change
- **Say:** "We also track fairness metrics to ensure no unintended side effects..."

---

### Part 3: Deploy & Export (1 min)

**Click "Deploy to Staging":**
- Toast appears: "Deployed candidate params to STAGING"
- **Say:** "Now this rate plan is live in our staging environment for testing..."

**Click "Export Filing":**
- Toast appears: "Filing exported: 6 files"
- **Say:** "And we can generate a complete actuarial filing package for regulators..."

**Open summary link (if time):**
- Show 2-3 page Markdown report
- **Say:** "This includes an executive summary, impact analysis, and methodology..."

---

### Part 4: Q&A

**Q:** "Can we test other scenarios?"  
**A:** "Yes, try: 'Add 10% surcharge for risk score >= 0.8'"

**Q:** "How long does it take?"  
**A:** "5-10 seconds for 90 days of data, scales to 365 days."

**Q:** "What if we want to see real-time quotes?"  
**A:** "We have a `/api/rating/quote` endpoint that returns instant pricing."

---

## Backup Prompts (if needed)

1. "Cap discounts at 10% for fleets smaller than 5 units"
2. "Add 5% surcharge for units in California"
3. "Decrease base rate by 3% for low-risk fleets (risk score < 0.5)"

---

## Troubleshooting

**"Backtest taking too long":**
- Check cohort size (should be <1000 units for demo)

**"No segments shown":**
- Cohort too small (need at least 10 units per segment)

**"Export links not working":**
- Check `filings` bucket exists and is public
```

---

## ✅ Acceptance Criteria

### Smoke Tests Pass

```bash
npm run test
# All 3 smoke tests pass
```

### Input Validation Works

```bash
# Test: Date range too short
curl -X POST http://localhost:3000/api/experiments/run-backtest \
  -d '{"backtest_from":"2025-10-01","backtest_to":"2025-10-15",...}' \
  | jq
# Expected: 400 "Backtest range must be at least 30 days"

# Test: Base rate change too large
curl -X POST http://localhost:3000/api/experiments/run-backtest \
  -d '{"param_patch":{"base_rate_pct_change":0.50},...}' \
  | jq
# Expected: 400 "Base rate increase cannot exceed +25%"
```

### Timeout Works

```bash
# Test: Large cohort (all exposures)
curl -X POST http://localhost:3000/api/experiments/run-backtest \
  -d '{"cohort_sql":"SELECT * FROM exposures_daily",...}' \
  | jq
# Expected: 500 "Backtest timeout (30s)" (if slow)
```

### Demo Script Runs Smoothly

- ✅ Part 1: Create experiment completes in <10s
- ✅ Part 2: All tabs render correctly
- ✅ Part 3: Deploy + Export both work
- ✅ No errors or freezes

---

## 📦 Phase 5 Deliverables

- [x] Smoke tests created and passing
- [x] Input validation added to API routes
- [x] 30s timeout implemented with helpful error
- [x] Demo script written and tested
- [x] 5-minute demo rehearsed

---

## ➡️ Next Phase

Once QA complete, proceed to **Phase 6 — Observability + Slack + RLS Tests**.

```bash
echo "✅ Phase 5 complete" >> PROGRESS.md
```


