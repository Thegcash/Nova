import { NextRequest } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabaseServer";
import { runBacktest } from "@/src/workers/backtest";
import { RateParams } from "@/src/rating/engine";
import { logStep } from "@/src/lib/obs";
import { checkLimit } from "@/src/lib/ratelimit";

const Req = z.object({
  cohort_sql: z.string(),
  param_patch: z.record(z.any()),
  backtest_from: z.string(),
  backtest_to: z.string(),
  base_rate_plan_id: z.string(),
});

const asDate = (s:string)=>new Date(s+"T00:00:00Z");
function daysBetween(a:string,b:string){ return Math.ceil((asDate(b).getTime()-asDate(a).getTime())/86400000); }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cohort_sql, param_patch, backtest_from, backtest_to, base_rate_plan_id } = Req.parse(body);

    // Validate date range: 30-365 days
    const range = daysBetween(backtest_from, backtest_to);
    if (range < 30 || range > 365) {
      return new Response(JSON.stringify({ error:`backtest range must be 30–365 days (got ${range})` }), { status:400 });
    }

    // Validate param_patch bounds
    const pct = Number((body?.param_patch?.base_rate_pct_change ?? 0));
    const hasCaps = !!body?.param_patch?.cap?.max_change_pct || !!body?.param_patch?.cap?.min_change_pct;
    if (!hasCaps && (pct < -0.20 || pct > 0.25)) {
      return new Response(JSON.stringify({ error:`base_rate_pct_change out of bounds [-0.20, 0.25] (got ${pct})` }), { status:400 });
    }

    const sb = supabaseServer();

    // Derive tenant (single-tenant dev fallback)
    const { data: tenRow, error: tErr } = await sb.from("exposures_daily").select("tenant_id").limit(1).maybeSingle();
    if (tErr) throw new Error(tErr.message);
    if (!tenRow?.tenant_id) throw new Error("tenant not found");
    const tenant_id = tenRow.tenant_id as string;

    // Rate limit check
    const lim = await checkLimit(tenant_id, "backtest_run", Number(process.env.RATE_LIMIT_BACKTESTS_PER_HOUR || 20), 3600);
    if (!lim.allowed) {
      return new Response(JSON.stringify({ error:"rate_limited: backtest hourly quota reached" }), { status: 429 });
    }

    // Load base rate plan
    const { data: plan, error: pErr } = await sb
      .from("rate_plans")
      .select("id, params")
      .eq("tenant_id", tenant_id)
      .eq("id", base_rate_plan_id)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!plan) throw new Error("base rate plan not found");

    // Create experiment shell
    const exp = {
      tenant_id,
      rate_plan_id: plan.id,
      nl_change: "",
      cohort_sql,
      param_patch,
      backtest_from,
      backtest_to,
      results: null,
      created_by: "00000000-0000-0000-0000-000000000000",
    };
    const { data: ins, error: iErr } = await sb.from("experiments").insert(exp).select("id").single();
    if (iErr) throw new Error(iErr.message);
    const experiment_id = ins.id as string;

    // Log start
    await logStep({ tenant_id, experiment_id, step: "api/run-backtest/start", detail:{ cohort_sql_len: cohort_sql.length }});

    // Run worker
    const results = await runBacktest({
      tenant_id, experiment_id,
      rate_plan_id: plan.id,
      cohort_sql,
      base_params: plan.params as RateParams,
      param_patch,
      from: backtest_from, to: backtest_to,
    });

    // Log end
    await logStep({ tenant_id, experiment_id, step: "api/run-backtest/end", detail:{ ok: true }});

    return new Response(JSON.stringify({ experiment_id, results }), { headers: { "content-type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "bad_request" }), { status: 400 });
  }
}
