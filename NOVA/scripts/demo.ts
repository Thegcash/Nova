import "dotenv/config";

const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const plan = process.env.RATE_PLAN_ID!;

if (!plan) {
  console.error("❌ Set RATE_PLAN_ID in env (from Supabase rate_plans.id)");
  process.exit(1);
}

const post = async (p:string, body:any)=> (await fetch(`${base}${p}`, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(body) })).json();

(async ()=>{
  console.log("🎬 Nova 2.0 Demo Script\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const nl = "Increase base rate 7% for fleets with ≥3 guardrail hits in last 30d";
  console.log("📝 Natural language input:");
  console.log(`   "${nl}"\n`);

  console.log("🤖 Parsing with GPT-4...");
  const parsed = await post("/api/llm/parse-pricing-change", { text: nl });
  console.log(`   Confidence: ${(parsed.confidence * 100).toFixed(1)}%`);
  console.log(`   Param patch:`, JSON.stringify(parsed.param_patch));
  console.log(`   Cohort SQL: ${parsed.cohort_sql?.slice(0,80)}...\n`);

  console.log("⚙️  Running backtest...");
  const run = await post("/api/experiments/run-backtest", {
    cohort_sql: parsed.cohort_sql,
    param_patch: parsed.param_patch,
    backtest_from: "2025-07-01",
    backtest_to: "2025-10-01",
    base_rate_plan_id: plan
  });
  
  console.log(`   Experiment ID: ${run.experiment_id}\n`);

  const kpis = run.results?.kpis?.portfolio;
  console.log("📊 Portfolio KPIs:");
  console.log(`   Δ Premium: $${kpis?.delta_written?.toFixed(2)}`);
  console.log(`   Δ Earned: $${kpis?.delta_earned?.toFixed(2)}`);
  console.log(`   LR Base: ${(kpis?.lr_base*100).toFixed(1)}%`);
  console.log(`   LR Candidate: ${(kpis?.lr_candidate*100).toFixed(1)}%`);
  console.log(`   Affected Policies: ${kpis?.affected_policies}`);
  console.log(`   Affected Units: ${kpis?.affected_units}`);
  console.log(`   Book Coverage: ${(kpis?.book_coverage_pct*100).toFixed(1)}%\n`);

  console.log("📄 Generating filing export...");
  const expId = run.experiment_id;
  const exp = await post("/api/experiments/export-filing", { experiment_id: expId });
  
  console.log("   Export links:");
  for (const [key, url] of Object.entries(exp.links)) {
    console.log(`   • ${key}: ${(url as string).slice(0, 60)}...`);
  }

  console.log("\n✅ Demo complete!");
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\nNext steps:");
  console.log("  1. Open http://localhost:3000/experiments");
  console.log("  2. Click 'New experiment' and paste the NL prompt");
  console.log("  3. Review results → Deploy → Export");
})().catch(e=>{ 
  console.error("\n❌ Demo failed:", e.message); 
  process.exit(1); 
});


