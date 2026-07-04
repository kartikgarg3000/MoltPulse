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
    <Link href={`/agents/${owner}/${repoName}`} className="block group h-full">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-5 hover:border-white/20 transition-all duration-200 cursor-pointer h-full flex flex-col">
        
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors line-clamp-1">
              {agent.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
               <p className="text-xs text-gray-500 font-mono truncate max-w-[150px]">{agent.repo}</p>
               {agent.is_verified && <StatusBadge type="verified" />}
               {badgeType && <StatusBadge type={badgeType} />}
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            {agent.pulse_score !== undefined && (
              <div className="flex flex-col items-end relative group/pulse cursor-help">
                <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase border-b border-dashed border-gray-600/50 pb-0.5">Pulse</span>
                <div className="text-xl font-bold text-white">
                  {Math.round(agent.pulse_score)}
                </div>
                
                {/* Tooltip */}
                <div className="absolute right-0 top-full mt-2 w-48 p-2.5 bg-[#111] border border-white/10 rounded-md text-xs text-gray-400 opacity-0 invisible group-hover/pulse:opacity-100 group-hover/pulse:visible transition-all duration-200 z-50 shadow-2xl pointer-events-none">
                  Based on repository activity, growth velocity and community engagement.
                </div>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">
          {agent.description || "No description provided."}
        </p>
        
        <div className="mt-auto flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Star size={14} className="text-gray-500" />
              <span>{formatStars(agent.stars)}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Votes">
               <TrendingUp size={14} className="text-gray-500" />
               <span>{agent.votes || 0}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Updated {getRelativeTime(agent.last_update)}</span>
          </div>
        </div>

      </div>
    </Link>
  );
}
