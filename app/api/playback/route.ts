import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicle_id');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!vehicleId || !start || !end) {
      return NextResponse.json(
        { error: 'Missing required parameters: vehicle_id, start, end' },
        { status: 400 }
      );
    }

    // Validate date format
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO 8601 format' },
        { status: 400 }
      );
    }

    // Get positions for the specified vehicle and time range
    const positions = await db.positions.getPlayback(vehicleId, start, end);

    return NextResponse.json({
      vehicle_id: vehicleId,
      start,
      end,
      positions,
      count: positions.length,
      duration_minutes: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))
    });

  } catch (error) {
    console.error('Playback error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playback data' },
      { status: 500 }
    );
  }
}
