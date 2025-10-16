// /app/api/rating/quote/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { quote, RateParams } from "@/src/rating/engine";

const Req = z.object({
  params: z.custom<RateParams>(),
  risk_vars: z.record(z.any()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { params, risk_vars } = Req.parse(body);
    const out = quote(params, risk_vars);
    return new Response(JSON.stringify(out), { headers: { "content-type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "bad_request" }), { status: 400 });
  }
}


