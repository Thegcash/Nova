async function getRecentExports() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/exports/carrier/runs?limit=10`, {
      cache: 'no-store'
    })

    if (!res.ok) return []
    
    const data = await res.json()
    return data.runs || []
  } catch (error) {
    console.error('Recent exports fetch error:', error)
    return []
  }
}

export async function RecentExports() {
  const runs = await getRecentExports()

  if (runs.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Exports</h2>
        </div>
        <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)'}}>
          No exports yet
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Recent Exports</h2>
      </div>
      <table>
        <thead>
          <tr>
            <th>Created</th>
            <th>Date Range</th>
            <th>Format</th>
            <th>Status</th>
            <th>Files</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run: any) => (
            <tr key={run.id}>
              <td style={{fontFamily: 'monospace', fontSize: '13px'}}>
                {new Date(run.created_at).toLocaleString()}
              </td>
              <td>{run.from_date} → {run.to_date}</td>
              <td>
                <span className="badge-neutral">{run.format.toUpperCase()}</span>
              </td>
              <td>
                <span className={
                  run.status === 'ok' ? 'badge-success' : 
                  run.status === 'error' ? 'badge-error' : 'badge-warning'
                }>
                  {run.status}
                </span>
              </td>
              <td>{run.manifest?.length || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}



