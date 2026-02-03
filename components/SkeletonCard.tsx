
import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="glass rounded-xl p-5 h-full animate-pulse border border-white/5">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-white/10 rounded-md w-3/4"></div>
          <div className="h-3 bg-white/5 rounded-md w-1/2"></div>
        </div>
        <div className="w-10 h-12 bg-white/10 rounded-lg"></div>
      </div>
      
      <div className="h-4 bg-white/10 rounded-full w-20 mb-6"></div>
      
      <div className="space-y-2 mb-6">
        <div className="h-3 bg-white/5 rounded-md w-full"></div>
        <div className="h-3 bg-white/5 rounded-md w-5/6"></div>
      </div>
      
      <div className="mt-auto h-10 border-t border-white/5 pt-4 flex justify-between">
        <div className="w-16 h-4 bg-white/10 rounded-md"></div>
        <div className="w-20 h-4 bg-white/10 rounded-md"></div>
      </div>
    </div>
  );
}
