"use client";

import { useState, useEffect } from "react";
import { Chip, Button, Kbd, Kpi } from "@/components/ui";
import { LiveMap } from "@/components/LiveMap";

interface Position {
  vehicle_id: string;
  ts: string;
  lat: number;
  lon: number;
  speed: number;
  heading: number;
  vehicles: {
    name: string;
    status: string;
  };
}

export default function MapLiveOpsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await fetch('/api/live/latest');
        if (response.ok) {
          const data = await response.json();
          setPositions(data.positions || []);
        }
      } catch (error) {
        console.error('Failed to fetch positions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
    
    // Poll every 3 seconds
    const interval = setInterval(fetchPositions, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Map & Live Operations</h1>
        <p className="text-gray-600">Real-time vehicle tracking and operational control center.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveMap className="h-96" />
        </div>
        
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3">Active Operations</h3>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between text-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : positions.length > 0 ? (
              <div className="space-y-2">
                {positions.slice(0, 5).map((position) => (
                  <div key={position.vehicle_id} className="flex items-center justify-between text-sm">
                    <span>{position.vehicles.name}</span>
                    <Chip tone={position.vehicles.status === 'active' ? 'ok' : 'warn'}>
                      {position.speed > 1 ? 'En Route' : 'Idle'}
                    </Chip>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No active vehicles</div>
            )}
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="primary" onClick={() => console.log('Emergency stop')}>
                Emergency Stop All
              </Button>
              <Button onClick={() => console.log('Reroute')}>
                Reroute Traffic
              </Button>
              <Button onClick={() => console.log('Update weather')}>
                Update Weather Data
              </Button>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3">Live Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Vehicles</span>
                <span className="font-medium">{positions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Speed</span>
                <span className="font-medium">
                  {positions.length > 0 
                    ? (positions.reduce((sum, p) => sum + p.speed, 0) / positions.length).toFixed(1)
                    : '0'
                  } mph
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Update</span>
                <span className="font-medium text-xs">
                  {positions.length > 0 
                    ? new Date(positions[0].ts).toLocaleTimeString()
                    : 'Never'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

