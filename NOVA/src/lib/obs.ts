import { createClient } from "@supabase/supabase-js";

export function sbAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false }});
}

type LogArgs = {
  tenant_id: string;
  experiment_id: string;
  step: string;
  detail?: any;
  ms?: number;
};

export async function logStep(a: LogArgs) {
  try {
    const sb = sbAdmin();
    await sb.from("experiment_logs").insert({
      tenant_id: a.tenant_id,
      experiment_id: a.experiment_id,
      step: a.step,
      detail: a.detail ?? null,
      ms: a.ms ?? null
    });
  } catch (e) {
    // last-resort console path only (never throw)
    console.warn("[obs/logStep] failed", (e as any)?.message);
  }
}

export function withTimer() {
  const t0 = Date.now();
  return () => Date.now() - t0;
}


