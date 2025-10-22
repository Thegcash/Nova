"use client";

import { useState, useEffect, useRef } from 'react';
import { formatRelative, formatTime, getLast24Hours } from '../../../lib/time';

interface Position {
  vehicle_id: string;
  lat: number;
  lon: number;
  speed: number;
  heading: number;
  ts: string;
}

interface Vehicle {
  vehicle_id: string;
  name: string;
  status: string;
}

interface PlaybackData {
  positions: Position[];
  vehicle_id: string;
  start: string;
  end: string;
}

export default function Playback() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [playbackData, setPlaybackData] = useState<PlaybackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrubberPosition, setScrubberPosition] = useState(0);
  const [timeRange, setTimeRange] = useState(getLast24Hours());
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

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
          console.log('Playback map loaded');
        });
      } catch (err) {
        console.error('Failed to load Mapbox:', err);
        setMapboxToken(null);
      }
    };

    initMap();
  }, [mapboxToken]);

  // Load vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await fetch('/api/live/latest', {
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        const uniqueVehicles = result.positions?.reduce((acc: Vehicle[], pos: any) => {
          if (!acc.find(v => v.vehicle_id === pos.vehicle_id)) {
            acc.push({
              vehicle_id: pos.vehicle_id,
              name: pos.name || `Vehicle ${pos.vehicle_id}`,
              status: pos.status || 'unknown'
            });
          }
          return acc;
        }, []) || [];
        
        setVehicles(uniqueVehicles);
        if (uniqueVehicles.length > 0 && !selectedVehicle) {
          setSelectedVehicle(uniqueVehicles[0].vehicle_id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vehicles');
      }
    };

    loadVehicles();
  }, [selectedVehicle]);

  // Load playback data
  const loadPlaybackData = async (vehicleId: string, start: string, end: string) => {
    if (!vehicleId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        vehicle_id: vehicleId,
        start,
        end
      });

      const response = await fetch(`/api/playback?${params}`, {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const positions = await response.json();
      setPlaybackData({
        positions: positions || [],
        vehicle_id: vehicleId,
        start,
        end
      });
      setScrubberPosition(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playback data');
    } finally {
      setLoading(false);
    }
  };

  // Load data when vehicle or time range changes
  useEffect(() => {
    if (selectedVehicle) {
      loadPlaybackData(selectedVehicle, timeRange.start, timeRange.end);
    }
  }, [selectedVehicle, timeRange]);

  // Update map with playback data
  useEffect(() => {
    if (!mapInstanceRef.current || !playbackData?.positions.length || !mapboxToken) return;

    const map = mapInstanceRef.current;
    const positions = playbackData.positions;

    // Remove existing polyline and marker
    if (polylineRef.current) {
      map.removeLayer('playback-route');
      map.removeSource('playback-route');
    }
    if (markerRef.current) {
      markerRef.current.remove();
    }

    if (positions.length === 0) return;

    // Create polyline
    const coordinates = positions.map(p => [p.lon, p.lat]);
    
    map.addSource('playback-route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      }
    });

    map.addLayer({
      id: 'playback-route',
      type: 'line',
      source: 'playback-route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#2b6be4',
        'line-width': 3
      }
    });

    // Add current position marker
    const currentIndex = Math.floor((scrubberPosition / 100) * (positions.length - 1));
    const currentPos = positions[currentIndex];
    
    if (currentPos) {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.cssText = `
        background-color: #ef4444;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 3px solid white;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      `;

      markerRef.current = new (window as any).mapboxgl.Marker(el)
        .setLngLat([currentPos.lon, currentPos.lat])
        .setPopup(
          new (window as any).mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <div class="font-semibold">${vehicles.find(v => v.vehicle_id === currentPos.vehicle_id)?.name || currentPos.vehicle_id}</div>
                <div class="text-sm">Speed: ${Math.round(currentPos.speed)} mph</div>
                <div class="text-sm">Heading: ${Math.round(currentPos.heading)}°</div>
                <div class="text-sm">${formatTime(currentPos.ts)}</div>
                <div class="text-xs text-gray-500">Position ${currentIndex + 1} of ${positions.length}</div>
              </div>
            `)
        )
        .addTo(map);

      // Fit map to route bounds
      if (coordinates.length > 1) {
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new (window as any).mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        map.fitBounds(bounds, { padding: 50 });
      }
    }

    polylineRef.current = true;
  }, [playbackData, scrubberPosition, mapboxToken, vehicles]);

  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
  };

  const handleTimeRangeChange = (field: 'start' | 'end', value: string) => {
    setTimeRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScrubberChange = (value: number) => {
    setScrubberPosition(value);
  };

  const currentPosition = playbackData?.positions ? 
    playbackData.positions[Math.floor((scrubberPosition / 100) * (playbackData.positions.length - 1))] : 
    null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Playback</h1>
        <p className="text-[var(--ink-dim)] text-sm">
          Review vehicle movement history with time scrubbing
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Vehicle Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Vehicle</label>
          <select
            value={selectedVehicle}
            onChange={(e) => handleVehicleChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-white"
            style={{ borderColor: 'var(--line)' }}
          >
            <option value="">Select a vehicle</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                {vehicle.name} ({vehicle.vehicle_id})
              </option>
            ))}
          </select>
        </div>

        {/* Time Range */}
        <div>
          <label className="block text-sm font-medium mb-2">Start Time</label>
          <input
            type="datetime-local"
            value={timeRange.start.slice(0, 16)}
            onChange={(e) => handleTimeRangeChange('start', new Date(e.target.value).toISOString())}
            className="w-full px-3 py-2 border rounded-lg bg-white"
            style={{ borderColor: 'var(--line)' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">End Time</label>
          <input
            type="datetime-local"
            value={timeRange.end.slice(0, 16)}
            onChange={(e) => handleTimeRangeChange('end', new Date(e.target.value).toISOString())}
            className="w-full px-3 py-2 border rounded-lg bg-white"
            style={{ borderColor: 'var(--line)' }}
          />
        </div>
      </div>

      {/* Scrubber */}
      {playbackData?.positions.length ? (
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm font-medium">Timeline</span>
            <span className="text-sm text-[var(--ink-dim)]">
              {currentPosition ? formatTime(currentPosition.ts) : 'No data'}
            </span>
            <span className="text-sm text-[var(--ink-dim)]">
              {playbackData.positions.length} positions
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={scrubberPosition}
            onChange={(e) => handleScrubberChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #2b6be4 0%, #2b6be4 ${scrubberPosition}%, #e5e7eb ${scrubberPosition}%, #e5e7eb 100%)` }}
          />
        </div>
      ) : null}

      {/* Map or List */}
      {mapboxToken ? (
        <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--line)' }}>
          <div ref={mapRef} className="w-full h-96" />
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--line)' }}>
          <div className="bg-[var(--panel)] px-4 py-2 border-b" style={{ borderColor: 'var(--line)' }}>
            <div className="text-sm font-medium">Playback Route</div>
            <div className="text-xs text-[var(--ink-dim)]">
              {mapboxToken ? 'Map view' : 'List view (Mapbox token not configured)'}
            </div>
          </div>
          <div className="max-h-96 overflow-auto">
            {loading ? (
              <div className="p-8 text-center text-[var(--ink-dim)]">
                Loading playback data...
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded m-4">
                <div className="text-red-800 font-medium">Error</div>
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            ) : playbackData?.positions.length ? (
              <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
                {playbackData.positions.map((pos, index) => {
                  const isCurrent = index === Math.floor((scrubberPosition / 100) * (playbackData.positions.length - 1));
                  return (
                    <div 
                      key={`${pos.vehicle_id}-${index}`} 
                      className={`p-4 ${isCurrent ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--hover)]'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${isCurrent ? 'text-white' : ''}`}>
                            Position {index + 1} {isCurrent && '← Current'}
                          </div>
                          <div className={`text-sm ${isCurrent ? 'text-blue-100' : 'text-[var(--ink-dim)]'}`}>
                            {formatTime(pos.ts)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm ${isCurrent ? 'text-white' : ''}`}>
                            {pos.lat.toFixed(6)}, {pos.lon.toFixed(6)}
                          </div>
                          <div className={`text-xs ${isCurrent ? 'text-blue-100' : 'text-[var(--ink-dim)]'}`}>
                            {Math.round(pos.speed)} mph • {Math.round(pos.heading)}°
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-[var(--ink-dim)]">
                No playback data available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}