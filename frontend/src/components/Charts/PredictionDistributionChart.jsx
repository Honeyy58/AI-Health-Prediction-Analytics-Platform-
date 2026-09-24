import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#f43f5e', '#10b981']; // Rose for Positive, Emerald for Negative

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="p-3 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-1">
        <span className="font-bold text-slate-800 dark:text-white">
          {data.name} Risk
        </span>
        <div className="text-slate-500 dark:text-slate-400">
          Count: <span className="font-semibold text-slate-800 dark:text-slate-200">{data.value}</span> ({data.payload.percentage}%)
        </div>
      </div>
    );
  }
  return null;
};

const PredictionDistributionChart = ({ data = [] }) => {
  const chartData = data.filter(d => d.count > 0);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
        <span>No prediction data available for distribution</span>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="count"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.name === 'Positive' ? COLORS[0] : COLORS[1]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {value} Risk
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PredictionDistributionChart;
