import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE!;
  if (!url || !service) throw new Error("Missing Supabase env vars");
  return createClient(url, service, { auth: { persistSession: false } });
}

export async function GET() {
  const supabase = serverClient();

  try {
    const [
      { data: active,  error: e1 },
      { data: idle,    error: e2 },
      { data: alerts,  error: e3 },
    ] = await Promise.all([
      supabase.rpc("kpi_active_vehicles"),
      supabase.rpc("kpi_idle_vehicles"),
      supabase.rpc("kpi_alerts_24h"),
    ]);

    if (e1 || e2 || e3) {
      return NextResponse.json(
        {
          error: "KPI RPC failed",
          details: { active: e1?.message, idle: e2?.message, alerts: e3?.message },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      active_vehicles: active ?? 0,
      idle_vehicles: idle ?? 0,
      alerts_24h: alerts ?? 0,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch fleet overview", detail: err?.message },
      { status: 500 }
    );
  }
}