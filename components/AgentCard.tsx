"use client";
import Link from 'next/link';
import { Star, ExternalLink, Sparkles } from 'lucide-react';

import WatchlistButton from './WatchlistButton';
import VoteButton from './VoteButton';
import StatusBadge, { BadgeType } from './StatusBadge';
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

  // Determine App Type Badge
  const getAppTypeBadge = (): BadgeType | null => {
    if (agent.app_type === 'ai_software') return 'ai-built';
    if (agent.app_type === 'autonomous_agent') return 'autonomous';
    if (agent.app_type === 'task_bot') return 'task-bot';
    return null;
  };

  // Determine Status Badge
  const getBadgeType = (): BadgeType | null => {
    // 1. Blue Chip: Pulse > 80 AND Stars > 1000
    if (agent.pulse_score && agent.pulse_score > 80 && agent.stars > 1000) return 'blue-chip';
    
    // 2. Hidden Gem: Pulse > 65 AND Stars < 200
    if (agent.pulse_score && agent.pulse_score > 65 && agent.stars < 200) return 'gem';
    
    // 3. Surging: Growth Score > 20 (approx top 10%) OR High Velocity
    if ((agent.growth_score && agent.growth_score > 20) || (agent.velocity && agent.velocity > 0.5)) return 'trending';
    
    // 4. Fresh Mint: Created < 7 days ago
    const daysOld = (new Date().getTime() - new Date(agent.created_at).getTime()) / (1000 * 3600 * 24);
    if (daysOld < 7) return 'new';

    return null;
  };

  const appTypeBadge = getAppTypeBadge();
  const badgeType = getBadgeType();

  // Mock Sparkline Data
  const sparklineData = Array.from({ length: 10 }, (_, i) => ({
    date: i.toString(),
    value: Math.floor(Math.random() * 50) + (agent.velocity ? agent.velocity * 10 : 0)
  }));

  // Extract owner and repo from full repo string (e.g. "facebook/react")
  const [owner, repoName] = agent.repo.split('/');

  return (
    <Link href={`/agents/${owner}/${repoName}`} className="block group h-full">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-5 hover:border-white/20 transition-all duration-200 cursor-pointer h-full flex flex-col">
        
        <div className="flex justify-between items-start mb-2.5">
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors line-clamp-1">
                {agent.name}
              </h3>
            </div>
            
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
               <p className="text-xs text-gray-500 font-mono truncate max-w-[140px]">{agent.repo}</p>
               {appTypeBadge && <StatusBadge type={appTypeBadge} />}
               {!appTypeBadge && agent.is_verified && <StatusBadge type="verified" />}
               {badgeType && <StatusBadge type={badgeType} />}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {agent.pulse_score !== undefined && (
              <>
                <div className="w-14 h-7 opacity-40 group-hover:opacity-100 transition-opacity hidden sm:block">
                  <PulseChart 
                    data={sparklineData} 
                    color={agent.velocity && agent.velocity > 0 ? "#10b981" : "#3b82f6"} 
                    height={28} 
                    showAxis={false} 
                  />
                </div>
                <div className="flex flex-col items-end relative group/pulse cursor-help">
                  <span className="text-[9px] text-gray-500 font-medium tracking-wide uppercase border-b border-dashed border-gray-600/50 pb-0.5">Pulse</span>
                  <div className="text-xl font-bold text-white mt-0.5 leading-none font-mono">
                    {Math.round(agent.pulse_score)}
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute right-0 top-full mt-2 w-48 p-2.5 bg-[#111] border border-white/10 rounded-md text-xs text-gray-400 opacity-0 invisible group-hover/pulse:opacity-100 group-hover/pulse:visible transition-all duration-200 z-50 shadow-2xl pointer-events-none">
                    Based on market activity, development velocity and community momentum.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">
          {agent.tagline || agent.description || "No description provided."}
        </p>

        {/* Capabilities / Built With Badges */}
        {(agent.capabilities || agent.built_with) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {agent.capabilities?.slice(0, 2).map((cap, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 font-medium">
                {cap}
              </span>
            ))}
            {agent.built_with?.slice(0, 2).map((tool, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-purple-950/30 border border-purple-500/20 text-[9px] text-purple-300 font-mono">
                ⚡ {tool}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-auto flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Star size={13} className="text-gray-500" />
              <span className="font-mono text-[11px]">{formatStars(agent.stars)}</span>
            </div>
            {/* Compact 👍/👎 agent classifier widget */}
            <VoteButton
              repo={agent.repo}
              initialVotes={agent.votes || 0}
              initialDownvotes={agent.downvotes || 0}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            {agent.demo_url && (
              <a 
                href={agent.demo_url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 px-2 py-0.5 rounded transition-colors"
                title="Launch Live App / Demo"
              >
                <ExternalLink size={10} />
                <span>Try Live</span>
              </a>
            )}
            <span className="text-[11px] text-gray-500">{getRelativeTime(agent.last_update)}</span>
          </div>
        </div>

      </div>
    </Link>
  );
}

