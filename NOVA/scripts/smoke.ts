import "dotenv/config";

const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const post = async (p:string, body:any) => {
  const r = await fetch(`${base}${p}`, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`${p} failed: ${r.status} ${(await r.text())}`);
  return r.json() as any;
};
const getPlan = async ()=>{
  const url = new URL("/api/experiments", base); // cheap ping to ensure server up
  await fetch(url);
  // We need a rate plan id (simplest: query Supabase via SQL console you did earlier)
  // To keep smoke self-contained, we accept plan id via env if set:
  const plan = process.env.RATE_PLAN_ID;
  if (!plan) throw new Error("Set RATE_PLAN_ID in env for smoke (from Supabase rate_plans.id).");
  return plan;
};

(async ()=>{
  console.log("🔍 Starting smoke tests...\n");
  const plan = await getPlan();
  const from = "2025-07-01", to = "2025-10-01";
  const tests = [
    "Increase base rate by 5% for all units",
    "Add 10% surcharge for units with risk score >= 0.8",
    "Cap discounts at 12% for fleets smaller than 5 units"
  ];
  
  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    console.log(`\n📝 Test ${i+1}: "${t}"`);
    
    const parsed = await post("/api/llm/parse-pricing-change", { text: t });
    const { cohort_sql, param_patch, confidence } = parsed;
    console.log(`   Confidence: ${(confidence * 100).toFixed(1)}%`);
    console.log(`   Param patch:`, JSON.stringify(param_patch));
    console.log(`   Cohort SQL: ${cohort_sql?.slice(0,80)}...`);
    
    const run = await post("/api/experiments/run-backtest", {
      cohort_sql,
      param_patch,
      backtest_from: from,
      backtest_to: to,
      base_rate_plan_id: plan
    });
    
    const kpis = run?.results?.kpis?.portfolio;
    console.log(`   ✅ Backtest complete:`);
    console.log(`      Δ Premium: $${kpis?.delta_written?.toFixed(2)}`);
    console.log(`      LR: ${(kpis?.lr_base*100).toFixed(1)}% → ${(kpis?.lr_candidate*100).toFixed(1)}%`);
    console.log(`      Affected units: ${kpis?.affected_units}`);
  }
  
  console.log("\n✅ All smoke tests passed!");
})().catch(e=>{ 
  console.error("\n❌ Smoke test failed:", e.message); 
  process.exit(1); 
});


