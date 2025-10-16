import { NextRequest } from "next/server";
import { getOpenAI } from "@/src/lib/openai";
import { checkLimit } from "@/src/lib/ratelimit";
import { createClient } from "@supabase/supabase-js";

type ParserOut = { cohort_sql: string; param_patch: any; confidence: number };

// derive tenant (dev fallback: first tenant from exposures)
async function getTenant(): Promise<string>{
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false }});
  const { data } = await sb.from("exposures_daily").select("tenant_id").limit(1).maybeSingle();
  if (!data?.tenant_id) throw new Error("tenant not found");
  return data.tenant_id as string;
}

export async function POST(req: NextRequest){
  try{
    const { text, product } = await req.json();
    if (!text || typeof text !== "string") return new Response(JSON.stringify({ error:"text_required" }),{ status:400 });

    const tenant_id = await getTenant();
    const lim = await checkLimit(tenant_id, "llm_parse", Number(process.env.RATE_LIMIT_LLM_PER_HOUR || 10), 3600);
    if (!lim.allowed) return new Response(JSON.stringify({ error:"rate_limited: llm_parse hourly quota reached" }), { status:429 });

    const system = await (await fetch(new URL("/prompts/parser.prmpt", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"))).text().catch(()=>null);
    const openai = getOpenAI();
    const msgs = [
      { role:"system", content: system ?? "Output JSON only per spec." },
      { role:"user", content: text + (product ? `\nProduct: ${product}` : "") }
    ];

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: msgs as any,
      temperature: 0.1,
    });

    const raw = resp.choices?.[0]?.message?.content?.trim() ?? "{}";
    // Remove fences if any
    const jsonStr = raw.replace(/^```(json)?/i,"").replace(/```$/,"").trim();
    const out = JSON.parse(jsonStr) as ParserOut;

    if (!out.cohort_sql || typeof out.cohort_sql !== "string") throw new Error("invalid cohort_sql");
    if (typeof out.confidence !== "number") out.confidence = 0.5;

    return new Response(JSON.stringify(out), { headers:{ "content-type":"application/json" }});
  }catch(e:any){
    return new Response(JSON.stringify({ error: e?.message ?? "parse_failed" }), { status: 400 });
  }
}
