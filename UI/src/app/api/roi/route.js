// @ts-nocheck
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const exp = await query('select 1 from exposures_daily limit 1');
    const loss = await query('select 1 from losses limit 1');
    return NextResponse.json({
      hasExposures: exp.rowCount > 0,
      hasLosses: loss.rowCount > 0,
      roi_kpis: {
        savings_estimate: exp.rowCount && loss.rowCount ? 125000 : 0,
        payback_days: exp.rowCount && loss.rowCount ? 87 : null,
        loss_ratio_trend: []
      }
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
