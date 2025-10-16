import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function admin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false }});
}

// simple merge: only supports base_rate_pct_change + cap for v1
function applyPatch(base:any, patch:any){
  const out = JSON.parse(JSON.stringify(base || {}));
  if (typeof patch?.base_rate_pct_change === "number") {
    out.base_rate = Number(out.base_rate ?? 0) * (1 + patch.base_rate_pct_change);
  }
  if (patch?.cap) out.caps = { ...(out.caps||{}), ...patch.cap };
  return out;
}

export async function POST(req: NextRequest){
  try{
    const { experiment_id } = await req.json();
    if (!experiment_id) return new Response(JSON.stringify({error:"experiment_id_required"}),{status:400});

    const sb = admin();
    const { data: exp, error: e1 } = await sb
      .from("experiments")
      .select("*, rate_plans(id, params)")
      .eq("id", experiment_id).maybeSingle();
    if (e1 || !exp) throw new Error(e1?.message || "experiment_not_found");

    const patched = applyPatch(exp.rate_plans.params, exp.param_patch);

    const { error: e2 } = await sb
      .from("rate_plans")
      .update({ params: patched, status: "staging" })
      .eq("id", exp.rate_plan_id)
      .eq("tenant_id", exp.tenant_id);
    if (e2) throw e2;

    return new Response(JSON.stringify({ rate_plan_id: exp.rate_plan_id, status: "staging" }), { headers:{ "content-type":"application/json" }});
  }catch(e:any){
    return new Response(JSON.stringify({ error: e?.message ?? "deploy_failed" }), { status:400 });
  }
}
