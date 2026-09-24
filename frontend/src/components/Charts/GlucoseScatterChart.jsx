import React from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell 
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-1">
        <div className="font-bold text-slate-800 dark:text-white flex items-center justify-between gap-2">
          <span>Prediction: {data.prediction}</span>
          <span className="font-mono text-[11px] text-slate-400">{data.confidence}% conf</span>
        </div>
        <div className="text-slate-600 dark:text-slate-300">
          Glucose: <span className="font-semibold">{data.glucose} mg/dL</span>
        </div>
        <div className="text-slate-600 dark:text-slate-300">
          BMI: <span className="font-semibold">{data.bmi}</span> | Age: <span className="font-semibold">{data.age}y</span>
        </div>
      </div>
    );
  }
  return null;
};

const GlucoseScatterChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
        <span>No clinical biomarker scatter data available</span>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis 
            type="number" 
            dataKey="glucose" 
            name="Glucose" 
            unit=" mg/dL"
            domain={[60, 'dataMax + 20']}
            tick={{ fontSize: 11, fill: '#94a3b8' }} 
            tickLine={false}
          />
          <YAxis 
            type="number" 
            dataKey="bmi" 
            name="BMI" 
            unit="" 
            domain={[10, 'dataMax + 5']}
            tick={{ fontSize: 11, fill: '#94a3b8' }} 
            tickLine={false}
            axisLine={false}
          />
          <ZAxis range={[60, 120]} />
          <Tooltip content={<CustomTooltip />} />
          <Scatter name="Biomarker Distribution" data={data}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.prediction === 'Positive' ? '#f43f5e' : '#10b981'} 
                fillOpacity={0.7}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GlucoseScatterChart;
