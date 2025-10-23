// @ts-nocheck
export const runtime = 'nodejs'; export const revalidate = 0; export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    routes: [
      '/api/_manifest',
      '/api/health',
      '/api/setup',
      '/api/risk-metrics',
      '/api/fleets',
      '/api/guardrails',
      '/api/compliance',
      '/api/roi',
      '/api/assistant (POST)'
    ]
  });
}
