'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'

export function ExportForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ok: boolean, error?: string, manifest?: string[]} | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      from: formData.get('from') as string,
      to: formData.get('to') as string,
      format: formData.get('format') as string
    }

    try {
      const res = await fetch('/api/exports/carrier/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const json = await res.json()
      setResult(json)
    } catch (error: any) {
      setResult({ ok: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  // Default dates
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-3 mb-4">
          <div>
            <label>From Date</label>
            <input 
              type="date" 
              name="from"
              defaultValue={weekAgo.toISOString().slice(0, 10)}
              required
            />
          </div>

          <div>
            <label>To Date</label>
            <input 
              type="date" 
              name="to"
              defaultValue={today.toISOString().slice(0, 10)}
              required
            />
          </div>

          <div>
            <label>Format</label>
            <select name="format" defaultValue="csv">
              <option value="csv">CSV</option>
              <option value="parquet">Parquet</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Upload size={16} />
          {loading ? 'Exporting...' : 'Run Export'}
        </button>
      </form>

      {result && (
        <div style={{marginTop: '20px', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid', borderColor: result.ok ? 'var(--success)' : 'var(--error)', background: result.ok ? '#D1FAE5' : '#FEE2E2'}}>
          {result.ok ? (
            <div>
              <div style={{color: 'var(--success)', fontWeight: 600, marginBottom: '8px'}}>
                Export successful
              </div>
              {result.manifest && result.manifest.length > 0 && (
                <div>
                  <div style={{fontSize: '13px', marginBottom: '8px'}}>
                    {result.manifest.length} files generated
                  </div>
                  <ul style={{fontSize: '12px', fontFamily: 'monospace', margin: 0, paddingLeft: '20px'}}>
                    {result.manifest.map((file, i) => (
                      <li key={i}>{file}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div style={{color: 'var(--error)', fontWeight: 600}}>
              Error: {result.error || 'Export failed'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
