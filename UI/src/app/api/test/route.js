// @ts-nocheck
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API test route working',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    }
  });
}
