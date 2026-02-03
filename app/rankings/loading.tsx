
import React from 'react';
import SkeletonCard from '@/components/SkeletonCard';

export default function Loading() {
  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      <header className="text-center space-y-4">
        <div className="h-14 bg-white/10 rounded-lg w-3/4 mx-auto animate-pulse"></div>
        <div className="h-6 bg-white/5 rounded-lg w-1/2 mx-auto animate-pulse"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Hall of Fame Skeleton */}
        <div className="space-y-6">
          <div className="h-8 bg-white/10 rounded-md w-48 animate-pulse mb-8"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4">
               <div className="w-8 h-10 bg-white/5 rounded"></div>
               <div className="flex-1"><SkeletonCard /></div>
            </div>
          ))}
        </div>

        {/* Community Favorites Skeleton */}
        <div className="space-y-6">
           <div className="h-8 bg-white/10 rounded-md w-48 animate-pulse mb-8"></div>
           {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4">
               <div className="w-8 h-10 bg-white/5 rounded"></div>
               <div className="flex-1"><SkeletonCard /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
