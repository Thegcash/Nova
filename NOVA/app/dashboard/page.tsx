import AppShell from "@/components/AppShell";

async function getJSON(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function DashboardPage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const experiments = await getJSON(`${base}/api/experiments`);
  const ttl = await getJSON(`${base}/api/filings/ttl`);
  const expCount = Array.isArray(experiments) ? experiments.length : 0;
  const ttlSeconds = ttl?.ttl_seconds ?? 86400;

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-sm opacity-70">Experiments</div>
          <div className="text-3xl font-semibold">{expCount}</div>
          <a className="mt-2 inline-block text-sm underline" href="/experiments">View all</a>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm opacity-70">Filings TTL</div>
          <div className="text-3xl font-semibold">{ttlSeconds}s</div>
          <a className="mt-2 inline-block text-sm underline" href="/filings">Manage</a>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm opacity-70">Environment</div>
          <div className="text-3xl font-semibold">Production</div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="font-medium mb-2">Recent Experiments</h2>
        <div className="rounded-xl border divide-y">
          {Array.isArray(experiments) && experiments.length > 0 ? (
            experiments.slice(0, 5).map((e: any) => (
              <div key={e.id} className="p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{e.name ?? "(unnamed)"}</div>
                  <div className="text-xs opacity-70">status: {e.status ?? "unknown"}</div>
                </div>
                <a className="text-sm underline shrink-0" href="/experiments">Open</a>
              </div>
            ))
          ) : (
            <div className="p-4 text-sm opacity-70">No experiments yet.</div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
