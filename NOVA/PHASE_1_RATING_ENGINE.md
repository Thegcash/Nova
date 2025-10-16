# Phase 1 — Rating Engine (Pure) + Endpoint

**Status:** ⏳ Ready to execute  
**Prerequisites:** Phase 0 complete ✅  
**Est. Time:** 15 minutes

---

## 🎯 Goal

Build deterministic pricing function + HTTP wrapper with input validation.

---

## 📝 What Gets Created

1. `/src/rating/engine.ts` — Pure `quote()` function
2. `/app/api/rating/quote/route.ts` — HTTP endpoint with Zod validation
3. `/src/rating/engine.test.ts` — Unit tests for caps/floors/matchers

---

## 🔧 Implementation Steps

### 1. Review Existing Engine

The engine is already scaffolded in `/src/rating/engine.ts`. Verify it includes:

- ✅ `quote(params, risk_vars)` — Main pricing function
- ✅ `applyParamPatch(base, patch)` — Merge param changes
- ✅ `matches(vars, conditions)` — Rule matcher (supports `>=`, `<=`, `>`, `<`, `===`)

### 2. Add HTTP Endpoint

Create `/app/api/rating/quote/route.ts`:

**Features:**
- Zod schema validation for `RateParams` and `risk_vars`
- Returns `{ premium_components: [], total: number }`
- Error handling (400 for invalid input, 500 for engine errors)

**Example request:**
```json
POST /api/rating/quote
{
  "params": {
    "base_rate": 0.045,
    "surcharges": [{
      "name": "High Risk",
      "when": {"risk_score": {">=": 0.8}},
      "percent": 0.10
    }]
  },
  "risk_vars": {
    "exposure": 1,
    "risk_score": 0.85
  }
}
```

**Expected response:**
```json
{
  "premium_components": [
    {"name": "Base", "amount": 0.045},
    {"name": "High Risk", "amount": 0.0045}
  ],
  "total": 0.0495
}
```

### 3. Add Unit Tests

Create `/src/rating/engine.test.ts`:

**Test cases:**
- Base rate only (no surcharges/discounts)
- Surcharge applied when condition matches
- Discount applied (negative percent)
- Cap enforcement (max_change_pct)
- Floor enforcement (min_change_pct)
- Multiple surcharges stack
- `when` matcher: `>=`, `<=`, `>`, `<`, `===`

### 4. Install Dependencies

```bash
npm install zod
npm install -D vitest @vitest/ui
```

---

## ✅ Acceptance Criteria

### Manual Test (cURL)

```bash
# Test 1: Base rate only
curl -s -X POST http://localhost:3000/api/rating/quote \
  -H 'content-type: application/json' \
  -d '{
    "params": {"base_rate": 0.045},
    "risk_vars": {"exposure": 1}
  }' | jq

# Expected: {"premium_components": [{"name": "Base", "amount": 0.045}], "total": 0.045}

# Test 2: Surcharge for guardrail hits
curl -s -X POST http://localhost:3000/api/rating/quote \
  -H 'content-type: application/json' \
  -d '{
    "params": {
      "base_rate": 0.045,
      "surcharges": [{
        "name": "Guardrail Hits",
        "when": {"guardrail_hits_30d": {">=": 3}},
        "percent": 0.07
      }]
    },
    "risk_vars": {
      "exposure": 1,
      "guardrail_hits_30d": 4
    }
  }' | jq

# Expected: total = 0.04815 (base 0.045 * 1.07)

# Test 3: Cap enforcement
curl -s -X POST http://localhost:3000/api/rating/quote \
  -H 'content-type: application/json' \
  -d '{
    "params": {
      "base_rate": 0.045,
      "surcharges": [{"name": "Big", "when": {}, "percent": 0.50}],
      "caps": {"max_change_pct": 0.25}
    },
    "risk_vars": {"exposure": 1}
  }' | jq

# Expected: total = 0.05625 (base * 1.25, not 1.50)
```

### Unit Tests Pass

```bash
npm run test
# All tests pass
```

---

## 🚨 Common Issues

### "Zod not found"
```bash
npm install zod
```

### "Function matches() too strict"
Ensure `matches()` handles missing keys gracefully:
```ts
const x = vars[k];
if (x === undefined) return false; // Add this line
```

### "Discount not applied"
Discounts should have **negative** percent values:
```json
{"name": "Fleet Discount", "when": {...}, "percent": -0.10}
```

---

## 📦 Phase 1 Deliverables

- [x] `/src/rating/engine.ts` — Pure pricing function
- [x] `/app/api/rating/quote/route.ts` — HTTP endpoint
- [x] `/src/rating/engine.test.ts` — Unit tests
- [x] Manual cURL tests pass
- [x] Unit tests pass

---

## ➡️ Next Phase

Once all tests pass, proceed to **Phase 2 — Backtest Worker**.

```bash
# Mark Phase 1 complete
echo "✅ Phase 1 complete" >> PROGRESS.md
```


