import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TENANT_ID = process.env.TENANT_ID as string | undefined;
const BUCKET = 'carrier-exports';

async function getRetentionDays(): Promise<number> {
  if (!TENANT_ID) return 30;
  const { data } = await supabaseAdmin
    .from('export_settings')
    .select('retention_days')
    .eq('tenant_id', TENANT_ID)
    .single();
  return Math.max(1, data?.retention_days ?? 30);
}

// Recursively list all objects under a prefix (folders + pagination)
async function listAllObjects(prefix: string): Promise<string[]> {
  const paths: string[] = [];
  const stack: string[] = [prefix];

  while (stack.length) {
    const cur = stack.pop()!;
    let offset = 0;
    const limit = 1000;

    // page through items at this level
    while (true) {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .list(cur, { limit, offset, sortBy: { column: 'name', order: 'asc' } });

      if (error) throw new Error(error.message);
      if (!data || data.length === 0) break;

      for (const item of data) {
        if (item.name.endsWith('/')) continue; // ignore weird names
        if (item.id) {
          // Supabase marks folders with id:null, files have id set
          paths.push((cur ? cur.replace(/\/?$/, '/') : '') + item.name);
        } else {
          // Folder — drill down
          stack.push((cur ? cur.replace(/\/?$/, '/') : '') + item.name + '/');
        }
      }

      if (data.length < limit) break;
      offset += limit;
    }
  }

  return paths;
}

export async function POST() {
  try {
    if (!TENANT_ID) {
      return NextResponse.json({ ok: false, error: 'TENANT_ID not set' }, { status: 400 });
    }

    const retentionDays = await getRetentionDays();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    const basePrefix = `carrier=${TENANT_ID}/`;
    const allPaths = await listAllObjects(basePrefix);

    // Fetch metadata per object (created_at) and choose deletions
    const toDelete: string[] = [];
    for (const p of allPaths) {
      const { data: meta, error } = await supabaseAdmin.storage.from(BUCKET).list(p, { limit: 1 }); // cheap call
      // Note: Supabase Storage doesn't expose per-object created_at via list for files directly;
      // fallback: infer from folder name patterns (YYYY-MM-DD_YYYY-MM-DD/<run-ts>/file).
      // We'll parse run-ts (3rd segment from end) when present.
      if (error) continue;

      const segs = p.split('/');
      // .../YYYY-MM-DD_YYYY-MM-DD/<run-ts>/file.ext
      if (segs.length >= 3) {
        const maybeTs = Number(segs[segs.length - 2]);
        if (!Number.isNaN(maybeTs)) {
          const dt = new Date(maybeTs);
          if (dt < cutoff) toDelete.push(p);
          continue;
        }
      }
      // fallback: skip if we can't parse — safety first
    }

    let deleted = 0, failed = 0;
    // delete in chunks of 1000
    for (let i = 0; i < toDelete.length; i += 1000) {
      const chunk = toDelete.slice(i, i + 1000);
      const { error } = await supabaseAdmin.storage.from(BUCKET).remove(chunk);
      if (error) failed += chunk.length; else deleted += chunk.length;
    }

    return NextResponse.json({
      ok: true,
      tenant_id: TENANT_ID,
      retention_days: retentionDays,
      cutoff: cutoff.toISOString(),
      scanned: allPaths.length,
      deleted,
      failed
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}


