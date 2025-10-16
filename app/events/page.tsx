export default function EventsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 style={{fontSize: '28px', fontWeight: 700, marginBottom: '8px'}}>
          Events
        </h1>
        <p className="text-secondary">
          Realtime fleet events and signals
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Events</h2>
        </div>
        <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)'}}>
          No events to display. Connect your event stream to see data here.
        </div>
      </div>
    </div>
  )
}



