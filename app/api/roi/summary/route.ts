import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
  { auth: { persistSession: false }, global: { headers: { 'X-Client-Info': 'nova-next-api' } } }
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') ?? undefined;   // YYYY-MM-DD
    const to = searchParams.get('to') ?? undefined;       // YYYY-MM-DD
    const policyId = searchParams.get('policy_id') ?? undefined;

    let q = supabase.from('vw_policy_roi_daily')
      .select('policy_id, day, alert_count, loss_prevented_est_sum');

    if (policyId) q = q.eq('policy_id', policyId);
    if (from) q = q.gte('day', from);
    if (to)   q = q.lt('day', to);

    if (!from && !to) {
      const d = new Date(); d.setDate(d.getDate() - 7);
      q = q.gte('day', d.toISOString().slice(0,10));
    }

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const map = new Map<string, { policy_id: string; alerts: number; loss_prevented: number }>();
    for (const r of (data ?? []) as any[]) {
      const pid = r.policy_id as string;
      const prev = map.get(pid) ?? { policy_id: pid, alerts: 0, loss_prevented: 0 };
      prev.alerts += Number(r.alert_count ?? 0);
      prev.loss_prevented += Number(r.loss_prevented_est_sum ?? 0);
      map.set(pid, prev);
    }
    const rows = Array.from(map.values()).sort((a,b)=> b.loss_prevented - a.loss_prevented);
    return NextResponse.json({ data: rows });
  } catch (e:any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}



