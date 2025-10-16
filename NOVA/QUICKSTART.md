# Nova 2.0 — Quick Start Guide

Get the Rate Experiment Sandbox running in **5 minutes**.

---

## 1. Install Dependencies

```bash
cd NOVA
npm install
```

## 2. Set Up Supabase

### A. Run Migrations

1. Open [Supabase Dashboard](https://app.supabase.com) → Your Project → SQL Editor
2. Create new query, paste contents of `migrations/002_experiments.sql`
3. Execute
4. Paste contents of `migrations/003_seed_demo_data.sql`
5. Execute

### B. Create Storage Bucket

1. Go to **Storage** → Create bucket: `filings`
2. Set **Public bucket**: ✅ Enabled

## 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGci...
OPENAI_API_KEY=sk-...
```

> **Where to find keys:**
> - Supabase URL & Service Role: Dashboard → Settings → API
> - OpenAI Key: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

## 4. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000/experiments](http://localhost:3000/experiments)

---

## 5. Run Your First Experiment

### Step 1: Click "New experiment"

### Step 2: Enter Pricing Change

Example:
```
Increase base rate by 7% for fleets with 3 or more guardrail hits in last 30 days
```

### Step 3: Set Backtest Window

- **From:** 2025-07-01
- **To:** 2025-10-01

(Uses last 90 days by default)

### Step 4: Click "Run Backtest"

Wait 5-10 seconds for results.

### Step 5: Review Results

Tabs:
- **Overview** — KPI summary, charts
- **Segments** — By product, fleet size, risk decile, geography
- **Winners** — Top 10 policies with premium decreases
- **Losers** — Top 10 policies with premium increases
- **Side Effects** — Guardrail hit rate changes
- **Audit** — Parameter diff (from → to)

### Step 6: Deploy or Export

- **Deploy to Staging** — Creates new `rate_plan` with `status='staging'`
- **Export Filing** — Generates markdown summary + CSVs

---

## Example Experiments to Try

1. **Base Rate Increase:**
   ```
   Increase base rate by 5% for all units
   ```

2. **Surcharge for High Risk:**
   ```
   Add 10% surcharge for units with risk score >= 0.8
   ```

3. **Discount Cap:**
   ```
   Cap discounts at 12% for fleets smaller than 5 units
   ```

4. **Guardrail-Based Pricing:**
   ```
   Add 8% surcharge for units with more than 2 guardrail violations in last 30 days
   ```

---

## Troubleshooting

### "No experiments shown"

**Solution:** Verify Supabase connection in `.env.local`

```bash
# Test connection
curl $SUPABASE_URL/rest/v1/experiments \
  -H "apikey: $SUPABASE_SERVICE_ROLE"
```

### "Backtest failed"

**Solution:** Check browser console for errors. Common issues:
- Missing demo data → Run `003_seed_demo_data.sql`
- Invalid cohort SQL → Check console for SQL error

### "Parser returns low confidence"

**Solution:** Input is ambiguous. Try more specific wording:
- ❌ "Make it safer"
- ✅ "Add 5% surcharge for risk score > 0.75"

### "Export filing failed"

**Solution:**
- Verify `OPENAI_API_KEY` is set
- Check Supabase Storage bucket `filings` exists and is public

---

## What's Next?

- ✅ Backend API fully wired
- ✅ LLM parser + narrator
- ✅ Real backtest with segmentation
- ✅ Deploy to staging workflow
- ✅ Export filing (MD + CSVs)

**Roadmap:**
- [ ] Charts (LR over time, delta histogram)
- [ ] A/B testing (50/50 split)
- [ ] Regulatory filing templates (SERFF)
- [ ] Slack notifications
- [ ] Multi-tenant auth

---

**Need Help?**
- Check `README_EXPERIMENTS.md` for full docs
- Review `prompts/*.prmpt` to customize LLM behavior
- Inspect API routes in `app/api/experiments/*`

**Enjoy building your pricing OS! 🚀**


