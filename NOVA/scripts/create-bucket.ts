#!/usr/bin/env tsx
/**
 * Create filings storage bucket if missing
 * Usage: npx tsx scripts/create-bucket.ts
 */

import { createClient } from "@supabase/supabase-js";

async function createBucket() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );

  console.log("🗄️  Creating 'filings' storage bucket...");

  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === "filings");

  if (exists) {
    console.log("✅ Bucket 'filings' already exists");
    return;
  }

  const { data, error } = await supabase.storage.createBucket("filings", {
    public: true,
    fileSizeLimit: 10485760, // 10MB
  });

  if (error) {
    console.error("❌ Failed to create bucket:", error.message);
    process.exit(1);
  }

  console.log("✅ Bucket 'filings' created successfully");
}

createBucket().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});


