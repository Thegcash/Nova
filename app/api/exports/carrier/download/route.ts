import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BUCKET = 'carrier-exports';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');
    const expires = Number(searchParams.get('expires')) || 3600; // seconds (1h default)

    if (!path) {
      return NextResponse.json({ error: 'Missing required query param: path' }, { status: 400 });
    }

    // Basic guard: prevent path traversal and absolute paths
    if (path.includes('..') || path.startsWith('/') || path.startsWith('http')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Basic validation: ensure path looks like our export format
    if (!/^carrier=.+\/\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}/.test(path)) {
      return NextResponse.json({ error: 'Path does not match expected carrier export format' }, { status: 400 });
    }

    const supabase = supabaseServer;
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, expires);

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message || 'Failed to sign URL' }, { status: 500 });
    }

    // Redirect so the user can click directly in the UI
    return NextResponse.redirect(data.signedUrl, { status: 302 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unexpected error' }, { status: 500 });
  }
}


