
import React from 'react';
import SkeletonCard from '@/components/SkeletonCard';

export default function Loading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="space-y-4">
        <div className="h-10 bg-white/10 rounded-lg w-64 animate-pulse"></div>
        <div className="h-4 bg-white/5 rounded-lg w-96 animate-pulse"></div>
      </header>
      
      {/* Fake Search & Filters */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between py-4 border-b border-white/5">
        <div className="w-full md:w-96 h-12 bg-white/5 rounded-full animate-pulse"></div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-20 h-8 bg-white/5 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
