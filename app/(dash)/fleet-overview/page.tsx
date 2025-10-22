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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <style jsx global>{`
        :root{
          --bg:#fff; --panel:#fff;
          --ink:#0f1720; --ink-dim:#5b6472;
          --line:#e8eaf0; --hover:#f7f8fb; --focus:#cfd6e4; --accent:#2b6be4;
          --chip-bg:#f4f6fa; --chip-ink:#3e4652;
          --chip-exclusive-bg:#ffefd2; --chip-exclusive-ink:#9a5a00;
          --chip-nonex-bg:#ebf5ff; --chip-nonex-ink:#2457a3;
          --chip-other-bg:#f8e8f0; --chip-other-ink:#8a3556;
          --radius-s:8px; --radius-m:12px; --radius-l:16px;
          --shadow-0:0 0 0 1px var(--line);
        }
        .btn-ghost{ height:34px; padding:0 12px; border:1px solid var(--line); border-radius:12px; background:var(--bg); display:inline-flex; align-items:center; gap:8px; }
        .btn-ghost:hover{ background:var(--hover); }
        .chip{ padding:4px 10px; border-radius:999px; font-size:12px; line-height:1; }
        .chip-muted{ background:var(--chip-bg); color:var(--chip-ink); }
        .chip-excl{ background:var(--chip-exclusive-bg); color:var(--chip-exclusive-ink); }
        .chip-nonex{ background:var(--chip-nonex-bg); color:var(--chip-nonex-ink); }
        .chip-other{ background:var(--chip-other-bg); color:var(--chip-other-ink); }
        .kpi{ border:1px solid var(--line); border-radius:16px; padding:14px 16px; background:var(--panel); }
        .table thead th{ font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-dim); border-bottom:1px solid var(--line); padding:10px 12px; position:sticky; top:0; background:var(--panel); z-index:1; }
        .table td{ font-size:13.5px; color:var(--ink); padding:10px 12px; border-bottom:1px solid var(--line); height:44px; }
        .row-hover:hover{ background:var(--hover); }
        .divider{ height:1px; background:var(--line); }
      `}</style>

      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-6 border-b" style={{borderColor:'var(--line)'}}>
        <div className="flex items-center gap-3">
          <div className="text-[13px] text-[var(--ink-dim)]">Fleet ▾</div>
          <div className="w-1 h-1 rounded-full bg-[var(--line)]"/>
          <div className="text-[15px] font-semibold">Command Center — Overview</div>
          <div className="w-1 h-1 rounded-full bg-[var(--line)]"/>
          <button className="btn-ghost text-[13px]">Vehicles ▾</button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 mr-2">
            <img className="w-6 h-6 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/24?img=1"/>
            <img className="w-6 h-6 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/24?img=2"/>
            <div className="w-6 h-6 rounded-full bg-[var(--hover)] grid place-items-center text-[11px] ring-2 ring-white">+3</div>
          </div>
          <button className="btn-ghost text-[13px]">Share</button>
          <button className="btn-ghost text-[13px]">Download</button>
          <button className="btn-ghost text-[13px]">EN ▾</button>
          <button className="btn-ghost text-[13px]">⚡ Run all</button>
        </div>
      </div>

      {/* Layout: Left Rail + Main */}
      <div className="flex">
        {/* Left Rail */}
        <div className="w-[72px] border-r" style={{borderColor:'var(--line)'}}>
          <div className="p-3 flex flex-col items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--hover)] grid place-items-center font-semibold">N</div>
            {['🏠','📁','💬','📄','⚙️'].map((i,idx)=> (
              <button key={idx} className="w-10 h-10 rounded-xl hover:bg-[var(--hover)] grid place-items-center text-lg">{i}</button>
            ))}
          </div>
        </div>

        {/* Main Column */}
        <div className="flex-1 min-h-[calc(100vh-56px)]">
          {/* Assistant Dock */}
          <div className="px-6 py-4 border-b" style={{borderColor:'var(--line)'}}>
            <AssistantPanel />
          </div>

          {/* Toolbar */}
          <div className="px-6 py-3 flex items-center gap-2 border-b" style={{borderColor:'var(--line)'}}>
            <button className="btn-ghost">➕ Add data</button>
            <button className="btn-ghost">📊 Columns</button>
            <button className="btn-ghost">📦 Templates</button>
            <div className="ml-auto flex items-center gap-2">
              <button className="btn-ghost">Deploy to Staging</button>
              <button className="btn-ghost">Export</button>
            </div>
          </div>

          {/* Context Chips */}
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

          {/* Table */}
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
                        <td className="truncate">Indemnity caps, sublicensing, renewal terms, termination for breach…</td>
                        <td>North America</td>
                        <td>
                          {i%3===0 && <span className="chip chip-excl">Exclusive</span>}
                          {i%3===1 && <span className="chip chip-nonex">Non‑exclusive</span>}
                          {i%3===2 && <span className="chip chip-other">Other</span>}
                        </td>
                        <td>Wireless distribution</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Composer */}
      <div className="fixed bottom-0 left-[72px] right-0 h-[68px] border-t bg-[var(--panel)] flex items-center px-6" style={{borderColor:'var(--line)'}}>
        <div className="w-full max-w-[1200px]">
          <div className="flex items-center gap-2 border rounded-full px-4 py-3" style={{borderColor:'var(--line)'}}>
            <span className="chip chip-muted">Context: Fleet</span>
            <input className="flex-1 outline-none text-[14px]" placeholder="Give me a task to work on…"/>
            <button className="text-[14px]">📎</button>
            <button className="text-[14px]">➤</button>
          </div>
        </div>
      </div>
    </div>
  );
}