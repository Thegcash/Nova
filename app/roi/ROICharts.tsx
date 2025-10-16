'use client'

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function ROICharts({ data }: { data: any[] }) {
  if (data.length === 0) return null

  // Transform data for charts
  const chartData = data.map((row: any) => ({
    date: row.day.slice(5), // MM-DD
    incidents: Number(row.avoided_incidents || 0),
    downtime: Number(row.downtime_avoided_min || 0),
    savings: Number(row.loss_prevented_est_sum || 0),
    baselineIncidents: Number(row.baseline_avoided_incidents || 0),
    baselineSavings: Number(row.baseline_loss || 0)
  }))

  return (
    <div className="grid grid-2 mb-6" style={{gap: 'var(--space-4)'}}>
      {/* Avoided Incidents Chart */}
      <div className="card">
        <div className="card-header">
          <h3 style={{fontSize: '15px', fontWeight: 600}}>Avoided Incidents Trend</h3>
          <p className="text-tertiary text-xs">vs Baseline</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{fontSize: 11, fill: '#94A3B8'}}
              axisLine={{stroke: '#E2E8F0'}}
              tickLine={false}
            />
            <YAxis 
              tick={{fontSize: 11, fill: '#94A3B8'}}
              axisLine={{stroke: '#E2E8F0'}}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '12px',
                padding: '8px 12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="incidents" 
              stroke="#2563EB" 
              strokeWidth={2}
              dot={false}
              name="Avoided"
            />
            <Line 
              type="monotone" 
              dataKey="baselineIncidents" 
              stroke="#94A3B8" 
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              name="Baseline"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cost Savings Chart */}
      <div className="card">
        <div className="card-header">
          <h3 style={{fontSize: '15px', fontWeight: 600}}>Cost Savings Trend</h3>
          <p className="text-tertiary text-xs">Daily loss prevented</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{fontSize: 11, fill: '#94A3B8'}}
              axisLine={{stroke: '#E2E8F0'}}
              tickLine={false}
            />
            <YAxis 
              tick={{fontSize: 11, fill: '#94A3B8'}}
              axisLine={{stroke: '#E2E8F0'}}
              tickLine={false}
              tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '12px',
                padding: '8px 12px'
              }}
              formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Savings']}
            />
            <Area 
              type="monotone" 
              dataKey="savings" 
              stroke="#10B981" 
              strokeWidth={2}
              fill="url(#colorSavings)" 
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}



