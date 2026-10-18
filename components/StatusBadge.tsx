"use client";

import React from 'react';
import { Gem, TrendingUp, Award, Zap, ShieldCheck, Sparkles, Bot, Layers, Compass } from 'lucide-react';

export type BadgeType = 
  | 'blue-chip' 
  | 'gem' 
  | 'trending' 
  | 'new' 
  | 'verified'
  | 'ai-built'
  | 'autonomous'
  | 'task-bot'
  | 'software';

interface StatusBadgeProps {
  type: BadgeType;
  className?: string;
}

export default function StatusBadge({ type, className = '' }: StatusBadgeProps) {
  const config: Record<BadgeType, { label: string; icon: React.ElementType; style: string; iconStyle: string }> = {
    'ai-built': {
      label: 'AI-BUILT',
      icon: Sparkles,
      style: 'bg-purple-950/50 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/10',
      iconStyle: 'text-purple-400'
    },
    'autonomous': {
      label: 'AUTONOMOUS',
      icon: Bot,
      style: 'bg-cyan-950/50 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10',
      iconStyle: 'text-cyan-400'
    },
    'task-bot': {
      label: 'TASK BOT',
      icon: Compass,
      style: 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40',
      iconStyle: 'text-emerald-400'
    },
    'software': {
      label: 'AI SOFTWARE',
      icon: Layers,
      style: 'bg-indigo-950/50 text-indigo-300 border-indigo-500/40',
      iconStyle: 'text-indigo-400'
    },
    'blue-chip': {
      label: 'BLUE CHIP',
      icon: Award,
      style: 'bg-blue-900/40 text-blue-400 border-blue-500/30',
      iconStyle: 'text-blue-400'
    },
    'gem': {
      label: 'HIDDEN GEM',
      icon: Gem,
      style: 'bg-amber-900/40 text-amber-400 border-amber-500/30',
      iconStyle: 'text-amber-400'
    },
    'trending': {
      label: 'SURGING',
      icon: TrendingUp,
      style: 'bg-green-900/40 text-green-400 border-green-500/30',
      iconStyle: 'text-green-400'
    },
    'new': {
      label: 'FRESH MINT',
      icon: Zap,
      style: 'bg-yellow-900/40 text-yellow-500 border-yellow-500/30',
      iconStyle: 'text-yellow-500'
    },
    'verified': {
      label: 'VERIFIED',
      icon: ShieldCheck,
      style: 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30',
      iconStyle: 'text-emerald-400'
    }
  };

  const { label, icon: Icon, style, iconStyle } = config[type] || config['verified'];

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${style} ${className}`}>
      <Icon size={10} className={iconStyle} />
      {label}
    </div>
  );
}

