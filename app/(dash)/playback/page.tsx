"use client";

import { useState, useMemo, useEffect } from "react";
import { Chip, Button, Kbd, Kpi } from "@/components/ui";

export default function PlaybackPage() {
  const [selectedDate, setSelectedDate] = useState("2024-01-15");
  
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle ID</label>
            <select className="border rounded-md px-3 py-2 text-sm">
              <option>All Vehicles</option>
              <option>AV-001</option>
              <option>AV-042</option>
              <option>AV-123</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="primary" onClick={() => console.log('Load playback')}>Load Playback</Button>
          </div>
        </div>
        
        <div className="bg-gray-100 border rounded-lg h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-lg font-medium mb-2">Playback Viewer</div>
            <div className="text-sm">Historical route and sensor data visualization</div>
            <div className="mt-4 flex items-center gap-2 justify-center">
              <Kbd>Space</Kbd>
              <span className="text-xs">Play/Pause</span>
              <Kbd>←</Kbd>
              <Kbd>→</Kbd>
              <span className="text-xs">Seek</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi label="Trip Duration" value="2h 34m" sub="Selected timeframe" />
        <Kpi label="Distance Covered" value="127.3 mi" sub="Total route distance" />
        <Kpi label="Avg Speed" value="49.8 mph" sub="Including stops" />
      </div>
    </div>
  );
}

