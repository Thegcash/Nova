"use client";

import { useEffect, useRef, useState } from 'react';

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

interface LiveMapProps {
  className?: string;
}

export function LiveMap({ className = "" }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch latest positions
  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/live/latest');
      if (!response.ok) {
        throw new Error('Failed to fetch positions');
      }
      const data = await response.json();
      setPositions(data.positions || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Check if Mapbox token is available
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!mapboxToken && !googleMapsKey) {
      setError('No map API key configured. Please set NEXT_PUBLIC_MAPBOX_TOKEN or GOOGLE_MAPS_API_KEY');
      setLoading(false);
      return;
    }

    // Initialize Mapbox (preferred)
    if (mapboxToken) {
      import('mapbox-gl' as any).then((mapboxgl) => {
        (window as any).mapboxgl = mapboxgl;
        mapboxgl.accessToken = mapboxToken;
        
        const map = new mapboxgl.Map({
          container: mapRef.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-74.006, 40.7128], // Default to NYC
          zoom: 10
        });

        map.on('load', () => {
          mapInstanceRef.current = map;
          fetchPositions();
        });
      }).catch((err) => {
        console.error('Failed to load Mapbox:', err);
        setError('Failed to load map');
        setLoading(false);
      });
    }
    // Fallback to Google Maps
    else if (googleMapsKey) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}&libraries=places`;
      script.onload = () => {
        const map = new google.maps.Map(mapRef.current!, {
          center: { lat: 40.7128, lng: -74.006 },
          zoom: 10
        });
        mapInstanceRef.current = map;
        fetchPositions();
      };
      script.onerror = () => {
        setError('Failed to load Google Maps');
        setLoading(false);
      };
      document.head.appendChild(script);
    }
  }, []);

  // Update markers when positions change
  useEffect(() => {
    if (!mapInstanceRef.current || !positions.length) return;

    const map = mapInstanceRef.current;
    const isMapbox = map.getStyle; // Mapbox has getStyle method

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (isMapbox) {
        marker.remove();
      } else {
        marker.setMap(null);
      }
    });
    markersRef.current.clear();

    // Add new markers
    positions.forEach((position) => {
      const { lat, lon, speed, heading, vehicles } = position;
      
      if (isMapbox) {
        // Mapbox implementation
        const el = document.createElement('div');
        el.className = 'vehicle-marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = vehicles.status === 'active' ? '#10B981' : '#F59E0B';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';
        el.title = `${vehicles.name} - ${speed.toFixed(1)} mph`;

        const marker = new (window as any).mapboxgl.Marker(el)
          .setLngLat([lon, lat])
          .setPopup(new (window as any).mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${vehicles.name}</h3>
              <p>Speed: ${speed.toFixed(1)} mph</p>
              <p>Status: ${vehicles.status}</p>
              <p>Updated: ${new Date(position.ts).toLocaleTimeString()}</p>
            </div>
          `))
          .addTo(map);

        markersRef.current.set(position.vehicle_id, marker);
      } else {
        // Google Maps implementation
        const marker = new google.maps.Marker({
          position: { lat, lng: lon },
          map: map,
          title: `${vehicles.name} - ${speed.toFixed(1)} mph`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: vehicles.status === 'active' ? '#10B981' : '#F59E0B',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold">${vehicles.name}</h3>
              <p>Speed: ${speed.toFixed(1)} mph</p>
              <p>Status: ${vehicles.status}</p>
              <p>Updated: ${new Date(position.ts).toLocaleTimeString()}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        markersRef.current.set(position.vehicle_id, marker);
      }
    });
  }, [positions]);

  // Poll for updates every 3 seconds
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const interval = setInterval(fetchPositions, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`bg-gray-100 border rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-2">Map Error</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
        <div className="text-sm font-medium mb-2">Live Vehicles</div>
        <div className="text-2xl font-bold text-blue-600">{positions.length}</div>
        <div className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
}
