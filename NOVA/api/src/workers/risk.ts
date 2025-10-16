import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE!;
const TENANT_ID = process.env.TENANT_ID!;

if (!url || !key || !TENANT_ID) {
  console.error('[risk] Missing env vars. Check SUPABASE_URL, SUPABASE_SERVICE_ROLE, TENANT_ID.');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function tick() {
  const started = new Date().toISOString();
  try {
    const { error } = await supabase.rpc('compute_risk_score_upsert', { p_tenant_id: TENANT_ID });
    if (error) throw error;
    console.log(`[risk] ${started} recompute OK`);
  } catch (e: any) {
    console.error(`[risk] ${started} ERROR:`, e?.message || e);
  }
}

(async () => {
  console.log('[risk] worker booted');
  await tick();                  // run once on boot
  setInterval(tick, 60_000);     // then every 60s
})();
