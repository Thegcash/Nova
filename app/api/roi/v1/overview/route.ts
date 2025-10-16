import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Totals = {
  alerts: number;
  loss_prevented: number;
  avoided_incidents: number;
  downtime_avoided_min: number;
};

function isISODate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}
function safePct(actual: number, base: number): number | null {
  return base ? (actual - base) / base : null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const policyId = searchParams.get('policy_id');

    // Defaults: last 7 days [today-7, tomorrow)
    const now = new Date();
    const defTo = new Date(now); defTo.setDate(defTo.getDate() + 1);
    const defFrom = new Date(now); defFrom.setDate(defFrom.getDate() - 7);
    const fromDate = from && isISODate(from) ? from : defFrom.toISOString().slice(0, 10);
    const toDate   = to   && isISODate(to)   ? to   : defTo.toISOString().slice(0, 10);

    // Query view
    let q = supabaseServer
      .from('vw_policy_roi_v1_with_baseline')
      .select('*')
      .gte('day', fromDate)
      .lt('day', toDate)
      .order('day', { ascending: true });

    if (policyId) q = q.eq('policy_id', policyId);

    const { data: daily, error } = await q;
    if (error) {
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    // Aggregate totals
    const totals: Totals = { alerts: 0, loss_prevented: 0, avoided_incidents: 0, downtime_avoided_min: 0 };
    const baseline: Totals = { alerts: 0, loss_prevented: 0, avoided_incidents: 0, downtime_avoided_min: 0 };

    for (const r of daily ?? []) {
      totals.alerts += Number(r.alert_count ?? 0);
      totals.loss_prevented += Number(r.loss_prevented_est_sum ?? 0);
      totals.avoided_incidents += Number(r.avoided_incidents ?? 0);
      totals.downtime_avoided_min += Number(r.downtime_avoided_min ?? 0);

      baseline.alerts += Number(r.baseline_alerts ?? 0);
      baseline.loss_prevented += Number(r.baseline_loss ?? 0);
      baseline.avoided_incidents += Number(r.baseline_avoided_incidents ?? 0);
      baseline.downtime_avoided_min += Number(r.baseline_downtime_min ?? 0);
    }

    const delta_pct = {
      alerts: safePct(totals.alerts, baseline.alerts),
      loss_prevented: safePct(totals.loss_prevented, baseline.loss_prevented),
      avoided_incidents: safePct(totals.avoided_incidents, baseline.avoided_incidents),
      downtime_avoided_min: safePct(totals.downtime_avoided_min, baseline.downtime_avoided_min),
    };

    return NextResponse.json({
      data: {
        window: { from: fromDate, to: toDate },
        policy_id: policyId ?? null,
        totals,
        baseline,
        delta_pct,
        daily: daily ?? [],
      }
    }, { headers: { 'Cache-Control': 'no-store' }});

  } catch (e: any) {
    return NextResponse.json({ error: `Server error: ${e.message ?? 'Unknown error'}` }, { status: 500 });
  }
}

