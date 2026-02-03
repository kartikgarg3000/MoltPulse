import React from 'react';
import { createClient } from '@/utils/supabase/server';
import AgentCard from '@/components/AgentCard';
import { Trophy, Star, ThumbsUp } from 'lucide-react';

export const revalidate = 0;

async function getTopAgents() {
  const supabase = await createClient();
  // Get top 5 by stars
  const { data: topStars } = await supabase
    .from('agents')
    .select('*')
    .order('stars', { ascending: false })
    .limit(5);

  // Get top 5 by votes
  const { data: topVotes } = await supabase
    .from('agents')
    .select('*')
    .order('votes', { ascending: false })
    .limit(5);

  return {
    topStars: topStars || [],
    topVotes: topVotes || []
  };
}

export default async function RankingsPage() {
    const { topStars, topVotes } = await getTopAgents();

    return (
      <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
         <header className="text-center space-y-4">
            <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                Elite Agent Rankings
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Tracking the titans of the AI ecosystem. Rankings are updated in real-time as the community votes and GitHub pulses.
            </p>
         </header>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Column 1: Hall of Fame (Stars) */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <Trophy className="text-yellow-500" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        Hall of Fame 
                        <span className="text-sm font-normal text-gray-500">(Top Stars)</span>
                    </h2>
                </div>
                
                <div className="space-y-4">
                    {topStars.map((agent: any, index) => (
                        <div key={agent.repo} className="flex items-center gap-4 group">
                            <span className="text-3xl font-black text-white/10 group-hover:text-yellow-500 transition-colors w-8">
                                #{index + 1}
                            </span>
                            <div className="flex-1">
                                <AgentCard agent={agent} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Column 2: Community Favorites (Votes) */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <ThumbsUp className="text-blue-500" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        Crowd Favorites
                        <span className="text-sm font-normal text-gray-500">(Top Votes)</span>
                    </h2>
                </div>

                <div className="space-y-4">
                    {topVotes.map((agent: any, index) => (
                        <div key={agent.repo} className="flex items-center gap-4 group">
                            <span className="text-3xl font-black text-white/10 group-hover:text-blue-500 transition-colors w-8">
                                #{index + 1}
                            </span>
                            <div className="flex-1">
                                <AgentCard agent={agent} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

         </div>
      </div>
    );
  }
