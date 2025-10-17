"use client";

import { useMemo, useState, useEffect } from "react";

/**
 * Nova 2.0 — Rate Experiment Sandbox UI (Legora/Attio skin)
 * Single-file preview that mirrors the final /app/experiments/* screens.
 * Keep IDs: #assistant, #listView, #detailView, #rows
 *
 * What's included in this preview:
 * - /experiments (list)
 * - /experiments/new (drawer)
 * - /experiments/[id] (results tabs)
 *
 * Interaction notes (no backend required for preview):
 * - Click "Run Backtest" in the New Experiment drawer to simulate a job and land on the Results view.
 * - Use the Tabs in Results to switch sections.
 * - Row click opens the right-side Detail Drawer.
 */

export default function App() {
  const [route, setRoute] = useState<"list" | "new" | "detail">("list");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [resultsTab, setResultsTab] = useState<ResultsTab>("overview");
  const [toast, setToast] = useState<string | null>(null);

  // Fake experiment ID for preview nav
  const [currentExperimentId, setCurrentExperimentId] = useState<string | null>(null);

  useEffect(() => {
    if (route === "new") setDrawerOpen(true);
  }, [route]);

  const goList = () => { setRoute("list"); setDrawerOpen(false); setCurrentExperimentId(null); };
  const goNew = () => { setRoute("new"); setDrawerOpen(true); };
  const goDetail = (id = "exp_demo_001") => { setCurrentExperimentId(id); setRoute("detail"); };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* Design tokens */}
      <Tokens />

      {/* App Shell */}
      <div className="grid grid-cols-[72px_1fr] min-h-screen">
        <LeftRail />
        <div className="flex flex-col min-w-0">
          <TopBar onBack={route === "list" ? undefined : goList} />

          {/* Assistant Dock */}
          <AssistantDock />

          {/* Toolbar */}
          <Toolbar onNew={goNew} />

          {/* Context Chips */}
          <ContextChips />

          {/* Main */}
          {route === "list" && (
            <ListView onRowOpen={(idx)=>{ setSelectedRow(idx); }} onOpenExperiment={()=> goDetail()} />
          )}

          {route === "detail" && (
            <ResultsView
              experimentId={currentExperimentId ?? "exp_demo_001"}
              resultsTab={resultsTab}
              setResultsTab={setResultsTab}
              onDeploy={()=> { setToast("Deployed candidate params to STAGING"); }}
              onExport={()=> { setToast("Filing export saved to Supabase Storage"); }}
            />
          )}

          {/* Right Detail Drawer (row details) */}
          <DetailDrawer open={selectedRow!==null} onClose={()=> setSelectedRow(null)} />

          {/* New Experiment Drawer */}
          <NewExperimentDrawer
            open={drawerOpen}
            onClose={()=>{ setDrawerOpen(false); if (route === "new") setRoute("list"); }}
            onRun={()=>{
              setDrawerOpen(false);
              // Simulate job run then show results
              setTimeout(()=> { setCurrentExperimentId("exp_demo_001"); setRoute("detail"); setToast("Backtest complete"); }, 500);
            }}
          />

          {/* Bottom Composer */}
          <Composer />

          {/* Toast */}
          {toast && (
            <div className="fixed left-[88px] bottom-20 bg-[var(--panel)] border border-[var(--line)] shadow-sm rounded-xl px-3 py-2 text-sm text-[var(--ink)]">{toast}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= Tokens & Primitives ================= */
function Tokens(){
  return (
    <style>{`
      :root{
        --bg:#ffffff; --panel:#ffffff;
        --ink:#0f1720; --ink-dim:#5b6472;
        --line:#e8eaf0; --hover:#f7f8fb; --focus:#cfd6e4; --accent:#2b6be4;
        --chip-bg:#f4f6fa; --chip-ink:#3e4652;
        --chip-exclusive-bg:#ffefd2; --chip-exclusive-ink:#9a5a00;
        --chip-nonex-bg:#ebf5ff; --chip-nonex-ink:#2457a3;
        --chip-other-bg:#f8e8f0; --chip-other-ink:#8a3556;
        --radius-s:8px; --radius-m:12px; --radius-l:16px;
      }
      .hairline{ box-shadow: inset 0 -1px 0 var(--line); }
      .btn-ghost{ height:34px; padding:0 12px; border:1px solid var(--line); border-radius:12px; background:var(--bg); display:inline-flex; align-items:center; gap:8px; }
      .btn-ghost:hover{ background:var(--hover); }
      .chip{ padding:4px 10px; border-radius:999px; font-size:12.5px; line-height:1; display:inline-flex; align-items:center; gap:6px; }
      .table thead th{ font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-dim); }
      .table td{ font-size:13.5px; color:var(--ink); padding:10px 12px; border-bottom:1px solid var(--line); height:44px; }
      .table th{ border-bottom:1px solid var(--line); padding:10px 12px; height:44px; }
      .row-hover:hover{ background:var(--hover); }
      .sticky-col{ position:sticky; left:0; background:var(--bg); }
      .kbd{ border:1px solid var(--line); border-bottom-width:2px; padding:2px 6px; border-radius:6px; font-size:12px; color:var(--ink-dim); }
      .tab{ height:36px; padding:0 12px; border:1px solid var(--line); border-radius:10px; background:var(--bg); font-size:13px; }
      .tab[aria-selected="true"]{ background:var(--hover); }
    `}</style>
  );
}

/* ================= Shell ================= */
function LeftRail(){
  return (
    <aside className="border-r border-[var(--line)] px-3 py-4 flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-[var(--ink)] text-white grid place-items-center text-sm font-semibold">NV</div>
      <nav className="flex flex-col items-center gap-3 text-[var(--ink-dim)]">
        {['home','layers','message-circle','folder','clock','settings'].map((i,idx)=> (
          <button key={idx} className="w-10 h-10 rounded-xl border border-[var(--line)] hover:bg-[var(--hover)] grid place-items-center">
            <span className="sr-only">{i}</span>
            <DotIcon />
          </button>
        ))}
      </nav>
    </aside>
  );
}

function TopBar({onBack}:{onBack?:()=>void}){
  return (
    <header className="h-14 hairline flex items-center justify-between px-5">
      <div className="flex items-center gap-2 text-sm">
        {onBack ? (
          <button className="btn-ghost" onClick={onBack}><ChevronLeft /> Back</button>
        ) : (
          <ChevronLeft className="opacity-30" />
        )}
        <div className="flex items-center gap-2">
          <span className="text-[var(--ink-dim)]">Collection</span>
          <ChevronDown />
          <span className="font-medium">Rate Experiment Sandbox</span>
          <span className="text-[var(--ink-dim)]">•</span>
          <button className="btn-ghost text-[13px]">License agreements <ChevronDown /></button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <AvatarStack />
        <button className="btn-ghost text-sm">Share</button>
        <button className="btn-ghost text-sm">Export</button>
        <button className="btn-ghost text-sm">EN</button>
        <button className="btn-ghost text-sm">Run all <BoltIcon /></button>
      </div>
    </header>
  );
}

function AssistantDock(){
  return (
    <section className="px-5 pt-4" id="assistant">
      <div className="flex items-center gap-2">
        <button className="btn-ghost text-sm"><LockIcon /> New chat</button>
        <div className="flex items-center gap-2">
          {['Explain spikes in risk score','Add ROI columns','Attach telemetry CSVs'].map((t,i)=> (
            <span key={i} className="chip bg-[var(--chip-bg)] text-[var(--chip-ink)]">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Toolbar({onNew}:{onNew:()=>void}){
  return (
    <section className="px-5 pt-4">
      <div className="flex items-center gap-2">
        <button className="btn-ghost text-sm" onClick={onNew}><PlusIcon /> New experiment</button>
        <button className="btn-ghost text-sm"><GridIcon /> Add columns</button>
        <button className="btn-ghost text-sm"><TemplateIcon /> Templates</button>
      </div>
    </section>
  );
}

function ContextChips(){
  return (
    <section className="px-5 pt-3">
      <div className="flex items-center gap-2">
        <span className="chip bg-[var(--chip-bg)] text-[var(--chip-ink)]">📄 Context: License agreements</span>
        <span className="chip bg-[var(--chip-bg)] text-[var(--chip-ink)]">🧪 Experiments</span>
      </div>
    </section>
  );
}

/* ================= Views ================= */
function ListView({ onRowOpen, onOpenExperiment }:{ onRowOpen:(idx:number)=>void; onOpenExperiment:()=>void; }){
  return (
    <main className="px-5 pt-3 pb-24 overflow-auto" id="listView">
      <div className="border border-[var(--line)] rounded-2xl overflow-hidden">
        <table className="w-full table">
          <thead className="sticky top-0 bg-[var(--panel)]">
            <tr>
              <th className="w-10 sticky-col"></th>
              <th>Name</th>
              <th>Status</th>
              <th>Δ Premium</th>
              <th>Δ Loss Ratio</th>
              <th>Coverage %</th>
              <th>Created by</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="rows">
            {EXPERIMENTS.map((r, idx) => (
              <tr key={r.id} className="row-hover cursor-pointer" onClick={()=> onRowOpen(idx)}>
                <td className="sticky-col"><input type="checkbox" aria-label="select row" /></td>
                <td className="font-medium truncate max-w-[240px]" title={r.name}>{r.name}</td>
                <td>
                  <span className="chip bg-[var(--chip-bg)] text-[var(--chip-ink)]">{r.status}</span>
                </td>
                <td className="text-[var(--ink)]">{fmtPct(r.deltaPremium)}</td>
                <td className="text-[var(--ink)]">{fmtPct(r.deltaLR)}</td>
                <td className="text-[var(--ink)]">{Math.round(r.coverage*100)}%</td>
                <td className="text-[var(--ink-dim)]">{r.createdBy}</td>
                <td className="text-[var(--ink-dim)]">{r.created}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn-ghost text-sm" onClick={(e)=>{ e.stopPropagation(); onOpenExperiment(); }}>Open</button>
                    <button className="btn-ghost text-sm" onClick={(e)=> e.stopPropagation() }>Deploy</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function ResultsView({experimentId, resultsTab, setResultsTab, onDeploy, onExport}:{
  experimentId: string; resultsTab: ResultsTab; setResultsTab:(t:ResultsTab)=>void; onDeploy:()=>void; onExport:()=>void;
}){
  const kpis = DEMO_RESULTS.kpis.portfolio;
  return (
    <main className="px-5 pt-3 pb-24 overflow-auto">
      {/* KPI header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Δ Premium" value={fmtCurrency(kpis.delta_written)} hint="Written" />
        <KPICard label="Δ Loss Ratio" value={fmtPct(kpis.lr_candidate - kpis.lr_base)} hint={`${fmtPct(kpis.lr_base)} → ${fmtPct(kpis.lr_candidate)}`} />
        <KPICard label="Affected Policies" value={String(kpis.affected_policies)} hint={`${Math.round(kpis.book_coverage_pct*100)}% book`} />
        <KPICard label="Affected Units" value={String(kpis.affected_units)} hint="Cohort size" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3">
        <button className="btn-ghost text-sm" onClick={onDeploy}>Deploy to Staging</button>
        <button className="btn-ghost text-sm" onClick={onExport}>Export Filing</button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-4">
        {TABS.map(t => (
          <button key={t.key} className="tab" aria-selected={resultsTab===t.key} onClick={()=> setResultsTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="mt-4">
        {resultsTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card title="Loss Ratio Over Time">
              <div className="h-40 rounded-md bg-[var(--hover)]" />
              <div className="text-xs text-[var(--ink-dim)] mt-2">Base vs Candidate</div>
            </Card>
            <Card title="Delta Histogram">
              <div className="h-40 rounded-md bg-[var(--hover)]" />
              <div className="text-xs text-[var(--ink-dim)] mt-2">Distribution of premium deltas</div>
            </Card>
          </div>
        )}
        {resultsTab === "segments" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <SegmentTable title="By Product" rows={DEMO_RESULTS.segments.by_product.map(p=>({ c1:p.product, c2:fmtPct(p.lr_cand - p.lr_base), c3:fmtCurrency(p.delta_written) }))} />
            <SegmentTable title="By Risk Decile" rows={DEMO_RESULTS.segments.by_risk_decile.map(p=>({ c1:`Decile ${p.decile}`, c2:fmtPct(p.delta_lr), c3:"" }))} />
            <SegmentTable title="By Fleet Size" rows={DEMO_RESULTS.segments.by_fleet_size.map(p=>({ c1:p.bucket, c2:fmtPct(p.delta_cr), c3:"" }))} />
            <SegmentTable title="By Geography" rows={DEMO_RESULTS.segments.by_geo.map(p=>({ c1:p.state, c2:"", c3:fmtCurrency(p.delta_written) }))} />
          </div>
        )}
        {resultsTab === "winners" && (
          <WinnersLosersTable title="Winners" rows={DEMO_RESULTS.winners} />
        )}
        {resultsTab === "losers" && (
          <WinnersLosersTable title="Losers" rows={DEMO_RESULTS.losers} />
        )}
        {resultsTab === "sidefx" && (
          <Card title="Guardrail Side-effects">
            <div className="text-sm">Hit rate (base → cand): {fmtPct(DEMO_RESULTS.fairness_checks.guardrail_side_effect.hit_rate_base)} → {fmtPct(DEMO_RESULTS.fairness_checks.guardrail_side_effect.hit_rate_cand)}</div>
            <div className="h-28 mt-2 rounded-md bg-[var(--hover)]" />
          </Card>
        )}
        {resultsTab === "audit" && (
          <Card title="Param Diff">
            <div className="text-sm">base_rate: {DEMO_RESULTS.audit.param_diff.base_rate.from} → {DEMO_RESULTS.audit.param_diff.base_rate.to}</div>
            <div className="h-28 mt-2 rounded-md bg-[var(--hover)]" />
          </Card>
        )}
      </div>
    </main>
  );
}

/* ================= Drawers & Cards ================= */
function DetailDrawer({open,onClose}:{open:boolean; onClose:()=>void}){
  return (
    <aside id="detailView" className={`fixed right-0 top-14 bottom-20 w-[440px] border-l border-[var(--line)] bg-[var(--panel)] transition-transform duration-200 ${open?"translate-x-0":"translate-x-full"}`}>
      <div className="p-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Row details</h3>
        <button className="btn-ghost text-sm" onClick={onClose}>Close</button>
      </div>
      <div className="px-4 pb-4 space-y-4">
        <div className="border border-[var(--line)] rounded-xl p-3">
          <div className="text-xs text-[var(--ink-dim)] mb-2">Risk score (last 30d)</div>
          <div className="h-24 bg-[var(--hover)] rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Field label="Parties" value="Acme Robotics / Legora LLC" />
          <Field label="Date" value="16 Dec 2004" />
          <Field label="License" value="Software + Data" />
          <Field label="Exclusivity" value="Non-exclusive" />
        </div>
        <div className="text-xs text-[var(--ink-dim)]">Attachments</div>
        <div className="border border-[var(--line)] rounded-xl p-3 text-sm">contract_v2.pdf</div>
      </div>
    </aside>
  );
}

function NewExperimentDrawer({open,onClose,onRun}:{open:boolean; onClose:()=>void; onRun:()=>void;}){
  const [nl, setNl] = useState("Increase base rate 7% for fleets with ≥3 guardrail hits in last 30d");
  const [from, setFrom] = useState("2025-07-01");
  const [to, setTo] = useState("2025-10-01");
  const parsed = useMemo(()=> parsePreview(nl), [nl]);

  return (
    <aside className={`fixed right-0 top-14 bottom-20 w-[520px] border-l border-[var(--line)] bg-[var(--panel)] transition-transform duration-200 ${open?"translate-x-0":"translate-x-full"}`}>
      <div className="p-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">New Experiment</h3>
        <button className="btn-ghost text-sm" onClick={onClose}>Close</button>
      </div>
      <div className="px-4 pb-4 space-y-4 text-sm">
        <div>
          <div className="text-xs text-[var(--ink-dim)] mb-1">Natural-language change</div>
          <textarea value={nl} onChange={(e)=> setNl(e.target.value)} className="w-full h-24 border border-[var(--line)] rounded-xl p-3" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <LabeledInput label="Backtest from" value={from} onChange={setFrom} />
          <LabeledInput label="Backtest to" value={to} onChange={setTo} />
        </div>
        <Card title="Parsed preview">
          <div className="text-xs text-[var(--ink-dim)]">Cohort SQL</div>
          <code className="block text-[12px] border border-[var(--line)] rounded-md p-2 overflow-auto">{parsed.cohort_sql}</code>
          <div className="text-xs text-[var(--ink-dim)] mt-2">Param Patch</div>
          <code className="block text-[12px] border border-[var(--line)] rounded-md p-2 overflow-auto">{JSON.stringify(parsed.param_patch, null, 2)}</code>
        </Card>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={onRun}>Run Backtest</button>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </aside>
  );
}

function Card({title, children}:{title:string; children:React.ReactNode}){
  return (
    <div className="border border-[var(--line)] rounded-2xl p-3">
      <div className="text-sm font-semibold mb-2">{title}</div>
      {children}
    </div>
  );
}

function KPICard({label, value, hint}:{label:string; value:string; hint?:string}){
  return (
    <div className="border border-[var(--line)] rounded-2xl p-3">
      <div className="text-xs text-[var(--ink-dim)]">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
      {hint && <div className="text-xs text-[var(--ink-dim)] mt-1">{hint}</div>}
    </div>
  );
}

function SegmentTable({title, rows}:{title:string; rows:{c1:string; c2:string; c3:string}[]}){
  return (
    <Card title={title}>
      <table className="w-full">
        <thead>
          <tr className="text-xs text-[var(--ink-dim)]">
            <th className="text-left font-medium pb-1">Segment</th>
            <th className="text-left font-medium pb-1">Δ</th>
            <th className="text-left font-medium pb-1">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=> (
            <tr key={i} className="text-sm">
              <td className="py-1">{r.c1}</td>
              <td className="py-1">{r.c2}</td>
              <td className="py-1">{r.c3}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function WinnersLosersTable({title, rows}:{title:string; rows:any[]}){
  return (
    <Card title={title}>
      <div className="border border-[var(--line)] rounded-xl overflow-hidden">
        <table className="w-full table">
          <thead>
            <tr>
              <th>Policy</th>
              <th>Unit</th>
              <th>Δ Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=> (
              <tr key={i} className="row-hover">
                <td>{r.policy_id}</td>
                <td>{r.unit_id}</td>
                <td>{fmtCurrency(r.delta_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ================= Bottom Composer ================= */
function Composer(){
  return (
    <footer className="fixed left-[72px] right-0 bottom-0 bg-[var(--panel)] border-t border-[var(--line)]">
      <div className="max-w-[1400px] mx-auto px-5 py-3">
        <div className="flex items-center gap-2 border border-[var(--line)] rounded-2xl px-3 py-2">
          <input className="flex-1 outline-none text-[15px] placeholder:text-[var(--ink-dim)]" placeholder="Give me a task to work on…" />
          <button className="btn-ghost"><PaperclipIcon /></button>
          <button className="btn-ghost"><SendIcon /></button>
        </div>
        <div className="mt-2 text-xs text-[var(--ink-dim)]">Context: License agreements • <span className="kbd">⌘K</span> Command</div>
      </div>
    </footer>
  );
}

/* ================= Helpers & Icons ================= */
type ResultsTab = "overview" | "segments" | "winners" | "losers" | "sidefx" | "audit";

function LabeledInput({label,value,onChange}:{label:string; value:string; onChange:(v:string)=>void}){
  return (
    <label className="block">
      <div className="text-xs text-[var(--ink-dim)] mb-1">{label}</div>
      <input value={value} onChange={(e)=> onChange(e.target.value)} className="w-full border border-[var(--line)] rounded-xl p-2" />
    </label>
  );
}

function ChevronLeft(props:any){return (<svg {...props} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>)}
function ChevronDown(){return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>)}
function BoltIcon(){return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/></svg>)}
function LockIcon(){return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>)}
function PlusIcon(){return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>)}
function GridIcon(){return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/></svg>)}
function TemplateIcon(){return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h16M4 12h16M4 19h10"/></svg>)}
function PaperclipIcon(){return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.88 17.55a2 2 0 1 1-2.83-2.83l8.49-8.49"/></svg>)}
function SendIcon(){return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>)}
function DotIcon(){return (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/></svg>)}

function AvatarStack(){
  return (
    <div className="flex -space-x-2">
      {["A","B","+3"].map((t,i)=> (
        <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-[var(--hover)] text-[11px] grid place-items-center font-medium text-[var(--ink-dim)]">{t}</div>
      ))}
    </div>
  );
}

function Field({label, value}:{label:string; value:string}){
  return (
    <div className="space-y-1">
      <div className="text-xs text-[var(--ink-dim)]">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

/* ================= Sample Data ================= */
const EXPERIMENTS = [
  { id:"exp_demo_001", name:"+7% base for hit>=3 (30d)", status:"Backtested", deltaPremium:0.032, deltaLR:-0.04, coverage:0.36, createdBy:"Gerardo", created:"12 Oct 2025" },
  { id:"exp_demo_002", name:"Cap discounts at 10% for fleets <5", status:"Draft", deltaPremium:0.011, deltaLR:-0.01, coverage:0.22, createdBy:"Nova Bot", created:"10 Oct 2025" },
  { id:"exp_demo_003", name:"+5% surcharge for risk≥0.8", status:"Backtested", deltaPremium:0.025, deltaLR:-0.03, coverage:0.18, createdBy:"Gerardo", created:"08 Oct 2025" }
];

const DEMO_RESULTS = {
  kpis: { portfolio: { delta_written: 12345.67, delta_earned: 8901.23, lr_base: 0.62, lr_candidate: 0.58, cr_base: 0.98, cr_candidate: 0.93, affected_policies: 142, affected_units: 1187, book_coverage_pct: 0.36 } },
  segments: {
    by_product: [ { product:"AUTO", lr_base:0.61, lr_cand:0.57, delta_written:3210 }, { product:"ROBOT", lr_base:0.64, lr_cand:0.60, delta_written:8123 } ],
    by_fleet_size: [ { bucket:"1-5", delta_cr:-0.03 }, { bucket:"6-20", delta_cr:-0.02 } ],
    by_risk_decile: [ { decile:9, delta_lr:-0.06 }, { decile:10, delta_lr:-0.08 } ],
    by_geo: [ { state:"CA", delta_written:1200 }, { state:"TX", delta_written:800 } ]
  },
  winners: [ { policy_id:"P-10012", unit_id:"U-991", delta_total:-120.44 } ],
  losers:  [ { policy_id:"P-10450", unit_id:"U-221", delta_total:  96.10 } ],
  fairness_checks: { cohort_selectivity: 0.78, guardrail_side_effect: { hit_rate_base:0.12, hit_rate_cand:0.10 } },
  charts: { lr_over_time: [], delta_histogram: [] },
  audit: { param_diff: { base_rate: { from:0.045, to:0.04815 } } }
};

const TABS = [
  { key: "overview" as ResultsTab, label: "Overview" },
  { key: "segments" as ResultsTab, label: "Segments" },
  { key: "winners" as ResultsTab, label: "Winners" },
  { key: "losers" as ResultsTab, label: "Losers" },
  { key: "sidefx" as ResultsTab, label: "Side Effects" },
  { key: "audit" as ResultsTab, label: "Audit" }
];

/* ================= Util ================= */
function fmtPct(n:number){ return (n*100).toFixed(1)+"%"; }
function fmtCurrency(n:number){ return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD', maximumFractionDigits:0}).format(n); }
function parsePreview(text:string){
  // naive parser for preview only
  const pct = /([+\-]?[0-9]+)%/.exec(text)?.[1] ?? "7";
  return {
    cohort_sql: "select unit_id from exposures_daily where guardrail_hits_30d >= 3 and dt >= (current_date - interval '30 days')",
    param_patch: { base_rate_pct_change: Number(pct)/100 }
  };
}