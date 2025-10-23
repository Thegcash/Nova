// @ts-nocheck
export const runtime = 'nodejs'; export const revalidate = 0; export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const r = await query('select 1 as ok');
    return NextResponse.json({ db: r.rows?.[0]?.ok === 1, ts: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ db: false, error: String(e) }, { status: 500 });
  }
}