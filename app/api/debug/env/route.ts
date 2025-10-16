import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    TENANT_ID: process.env.TENANT_ID || null,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || null,
    SUPABASE_URL: process.env.SUPABASE_URL ? '✓ set' : null,
    SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE ? '✓ set (hidden)' : null,
    SLACK_WEBHOOK_ROI: process.env.SLACK_WEBHOOK_ROI ? '✓ set (hidden)' : null,
    EXPORT_DEFAULT_FORMAT: process.env.EXPORT_DEFAULT_FORMAT || 'csv',
  });
}


