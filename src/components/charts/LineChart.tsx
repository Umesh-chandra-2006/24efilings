import React from 'react';

export const LineChart: React.FC = () => {
  return (
    <div className="w-full h-64 text-xs">
      <svg width="100%" height="100%" viewBox="0 0 500 250" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => (
          <line key={i} x1="30" y1={40 + i * 45} x2="480" y2={40 + i * 45} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        
        {/* Y-axis labels */}
        <text x="25" y="45" textAnchor="end" fill="#64748b">100</text>
        <text x="25" y="90" textAnchor="end" fill="#64748b">75</text>
        <text x="25" y="135" textAnchor="end" fill="#64748b">50</text>
        <text x="25" y="180" textAnchor="end" fill="#64748b">25</text>
        <text x="25" y="225" textAnchor="end" fill="#64748b">0</text>
        
        {/* Data lines */}
        <polyline
          fill="none"
          stroke="#1c398e"
          strokeWidth="2.5"
          points="50,180 135,135 220,150 305,90 390,110 475,60"
        />
         <polyline
          fill="none"
          stroke="#a5b4fc"
          strokeWidth="2.5"
          points="50,200 135,170 220,180 305,120 390,145 475,100"
        />

        {/* Data points */}
        <circle cx="475" cy="60" r="4" fill="#1c398e" stroke="white" strokeWidth="2" />
        <circle cx="475" cy="100" r="4" fill="#a5b4fc" stroke="white" strokeWidth="2" />

        {/* X-axis labels */}
        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
            <text key={month} x={50 + i * 85} y="240" textAnchor="middle" fill="#64748b">{month}</text>
        ))}

        {/* Legend */}
        <g transform="translate(350, 10)">
            <rect x="0" y="0" width="10" height="10" rx="2" fill="#1c398e" />
            <text x="15" y="9" fill="#334155">Leads</text>
             <rect x="60" y="0" width="10" height="10" rx="2" fill="#a5b4fc" />
            <text x="75" y="9" fill="#334155">Conversions</text>
        </g>
      </svg>
    </div>
  );
};