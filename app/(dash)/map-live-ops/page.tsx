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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <style jsx global>{`
        :root{
          --bg:#fff; --panel:#fff;
          --ink:#0f1720; --ink-dim:#5b6472;
          --line:#e8eaf0; --hover:#f7f8fb; --focus:#cfd6e4; --accent:#2b6be4;
          --chip-bg:#f4f6fa; --chip-ink:#3e4652;
          --radius-s:8px; --radius-m:12px; --radius-l:16px;
          --shadow-0:0 0 0 1px var(--line);
        }
        .btn-ghost{ height:34px; padding:0 12px; border:1px solid var(--line); border-radius:12px; background:var(--bg); display:inline-flex; align-items:center; gap:8px; }
        .btn-ghost:hover{ background:var(--hover); }
        .chip{ padding:4px 10px; border-radius:999px; font-size:12px; line-height:1; }
        .chip-muted{ background:var(--chip-bg); color:var(--chip-ink); }
      `}</style>

      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-6 border-b" style={{borderColor:'var(--line)'}}>
        <div className="flex items-center gap-3">
          <div className="text-[13px] text-[var(--ink-dim)]">Fleet ▾</div>
          <div className="w-1 h-1 rounded-full bg-[var(--line)]"/>
          <div className="text-[15px] font-semibold">Command Center — Live Ops</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-[13px]">Share</button>
          <button className="btn-ghost text-[13px]">Download</button>
          <button className="btn-ghost text-[13px]">EN ▾</button>
        </div>
      </div>

      <div className="flex">
        {/* Left Rail */}
        <div className="w-[72px] border-r" style={{borderColor:'var(--line)'}}>
          <div className="p-3 flex flex-col items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--hover)] grid place-items-center font-semibold">N</div>
            {['🏠','📁','💬','📄','⚙️'].map((i,idx)=> (
              <button key={idx} className="w-10 h-10 rounded-xl hover:bg-[var(--hover)] grid place-items-center text-lg">{i}</button>
            ))}
          </div>
        </div>

        {/* Main Column */}
        <div className="flex-1 min-h-[calc(100vh-56px)] p-6">
          <div ref={ref} className="w-full h-[72vh] rounded-2xl border" style={{ borderColor: "var(--line)" }} />
          <div className="text-[12px] text-[var(--ink-dim)] mt-2">
            Live Ops — Google Maps • updates every ~3s
          </div>
        </div>
      </div>
    </div>
  );
}