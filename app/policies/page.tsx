export default function PoliciesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 style={{fontSize: '28px', fontWeight: 700, marginBottom: '8px'}}>
          Policies
        </h1>
        <p className="text-secondary">
          Fleet safety policies and rules
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Active Policies</h2>
        </div>
        <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)'}}>
          No policies configured. Add policies to enforce fleet safety rules.
        </div>
      </div>
    </div>
  )
}



