export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false }});
  const { data, error } = await sb
    .from("experiment_logs")
    .select("step, detail, ms, ts")
    .eq("experiment_id", params.id)
    .order("ts", { ascending: true })
    .limit(500);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } });
}


