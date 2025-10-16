import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const TENANT_ID = process.env.TENANT_ID as string | undefined;

export async function GET() {
  if (!TENANT_ID) {
    return NextResponse.json({ tenant_id: null, retention_days: 30, hint: 'Set TENANT_ID to persist per-tenant settings.' });
  }
  const { data, error } = await supabaseAdmin
    .from('export_settings')
    .select('tenant_id, retention_days, updated_at')
    .eq('tenant_id', TENANT_ID)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? { tenant_id: TENANT_ID, retention_days: 30 });
}

const BodySchema = z.object({
  retention_days: z.number().int().min(1).max(365)
});

export async function POST(req: Request) {
  if (!TENANT_ID) return NextResponse.json({ error: 'TENANT_ID not set' }, { status: 400 });
  const json = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body', details: parsed.error.flatten() }, { status: 400 });

  const { retention_days } = parsed.data;
  const { error } = await supabaseAdmin
    .from('export_settings')
    .upsert({ tenant_id: TENANT_ID, retention_days }, { onConflict: 'tenant_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, tenant_id: TENANT_ID, retention_days });
}


