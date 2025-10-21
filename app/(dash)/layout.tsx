// app/(dash)/layout.tsx
"use client";

export default function DashLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <style jsx global>{`
        :root{
          --bg:#fff; --panel:#fff;
          --ink:#0f1720; --ink-dim:#5b6472;
          --line:#e8eaf0; --hover:#f7f8fb; --focus:#cfd6e4; --accent:#2b6be4;
          --chip-bg:#f4f6fa; --chip-ink:#3e4652;
          --radius-s:8px; --radius-m:12px; --radius-l:16px;
          --shadow-0:0 0 0 1px var(--line);
        }
        .btn-ghost{ height:34px; padding:0 12px; border:1px solid var(--line); border-radius:12px; background:var(--bg); display:inline-flex; align-items:center; gap:8px; }
        .btn-ghost:hover{ background:var(--hover); }
        .chip{ padding:4px 10px; border-radius:999px; font-size:12px; line-height:1; }
        .chip-muted{ background:var(--chip-bg); color:var(--chip-ink); }
        .kpi{ border:1px solid var(--line); border-radius:16px; padding:14px 16px; background:var(--panel); }
        .table thead th{ font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-dim); border-bottom:1px solid var(--line); padding:10px 12px; position:sticky; top:0; background:var(--panel); z-index:1; }
        .table td{ font-size:13.5px; color:var(--ink); padding:10px 12px; border-bottom:1px solid var(--line); height:44px; }
        .row-hover:hover{ background:var(--hover); }
      `}</style>

      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-6 border-b" style={{borderColor:'var(--line)'}}>
        <div className="flex items-center gap-3">
          <div className="text-[13px] text-[var(--ink-dim)]">Fleet ▾</div>
          <div className="w-1 h-1 rounded-full bg-[var(--line)]"/>
          <div className="text-[15px] font-semibold">Command Center</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-[13px]">Share</button>
          <button className="btn-ghost text-[13px]">Download</button>
          <button className="btn-ghost text-[13px]">EN ▾</button>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar (only here) */}
        <aside className="w-[220px] border-r" style={{borderColor:'var(--line)'}}>
          <div className="p-4">
            <div className="text-sm font-semibold mb-3">Nova</div>
            <nav className="grid gap-1 text-[14px]">
              <a className="btn-ghost" href="/fleet-overview">Dashboard</a>
              <a className="btn-ghost" href="/map-live-ops">Live Ops</a>
              <a className="btn-ghost" href="/playback">Playback</a>
              <a className="btn-ghost" href="/alerts">Alerts</a>
              <a className="btn-ghost" href="/exports">Exports</a>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-56px)]">
          {children}
        </main>
      </div>
    </div>
  );
}