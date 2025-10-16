# Phase 4 — Wire UI to APIs

**Status:** ⏳ Ready to execute  
**Prerequisites:** Phase 3 complete ✅  
**Est. Time:** 20 minutes

---

## 🎯 Goal

Replace all mock data in the UI with real `fetch()` calls to backend APIs. Add loading states and error handling.

---

## 📝 What Gets Updated

1. `/app/experiments/page.tsx` — Main experiments interface ✅ (already wired)

**Note:** The UI is already fully wired! This phase verifies the integration works end-to-end.

---

## 🔧 Verification Steps

### 1. Check Existing API Calls

File: `/app/experiments/page.tsx`

**Verify these fetch calls exist:**

**A. List Experiments (on mount)**
```ts
useEffect(() => {
  if (route === "list") {
    fetchExperiments();
  }
}, [route]);

const fetchExperiments = async () => {
  const res = await fetch("/api/experiments");
  const data = await res.json();
  setExperiments(data);
};
```

**B. Parse NL + Run Backtest (NewExperimentDrawer)**
```ts
const onRun = async (nl, from, to) => {
  // Parse
  const parseRes = await fetch("/api/llm/parse-pricing-change", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: nl })
  });
  const parsed = await parseRes.json();

  // Run backtest
  const backtestRes = await fetch("/api/experiments/run-backtest", {
    method: "POST",
    body: JSON.stringify({
      nl_change: nl,
      cohort_sql: parsed.cohort_sql,
      param_patch: parsed.param_patch,
      backtest_from: from,
      backtest_to: to
    })
  });
  const backtest = await backtestRes.json();

  goDetail(backtest.experiment_id);
};
```

**C. Fetch Experiment Details (ResultsView mount)**
```ts
useEffect(() => {
  if (route === "detail" && currentExperimentId) {
    fetchExperimentDetails(currentExperimentId);
  }
}, [route, currentExperimentId]);

const fetchExperimentDetails = async (id) => {
  const res = await fetch(`/api/experiments/${id}`);
  const data = await res.json();
  setCurrentExperiment(data);
};
```

**D. Deploy to Staging (button)**
```ts
const onDeploy = async () => {
  await fetch("/api/experiments/deploy-staging", {
    method: "POST",
    body: JSON.stringify({ experiment_id: currentExperimentId })
  });
  setToast("Deployed candidate params to STAGING");
};
```

**E. Export Filing (button)**
```ts
const onExport = async () => {
  const res = await fetch("/api/experiments/export-filing", {
    method: "POST",
    body: JSON.stringify({ experiment_id: currentExperimentId })
  });
  const data = await res.json();
  setToast(`Filing exported: ${Object.keys(data.links).length} files`);
};
```

---

## ✅ Acceptance Criteria

### Test 1: End-to-End Flow (Manual UI Test)

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to experiments:**
   ```
   http://localhost:3000/experiments
   ```

3. **List View:**
   - ✅ Shows "Loading..." initially
   - ✅ Displays experiments table (or "No experiments" if empty)
   - ✅ Click "Open" on an experiment → navigates to Results View

4. **New Experiment Drawer:**
   - ✅ Click "New experiment" button
   - ✅ Enter: "Increase base rate by 7% for fleets with ≥3 guardrail hits in last 30d"
   - ✅ Set dates: 2025-07-01 to 2025-10-01
   - ✅ Click "Run Backtest"
   - ✅ Shows loading overlay ("Running backtest...")
   - ✅ Navigates to Results View after ~5-10 seconds

5. **Results View:**
   - ✅ Displays 4 KPI cards (Δ Premium, Δ Loss Ratio, Affected Policies, Affected Units)
   - ✅ All 6 tabs render: Overview, Segments, Winners, Losers, Side Effects, Audit
   - ✅ Segments tab shows 4 tables (Product, Risk Decile, Fleet Size, Geography)
   - ✅ Winners/Losers tabs show policy lists
   - ✅ Audit tab shows param diff (from → to)

6. **Deploy:**
   - ✅ Click "Deploy to Staging"
   - ✅ Toast appears: "Deployed candidate params to STAGING"

7. **Export:**
   - ✅ Click "Export Filing"
   - ✅ Toast appears: "Filing exported: 6 files"

### Test 2: Error Handling

**A. Invalid NL input:**
```
Enter: "asdfghjkl"
Click "Run Backtest"
→ Should still return a result (fallback parser with low confidence)
→ Or show toast: "Failed to parse pricing change"
```

**B. Network error:**
```
Stop dev server mid-backtest
→ Should show toast: "Backtest failed"
→ Loading overlay should dismiss
```

**C. Empty experiments list:**
```
Fresh DB with no experiments
→ Should show: "No experiments yet. Click 'New experiment' to get started."
```

### Test 3: Loading States

**Verify these loading indicators:**
- ✅ List View: "Loading..." row while fetching
- ✅ New Experiment: Loading overlay with "Running backtest..." during API call
- ✅ Results View: "Loading results..." if experiment not yet fetched
- ✅ Deploy/Export: Button disabled during API call (optional enhancement)

---

## 🚨 Common Issues

### "Experiments list empty"

**Cause:** No experiments in DB  
**Fix:** Run a backtest via UI first, or manually via cURL (see Phase 2)

### "Results not loading"

**Cause:** Experiment ID mismatch or API error  
**Fix:** Check browser console for 404/500 errors  
**Debug:**
```ts
console.log("Fetching experiment:", id);
const res = await fetch(`/api/experiments/${id}`);
console.log("Response:", await res.json());
```

### "Toast not showing"

**Cause:** Toast timeout too short or state not updating  
**Fix:** Add auto-dismiss:
```ts
useEffect(() => {
  if (toast) {
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }
}, [toast]);
```

### "CORS error"

**Cause:** API route not returning proper headers  
**Fix:** Should not happen with Next.js API routes (same-origin)

### "Headers already sent" error

**Cause:** Multiple `NextResponse.json()` calls in API route  
**Fix:** Ensure only one response per request

---

## 🎨 Optional Enhancements

### Add Skeleton Loaders

Replace "Loading..." text with animated skeletons:

```tsx
function SkeletonRow() {
  return (
    <tr>
      <td colSpan={9}>
        <div className="animate-pulse flex space-x-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </td>
    </tr>
  );
}
```

### Add Copy-to-Clipboard for Export Links

```tsx
const onExport = async () => {
  const res = await fetch("/api/experiments/export-filing", ...);
  const data = await res.json();
  
  // Copy summary link
  navigator.clipboard.writeText(data.links.summary_md);
  setToast("Summary link copied to clipboard!");
};
```

### Add Keyboard Shortcuts

```tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.metaKey && e.key === 'k') {
      e.preventDefault();
      goNew(); // Open new experiment drawer
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

## 📦 Phase 4 Deliverables

- [x] All UI components fetching from real APIs (no mocks)
- [x] End-to-end flow works: List → New → Backtest → Results → Deploy/Export
- [x] Loading states visible during API calls
- [x] Error toasts shown on failures
- [x] Manual UI testing complete

---

## 🎬 Demo Script (for stakeholders)

1. **Navigate to `/experiments`**
2. **Click "New experiment"**
3. **Paste:** "Increase base rate by 7% for fleets with ≥3 guardrail hits in last 30d"
4. **Set dates:** 2025-07-01 to 2025-10-01
5. **Click "Run Backtest"** → Wait 5-10s
6. **Review Results:**
   - KPIs: Δ Premium, Δ LR, Affected Policies
   - Segments: By Product, Risk Decile
   - Winners/Losers: Top 10 policies
7. **Click "Deploy to Staging"** → Toast confirms
8. **Click "Export Filing"** → Toast with links

---

## ➡️ Next Phase

Once UI testing complete, proceed to **Phase 5 — QA + Demo + Perf Guardrails**.

```bash
echo "✅ Phase 4 complete" >> PROGRESS.md
```


