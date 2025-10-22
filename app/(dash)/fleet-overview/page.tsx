// app/(dash)/fleet-overview/page.tsx
import AssistantPanel from "@/components/AssistantPanel";

export const dynamic = "force-dynamic";

async function getKpis() {
  try {
    const res = await fetch("/api/fleet/overview", { cache: "no-store", next: { revalidate: 0 } });
    if (!res.ok) throw new Error("bad status");
    return await res.json();
  } catch {
    return { active_vehicles: 0, idle_vehicles: 0, alerts_24h: 0 };
  }
}

export default async function FleetOverview() {
  const kpis = await getKpis();

  return (
    <>
      <AssistantPanel />

      {/* Context */}
      <div className="px-6 py-3 flex items-center gap-2 border-b" style={{borderColor:'var(--line)'}}>
        <span className="chip chip-muted">Context: Fleet</span>
        <span className="chip chip-muted">Tenant: default</span>
        <span className="chip chip-muted">Window: last 24h</span>
      </div>

      {/* KPI Row */}
      <div className="px-6 py-4 grid grid-cols-4 gap-3">
        {[
          {label:'Active Vehicles', value: String(kpis.active_vehicles ?? 0)},
          {label:'Idle Vehicles (10m)', value: String(kpis.idle_vehicles ?? 0)},
          {label:'Alerts (24h)', value: String(kpis.alerts_24h ?? 0)},
          {label:'Data Freshness', value: 'Live'},
        ].map((k)=> (
          <div key={k.label} className="kpi">
            <div className="text-[12px] uppercase tracking-[.08em] text-[var(--ink-dim)]">{k.label}</div>
            <div className="text-[20px] font-semibold mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="flex items-center gap-4 text-[13px] border-b" style={{borderColor:'var(--line)'}}>
          {['Overview','Segments','Winners','Losers','Guardrail Side-effects','Audit Diff'].map((t, i)=> (
            <button key={t} className={`h-10 px-1 ${i===0? 'border-b-2 border-[var(--ink)] font-medium':'text-[var(--ink-dim)]'}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Table (static placeholder) */}
      <div className="px-6 pt-3 pb-24">
        <div className="border rounded-2xl overflow-hidden" style={{borderColor:'var(--line)'}}>
          <div className="overflow-auto max-h-[46vh]">
            <table className="w-full table">
              <thead>
                <tr>
                  {['Document','Parties','Date','Key Terms','License Scope','Exclusivity','Field of Use'].map(h=> (
                    <th key={h} className="text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({length:10}).map((_,i)=> (
                  <tr key={i} className="row-hover">
                    <td><span className="font-medium">Agreement — </span><span className="text-[var(--ink-dim)]">Wireless Content License {i+1}</span></td>
                    <td>Acme Co • Nova Labs</td>
                    <td>16 Dec 2004</td>
                    <td className="truncate">Indemnity caps, sublicensing, renewal terms…</td>
                    <td>North America</td>
                    <td>{i%3===0?'Exclusive':i%3===1?'Non-exclusive':'Other'}</td>
                    <td>Wireless distribution</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Composer */}
      <div className="fixed bottom-0 left-[220px] right-0 h-[68px] border-t bg-[var(--panel)] flex items-center px-6" style={{borderColor:'var(--line)'}}>
        <div className="w-full max-w-[1200px]">
          <div className="flex items-center gap-2 border rounded-full px-4 py-3" style={{borderColor:'var(--line)'}}>
            <span className="chip chip-muted">Context: Fleet</span>
            <input className="flex-1 outline-none text-[14px]" placeholder="Give me a task to work on…" />
            <button className="text-[14px]">📎</button>
            <button className="text-[14px]">➤</button>
          </div>
        </div>
      </div>
    </>
  );
}