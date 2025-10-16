import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { RiskTrendChart } from './RiskTrendChart'

async function getDashboardData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/roi/health`, {
      cache: 'no-store'
    })
    
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return null
  }
}

export default async function DashboardPage() {
  const healthData = await getDashboardData()

  return (
    <div>
      <div className="mb-6">
        <h1 style={{fontSize: '28px', fontWeight: 700, marginBottom: '8px'}}>
          Dashboard
        </h1>
        <p className="text-secondary">
          Fleet overview and key metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-3 mb-6">
        <div className="stat-card">
          <div className="stat-label">System Status</div>
          <div className="stat-value">
            {healthData?.ok ? (
              <span style={{color: 'var(--success)'}}>Online</span>
            ) : (
              <span style={{color: 'var(--error)'}}>Offline</span>
            )}
          </div>
          <div className="stat-meta">
            <span className={healthData?.ok ? 'badge-success' : 'badge-error'} style={{display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '999px', fontSize: '12px'}}>
              {healthData?.ok ? <><CheckCircle size={14} /> All systems operational</> : 'Checking...'}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active Alerts</div>
          <div className="stat-value">24</div>
          <div className="stat-meta">
            <span className="badge-warning" style={{display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '999px', fontSize: '12px'}}>
              <AlertTriangle size={14} /> 3 high priority
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">ROI (30d)</div>
          <div className="stat-value">$127k</div>
          <div className="stat-meta">
            <span className="badge-success" style={{display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '999px', fontSize: '12px'}}>
              <TrendingUp size={14} /> 142 incidents avoided
            </span>
          </div>
        </div>
      </div>

      {/* Risk Trend Chart */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">Fleet Risk Trend</h2>
          <p className="text-secondary text-sm">Last 30 days</p>
        </div>
        <RiskTrendChart />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-3">
        <a href="/events" className="card" style={{textDecoration: 'none', transition: 'all 0.15s ease', cursor: 'pointer'}}>
          <h3 style={{fontSize: '16px', fontWeight: 600, marginBottom: '8px'}}>
            Events
          </h3>
          <p className="text-secondary text-sm">
            Browse realtime fleet events and signals
          </p>
        </a>

        <a href="/roi" className="card" style={{textDecoration: 'none', transition: 'all 0.15s ease', cursor: 'pointer'}}>
          <h3 style={{fontSize: '16px', fontWeight: 600, marginBottom: '8px'}}>
            ROI Tracking
          </h3>
          <p className="text-secondary text-sm">
            View policy performance and cost savings
          </p>
        </a>

        <a href="/exports" className="card" style={{textDecoration: 'none', transition: 'all 0.15s ease', cursor: 'pointer'}}>
          <h3 style={{fontSize: '16px', fontWeight: 600, marginBottom: '8px'}}>
            Data Exports
          </h3>
          <p className="text-secondary text-sm">
            Generate carrier data exports (CSV/Parquet)
          </p>
        </a>
      </div>
    </div>
  )
}
