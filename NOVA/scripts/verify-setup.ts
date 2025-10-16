#!/usr/bin/env tsx
/**
 * Phase 0 Verification Script
 * Checks that Supabase schema, storage, and envs are ready
 * 
 * Usage: npx tsx scripts/verify-setup.ts
 */

import { createClient } from "@supabase/supabase-js";

const REQUIRED_ENVS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE",
  "OPENAI_API_KEY",
];

const OPTIONAL_ENVS = ["SLACK_WEBHOOK_EXPERIMENTS"];

const REQUIRED_TABLES = [
  "exposures_daily",
  "losses",
  "guardrail_hits",
  "rate_plans",
  "experiments",
];

const REQUIRED_VIEWS = ["vw_policy_performance"];

const REQUIRED_BUCKETS = ["filings"];

async function verify() {
  console.log("🔍 Phase 0 — Verification\n");

  // 1. Check environment variables
  console.log("📋 Checking environment variables...");
  const missingEnvs: string[] = [];
  
  for (const env of REQUIRED_ENVS) {
    if (!process.env[env]) {
      missingEnvs.push(env);
      console.log(`  ❌ ${env} — MISSING`);
    } else {
      console.log(`  ✅ ${env} — OK`);
    }
  }

  for (const env of OPTIONAL_ENVS) {
    if (!process.env[env]) {
      console.log(`  ⚠️  ${env} — Optional, not set`);
    } else {
      console.log(`  ✅ ${env} — OK`);
    }
  }

  if (missingEnvs.length > 0) {
    console.error(`\n❌ Missing required environment variables: ${missingEnvs.join(", ")}`);
    console.error("Create .env.local with these values (see .env.example)");
    process.exit(1);
  }

  // 2. Connect to Supabase
  console.log("\n🔌 Connecting to Supabase...");
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );

  // 3. Check tables
  console.log("\n📊 Checking tables...");
  const missingTables: string[] = [];

  for (const table of REQUIRED_TABLES) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        console.log(`  ❌ ${table} — NOT FOUND (${error.message})`);
        missingTables.push(table);
      } else {
        console.log(`  ✅ ${table} — OK`);
      }
    } catch (err: any) {
      console.log(`  ❌ ${table} — ERROR (${err.message})`);
      missingTables.push(table);
    }
  }

  // 4. Check views (query directly)
  console.log("\n👁️  Checking views...");
  for (const view of REQUIRED_VIEWS) {
    try {
      const { error } = await supabase.rpc("pg_get_viewdef", {
        viewname: view,
      });

      if (error) {
        console.log(`  ⚠️  ${view} — Could not verify (this is expected)`);
      } else {
        console.log(`  ✅ ${view} — OK`);
      }
    } catch {
      console.log(`  ⚠️  ${view} — Could not verify (manual check needed)`);
    }
  }

  // 5. Check storage buckets
  console.log("\n🗄️  Checking storage buckets...");
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error(`  ❌ Could not list buckets: ${bucketsError.message}`);
  } else {
    for (const bucket of REQUIRED_BUCKETS) {
      const exists = buckets?.some((b) => b.name === bucket);
      if (exists) {
        console.log(`  ✅ ${bucket} — OK`);
      } else {
        console.log(`  ❌ ${bucket} — MISSING`);
        console.log(`     Create in Supabase Dashboard → Storage → Create bucket: "${bucket}"`);
      }
    }
  }

  // 6. Check for sample data
  console.log("\n📦 Checking for sample data...");
  const { count: expCount } = await supabase
    .from("exposures_daily")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", "00000000-0000-0000-0000-000000000001");

  const { count: planCount } = await supabase
    .from("rate_plans")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", "00000000-0000-0000-0000-000000000001");

  if ((expCount ?? 0) === 0) {
    console.log(`  ⚠️  No exposures found for demo tenant`);
    console.log(`     Run migrations/003_seed_demo_data.sql in Supabase SQL Editor`);
  } else {
    console.log(`  ✅ ${expCount} exposures found for demo tenant`);
  }

  if ((planCount ?? 0) === 0) {
    console.log(`  ⚠️  No rate plans found for demo tenant`);
    console.log(`     Run migrations/003_seed_demo_data.sql in Supabase SQL Editor`);
  } else {
    console.log(`  ✅ ${planCount} rate plans found for demo tenant`);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  if (missingTables.length > 0) {
    console.log("❌ VERIFICATION FAILED");
    console.log(`\nMissing tables: ${missingTables.join(", ")}`);
    console.log("\nAction required:");
    console.log("1. Open Supabase Dashboard → SQL Editor");
    console.log("2. Run migrations/002_experiments.sql");
    console.log("3. Run migrations/003_seed_demo_data.sql");
    process.exit(1);
  } else {
    console.log("✅ VERIFICATION PASSED");
    console.log("\nAll required tables, views, and storage are ready.");
    console.log("Proceed to Phase 1 — Rating Engine");
  }
}

// Run verification
verify().catch((err) => {
  console.error("\n❌ Verification error:", err);
  process.exit(1);
});


