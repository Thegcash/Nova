// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '360px', borderRadius: '16px' };

export default function MapView() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });
  const [fleets, setFleets] = useState([]);

  useEffect(() => {
    fetch('/api/fleets').then(r => r.json()).then(d => setFleets(d.fleets || [])).catch(() => {});
  }, []);

  if (!isLoaded) return <div className="text-sm opacity-60">Loading map…</div>;

  const center = fleets[0] ? { lat: fleets[0].lat, lng: fleets[0].lng } : { lat: 39.5, lng: -98.35 };

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={4}>
      {fleets.map(f => (
        <Marker key={f.id} position={{ lat: f.lat, lng: f.lng }} title={`${f.name} (${f.status})`} />
      ))}
    </GoogleMap>
  );
}

