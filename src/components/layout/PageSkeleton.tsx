import React from 'react';

export const PageSkeleton = () => {
  return (
    <div className="w-full h-full p-6 animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="h-10 bg-slate-200 rounded w-1/6"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="h-28 bg-slate-200 rounded-lg"></div>
        <div className="h-28 bg-slate-200 rounded-lg"></div>
        <div className="h-28 bg-slate-200 rounded-lg"></div>
        <div className="h-28 bg-slate-200 rounded-lg"></div>
      </div>
      <div className="h-96 bg-slate-200 rounded-lg"></div>
    </div>
  );
};
