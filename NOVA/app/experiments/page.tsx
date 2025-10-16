'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Experiment = { id: string; name: string; status: string; createdAt: string; notes?: string; meta?: { roi?: number; incidents_avoided?: number } }

export default function ExperimentsPage() {
  const [rows, setRows] = useState<Experiment[]>([])
  const [active, setActive] = useState<Experiment | null>(null)
  const [ask, setAsk] = useState('What is the TTL and how do I run a new backtest?')
  const [answer, setAnswer] = useState<string>('')

  async function loadList() {
    const r = await fetch('/api/experiments', { cache: 'no-store' })
    const js = await r.json()
    setRows(js)
  }
  async function openRow(id: string) {
    const r = await fetch(`/api/experiments/${id}`, { cache: 'no-store' })
    setActive(await r.json())
  }
  async function newBacktest() {
    const r = await fetch('/api/experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `Backtest ${new Date().toLocaleString()}` })
    })
    const created = await r.json()
    await loadList()
    setActive(created)
  }
  async function importFiling(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch('/api/filings/upload', { method: 'POST', body: fd })
    if (!r.ok) alert('Upload failed')
    else alert('Upload complete')
  }
  async function sendAsk() {
    setAnswer('Thinking…')
    const r = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: ask }),
    })
    const js = await r.json()
    setAnswer(js.reply || js.error || '')
  }

  useEffect(() => { loadList() }, [])

  return (
    <div className="min-h-screen grid grid-cols-[280px_1fr]">
      {/* Left rail */}
      <aside className="border-r border-[var(--line)] p-4 space-y-4 bg-[var(--panel)]">
        <div className="text-xs uppercase tracking-wide text-[var(--ink-dim)]">Assistant</div>
        <div className="rounded-xl border border-[var(--line)] p-3 space-y-2" id="assistant">
          <textarea
            className="w-full text-sm rounded-lg border border-[var(--line)] p-2"
            rows={3}
            value={ask}
            onChange={e=>setAsk(e.target.value)}
          />
          <div className="flex justify-between">
            <button className="h-8 px-3 rounded-xl border border-[var(--line)]" onClick={sendAsk}>Ask</button>
              </div>
          <div className="text-sm text-[var(--ink-dim)] whitespace-pre-wrap">{answer}</div>
        </div>

        <nav className="pt-2 space-y-1">
          <Link href="/experiments" className="block text-sm px-2 py-1 rounded hover:bg-[var(--hover)]">Experiments</Link>
          <Link href="/experiments/history" className="block text-sm px-2 py-1 rounded hover:bg-[var(--hover)]">History</Link>
          <Link href="/filings" className="block text-sm px-2 py-1 rounded hover:bg-[var(--hover)]">Filings</Link>
          <Link href="/settings" className="block text-sm px-2 py-1 rounded hover:bg-[var(--hover)]">Settings</Link>
      </nav>
    </aside>

      {/* Main content */}
      <main className="p-6">
        <div className="h-14 flex items-center justify-between border-b border-[var(--line)] mb-4">
          <h1 className="text-[17px] font-semibold tracking-[-0.01em]">Rate Experiments</h1>
        <div className="flex items-center gap-2">
            <label className="h-8 px-3 rounded-xl border border-[var(--line)] cursor-pointer flex items-center gap-2">
              <input type="file" className="hidden" onChange={e=>e.target.files && importFiling(e.target.files[0])}/>
              Import filing
            </label>
            <button className="h-8 px-3 rounded-xl border border-[var(--line)]" onClick={newBacktest}>New backtest</button>
            <button className="h-8 px-3 rounded-xl border border-[var(--line)]"
              disabled={!active} onClick={async ()=>{
                if (!active) return;
                await fetch('/api/experiments/run',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ id: active.id })});
                // refresh detail and list
                const d = await fetch(`/api/experiments/${active.id}`, { cache: 'no-store' }).then(r=>r.json());
                setActive(d); await loadList();
              }}>Run backtest</button>
      </div>
        </div>

        <div className="grid grid-cols-[minmax(360px,520px)_1fr] gap-4">
          <section id="listView" className="rounded-2xl border border-[var(--line)] overflow-hidden">
            <div className="px-3 py-2 text-xs uppercase tracking-wide text-[var(--ink-dim)] border-b border-[var(--line)]">Experiments</div>
            <div id="rows" className="divide-y divide-[var(--line)]">
              {rows.length === 0 && (
                <div className="px-3 py-3 text-sm text-[var(--ink-dim)]">No experiments yet.</div>
              )}
              {rows.map(r=>(
                <button key={r.id} onClick={()=>openRow(r.id)} className="w-full text-left px-3 py-2 hover:bg-[var(--hover)]">
                  <div className="text-sm">{r.name}</div>
                  <div className="text-xs text-[var(--ink-dim)]">{r.status} · {new Date(r.createdAt).toLocaleString()}</div>
          </button>
        ))}
      </div>
          </section>

          <section id="detailView" className="rounded-2xl border border-[var(--line)] min-h-[320px]">
            <div className="px-3 py-2 text-xs uppercase tracking-wide text-[var(--ink-dim)] border-b border-[var(--line)]">Details</div>
            <div className="p-4 text-sm text-[var(--ink-dim)]">
              {!active ? 'Select an experiment to see details.' : (
                <div className="space-y-1">
                  <div className="text-base text-[var(--ink)] font-medium">{active.name}</div>
                  <div>Status: {active.status}</div>
                  <div>Created: {new Date(active.createdAt).toLocaleString()}</div>
                  {'notes' in active && <div>Notes: {(active as any).notes}</div>}
                  {active?.meta?.roi !== undefined && (
                    <div>ROI: {active.meta.roi}x · Incidents avoided: {active.meta.incidents_avoided}</div>
                  )}
          </div>
        )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}