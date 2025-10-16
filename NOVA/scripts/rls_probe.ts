import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Requires an anon key to truly test RLS; skip if you don't have one.
const ANON = process.env.SUPABASE_ANON_KEY;
const URL = process.env.SUPABASE_URL!;

if (!ANON) {
  console.log("✓ SKIP (no SUPABASE_ANON_KEY). RLS probe requires anon key.");
  console.log("  To test RLS: set SUPABASE_ANON_KEY in .env.local and re-run.");
  process.exit(0);
}

const sb = createClient(URL, ANON, { auth:{ persistSession:false }});

(async ()=>{
  console.log("🔒 RLS Probe (using anon key)...\n");

  const tables = ["experiments", "rate_plans", "exposures_daily", "losses", "cohort_units"];
  
  for (const table of tables) {
    const { data, error } = await sb.from(table).select("*").limit(5);
    const status = error ? `❌ ${error.message}` : `✅ ${data?.length ?? 0} rows`;
    console.log(`   ${table.padEnd(20)} ${status}`);
  }

  console.log("\n✓ RLS probe complete");
  console.log("  Note: dev_read policy allows all reads. Tighten in production.");
})();


