import { Suspense } from 'react';
import { RunsTable } from './RunsTable';

async function fetchRuns() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
  const url = new URL('/api/exports/carrier/runs', base);
  url.searchParams.set('limit','50');
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) return { runs: [], meta: { total: 0, limit: 50, offset: 0 } };
  return res.json();
}

export async function RecentRuns() {
  const data = await fetchRuns();
  return (
    <Suspense fallback={<div className="text-sm text-gray-500">Loading runs…</div>}>
      <RunsTable runs={data.runs || []} />
    </Suspense>
  );
}


