"use client";

import React from 'react';
import { Gem, TrendingUp, Award, Zap, ShieldCheck } from 'lucide-react';

export type BadgeType = 'blue-chip' | 'gem' | 'trending' | 'new' | 'verified';

interface StatusBadgeProps {
  type: BadgeType;
  className?: string;
}

export default function StatusBadge({ type, className = '' }: StatusBadgeProps) {
  const config = {
    'blue-chip': {
      label: 'BLUE CHIP',
      icon: Award,
      style: 'bg-blue-900/40 text-blue-400 border-blue-500/30',
      iconStyle: 'text-blue-400'
    },
    'gem': {
      label: 'HIDDEN GEM',
      icon: Gem,
      style: 'bg-purple-900/40 text-purple-400 border-purple-500/30',
      iconStyle: 'text-purple-400'
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

  const { label, icon: Icon, style, iconStyle } = config[type];

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${style} ${className}`}>
      <Icon size={10} className={iconStyle} />
      {label}
    </div>
  );
}
