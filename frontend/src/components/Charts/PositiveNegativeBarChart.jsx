import React from 'react';
import { 
  BarChart, 
  Bar, 
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
          Age Group: {label}
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

const PositiveNegativeBarChart = ({ data = [] }) => {
  const hasData = data && data.some(d => (d.positive > 0 || d.negative > 0));

  if (!hasData) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
        <span>No demographic breakdown data available</span>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
          <XAxis 
            dataKey="group" 
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
          <Bar 
            dataKey="positive" 
            name="Higher Risk" 
            fill="#f43f5e" 
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            dataKey="negative" 
            name="Lower Risk" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PositiveNegativeBarChart;
