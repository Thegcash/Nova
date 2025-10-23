// @ts-nocheck
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const guardrails = await query('select id,name,status,created_at from guardrails order by created_at desc limit 50');
    const hits = await query('select id,guardrail_id,fleet_id,occurred_at from guardrail_hits order by occurred_at desc limit 100');
    return NextResponse.json({ guardrails: guardrails.rows || [], hits: hits.rows || [] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
