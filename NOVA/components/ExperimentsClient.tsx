"use client";

import { useState, useEffect } from "react";

type Exp = {
  id: string;
  name?: string | null;
  status?: string | null;
  createdAt?: string | null;
  notes?: string | null;
  meta?: any;
};

export default function ExperimentsClient({ initialExperiments }: { initialExperiments: Exp[] }) {
  const [experiments, setExperiments] = useState<Exp[]>(initialExperiments);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [logId, setLogId] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExperiments() {
      try {
        const res = await fetch('/api/experiments', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setExperiments(data);
        }
      } catch (e) {
        setError('Failed to load experiments');
      } finally {
        setLoading(false);
      }
    }
    loadExperiments();
  }, []);

  async function run(id: string) {
    try {
      setError(null);
      setLoadingId(id);
      // optimistic status
      setExperiments(prev => prev.map(e => e.id === id ? { ...e, status: "running" } : e));
      const res = await fetch(`/api/experiments/run`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Run failed");

      // poll for completion a few times
      for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 1500));
        const s = await fetch(`/api/experiments/${id}`, { cache: "no-store" });
        const exp = await s.json();
        setExperiments(prev => prev.map(e => e.id === id ? { ...e, ...exp } : e));
        if (exp.status === "done") break;
      }
    } catch (e: any) {
      setError(e.message || "Run failed");
    } finally {
      setLoadingId(null);
    }
  }

  async function openLogs(id: string) {
    setLogs(null);
    setLogId(id);
    try {
      const res = await fetch(`/api/experiments/${id}/logs`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load logs");
      setLogs(data);
    } catch (e: any) {
      setLogs([]);
      setError(e.message || "Failed to load logs");
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Nova Experiments</h1>
        <a className="text-sm underline opacity-70 hover:opacity-100" href="/settings">Settings</a>
      </header>

      {error && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="card p-2 divide-y">
        {loading && <div className="p-4 text-sm opacity-70">Loading experiments...</div>}
        {!loading && experiments.length === 0 && <div className="p-4 text-sm opacity-70">No experiments yet.</div>}
        {experiments.map((e) => (
          <div key={e.id} className="flex items-center justify-between p-4 gap-4">
            <div className="min-w-0">
              <div className="font-medium truncate">{e.name ?? "(unnamed experiment)"}</div>
              <div className="text-xs opacity-70">id: {e.id}</div>
              <div className="text-xs opacity-70">status: <span className="font-medium">{e.status ?? "unknown"}</span></div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openLogs(e.id)}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Logs
              </button>
              <button
                onClick={() => run(e.id)}
                disabled={loadingId === e.id}
                className="rounded-lg bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
              >
                {loadingId === e.id ? "Running…" : "Run"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {logId && (
        <section className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-medium">Logs for {logId}</h2>
            <button onClick={() => setLogId(null)} className="text-sm underline">Close</button>
          </div>
          {!logs && <div className="text-sm opacity-70">Loading logs…</div>}
          {logs && logs.length === 0 && <div className="text-sm opacity-70">No logs.</div>}
          {logs && logs.length > 0 && (
            <ul className="text-sm space-y-1">
              {logs.map((l, i) => (
                <li key={i} className="grid grid-cols-[110px_1fr] gap-3">
                  <span className="opacity-70">{new Date(l.ts || l.timestamp || Date.now()).toLocaleString()}</span>
                  <span><span className="font-medium">{l.step}</span> — {l.detail}{typeof l.ms === "number" ? ` (${l.ms}ms)` : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
