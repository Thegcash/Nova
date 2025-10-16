export default function AlertsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 style={{fontSize: '28px', fontWeight: 700, marginBottom: '8px'}}>
          Alerts
        </h1>
        <p className="text-secondary">
          Policy violations and system alerts
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Active Alerts</h2>
        </div>
        <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)'}}>
          No active alerts. Connect your alert system to see data here.
        </div>
      </div>
    </div>
  )
}



