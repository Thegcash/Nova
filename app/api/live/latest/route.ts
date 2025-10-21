import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get latest position for each vehicle within last 2 minutes
    const latestPositions = await db.positions.getLatest();

    return NextResponse.json({
      positions: latestPositions,
      count: latestPositions.length,
      last_updated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Live latest error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest positions' },
      { status: 500 }
    );
  }
}
