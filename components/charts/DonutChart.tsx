
import React from 'react';

export const DonutChart: React.FC = () => {
    const data = [
        { label: 'Converted', value: 45, color: '#16a34a' },
        { label: 'Lost', value: 15, color: '#ef4444' },
    ];
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    let accumulated = 0;

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="relative w-48 h-48">
                <svg width="100%" height="100%" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth="20" />
                    {data.map((item, index) => {
                        const dashoffset = circumference - (accumulated / total) * circumference;
                        const dasharray = (item.value / total) * circumference;
                        accumulated += item.value;
                        return (
                            <circle
                                key={index}
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth="20"
                                strokeDasharray={`${dasharray} ${circumference}`}
                                strokeDashoffset={dashoffset}
                                transform="rotate(-90 100 100)"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800">{total}</span>
                    <span className="text-sm text-slate-500">Closed</span>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                {data.map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-slate-700">{item.label} ({item.value})</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
