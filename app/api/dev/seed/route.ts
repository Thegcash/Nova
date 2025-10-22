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

    // 1) Check existing vehicles
    const { data: existing, error: e1 } = await supabase.from("vehicles").select("id, name").limit(1);
    if (e1) return NextResponse.json({ ok:false, step:"check_vehicles", error:e1.message }, { status:500 });

    // 2) Create 5 vehicles if none
    if (!existing || existing.length === 0) {
      const names = ["Alpha","Bravo","Charlie","Delta","Echo"];
      const insVehicles = names.map(n => ({ name: n, make: "Robo", model: "X1", status: "active", last_heartbeat_at: new Date().toISOString() }));
      const { error: e2 } = await supabase.from("vehicles").insert(insVehicles);
      if (e2) return NextResponse.json({ ok:false, step:"insert_vehicles", error:e2.message }, { status:500 });
    }

    // 3) Fetch all vehicles
    const { data: vehicles, error: e3 } = await supabase.from("vehicles").select("id, name");
    if (e3) return NextResponse.json({ ok:false, step:"fetch_vehicles", error:e3.message }, { status:500 });

    // 4) Insert one fresh position per vehicle (NYC-ish jitter)
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
      const { error: e4 } = await supabase.from("positions").insert(rows);
      if (e4) return NextResponse.json({ ok:false, step:"insert_positions", error:e4.message }, { status:500 });
    }

    // 5) Heartbeats
    const { error: e5 } = await supabase.from("vehicles").update({ last_heartbeat_at: now }).not("id", "is", null);
    if (e5) return NextResponse.json({ ok:false, step:"update_heartbeats", error:e5.message }, { status:500 });

    return NextResponse.json({ ok:true, vehicles: vehicles?.length ?? 0, inserted: rows.length, ts: now });
  } catch (err:any) {
    return NextResponse.json({ ok:false, error: err?.message ?? "seed error" }, { status:500 });
  }
}
