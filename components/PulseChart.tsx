"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PulseChartProps {
  data: { date: string; value: number }[];
  color?: string;
  height?: number;
  showAxis?: boolean;
}

export default function PulseChart({ data, color = "#3b82f6", height = 200, showAxis = true }: PulseChartProps) {
  
  // If no data, show a placeholder
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center bg-white/5 rounded-xl border border-white/10" style={{ height }}>
        <span className="text-xs text-gray-500 font-mono">No chart data available</span>
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showAxis && (
            <>
              <XAxis 
                dataKey="date" 
                hide 
              />
              <YAxis 
                hide 
              />
            </>
          )}
          <Tooltip 
            contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ display: 'none' }}
            formatter={(value: any) => [value, 'Activity']}
          />

          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            fill={`url(#gradient-${color})`} 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
