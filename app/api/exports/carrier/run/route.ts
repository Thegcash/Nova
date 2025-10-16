import { NextResponse } from 'next/server';
import { z } from 'zod';
import { startExportRun, completeExportRun, failExportRun } from '@/lib/exports/run-audit';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { toCSVBuffer, toParquetBuffer } from '@/lib/csvParquet';

export const dynamic = 'force-dynamic';

const TENANT_ID = process.env.TENANT_ID as string | undefined;
const EXPORT_DEFAULT_FORMAT = (process.env.EXPORT_DEFAULT_FORMAT || 'csv') as 'csv' | 'parquet';

const BodySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  format: z.enum(['csv', 'parquet']).optional(),
});

export async function POST(req: Request) {
  const t0 = Date.now();
  let runId: string | null = null;

  try {
    // 0) Require TENANT_ID to avoid 'default' fallbacks
    if (!TENANT_ID) {
      return NextResponse.json({ ok: false, error: 'TENANT_ID not set in environment (.env.local)' }, { status: 500 });
    }

    // 1) Parse body
    const json = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const fromDate = parsed.data.from;
    const toDate = parsed.data.to;
    const format = parsed.data.format || EXPORT_DEFAULT_FORMAT;
    const tenantId = TENANT_ID;

    // 2) Start audit row (status=running)
    runId = await startExportRun({ tenantId, fromDate, toDate, format });

    // 3) Export logic - Real dataset generation
    const timestamp = Date.now();
    const basePath = `carrier=${tenantId}/${fromDate}_${toDate}/${timestamp}`;
    const extension = format === 'csv' ? '.csv' : '.parquet';

    // Dataset 1: Risk Timeseries (swallow errors if view doesn't exist)
    let riskData: any[] = [];
    try {
      const { data, error } = await supabaseAdmin
        .from('vw_risk_timeseries_daily')
        .select('*')
        .gte('day', fromDate)
        .lt('day', toDate);

      if (!error && data) {
        riskData = data;
      } else if (error) {
        console.warn('Risk timeseries query error (non-fatal):', error.message);
      }
    } catch (e: any) {
      console.warn('Risk timeseries fetch failed (non-fatal):', e.message);
    }

    // Dataset 2: Alerts
    const { data: alertsData, error: alertsError } = await supabaseAdmin
      .from('alerts')
      .select('policy_id, unit_id, triggered_at, details')
      .gte('triggered_at', `${fromDate}T00:00:00Z`)
      .lt('triggered_at', `${toDate}T00:00:00Z`);

    if (alertsError) {
      throw new Error(`Failed to fetch alerts: ${alertsError.message}`);
    }

    // Rename triggered_at to ts for alerts
    const alertsFormatted = (alertsData || []).map((row: any) => ({
      policy_id: row.policy_id,
      unit_id: row.unit_id,
      ts: row.triggered_at,
      details: row.details,
    }));

    // Dataset 3: Policy Versions (use compat view, swallow errors)
    let policyVersionsData: any[] = [];
    try {
      const { data, error } = await supabaseAdmin
        .from('vw_policy_versions_compat')
        .select('*')
        .lt('start_ts', `${toDate}T00:00:00Z`)
        .gte('end_ts', `${fromDate}T00:00:00Z`);

      if (!error && data) {
        policyVersionsData = data;
      } else if (error) {
        console.warn('Policy versions query error (non-fatal):', error.message);
      }
    } catch (e: any) {
      console.warn('Policy versions fetch failed (non-fatal):', e.message);
    }

    // Dataset 4: ROI Summary
    const { data: roiData, error: roiError } = await supabaseAdmin
      .from('vw_policy_roi_v1_with_baseline')
      .select('*')
      .gte('day', fromDate)
      .lt('day', toDate);

    if (roiError) {
      throw new Error(`Failed to fetch roi_summary: ${roiError.message}`);
    }

    // Convert datasets to buffers
    const datasets = [
      { name: 'risk_timeseries', data: riskData },
      { name: 'alerts', data: alertsFormatted },
      { name: 'policy_versions', data: policyVersionsData },
      { name: 'roi_summary', data: roiData || [] },
    ];

    const manifest: string[] = [];

    // Upload each dataset
    for (const dataset of datasets) {
      const buffer = format === 'csv' 
        ? await toCSVBuffer(dataset.data)
        : await toParquetBuffer(dataset.data);

      const filePath = `${basePath}/${dataset.name}${extension}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseAdmin.storage
        .from('carrier-exports')
        .upload(filePath, buffer, {
          contentType: format === 'csv' ? 'text/csv' : 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload ${dataset.name}: ${uploadError.message}`);
      }

      manifest.push(filePath);
    }

    // 4) Complete audit row
    const durationMs = Date.now() - t0;
    await completeExportRun(runId, manifest, durationMs);

    return NextResponse.json({ ok: true, run_id: runId, manifest, status: 'ok', duration_ms: durationMs });
  } catch (e: any) {
    const durationMs = Date.now() - t0;
    if (runId) {
      try { await failExportRun(runId, e?.message ?? String(e), durationMs); } catch {}
    }
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}

/**
 * GET /api/exports/carrier/run
 * Returns endpoint info
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/exports/carrier/run',
    method: 'POST',
    description: 'Export carrier datasets to Supabase Storage',
    requires: ['TENANT_ID'],
    configured: {
      tenant_id: !!TENANT_ID,
    },
    body: {
      from: 'YYYY-MM-DD (required)',
      to: 'YYYY-MM-DD (required)',
      format: 'csv|parquet (default: csv)',
    },
    example: {
      from: '2025-10-08',
      to: '2025-10-12',
      format: 'csv',
    },
  });
}
