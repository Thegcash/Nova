"use client";

import { useState, useMemo, useEffect } from "react";
import { Chip, Button, Kbd, Kpi } from "@/components/ui";

export default function ReduceCostPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Reduce Cost</h1>
        <p className="text-gray-600">Optimize operations and identify cost-saving opportunities across your fleet.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Kpi label="Monthly Savings" value="$47.2K" sub="vs last month" tone="ok" />
        <Kpi label="Fuel Efficiency" value="23.4 mpg" sub="Fleet average" tone="ok" />
        <Kpi label="Maintenance Cost" value="$892/vehicle" sub="This month" tone="warn" />
        <Kpi label="Idle Time" value="12.3%" sub="↓ 3.2% improvement" tone="ok" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Cost Optimization Opportunities</h2>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Route Optimization</h3>
                <Chip tone="ok">$12.4K/month</Chip>
              </div>
              <p className="text-xs text-gray-600 mb-3">Optimize 23 routes to reduce fuel consumption by 8.2%</p>
              <Button variant="primary" onClick={() => console.log('Implement changes')}>Implement Changes</Button>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Predictive Maintenance</h3>
                <Chip tone="warn">$8.7K/month</Chip>
              </div>
              <p className="text-xs text-gray-600 mb-3">Schedule maintenance based on usage patterns vs fixed intervals</p>
              <Button onClick={() => console.log('Review schedule')}>Review Schedule</Button>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Energy Management</h3>
                <Chip tone="ok">$5.1K/month</Chip>
              </div>
              <p className="text-xs text-gray-600 mb-3">Optimize charging schedules during off-peak hours</p>
              <Button onClick={() => console.log('Configure settings')}>Configure Settings</Button>
            </div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Cost Breakdown</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Fuel & Energy</span>
              <span className="font-medium">$156.2K</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Maintenance</span>
              <span className="font-medium">$89.4K</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Insurance</span>
              <span className="font-medium">$34.7K</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Operations</span>
              <span className="font-medium">$67.1K</span>
            </div>
            <div className="border-t pt-2 mt-4">
              <div className="flex items-center justify-between font-semibold">
                <span>Total Monthly Cost</span>
                <span>$347.4K</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

