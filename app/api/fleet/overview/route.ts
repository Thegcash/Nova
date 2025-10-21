import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get active vehicles (heartbeat within last 5 minutes)
    const activeVehicles = await db.vehicles.getActive();
    const activeCount = activeVehicles.length;

    // Get idle vehicles (speed < 1 for all points in last 10 minutes)
    const idleVehicleIds = await db.positions.getIdleVehicles();
    const idleCount = idleVehicleIds.length;

    // Get 24h alerts count
    const alerts24h = await db.events.get24hAlerts();

    return NextResponse.json({
      active_vehicles: activeCount,
      idle_vehicles: idleCount,
      alerts_24h: alerts24h,
      total_vehicles: activeCount + idleCount,
      last_updated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fleet overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fleet overview' },
      { status: 500 }
    );
  }
}
