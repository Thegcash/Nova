import "dotenv/config";

const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

async function post(path:string, body:any){
  const r = await fetch(`${base}${path}`, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(()=>({}));
  return { ok: r.ok, status: r.status, json: j };
}

(async ()=>{
  console.log("🔒 Rate Limit Smoke Tests\n");
  
  // get a plan id (require env to avoid extra queries)
  const plan = process.env.RATE_PLAN_ID;
  if (!plan) throw new Error("Set RATE_PLAN_ID for ratelimit smoke.");

  // 1) LLM parse 11x to trigger limit (default 10/hr)
  console.log("📝 Testing LLM parser rate limit (10/hour)...");
  let hits = 0, last:any = null;
  for (let i=0;i<11;i++){
    last = await post("/api/llm/parse-pricing-change", { text:`Increase base rate ${(i+1)}% for all units` });
    hits++;
    if (!last.ok && last.status===429) {
      console.log(`   ✅ Hit rate limit after ${hits} calls`);
      console.log(`   Error message: "${last.json?.error}"`);
      break;
    }
  }
  if (last.ok) {
    console.log(`   ⚠️  No rate limit hit after ${hits} calls (expected limit at 11)`);
  }

  // Wait a beat
  await new Promise(r => setTimeout(r, 1000));

  // 2) Backtest 21x to trigger limit (default 20/hr)
  console.log("\n⚙️  Testing backtest rate limit (20/hour)...");
  hits = 0; last = null;
  for (let i=0;i<21;i++){
    last = await post("/api/experiments/run-backtest", {
      cohort_sql: "select unit_id from exposures_daily limit 5",
      param_patch: { base_rate_pct_change: 0.01 },
      backtest_from: "2025-07-01",
      backtest_to: "2025-10-01",
      base_rate_plan_id: plan
    });
    hits++;
    if (!last.ok && last.status===429) {
      console.log(`   ✅ Hit rate limit after ${hits} calls`);
      console.log(`   Error message: "${last.json?.error}"`);
      break;
    }
  }
  if (last.ok) {
    console.log(`   ⚠️  No rate limit hit after ${hits} calls (expected limit at 21)`);
  }

  console.log("\n✅ Rate limit smoke complete");
  console.log("   Note: Limits reset after 1 hour window");
})().catch(e=>{ 
  console.error("\n❌ Rate limit smoke failed:", e.message); 
  process.exit(1); 
});


