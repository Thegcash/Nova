import { supabaseAdmin } from '@/lib/supabase/admin';

export type ExportRunStatus = 'running' | 'ok' | 'error';

export interface StartRunParams {
  tenantId: string;
  fromDate: string; // 'YYYY-MM-DD'
  toDate: string;   // 'YYYY-MM-DD'
  format: 'csv' | 'parquet';
}

export async function startExportRun(p: StartRunParams) {
  // Validate UUID format
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(p.tenantId)) {
    throw new Error(`Invalid tenant_id: must be a valid UUID. Got: ${p.tenantId}`);
  }

  const { data, error } = await supabaseAdmin
    .from('export_runs')
    .insert({
      tenant_id: p.tenantId,
      from_date: p.fromDate,
      to_date: p.toDate,
      format: p.format,
      status: 'running',
      manifest: [],
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function completeExportRun(runId: string, manifest: string[], durationMs: number) {
  const { error } = await supabaseAdmin
    .from('export_runs')
    .update({ status: 'ok', manifest, duration_ms: Math.max(0, Math.floor(durationMs)) })
    .eq('id', runId);
  if (error) throw error;
}

export async function failExportRun(runId: string, errMsg: string, durationMs: number) {
  const { error } = await supabaseAdmin
    .from('export_runs')
    .update({ status: 'error', error: String(errMsg).slice(0, 2000), duration_ms: Math.max(0, Math.floor(durationMs)) })
    .eq('id', runId);
  if (error) throw error;
}
