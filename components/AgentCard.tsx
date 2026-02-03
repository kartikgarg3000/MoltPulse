
import React from 'react';
import Link from 'next/link';
import VoteButton from './VoteButton';
import WatchlistButton from './WatchlistButton';

interface Agent {
  name: string;
  repo: string;
  description: string | null;
  stars: number;
  last_update: string;
  trend: string;
  votes?: number;
  category?: string;
  velocity?: number;
  pulse_score?: number;
}

interface AgentCardProps {
  agent: Agent;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  // Format stars
  const formatStars = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  // Format date relative
  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const isPositive = agent.trend.startsWith('+') || agent.trend === 'New';

  // Extract owner and repo from full repo string (e.g. "facebook/react")
  const [owner, repoName] = agent.repo.split('/');

  return (
    <Link href={`/agents/${owner}/${repoName}`} className="block group">
      <div className="glass rounded-xl p-5 hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full flex flex-col relative overflow-hidden">
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500" />

        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
              {agent.name}
            </h3>
            <p className="text-sm text-gray-500 font-mono">{agent.repo}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {agent.pulse_score !== undefined && (
              <div className="flex flex-col items-end">
                <span className="text-[8px] uppercase tracking-tighter text-gray-500 font-black mb-0.5">Pulse Score</span>
                <div className="text-2xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  {Math.round(agent.pulse_score)}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <WatchlistButton repo={agent.repo} />
              <div className="w-10 h-12 flex items-center justify-center p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-blue-500/30 transition-all">
                <VoteButton repo={agent.repo} initialVotes={agent.votes || 0} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4 relative z-10">
           <div className={`text-xs font-mono px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {agent.trend}
          </div>
          {agent.category && (
            <div className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border 
              ${agent.category === 'MoltHub' 
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]' 
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
              {agent.category}
            </div>
          )}
          {agent.velocity && agent.velocity > 0.01 && (
            <div className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border flex items-center gap-1 animate-pulse
              ${agent.category === 'MoltHub'
                ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
               <span className={`w-1.5 h-1.5 rounded-full ${agent.category === 'MoltHub' ? 'bg-pink-500' : 'bg-orange-500'}`}></span>
               {agent.category === 'MoltHub' ? 'Racing' : 'Pulsing'}
            </div>
          )}
        </div>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10 relative z-10">
          {agent.description || "No description available."}
        </p>
        
        <div className="mt-auto flex items-center justify-between text-sm text-gray-300 relative z-10 pt-4 border-t border-white/5">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            <span>{formatStars(agent.stars)}</span>
          </div>
          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <span>⏱</span>
            <span>{getRelativeTime(agent.last_update)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AgentCard;
