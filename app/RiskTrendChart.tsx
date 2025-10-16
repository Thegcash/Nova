'use client'

import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function RiskTrendChart() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // Generate 30 days of sample risk data
    const today = new Date()
    const sampleData = []
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Simulate risk score between 60-75 with some variance
      const baseRisk = 68
      const variance = Math.sin(i / 3) * 5 + Math.random() * 3
      const riskScore = Math.round((baseRisk + variance) * 10) / 10
      
      sampleData.push({
        date: date.toISOString().slice(5, 10), // MM-DD format
        risk: riskScore,
        baseline: 72 // Baseline risk
      })
    }
    
    setData(sampleData)
  }, [])

  if (data.length === 0) {
    return <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)'}}>Loading chart...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0.05}/>
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
          domain={[60, 80]}
        />
        <Tooltip 
          contentStyle={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontSize: '13px',
            padding: '8px 12px'
          }}
        />
        <Area 
          type="monotone" 
          dataKey="risk" 
          stroke="#2563EB" 
          strokeWidth={2}
          fill="url(#colorRisk)" 
          animationDuration={300}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}



