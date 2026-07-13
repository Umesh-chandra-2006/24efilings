import React from 'react';

interface BarChartData {
    label: string;
    value: number;
}

interface BarChartProps {
    data: BarChartData[];
}

const COLORS = ['#1c398e', '#4f46e5', '#7c3aed', '#db2777', '#f59e0b', '#10b981', '#3b82f6'];

export const BarChart: React.FC<BarChartProps> = ({ data = [] }) => {
  if (!data || data.length === 0) {
      return <div className="w-full h-64 flex items-center justify-center text-slate-500 bg-slate-50 rounded-lg">No data available.</div>;
  }
  
  const maxValue = Math.ceil(Math.max(...data.map(d => d.value), 0) * 1.1) || 10;
  const chartHeight = 200;
  const barWidth = 40;
  const barMargin = 30;
  const chartWidth = 50 + data.length * (barWidth + barMargin);

  const yAxisLabels = 5;
  const yAxisValues = Array.from({ length: yAxisLabels }, (_, i) => {
      const value = (maxValue / (yAxisLabels - 1)) * i;
      return Math.ceil(value);
  }).filter((v, i, a) => a.indexOf(v) === i);


  return (
    <div className="w-full h-64 text-xs overflow-x-auto">
      <svg width={chartWidth} height="250" viewBox={`0 0 ${chartWidth} 250`} preserveAspectRatio="xMinYMid meet">
        {/* Grid lines and Y-axis labels */}
        {yAxisValues.map((value, i) => (
          <g key={i}>
            <line x1="30" y1={225 - (value / maxValue) * chartHeight} x2={chartWidth - 20} y2={225 - (value / maxValue) * chartHeight} stroke="#e2e8f0" strokeWidth="1" />
            <text x="25" y={225 - (value / maxValue) * chartHeight + 3} textAnchor="end" fill="#64748b">
              {value}
            </text>
          </g>
        ))}
        <line x1="30" y1="225" x2={chartWidth-20} y2="225" stroke="#94a3b8" strokeWidth="1" />

        {/* Bars and X-axis labels */}
        {data.map((d, i) => {
          const x = 50 + i * (barWidth + barMargin);
          const barValueHeight = d.value > 0 ? (d.value / maxValue) * chartHeight : 0;
          const y = 225 - barValueHeight;
          const height = barValueHeight;
          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height}
                fill={COLORS[i % COLORS.length]}
                rx="4"
              />
              <text x={x + barWidth / 2} y="240" textAnchor="middle" fill="#334155" className="text-[10px] font-medium">
                {d.label}
              </text>
               <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fill={COLORS[i % COLORS.length]} fontWeight="bold">
                {d.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};