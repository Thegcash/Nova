"use client";

import { useState, useEffect } from "react";
import { Chip, Button, Kbd, Kpi, TestRow } from "@/components/ui";

interface FleetOverviewData {
  active_vehicles: number;
  idle_vehicles: number;
  alerts_24h: number;
  total_vehicles: number;
  last_updated: string;
}

export default function FleetOverviewPage() {
  const [data, setData] = useState<FleetOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/fleet/overview');
        if (!response.ok) {
          throw new Error('Failed to fetch fleet data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">Fleet Overview</h1>
          <p className="text-gray-600">Loading fleet data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">Fleet Overview</h1>
          <p className="text-red-600">Error loading fleet data: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">Fleet Overview</h1>
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Fleet Overview</h1>
        <p className="text-gray-600">Monitor your autonomous vehicle fleet status and performance metrics.</p>
        <p className="text-sm text-gray-500 mt-1">Last updated: {new Date(data.last_updated).toLocaleString()}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi 
          label="Active Vehicles" 
          value={data.active_vehicles.toString()} 
          sub={`${data.total_vehicles} total`} 
          tone="ok" 
        />
        <Kpi 
          label="Idle Vehicles" 
          value={data.idle_vehicles.toString()} 
          sub="Speed < 1 mph" 
          tone={data.idle_vehicles > 0 ? "warn" : "ok"} 
        />
        <Kpi 
          label="24h Alerts" 
          value={data.alerts_24h.toString()} 
          sub="Last 24 hours" 
          tone={data.alerts_24h > 10 ? "bad" : data.alerts_24h > 5 ? "warn" : "ok"} 
        />
        <Kpi 
          label="Fleet Health" 
          value={`${Math.round((data.active_vehicles / Math.max(data.total_vehicles, 1)) * 100)}%`} 
          sub="Operational" 
          tone={data.active_vehicles === data.total_vehicles ? "ok" : "warn"} 
        />
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Fleet Status</h2>
        <div className="space-y-2">
          <TestRow 
            label="Vehicle Health Checks" 
            pass={data.active_vehicles > 0} 
            detail={`${data.active_vehicles}/${data.total_vehicles} vehicles active`} 
          />
          <TestRow 
            label="Communication Status" 
            pass={data.active_vehicles > 0} 
            detail={data.active_vehicles > 0 ? "All systems online" : "No active vehicles"} 
          />
          <TestRow 
            label="Idle Vehicles" 
            pass={data.idle_vehicles === 0} 
            detail={data.idle_vehicles > 0 ? `${data.idle_vehicles} vehicles idle` : "All vehicles active"} 
          />
          <TestRow 
            label="Alert Status" 
            pass={data.alerts_24h < 10} 
            detail={`${data.alerts_24h} alerts in last 24h`} 
          />
        </div>
      </div>
    </div>
  );
}

