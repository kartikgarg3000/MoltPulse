
'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Activity, TrendingUp, Users, Zap } from 'lucide-react';

interface Stats {
  total_agents: number;
  total_votes: number;
  total_stars: number;
  new_agents_24h: number;
}

const SOL_ICON = "https://cryptologos.cc/logos/solana-sol-logo.png";

export default function MarketTicker() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topGainers, setTopGainers] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Global Stats
      const { data: globalData } = await supabase
        .from('global_stats')
        .select('*')
        .single();
      
      if (globalData) setStats(globalData);

      // Fetch Top Gainers (by velocity)
      const { data: gainers } = await supabase
        .from('agents')
        .select('name, velocity, category')
        .order('velocity', { ascending: false })
        .limit(5);
      
      if (gainers) setTopGainers(gainers);
    };

    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div className="w-full bg-black/60 backdrop-blur-xl border-b border-white/5 py-1.5 px-4 overflow-hidden sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-12 text-[9px] font-black uppercase tracking-[0.15em] text-gray-500">
        
        {/* Global Overview */}
        <div className="flex items-center gap-6 border-r border-white/10 pr-6 shrink-0">
          <div className="flex items-center gap-2 pr-2 border-r border-white/5">
             <img src={SOL_ICON} alt="SOL" className="w-3 h-3" />
             <span className="text-white font-mono">$184.21</span>
             <span className="text-green-500 font-mono text-[8px]">+2.4%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600">Agents:</span>
            <span className="text-white font-mono">{stats.total_agents}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600">24h Pulse:</span>
            <span className="text-orange-400 font-mono">+{stats.total_votes}</span>
          </div>
        </div>

        {/* Marquee Ticker */}
        <div className="flex-1 overflow-hidden relative group">
           <div className="flex gap-12 animate-marquee whitespace-nowrap items-center hover:pause">
              {topGainers.concat(topGainers).map((gainer, i) => (
                <div key={i} className="flex items-center gap-3">
                   <span className="text-white underline decoration-blue-500/30 underline-offset-4">{gainer.name}</span>
                   <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{gainer.category || 'General'}</span>
                   <span className="text-green-400 font-mono">+{Math.round(gainer.velocity * 100)}%</span>
                </div>
              ))}
           </div>
           
           {/* Fade masks */}
           <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/80 to-transparent pointer-events-none" />
           <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/80 to-transparent pointer-events-none" />
        </div>

        <div className="hidden lg:flex items-center gap-2 text-blue-500 font-black">
           <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></span>
           LIVE MOLT DATA
        </div>
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
