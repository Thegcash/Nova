import { Router } from 'express';
import { supabase } from '../supabase';

const router = Router();

// health check
router.get('/health', (_req, res) => res.json({ ok: true }));

/**
 * GET /api/roi/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&policy_id=UUID
 * Aggregates vw_policy_roi_daily on the server side (JS), no exec_sql needed.
 */
router.get('/summary', async (req, res) => {
  try {
    const q = req.query as Record<string, string | undefined>;
    const from = q.from; // inclusive
    const to   = q.to;   // exclusive next day if provided
    const policyId = q.policy_id;

    let sb = supabase
      .from('vw_policy_roi_daily')
      .select('policy_id, day, alert_count, loss_prevented_est_sum');

    if (policyId) sb = sb.eq('policy_id', policyId);
    if (from) sb = sb.gte('day', from);
    if (to)   sb = sb.lt('day', to);

    // default: last 7 days
    if (!from && !to) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sb = sb.gte('day', sevenDaysAgo.toISOString().slice(0,10));
    }

    const { data, error } = await sb;
    if (error) return res.status(500).json({ error: error.message });

    // aggregate by policy_id
    const byPolicy = new Map<string, { policy_id: string; alerts: number; loss_prevented: number }>();
    for (const r of data ?? []) {
      const pid = r.policy_id as string;
      const prev = byPolicy.get(pid) ?? { policy_id: pid, alerts: 0, loss_prevented: 0 };
      prev.alerts += Number(r.alert_count ?? 0);
      prev.loss_prevented += Number(r.loss_prevented_est_sum ?? 0);
      byPolicy.set(pid, prev);
    }
    const rows = Array.from(byPolicy.values()).sort((a,b)=> b.loss_prevented - a.loss_prevented);

    res.json({ data: rows });
  } catch (e:any) {
    res.status(500).json({ error: e.message ?? String(e) });
  }
});

/** GET /api/roi/policy/:id/trends  (30d series straight from view) */
router.get('/policy/:id/trends', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('vw_policy_trends_30d')
      .select('day, alert_count, loss_prevented_est_sum')
      .eq('policy_id', id)
      .order('day', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ data });
  } catch (e:any) {
    res.status(500).json({ error: e.message ?? String(e) });
  }
});

/** GET /api/roi/policy/:id/top-units (7d) */
router.get('/policy/:id/top-units', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('vw_policy_top_units_7d')
      .select('unit_id, alerts_7d, loss_prevented_7d')
      .eq('policy_id', id)
      .order('loss_prevented_7d', { ascending: false })
      .limit(10);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ data });
  } catch (e:any) {
    res.status(500).json({ error: e.message ?? String(e) });
  }
});

export default router;
