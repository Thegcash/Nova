import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // ensure Node APIs available

const BodySchema = z.object({
  run_id: z.string().uuid().optional(),
  manifest: z.array(z.string().min(1)).optional()
}).refine(v => !!v.run_id || (v.manifest && v.manifest.length > 0), {
  message: 'Provide either run_id or manifest[]'
});

const TENANT_ID = process.env.TENANT_ID as string | undefined;

async function fetchManifestFromRun(runId: string) {
  const { data, error } = await supabaseAdmin
    .from('export_runs')
    .select('manifest, tenant_id, from_date, to_date, created_at')
    .eq('id', runId)
    .single();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Run not found');
  if (TENANT_ID && data.tenant_id !== TENANT_ID) {
    throw new Error('Run does not belong to this tenant');
  }
  return {
    manifest: (data.manifest as string[]) || [],
    metaName: `export_${data.from_date}_${data.to_date}_${new Date(data.created_at).toISOString().slice(0,19).replace(/[:T]/g,'-')}`
  };
}

async function downloadBytes(path: string): Promise<Uint8Array> {
  const { data, error } = await supabaseAdmin.storage
    .from('carrier-exports')
    .download(path);
  if (error) throw new Error(error.message);
  const ab = await data.arrayBuffer();
  return new Uint8Array(ab);
}

function niceNameFromPath(path: string) {
  // Input: "carrier=.../2025-10-08_2025-10-12/1760208/alerts.csv"
  const parts = path.split('/');
  return parts.slice(-1)[0] || path; // file name
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body', details: parsed.error.flatten() }, { status: 400 });
    }

    let manifest: string[] = [];
    let baseName = 'export_bundle';

    if (parsed.data.run_id) {
      const { manifest: mf, metaName } = await fetchManifestFromRun(parsed.data.run_id);
      manifest = mf;
      baseName = metaName;
    } else if (parsed.data.manifest) {
      manifest = parsed.data.manifest;
    }

    if (!manifest.length) {
      return NextResponse.json({ error: 'Manifest is empty' }, { status: 400 });
    }

    const zip = new JSZip();
    const failures: { path: string; error: string }[] = [];

    // Download and add files (best-effort)
    for (const path of manifest) {
      try {
        const bytes = await downloadBytes(path);
        zip.file(niceNameFromPath(path), bytes);
      } catch (e: any) {
        failures.push({ path, error: String(e?.message ?? e) });
      }
    }

    const zipBytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
    const filename = `${baseName}.zip`;

    const headers = new Headers({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store'
    });

    // Include failures (if any) in a response header as JSON (truncated if large)
    if (failures.length) {
      const note = JSON.stringify({ failed: failures.slice(0, 10) });
      headers.set('X-Zip-Partial-Failures', note);
    }

    return new NextResponse(new Blob([zipBytes as any]), { headers });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}


