import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE!;
  if (!url || !service) {
    return NextResponse.json({ ok: false, error: "Missing Supabase envs" }, { status: 500 });
  }
  const sb = createClient(url, service, { auth: { persistSession: false } });

  // 1) bump heartbeats
  const upd = await sb.from("vehicles").update({ last_heartbeat_at: new Date().toISOString() }).neq("id", "");
  if (upd.error) return NextResponse.json({ ok: false, step: "update_heartbeats", error: upd.error.message }, { status: 500 });

  // 2) fetch vehicles
  const { data: vehicles, error: ev } = await sb.from("vehicles").select("id");
  if (ev) return NextResponse.json({ ok: false, step: "fetch_vehicles", error: ev.message }, { status: 500 });

  // 3) insert one fresh point per vehicle near NYC
  const rows = (vehicles ?? []).map(v => ({
    vehicle_id: v.id,
    ts: new Date().toISOString(),
    lat: 40.72 + (Math.random() - 0.5) * 0.02,
    lon: -73.97 + (Math.random() - 0.5) * 0.02,
    speed: 4 + Math.random() * 2,
    heading: Math.random() * 360,
  }));

  if (rows.length) {
    const ins = await sb.from("positions").insert(rows);
    if (ins.error) return NextResponse.json({ ok: false, step: "insert_positions", error: ins.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, inserted: rows.length, ts: new Date().toISOString() });
}
