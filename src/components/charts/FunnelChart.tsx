import React from 'react';

const funnelData = [
  { stage: 'New Leads', value: 120, color: '#1c398e' },
  { stage: 'In Progress', value: 85, color: '#435EBE' },
  { stage: 'Documentation', value: 60, color: '#6A82CE' },
  { stage: 'Payment', value: 50, color: '#91A5DE' },
  { stage: 'Converted', value: 45, color: '#B8C2EE' },
];

export const FunnelChart: React.FC = () => {
  const chartWidth = 300;
  const chartHeight = 200;
  const stageHeight = chartHeight / funnelData.length;

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center">
      <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {funnelData.map((item, index) => {
          const topWidth = index === 0 ? chartWidth * 0.9 : (funnelData[index-1].value / funnelData[0].value) * chartWidth * 0.75;
          const bottomWidth = (item.value / funnelData[0].value) * chartWidth * 0.75;
          
          const y = index * stageHeight;
          const points = [
            [(chartWidth - topWidth) / 2, y],
            [(chartWidth + topWidth) / 2, y],
            [(chartWidth + bottomWidth) / 2, y + stageHeight - 2],
            [(chartWidth - bottomWidth) / 2, y + stageHeight - 2],
          ].map(p => p.join(',')).join(' ');

          return (
            <g key={item.stage}>
              <polygon points={points} fill={item.color} />
              <text x={chartWidth / 2} y={y + stageHeight / 2 + 5} textAnchor="middle" fill="white" className="font-bold text-sm">
                {item.stage} ({item.value})
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-center gap-4 mt-4 text-xs">
        {funnelData.map(item => (
          <div key={item.stage} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></div>
            <span>{item.stage}</span>
          </div>
        ))}
      </div>
    </div>
  );
};