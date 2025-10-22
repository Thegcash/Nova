"use client";

import { useState, useEffect, useRef } from 'react';
import { formatRelative, formatTime } from '../../../lib/time';

interface Position {
  vehicle_id: string;
  name: string;
  lat: number;
  lon: number;
  speed: number;
  heading: number;
  ts: string;
  status: string;
}

interface LiveData {
  positions: Position[];
  count: number;
  last_updated: string;
}

export default function MapLiveOps() {
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useSSE, setUseSSE] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Check for Mapbox token
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    setMapboxToken(token || null);
  }, []);

  // Initialize map if Mapbox is available
  useEffect(() => {
    if (!mapboxToken || !mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        // Dynamic import with error handling
        const mapboxgl = await import('mapbox-gl').catch(() => null);
        if (!mapboxgl) throw new Error('Mapbox not available');
        mapboxgl.accessToken = mapboxToken;

        const map = new mapboxgl.Map({
          container: mapRef.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-118.2437, 34.0522], // Los Angeles
          zoom: 10
        });

        mapInstanceRef.current = map;

        map.on('load', () => {
          console.log('Map loaded');
        });
      } catch (err) {
        console.error('Failed to load Mapbox:', err);
        setMapboxToken(null);
      }
    };

    initMap();
  }, [mapboxToken]);

  // Update map markers
  const updateMapMarkers = (positions: Position[]) => {
    if (!mapInstanceRef.current || !mapboxToken) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    positions.forEach(pos => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.cssText = `
        background-color: ${pos.status === 'active' ? '#2b6be4' : '#6b7280'};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `;

      const marker = new (window as any).mapboxgl.Marker(el)
        .setLngLat([pos.lon, pos.lat])
        .setPopup(
          new (window as any).mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <div class="font-semibold">${pos.name}</div>
                <div class="text-sm text-gray-600">${pos.vehicle_id}</div>
                <div class="text-sm">Speed: ${Math.round(pos.speed)} mph</div>
                <div class="text-sm">Heading: ${Math.round(pos.heading)}°</div>
                <div class="text-sm">${formatTime(pos.ts)}</div>
              </div>
            `)
        )
        .addTo(mapInstanceRef.current);

      markersRef.current.push(marker);
    });
  };

  // Fetch data via polling
  const fetchData = async () => {
    try {
      const response = await fetch('/api/live/latest', {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
      
      if (mapboxToken) {
        updateMapMarkers(result.positions || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Setup SSE connection
  const setupSSE = () => {
    if (eventSourceRef.current) return;

    const eventSource = new EventSource('/api/live/stream');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const result = JSON.parse(event.data);
        setData(result);
        setError(null);
        
        if (mapboxToken) {
          updateMapMarkers(result.positions || []);
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    eventSource.addEventListener('positions', (event) => {
      try {
        const result = JSON.parse(event.data);
        setData(result);
        setError(null);
        
        if (mapboxToken) {
          updateMapMarkers(result.positions || []);
        }
      } catch (err) {
        console.error('SSE positions error:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      setUseSSE(false);
      eventSource.close();
      eventSourceRef.current = null;
    };
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Setup polling or SSE
  useEffect(() => {
    if (useSSE) {
      setupSSE();
      return () => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      };
    } else {
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [useSSE]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-[var(--ink-dim)]">Loading live positions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-medium">Error loading live data</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
          <button 
            onClick={fetchData}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Live Operations</h1>
          <p className="text-[var(--ink-dim)] text-sm">
            {data?.count || 0} vehicles • Last updated: {data?.last_updated ? formatRelative(data.last_updated) : 'Never'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useSSE}
              onChange={(e) => setUseSSE(e.target.checked)}
              className="rounded"
            />
            Use real-time stream
          </label>
          <button
            onClick={fetchData}
            className="px-3 py-1 bg-[var(--accent)] text-white rounded text-sm hover:opacity-90"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Map or List */}
      {mapboxToken ? (
        <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--line)' }}>
          <div ref={mapRef} className="w-full h-96" />
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--line)' }}>
          <div className="bg-[var(--panel)] px-4 py-2 border-b" style={{ borderColor: 'var(--line)' }}>
            <div className="text-sm font-medium">Live Vehicle Positions</div>
            <div className="text-xs text-[var(--ink-dim)]">
              {mapboxToken ? 'Map view' : 'List view (Mapbox token not configured)'}
            </div>
          </div>
          <div className="max-h-96 overflow-auto">
            {data?.positions?.length ? (
              <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
                {data.positions.map((pos, index) => (
                  <div key={`${pos.vehicle_id}-${index}`} className="p-4 hover:bg-[var(--hover)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{pos.name}</div>
                        <div className="text-sm text-[var(--ink-dim)]">{pos.vehicle_id}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          {pos.lat.toFixed(6)}, {pos.lon.toFixed(6)}
                        </div>
                        <div className="text-xs text-[var(--ink-dim)]">
                          {Math.round(pos.speed)} mph • {formatRelative(pos.ts)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-[var(--ink-dim)]">
                No vehicle positions available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}