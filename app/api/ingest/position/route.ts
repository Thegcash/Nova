import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate payload
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Expected array of positions' },
        { status: 400 }
      );
    }

    // Validate each position
    for (const pos of body) {
      if (!pos.vehicle_id || !pos.ts || typeof pos.lat !== 'number' || typeof pos.lon !== 'number') {
        return NextResponse.json(
          { error: 'Invalid position data. Required: vehicle_id, ts, lat, lon' },
          { status: 400 }
        );
      }
    }

    // Insert positions
    const inserted = await db.positions.insertMany(body);

    return NextResponse.json({
      success: true,
      count: inserted.length,
      inserted: inserted.map(p => ({ id: p.id, vehicle_id: p.vehicle_id, ts: p.ts }))
    });

  } catch (error) {
    console.error('Position ingest error:', error);
    return NextResponse.json(
      { error: 'Failed to ingest positions' },
      { status: 500 }
    );
  }
}
