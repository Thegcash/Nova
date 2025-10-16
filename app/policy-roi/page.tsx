import { supabaseServer } from '@/lib/supabaseServer';
import { TrendingUp, TrendingDown, Shield, DollarSign, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

const POLICY_ID = '9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb';
const POLICY_NAME = 'Speed Limit Violations';

// Helper component for baseline comparison
function BaselineChip({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="pill">vs baseline: n/a</span>;
  }

  const isPositive = value > 0;
  const isNegative = value < 0;
  const className = isPositive ? 'pill green' : isNegative ? 'pill red' : 'pill';
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : null;

  return (
    <span className={className}>
      {Icon && <Icon size={12} />}
      {Math.abs(value * 100).toFixed(1)}% vs baseline
    </span>
  );
}

export default async function PolicyROIPage() {
  try {
    // Calculate date range: last 7 days
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const fromDate = new Date(now);
    fromDate.setDate(fromDate.getDate() - 7);
    
    const from = fromDate.toISOString().slice(0, 10);
    const to = tomorrow.toISOString().slice(0, 10);

    // Fetch ROI data directly from database
    const { data: dailyData, error } = await supabaseServer
      .from('vw_policy_roi_v1_with_baseline')
      .select('*')
      .eq('policy_id', POLICY_ID)
      .gte('day', from)
      .lt('day', to)
      .order('day', { ascending: true });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const daily = dailyData || [];

    // Calculate totals and baseline
    const totals = {
      alerts: 0,
      loss_prevented: 0,
      avoided_incidents: 0,
      downtime_avoided_min: 0,
    };

    const baseline = {
      alerts: 0,
      loss_prevented: 0,
      avoided_incidents: 0,
      downtime_avoided_min: 0,
    };

    for (const r of daily) {
      totals.alerts += Number(r.alert_count ?? 0);
      totals.loss_prevented += Number(r.loss_prevented_est_sum ?? 0);
      totals.avoided_incidents += Number(r.avoided_incidents ?? 0);
      totals.downtime_avoided_min += Number(r.downtime_avoided_min ?? 0);

      baseline.alerts += Number(r.baseline_alerts ?? 0);
      baseline.loss_prevented += Number(r.baseline_loss ?? 0);
      baseline.avoided_incidents += Number(r.baseline_avoided_incidents ?? 0);
      baseline.downtime_avoided_min += Number(r.baseline_downtime_min ?? 0);
    }

    const safePct = (actual: number, base: number): number | null => {
      return base ? (actual - base) / base : null;
    };

    const delta_pct = {
      alerts: safePct(totals.alerts, baseline.alerts),
      loss_prevented: safePct(totals.loss_prevented, baseline.loss_prevented),
      avoided_incidents: safePct(totals.avoided_incidents, baseline.avoided_incidents),
      downtime_avoided_min: safePct(totals.downtime_avoided_min, baseline.downtime_avoided_min),
    };

    return (
      <div>
        {/* Header */}
        <div style={{marginBottom:'var(--sp-20)'}}>
          <div style={{display:'flex', alignItems:'center', gap:'var(--sp-8)', marginBottom:'var(--sp-8)'}}>
            <Shield size={24} style={{color:'var(--blue)'}} />
            <h1 style={{fontSize:'28px', fontWeight:600, color:'var(--text)'}}>ROI Dashboard</h1>
          </div>
          <p style={{fontSize:'14px', color:'var(--text-2)'}}>{POLICY_NAME}</p>
          <code style={{fontSize:'12px', color:'var(--text-3)'}}>{POLICY_ID}</code>
          <span style={{fontSize:'11px', color:'var(--text-3)', marginLeft:'var(--sp-8)'}}>· {from} → {to}</span>
        </div>

        {/* ROI Stats */}
        <div className="grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', marginBottom:'var(--sp-20)'}}>
          <div className="card" style={{padding:'var(--sp-20)'}}>
            <div style={{fontSize:'12px', color:'var(--text-3)', marginBottom:'var(--sp-8)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:500}}>Avoided Incidents (7d)</div>
            <div style={{fontSize:'36px', fontWeight:700, color:'var(--text)', letterSpacing:'.15px', marginBottom:'var(--sp-8)'}}>
              {totals.avoided_incidents.toLocaleString()}
            </div>
            <BaselineChip value={delta_pct.avoided_incidents} />
          </div>

          <div className="card" style={{padding:'var(--sp-20)'}}>
            <div style={{fontSize:'12px', color:'var(--text-3)', marginBottom:'var(--sp-8)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:500}}>Downtime Avoided (min)</div>
            <div style={{fontSize:'36px', fontWeight:700, color:'var(--text)', letterSpacing:'.15px', marginBottom:'var(--sp-8)'}}>
              {totals.downtime_avoided_min.toLocaleString()}
            </div>
            <BaselineChip value={delta_pct.downtime_avoided_min} />
          </div>

          <div className="card" style={{padding:'var(--sp-20)'}}>
            <div style={{fontSize:'12px', color:'var(--text-3)', marginBottom:'var(--sp-8)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:500}}>Loss Prevented</div>
            <div style={{fontSize:'36px', fontWeight:700, color:'var(--text)', letterSpacing:'.15px', marginBottom:'var(--sp-8)'}}>
              ${totals.loss_prevented.toLocaleString()}
            </div>
            <BaselineChip value={delta_pct.loss_prevented} />
          </div>
        </div>

        {/* Daily Breakdown Table */}
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <div style={{padding:'var(--sp-16)', borderBottom:'1px solid var(--hair)'}}>
            <h2 style={{fontSize:'16px', fontWeight:600, color:'var(--text)'}}>Daily Breakdown</h2>
          </div>
          <div style={{overflowX:'auto'}}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th style={{textAlign:'right'}}>Alerts</th>
                  <th style={{textAlign:'right'}}>Avoided Incidents</th>
                  <th style={{textAlign:'right'}}>Downtime (min)</th>
                  <th style={{textAlign:'right'}}>Loss Prevented</th>
                </tr>
              </thead>
              <tbody>
                {daily.length > 0 ? (
                  daily.map((row: any) => (
                    <tr key={row.day}>
                      <td style={{fontFamily:'monospace', fontSize:'13px'}}>{row.day}</td>
                      <td style={{textAlign:'right'}}>{Number(row.alert_count || 0).toLocaleString()}</td>
                      <td style={{textAlign:'right', color:'var(--blue)', fontWeight:600}}>
                        {Number(row.avoided_incidents || 0).toLocaleString()}
                      </td>
                      <td style={{textAlign:'right', fontWeight:600}}>
                        {Number(row.downtime_avoided_min || 0).toLocaleString()}
                      </td>
                      <td style={{textAlign:'right', color:'var(--green)', fontWeight:600}}>
                        ${Number(row.loss_prevented_est_sum || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{textAlign:'center', padding:'var(--sp-40)', color:'var(--text-3)'}}>
                      No data available for this date range
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div>
        <div className="card" style={{padding:'var(--sp-24)', borderColor:'var(--red)', background:'rgba(239,68,68,.05)'}}>
          <div style={{display:'flex', alignItems:'start', gap:'var(--sp-12)'}}>
            <span className="status-dot red" style={{marginTop:'4px'}}></span>
            <div>
              <h2 style={{fontSize:'16px', fontWeight:600, color:'var(--red)', marginBottom:'var(--sp-8)'}}>Error Loading ROI Data</h2>
              <p style={{fontSize:'14px', color:'var(--text-2)'}}>{error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
