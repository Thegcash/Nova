"use client";

import { useState, useMemo, useEffect } from "react";
import { Chip, Button, Kbd, Kpi, TestRow } from "@/components/ui";

export default function IngestionPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Data Ingestion</h1>
        <p className="text-gray-600">Monitor data pipelines and ingestion processes from your vehicle fleet.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Kpi label="Data Rate" value="2.4 GB/s" sub="Current ingestion" tone="ok" />
        <Kpi label="Queue Size" value="1.2M" sub="Pending records" tone="warn" />
        <Kpi label="Processing Lag" value="34ms" sub="Avg latency" tone="ok" />
        <Kpi label="Error Rate" value="0.02%" sub="Last 24h" tone="ok" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Pipeline Status</h2>
          <div className="space-y-3">
            <TestRow label="Sensor Data Stream" pass={true} detail="247 vehicles connected" />
            <TestRow label="GPS Tracking" pass={true} detail="Real-time updates" />
            <TestRow label="Camera Feed Processing" pass={false} detail="3 cameras offline" />
            <TestRow label="LIDAR Data Ingestion" pass={true} detail="High fidelity mode" />
            <TestRow label="Vehicle Diagnostics" pass={true} detail="All systems reporting" />
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Data Sources</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Vehicle Telemetry</div>
                <div className="text-xs text-gray-500">Real-time sensor data</div>
              </div>
              <Chip tone="ok">Active</Chip>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Traffic Cameras</div>
                <div className="text-xs text-gray-500">City infrastructure</div>
              </div>
              <Chip tone="warn">Degraded</Chip>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Weather API</div>
                <div className="text-xs text-gray-500">Environmental data</div>
              </div>
              <Chip tone="ok">Active</Chip>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Map Updates</div>
                <div className="text-xs text-gray-500">Road condition changes</div>
              </div>
              <Chip tone="ok">Active</Chip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

