import { NextRequest } from "next/server";
import { supaAdmin, putText, putCSV, signURL } from "@/src/lib/storage";
import { getOpenAI } from "@/src/lib/openai";
import { toCSV } from "@/src/lib/csv";
import { logStep } from "@/src/lib/obs";

export async function POST(req: NextRequest){
  try{
    const { experiment_id } = await req.json();
    if (!experiment_id) return new Response(JSON.stringify({ error:"experiment_id_required" }), { status:400 });

    const sb = supaAdmin();
    const { data: exp, error } = await sb.from("experiments").select("*, rate_plans(id, params)").eq("id", experiment_id).maybeSingle();
    if (error || !exp) throw new Error(error?.message || "experiment_not_found");

    const tenant_id = exp.tenant_id as string;
    const results = exp.results || {};
    const param_diff = results?.audit?.param_diff ?? {};
    const pathBase = `filings/${tenant_id}/${experiment_id}`;
    const narratorSystem = await (await fetch(new URL("/prompts/narrator.prmpt", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"))).text().catch(()=>null);

    // 1) Markdown summary via OpenAI
    const openai = getOpenAI();
    const md = await (async () => {
      const resp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: narratorSystem ?? "Write a neutral actuarial markdown summary." },
          { role: "user", content: JSON.stringify({ results, param_diff }) }
        ],
      });
      return resp.choices?.[0]?.message?.content ?? "Summary unavailable.";
    })();

    await putText(`${pathBase}/summary.md`, md);

    // 2) CSVs
    const kpis = [ results?.kpis?.portfolio ?? {} ];
    const seg_product = results?.segments?.by_product ?? [];
    const seg_fleet   = results?.segments?.by_fleet_size ?? [];
    const seg_decile  = results?.segments?.by_risk_decile ?? [];
    const seg_geo     = results?.segments?.by_geo ?? [];
    const winners     = results?.winners ?? [];
    const losers      = results?.losers ?? [];

    await putCSV(`${pathBase}/kpis.csv`,       toCSV(kpis));
    await putCSV(`${pathBase}/segments_product.csv`, toCSV(seg_product));
    await putCSV(`${pathBase}/segments_fleet.csv`,   toCSV(seg_fleet));
    await putCSV(`${pathBase}/segments_decile.csv`,  toCSV(seg_decile));
    await putCSV(`${pathBase}/segments_geo.csv`,     toCSV(seg_geo));
    await putCSV(`${pathBase}/winners.csv`,    toCSV(winners));
    await putCSV(`${pathBase}/losers.csv`,     toCSV(losers));

    // 3) Signed links (24h)
    const links = {
      summary_md: await signURL(`${pathBase}/summary.md`),
      kpis_csv: await signURL(`${pathBase}/kpis.csv`),
      segments_product_csv: await signURL(`${pathBase}/segments_product.csv`),
      segments_fleet_csv: await signURL(`${pathBase}/segments_fleet.csv`),
      segments_decile_csv: await signURL(`${pathBase}/segments_decile.csv`),
      segments_geo_csv: await signURL(`${pathBase}/segments_geo.csv`),
      winners_csv: await signURL(`${pathBase}/winners.csv`),
      losers_csv: await signURL(`${pathBase}/losers.csv`),
    };

    // Log export
    await logStep({ tenant_id, experiment_id, step:"api/export-filing/done", detail:{ files: Object.keys(links) }});

    return new Response(JSON.stringify({ links }), { headers:{ "content-type":"application/json" }});
  }catch(e:any){
    return new Response(JSON.stringify({ error: e?.message ?? "export_failed" }), { status: 400 });
  }
}
