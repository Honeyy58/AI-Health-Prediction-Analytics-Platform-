import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-1">
        <p className="font-bold text-slate-800 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
          {label}
        </p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between space-x-3 text-slate-600 dark:text-slate-300">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}:</span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PredictionsTimelineChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
        <span>No timeline data recorded yet</span>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11, fill: '#94a3b8' }} 
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1', strokeWidth: 0.5 }}
          />
          <YAxis 
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            formatter={(val) => <span className="text-xs text-slate-600 dark:text-slate-300">{val}</span>} 
          />
          <Area 
            type="monotone" 
            dataKey="positive" 
            name="Higher Risk" 
            stroke="#f43f5e" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPos)" 
          />
          <Area 
            type="monotone" 
            dataKey="negative" 
            name="Lower Risk" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorNeg)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PredictionsTimelineChart;
