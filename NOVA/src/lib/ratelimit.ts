import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false }});

export async function checkLimit(tenant_id: string, key: "llm_parse"|"backtest_run", limit: number, windowSec: number){
  const { data, error } = await sb().rpc("check_rate_limit", {
    p_tenant_id: tenant_id,
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSec
  });
  if (error) throw new Error(error.message);
  const row = (data as any[])?.[0] ?? { allowed:false, remaining:0 };
  return row as { allowed: boolean; remaining: number };
}


