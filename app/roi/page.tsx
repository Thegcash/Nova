import { supabaseServer } from '@/lib/supabaseServer'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { ROICharts } from './ROICharts'

export const dynamic = 'force-dynamic'

const POLICY_ID = '9ee15b60-2ef7-4fcf-8aa6-025e1fa818cb'

export default async function ROIPage() {
  let daily: any[] = []
  let errorMessage: string | null = null

  try {
    // Get last 30 days
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const monthAgo = new Date(now)
    monthAgo.setDate(monthAgo.getDate() - 30)

    const from = monthAgo.toISOString().slice(0, 10)
    const to = tomorrow.toISOString().slice(0, 10)

    // Try to fetch from database
    const { data, error } = await supabaseServer
      .from('vw_policy_roi_v1_with_baseline')
      .select('*')
      .eq('policy_id', POLICY_ID)
      .gte('day', from)
      .lt('day', to)
      .order('day', { ascending: true })

    if (error) {
      errorMessage = `Database error: ${error.message} (code: ${error.code})`
    } else {
      daily = data || []
    }
  } catch (error: any) {
    errorMessage = error?.message || String(error)
  }

  // If no data, show helpful message
  if (errorMessage) {
    return (
      <div>
        <div className="mb-6">
          <h1 style={{fontSize: '28px', fontWeight: 700, marginBottom: '8px'}}>
            ROI Dashboard
          </h1>
          <p className="text-secondary">
            Speed Limit Violations Policy
          </p>
        </div>

        <div className="card" style={{borderColor: 'var(--error)', background: '#FEF2F2', padding: 'var(--space-6)'}}>
          <div style={{display: 'flex', alignItems: 'start', gap: 'var(--space-3)'}}>
            <AlertCircle size={24} style={{color: 'var(--error)', flexShrink: 0}} />
            <div>
              <h2 style={{color: 'var(--error)', marginBottom: '8px', fontSize: '18px', fontWeight: 600}}>
                Database Connection Issue
              </h2>
              <p style={{fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px'}}>
                {errorMessage}
              </p>
              <div style={{background: '#FFFFFF', padding: 'var(--space-4)', borderRadius: 'var(--radius)', border: '1px solid var(--border)'}}>
                <h3 style={{fontSize: '14px', fontWeight: 600, marginBottom: '8px'}}>Quick Fix:</h3>
                <ol style={{fontSize: '13px', paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)'}}>
                  <li>Open your Supabase SQL Editor</li>
                  <li>Run the <code style={{background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px'}}>pilot-data.sql</code> script from your project root</li>
                  <li>Refresh this page</li>
                </ol>
                <p style={{fontSize: '12px', marginTop: '12px', color: 'var(--text-tertiary)'}}>
                  The script creates sample data in the <code>vw_policy_roi_v1_with_baseline</code> view.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (daily.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 style={{fontSize: '28px', fontWeight: 700, marginBottom: '8px'}}>
            ROI Dashboard
          </h1>
          <p className="text-secondary">
            Speed Limit Violations Policy
          </p>
        </div>

        <div className="card" style={{padding: 'var(--space-6)', textAlign: 'center'}}>
          <AlertCircle size={48} style={{color: 'var(--text-tertiary)', margin: '0 auto 16px'}} />
          <h2 style={{fontSize: '18px', fontWeight: 600, marginBottom: '8px'}}>No Data Yet</h2>
          <p style={{fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px'}}>
            Run <code style={{background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px'}}>pilot-data.sql</code> in Supabase to see sample data and charts.
          </p>
        </div>
      </div>
    )
  }

  // Calculate totals
  let totalIncidents = 0
  let totalDowntime = 0
  let totalLoss = 0
  let baselineIncidents = 0
  let baselineDowntime = 0
  let baselineLoss = 0

  daily.forEach((row: any) => {
    totalIncidents += Number(row.avoided_incidents || 0)
    totalDowntime += Number(row.downtime_avoided_min || 0)
    totalLoss += Number(row.loss_prevented_est_sum || 0)
    baselineIncidents += Number(row.baseline_avoided_incidents || 0)
    baselineDowntime += Number(row.baseline_downtime_min || 0)
    baselineLoss += Number(row.baseline_loss || 0)
  })

  // Calculate vs baseline percentages
  const incidentsDelta = baselineIncidents ? ((totalIncidents - baselineIncidents) / baselineIncidents * 100) : 0
  const downtimeDelta = baselineDowntime ? ((totalDowntime - baselineDowntime) / baselineDowntime * 100) : 0
  const lossDelta = baselineLoss ? ((totalLoss - baselineLoss) / baselineLoss * 100) : 0

  return (
    <div>
      <div className="mb-6">
        <h1 style={{fontSize: '28px', fontWeight: 700, marginBottom: '8px'}}>
          ROI Dashboard
        </h1>
        <p className="text-secondary">
          Speed Limit Violations · Last 30 days
        </p>
      </div>

      {/* KPIs with vs Baseline */}
      <div className="grid grid-3 mb-6">
        <div className="stat-card">
          <div className="stat-label">Avoided Incidents</div>
          <div className="stat-value">{totalIncidents}</div>
          <div className="stat-meta">
            <span className={incidentsDelta > 0 ? 'badge-success' : incidentsDelta < 0 ? 'badge-error' : 'badge-neutral'} style={{display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '999px', fontSize: '12px'}}>
              {incidentsDelta > 0 ? <TrendingUp size={12} /> : incidentsDelta < 0 ? <TrendingDown size={12} /> : null}
              {Math.abs(incidentsDelta).toFixed(1)}% vs baseline
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Downtime Avoided</div>
          <div className="stat-value">{totalDowntime.toLocaleString()}</div>
          <div className="stat-meta">
            <span className={downtimeDelta > 0 ? 'badge-success' : downtimeDelta < 0 ? 'badge-error' : 'badge-neutral'} style={{display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '999px', fontSize: '12px'}}>
              {downtimeDelta > 0 ? <TrendingUp size={12} /> : downtimeDelta < 0 ? <TrendingDown size={12} /> : null}
              {Math.abs(downtimeDelta).toFixed(1)}% vs baseline
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Loss Prevented</div>
          <div className="stat-value">${totalLoss.toLocaleString()}</div>
          <div className="stat-meta">
            <span className={lossDelta > 0 ? 'badge-success' : lossDelta < 0 ? 'badge-error' : 'badge-neutral'} style={{display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '999px', fontSize: '12px'}}>
              {lossDelta > 0 ? <TrendingUp size={12} /> : lossDelta < 0 ? <TrendingDown size={12} /> : null}
              {Math.abs(lossDelta).toFixed(1)}% vs baseline
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <ROICharts data={daily} />

      {/* Daily Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Daily Breakdown</h2>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Alerts</th>
              <th>Avoided Incidents</th>
              <th>Downtime (min)</th>
              <th>Loss Prevented</th>
            </tr>
          </thead>
          <tbody>
            {daily.map((row: any) => (
              <tr key={row.day}>
                <td style={{fontFamily: 'monospace', fontSize: '13px'}}>{row.day}</td>
                <td>{Number(row.alert_count || 0).toLocaleString()}</td>
                <td style={{color: 'var(--primary)', fontWeight: 600}}>
                  {Number(row.avoided_incidents || 0).toLocaleString()}
                </td>
                <td>{Number(row.downtime_avoided_min || 0).toLocaleString()}</td>
                <td style={{color: 'var(--success)', fontWeight: 600}}>
                  ${Number(row.loss_prevented_est_sum || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
