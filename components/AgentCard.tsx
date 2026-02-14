"use client";
import Link from 'next/link';
import { TrendingUp, TrendingDown, Star, MessageSquare, ExternalLink, Zap, Heart, Check } from 'lucide-react';

import WatchlistButton from './WatchlistButton';
import VoteButton from './VoteButton';
import StatusBadge from './StatusBadge';
import PulseChart from './PulseChart';

import { Agent } from '@/types';

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
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

  // Determine Status Badge
  const getBadgeType = () => {
    // 1. Blue Chip: Pulse > 80 AND Stars > 1000
    if (agent.pulse_score && agent.pulse_score > 80 && agent.stars > 1000) return 'blue-chip';
    
    // 2. Hidden Gem: Pulse > 65 AND Stars < 200
    if (agent.pulse_score && agent.pulse_score > 65 && agent.stars < 200) return 'gem';
    
    // 3. Surging: Growth Score > 20 (approx top 10%) OR High Velocity
    // Note: We need growth_score in interface, but can fallback to velocity
    if ((agent.growth_score && agent.growth_score > 20) || (agent.velocity && agent.velocity > 0.5)) return 'trending';
    
    // 4. Fresh Mint: Created < 7 days ago
    const daysOld = (new Date().getTime() - new Date(agent.created_at).getTime()) / (1000 * 3600 * 24);
    if (daysOld < 7) return 'new';

    return null;
  };

  const badgeType = getBadgeType();

  // Mock Sparkline Data (Replace with real history later)
  const sparklineData = Array.from({ length: 10 }, (_, i) => ({
    date: i.toString(),
    value: Math.floor(Math.random() * 50) + (agent.velocity ? agent.velocity * 10 : 0)
  }));


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
            <div className="flex items-center gap-2 mt-1">
               <p className="text-sm text-gray-500 font-mono">{agent.repo}</p>
               {badgeType && <StatusBadge type={badgeType} />}
            </div>
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
        <div className="mb-4 h-16 opacity-50 group-hover:opacity-100 transition-opacity">
            <PulseChart data={sparklineData} height={60} showAxis={false} color={badgeType === 'gem' ? '#a855f7' : '#3b82f6'} />
        </div>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10 relative z-10">
          {agent.description || "No description available."}
        </p>
        
        <div className="mt-auto flex items-center justify-between text-sm text-gray-300 relative z-10 pt-4 border-t border-white/5">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            <span>{formatStars(agent.stars)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
              <span>⏱</span>
              <span>{getRelativeTime(agent.last_update)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
