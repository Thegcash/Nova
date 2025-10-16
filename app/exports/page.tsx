import { ExportForm } from './ExportForm'
import { RecentExports } from './RecentExports'

export default function ExportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 style={{fontSize: '28px', fontWeight: 700, marginBottom: '8px'}}>
          Data Exports
        </h1>
        <p className="text-secondary">
          Generate carrier data exports in CSV or Parquet format
        </p>
      </div>

      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">New Export</h2>
        </div>
        <ExportForm />
      </div>

      <RecentExports />
    </div>
  )
}
