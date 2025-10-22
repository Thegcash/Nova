import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const runtime = "nodejs";

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE!;
  if (!url || !service) throw new Error("Missing Supabase envs");
  return createClient(url, service, { auth: { persistSession: false } });
}

export async function POST() {
  try {
    const supabase = sb();

    // Ensure we have vehicles; if not, seed first.
    const { data: vehicles0, error: ev0 } = await supabase.from("vehicles").select("id").limit(1);
    if (ev0) return NextResponse.json({ ok:false, step:"check_vehicles", error: ev0.message }, { status:500 });
    if (!vehicles0 || vehicles0.length === 0) {
      const seedRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/dev/seed`, { method: "POST" })
        .catch(() => null);
      if (!seedRes || !seedRes.ok) {
        return NextResponse.json({ ok:false, step:"auto_seed", error:"Failed to auto-seed vehicles" }, { status:500 });
      }
    }

    // Fetch all vehicles
    const { data: vehicles, error: ev } = await supabase.from("vehicles").select("id");
    if (ev) return NextResponse.json({ ok:false, step:"fetch_vehicles", error: ev.message }, { status:500 });

    // Insert fresh positions
    const now = new Date().toISOString();
    const rows = (vehicles ?? []).map(v => ({
      vehicle_id: v.id,
      ts: now,
      lat: 40.72 + (Math.random()-0.5)*0.02,
      lon: -73.97 + (Math.random()-0.5)*0.02,
      speed: 4 + Math.random()*2,
      heading: Math.random()*360,
    }));
    if (rows.length) {
      const { error: ip } = await supabase.from("positions").insert(rows);
      if (ip) return NextResponse.json({ ok:false, step:"insert_positions", error: ip.message }, { status:500 });
    }

    const { error: hb } = await supabase.from("vehicles").update({ last_heartbeat_at: now }).not("id", "is", null);
    if (hb) return NextResponse.json({ ok:false, step:"update_heartbeats", error: hb.message }, { status:500 });

    return NextResponse.json({ ok:true, inserted: rows.length, ts: now });
  } catch (err:any) {
    return NextResponse.json({ ok:false, error: err?.message ?? "tick error" }, { status:500 });
  }
}