"use client";

import React from 'react';
import { Gem, TrendingUp, Award, Zap } from 'lucide-react';

export type BadgeType = 'blue-chip' | 'gem' | 'trending' | 'new';

interface StatusBadgeProps {
  type: BadgeType;
  className?: string;
}

export default function StatusBadge({ type, className = '' }: StatusBadgeProps) {
  const config = {
    'blue-chip': {
      label: 'BLUE CHIP',
      icon: Award,
      style: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
      iconStyle: 'text-blue-400'
    },
    'gem': {
      label: 'HIDDEN GEM',
      icon: Gem,
      style: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
      iconStyle: 'text-purple-400'
    },
    'trending': {
      label: 'SURGING',
      icon: TrendingUp,
      style: 'bg-green-500/10 text-green-400 border-green-500/20 animate-pulse',
      iconStyle: 'text-green-400'
    },
    'new': {
      label: 'FRESH MINT',
      icon: Zap,
      style: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      iconStyle: 'text-yellow-500'
    }
  };

  const { label, icon: Icon, style, iconStyle } = config[type];

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${style} ${className}`}>
      <Icon size={10} className={iconStyle} />
      {label}
    </div>
  );
}
