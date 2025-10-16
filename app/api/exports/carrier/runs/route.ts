import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Env
const TENANT_ID = process.env.TENANT_ID as string | undefined;

const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  status: z.enum(['ok','error','running']).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // inclusive
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),   // inclusive
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query', details: parsed.error.flatten() }, { status: 400 });
    }
    const { limit, offset, status, from, to } = parsed.data;

    if (!TENANT_ID) {
      return NextResponse.json({
        runs: [],
        meta: { total: 0, limit, offset },
        hint: 'Set TENANT_ID in .env.local to enable scoped run history.'
      });
    }

    let q = supabaseAdmin
      .from('export_runs')
      .select('*', { count: 'exact' })
      .eq('tenant_id', TENANT_ID)
      .order('created_at', { ascending: false });

    if (status) q = q.eq('status', status);
    if (from)   q = q.gte('from_date', from);
    if (to)     q = q.lte('to_date', to);

    // pagination
    const fromIdx = offset;
    const toIdx = offset + limit - 1;
    q = q.range(fromIdx, toIdx);

    const { data, error, count } = await q;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      runs: data ?? [],
      meta: {
        total: count ?? 0,
        limit,
        offset
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}


