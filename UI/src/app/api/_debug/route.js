// @ts-nocheck
export const runtime = 'nodejs'; export const revalidate = 0; export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV || null,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    hasMapsKey: Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
  });
}
