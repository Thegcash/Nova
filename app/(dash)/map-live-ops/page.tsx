"use client";
import React from "react";
import { Loader } from "@googlemaps/js-api-loader";

type Latest = {
  positions: { vehicle_id: string; ts: string; lat: number; lon: number; speed: number; heading: number; vehicles?: { name?: string } }[];
  count: number;
  last_updated: string;
};

export default function LiveOps() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<google.maps.Map | null>(null);
  const markersRef = React.useRef<Record<string, google.maps.Marker>>({});

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string | undefined;

  React.useEffect(() => {
    let timer: any;

    async function initMap() {
      if (!ref.current) return;

      if (!apiKey) {
        ref.current.innerHTML =
          "<div style='padding:12px;border:1px solid var(--line);border-radius:12px;'>Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</div>";
        return;
      }

      if (!mapRef.current) {
        const loader = new Loader({ apiKey, version: "weekly" });
        const { Map } = await (loader as any).importLibrary("maps");
        mapRef.current = new Map(ref.current, {
          center: { lat: 40.73, lng: -73.97 },
          zoom: 12,
          mapId: "nova-map",
          disableDefaultUI: true,
        });
      }

      async function tick() {
        try {
          const res = await fetch("/api/live/latest", { cache: "no-store" });
          const data: Latest = await res.json();

          if (!Array.isArray(data.positions)) return;

          for (const p of data.positions) {
            const id = p.vehicle_id;
            const pos = { lat: p.lat, lng: p.lon };
            const label = p.vehicles?.name ?? id.slice(0, 4).toUpperCase();

            if (!markersRef.current[id]) {
              markersRef.current[id] = new google.maps.Marker({
                position: pos,
                map: mapRef.current!,
                title: label,
              });
            } else {
              markersRef.current[id].setPosition(pos);
              markersRef.current[id].setTitle(label);
            }
          }
        } catch (e) {
          console.error("live tick error", e);
        }
      }

      await tick();
      timer = setInterval(tick, 3000);
    }

    initMap();
    return () => timer && clearInterval(timer);
  }, [apiKey]);

  return (
    <div className="p-4">
      <div ref={ref} className="w-full h-[72vh] rounded-2xl border" style={{ borderColor: "var(--line)" }} />
      <div className="text-[12px] text-[var(--ink-dim)] mt-2">
        Live Ops — Google Maps • updates every ~3s
      </div>
    </div>
  );
}