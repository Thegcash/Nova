import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE!;
  if (!url || !service) throw new Error("Missing Supabase env vars");
  return createClient(url, service, { auth: { persistSession: false } });
}

export async function GET(request: NextRequest) {
  const supabase = serverClient();
  
  // Set SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  const stream = new ReadableStream({
    start(controller) {
      let isActive = true;
      let heartbeatInterval: NodeJS.Timeout;
      let dataInterval: NodeJS.Timeout;

      const sendData = async () => {
        if (!isActive) return;
        
        try {
          // Get latest positions (reuse logic from /api/live/latest)
          const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
          
          const { data: positions, error } = await supabase
            .from('positions')
            .select(`
              vehicle_id,
              lat,
              lon,
              speed,
              heading,
              ts,
              vehicles!inner(name, status)
            `)
            .gte('ts', twoMinutesAgo)
            .order('ts', { ascending: false });

          if (error) {
            console.error('SSE positions error:', error);
            return;
          }

          // Group by vehicle_id and get latest position per vehicle
          const latestPositions = positions?.reduce((acc: any[], pos: any) => {
            if (!acc.find(p => p.vehicle_id === pos.vehicle_id)) {
              acc.push({
                vehicle_id: pos.vehicle_id,
                name: pos.vehicles?.name || `Vehicle ${pos.vehicle_id}`,
                lat: pos.lat,
                lon: pos.lon,
                speed: pos.speed,
                heading: pos.heading,
                ts: pos.ts,
                status: pos.vehicles?.status || 'unknown'
              });
            }
            return acc;
          }, []) || [];

          const data = {
            positions: latestPositions,
            count: latestPositions.length,
            last_updated: new Date().toISOString()
          };

          const message = `event: positions\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(new TextEncoder().encode(message));
        } catch (error) {
          console.error('SSE error:', error);
        }
      };

      const sendHeartbeat = () => {
        if (!isActive) return;
        controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));
      };

      // Send initial data
      sendData();

      // Set up intervals
      dataInterval = setInterval(sendData, 2000); // Every 2 seconds
      heartbeatInterval = setInterval(sendHeartbeat, 15000); // Every 15 seconds

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        isActive = false;
        clearInterval(dataInterval);
        clearInterval(heartbeatInterval);
        controller.close();
      });
    }
  });

  return new Response(stream, { headers });
}
