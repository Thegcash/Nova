"use client";

import { useState, useEffect, useRef } from "react";
import { Chip, Button, Kbd, Kpi } from "@/components/ui";

interface Vehicle {
  id: string;
  name: string;
  status: string;
}

interface Position {
  id: string;
  vehicle_id: string;
  ts: string;
  lat: number;
  lon: number;
  speed: number;
  heading: number;
}

export default function PlaybackPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/fleet/overview');
        if (response.ok) {
          const data = await response.json();
          // Mock vehicles for now - in real app, this would come from a vehicles API
          setVehicles([
            { id: '1', name: 'AV-001', status: 'active' },
            { id: '2', name: 'AV-002', status: 'active' },
            { id: '3', name: 'AV-003', status: 'idle' },
            { id: '4', name: 'AV-004', status: 'active' },
            { id: '5', name: 'AV-005', status: 'active' },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      }
    };

    fetchVehicles();
  }, []);

  // Load playback data
  const loadPlayback = async () => {
    if (!selectedVehicle) return;

    setLoading(true);
    setError(null);

    try {
      const start = new Date(selectedDate).toISOString();
      const end = new Date(new Date(selectedDate).getTime() + 24 * 60 * 60 * 1000).toISOString();

      const response = await fetch(
        `/api/playback?vehicle_id=${selectedVehicle}&start=${start}&end=${end}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch playback data');
      }

      const data = await response.json();
      setPositions(data.positions || []);
      setCurrentIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Playback controls
  const togglePlayback = () => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      if (positions.length > 0) {
        intervalRef.current = setInterval(() => {
          setCurrentIndex(prev => {
            if (prev >= positions.length - 1) {
              setIsPlaying(false);
              return prev;
            }
            return prev + 1;
          });
        }, 1000 / playbackSpeed);
        setIsPlaying(true);
      }
    }
  };

  const seekTo = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, positions.length - 1)));
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Calculate stats
  const currentPosition = positions[currentIndex];
  const tripDuration = positions.length > 0 
    ? Math.round((new Date(positions[positions.length - 1].ts).getTime() - new Date(positions[0].ts).getTime()) / (1000 * 60))
    : 0;
  
  const totalDistance = positions.length > 1
    ? positions.reduce((total, pos, index) => {
        if (index === 0) return 0;
        const prev = positions[index - 1];
        // Simple distance calculation (not accurate for long distances)
        const latDiff = pos.lat - prev.lat;
        const lonDiff = pos.lon - prev.lon;
        const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 69; // Rough miles
        return total + distance;
      }, 0)
    : 0;

  const avgSpeed = positions.length > 0
    ? positions.reduce((sum, pos) => sum + pos.speed, 0) / positions.length
    : 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Playback</h1>
        <p className="text-gray-600">Review historical vehicle data and replay past operations.</p>
      </div>
      
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
            <select 
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button 
              variant="primary" 
              onClick={loadPlayback}
              disabled={!selectedVehicle || loading}
            >
              {loading ? 'Loading...' : 'Load Playback'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <div className="bg-gray-100 border rounded-lg h-64 flex items-center justify-center relative">
          {positions.length > 0 ? (
            <div className="w-full h-full p-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium">
                  {vehicles.find(v => v.id === selectedVehicle)?.name} - Playback
                </h3>
                <p className="text-sm text-gray-600">
                  Position {currentIndex + 1} of {positions.length}
                </p>
              </div>
              
              {currentPosition && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentPosition.speed.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">Speed (mph)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {currentPosition.lat.toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-500">Latitude</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {currentPosition.lon.toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-500">Longitude</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentPosition.heading.toFixed(0)}°
                    </div>
                    <div className="text-xs text-gray-500">Heading</div>
                  </div>
                </div>
              )}

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button onClick={togglePlayback} variant="primary">
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <div className="flex items-center gap-2">
                  <label className="text-sm">Speed:</label>
                  <select 
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={4}>4x</option>
                  </select>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <input
                  type="range"
                  min="0"
                  max={positions.length - 1}
                  value={currentIndex}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{new Date(positions[0]?.ts).toLocaleTimeString()}</span>
                  <span>{new Date(positions[positions.length - 1]?.ts).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">Playback Viewer</div>
              <div className="text-sm">Select a vehicle and date to view historical data</div>
              <div className="mt-4 flex items-center gap-2 justify-center">
                <Kbd>Space</Kbd>
                <span className="text-xs">Play/Pause</span>
                <Kbd>←</Kbd>
                <Kbd>→</Kbd>
                <span className="text-xs">Seek</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi 
          label="Trip Duration" 
          value={`${Math.floor(tripDuration / 60)}h ${tripDuration % 60}m`} 
          sub="Selected timeframe" 
        />
        <Kpi 
          label="Distance Covered" 
          value={`${totalDistance.toFixed(1)} mi`} 
          sub="Total route distance" 
        />
        <Kpi 
          label="Avg Speed" 
          value={`${avgSpeed.toFixed(1)} mph`} 
          sub="Including stops" 
        />
      </div>
    </div>
  );
}

