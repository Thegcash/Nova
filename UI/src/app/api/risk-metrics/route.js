// @ts-nocheck
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const exp = await query('select count(*)::int as c from exposures_daily');
    const los = await query('select count(*)::int as c from losses');
    return NextResponse.json({
      totals: {
        exposures: exp.rows[0]?.c || 0,
        losses: los.rows[0]?.c || 0,
        exposures_last_30d: exp.rows[0]?.c || 0
      },
      series: []
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
