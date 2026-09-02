"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Star } from 'lucide-react';

import { Agent } from '@/types';

interface AgentFeedItemProps {
  agent: Agent;
}

export default function AgentFeedItem({ agent }: AgentFeedItemProps) {
  const [owner, repoName] = agent.repo.split('/');

  // Calculate time since creation
  const getTimeSince = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const isVerified = agent.is_verified === true;

  return (
    <div className="group flex items-start gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-xs font-bold text-white shrink-0 border border-white/10 group-hover:border-blue-500/30">
        {agent.name.slice(0, 2).toUpperCase()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <Link href={`/agents/${owner}/${repoName}`} className="block min-w-0">
             <h4 className="font-bold text-white hover:text-blue-400 transition-colors truncate">
               {agent.name}
             </h4>
          </Link>
          {isVerified ? (
            <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded font-mono shrink-0">
              <ShieldCheck size={10} />
              VERIFIED
            </span>
          ) : (
            <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono shrink-0">
              NEW
            </span>
          )}
        </div>
        
        <p className="text-xs text-gray-500 line-clamp-1 mb-2">
          {agent.description || "No description provided."}
        </p>
        
        <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
           <span>{getTimeSince(agent.created_at)}</span>
           <span className="w-0.5 h-0.5 bg-gray-600 rounded-full" />
           <span className="flex items-center gap-1">
             <Star size={10} className="text-yellow-500" />
             {agent.stars >= 1000 ? (agent.stars/1000).toFixed(1) + 'k' : agent.stars}
           </span>
           {agent.category && (
              <>
                <span className="w-0.5 h-0.5 bg-gray-600 rounded-full" />
                <span className="text-blue-400">{agent.category}</span>
              </>
           )}
        </div>
      </div>
    </div>
  );
}
