// @ts-nocheck
export const runtime = 'nodejs'; export const revalidate = 0; export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const r = await query('select id,name,status,lat,lng,updated_at from fleets');
    return NextResponse.json({ fleets: r.rows || [] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}