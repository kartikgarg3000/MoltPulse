import { createClient } from '@/utils/supabase/server';
import AgentCard from '@/components/AgentCard';
import PulseActivity from '@/components/PulseActivity';
import AgentFeedItem from '@/components/AgentFeedItem';
import { TrendingUp, Clock, Filter, Layers } from 'lucide-react';

export const revalidate = 0; // Disable static caching for real-time updates

import { Agent } from '@/types';

async function getAgents(): Promise<Agent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('velocity', { ascending: false });

  if (error) {
    console.error("Failed to fetch agents:", error);
    return [];
  }

  return data as Agent[];
}

export default async function Home() {
  const agents = await getAgents();

  // Derived Lists
  const trendingAgents = agents.slice(0, 5); // Top 5 by Velocity
  const newArrivals = [...agents].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
  const ecosystems = [...new Set(agents.map(a => a.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-blue-500/30">
      
      {/* Header / Market Status */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-mono text-green-500 uppercase tracking-widest">Market Open • Real-time</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Market Terminal
          </h1>
          <p className="text-sm text-gray-500 max-w-md">
            The definitive source for discovering new and trending autonomous agents.
          </p>
        </div>
        
        <div className="flex gap-4">
           <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-center">
              <span className="block text-xs uppercase tracking-wider text-gray-500 font-bold">Volume</span>
              <span className="text-xl font-mono text-white font-bold">{agents.length}</span>
           </div>
           <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-center">
              <span className="block text-xs uppercase tracking-wider text-gray-500 font-bold">24h Movers</span>
              <span className="text-xl font-mono text-blue-400 font-bold">{trendingAgents.length}</span>
           </div>
        </div>
      </header>

      {/* Main Grid Layout - The "Terminal" */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Market Movers (Trending) - Width 7/12 */}
        <div className="lg:col-span-7 space-y-8">
           <section>
              <div className="flex items-center gap-2 mb-4 text-blue-400">
                 <TrendingUp size={18} />
                 <h2 className="text-sm font-black uppercase tracking-widest">Market Movers</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {trendingAgents.map((agent, i) => (
                    <div key={agent.repo} className={i === 0 ? "md:col-span-2" : ""}>
                       <AgentCard agent={agent} />
                    </div>
                 ))}
              </div>
           </section>
        </div>

        {/* Center/Right Col: Feed & Filters - Width 5/12 */}
        <div className="lg:col-span-5 space-y-8 sticky top-8">
           
           {/* New Arrivals Feed */}
           <section className="glass rounded-xl border border-white/10 overflow-hidden flex flex-col max-h-[600px]">
              <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-green-400">
                    <Clock size={16} />
                    <h3 className="text-xs font-black uppercase tracking-widest">Fresh on Market</h3>
                 </div>
                 <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 animate-pulse">
                    LIVE
                 </span>
              </div>
              
              <div className="overflow-y-auto custom-scrollbar">
                 {newArrivals.map((agent) => (
                    <AgentFeedItem key={agent.repo} agent={agent} />
                 ))}
                 {newArrivals.length === 0 && (
                     <div className="p-8 text-center text-gray-600 text-xs">
                        No new agents in the last 24h.
                     </div>
                 )}
              </div>
           </section>

           {/* Pulse Activity Widget */}
           <PulseActivity />

           {/* Categories / Sectors */}
           <section className="glass rounded-xl border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-4 text-gray-400">
                 <Layers size={16} />
                 <h3 className="text-xs font-black uppercase tracking-widest">Sectors</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                 {ecosystems.map((cat) => (
                    <button key={cat} className="px-3 py-1.5 rounded-md bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-xs text-gray-400 hover:text-white">
                       {cat}
                    </button>
                 ))}
                 <button className="px-3 py-1.5 rounded-md border border-dashed border-white/10 text-xs text-gray-600 hover:text-gray-400 transition-colors">
                    + All Sectors
                 </button>
              </div>
           </section>

        </div>

      </div>
    </div>
  );
}
