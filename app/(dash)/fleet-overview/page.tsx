"use client";

import { useState, useMemo, useEffect } from "react";
import { Chip, Button, Kbd, Kpi, TestRow } from "@/components/ui";

export default function FleetOverviewPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Fleet Overview</h1>
        <p className="text-gray-600">Monitor your autonomous vehicle fleet status and performance metrics.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi label="Active Vehicles" value="247" sub="↑ 12 from yesterday" tone="ok" />
        <Kpi label="Total Distance" value="12.4K mi" sub="Today" tone="default" />
        <Kpi label="Avg Efficiency" value="94.2%" sub="↑ 2.1% this week" tone="ok" />
        <Kpi label="Incidents" value="3" sub="↓ 5 from last week" tone="warn" />
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Fleet Status</h2>
        <div className="space-y-2">
          <TestRow label="Vehicle Health Checks" pass={true} detail="247/247 vehicles" />
          <TestRow label="Communication Status" pass={true} detail="All systems online" />
          <TestRow label="Route Optimization" pass={false} detail="3 routes need attention" />
          <TestRow label="Battery Levels" pass={true} detail="Avg 78% charge" />
        </div>
      </div>
    </div>
  );
}

